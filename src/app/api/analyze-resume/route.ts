import { NextRequest, NextResponse } from "next/server";
import {
  generateText,
  Output,
  APICallError,
  TypeValidationError,
  JSONParseError,
  NoOutputGeneratedError,
  NoObjectGeneratedError,
  RetryError,
} from "ai";
import { google } from "@ai-sdk/google";
import { extractResumeText, ResumeParseError } from "@/lib/resume/extract-text";
import {
  AnalysisRequestSchema,
  LlmAnalysisOutputSchema,
  AnalysisSuccessResponseSchema,
  AnalysisErrorResponse,
  AnalysisSuccessResponse,
} from "@/lib/validation/analysis-schema";
import { calculateOverallScore } from "@/lib/analysis/scoring";
import {
  ANALYSIS_SYSTEM_PROMPT,
  buildAnalysisUserPrompt,
} from "@/lib/analysis/prompts";
import {
  MAX_RESUME_SIZE_BYTES,
  MAX_RESUME_SIZE_LABEL,
} from "@/lib/constants";

export const runtime = "nodejs";
export const maxDuration = 60;

const HEURISTIC_DISCLAIMER =
  "This score is an estimate based on heuristic comparison between your resume and the supplied job description. It does not predict or guarantee the outcome of any employer's proprietary ATS or hiring decision.";

/**
 * Helper to construct a typed, consistent JSON error response.
 */
function errorResponse(
  message: string,
  code: AnalysisErrorResponse["code"],
  status: number
): NextResponse<AnalysisErrorResponse> {
  const body: AnalysisErrorResponse = {
    success: false,
    error: message,
    code,
  };
  return NextResponse.json(body, { status });
}

/**
 * Maps an overall numeric score (0–100) to its descriptive alignment band.
 */
function determineScoreBand(
  score: number
): "Strong Alignment" | "Moderate Alignment" | "Needs Improvement" {
  if (score >= 75) return "Strong Alignment";
  if (score >= 50) return "Moderate Alignment";
  return "Needs Improvement";
}

/**
 * Normalizes text by collapsing whitespace and lowercasing for fuzzy substring comparison.
 */
function normalizeForSearch(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

/**
 * Verifies whether an AI-generated quote actually corresponds to the extracted resume text.
 * Strips surrounding quotation marks and checks for verbatim or normalized presence.
 * Requires the full normalized evidence to be present in the resume text to prevent
 * hallucinated suffixes from being marked as verified.
 */
function verifyEvidenceInResume(evidence: string, resumeText: string): boolean {
  const normalizedResume = normalizeForSearch(resumeText);
  const trimmed = evidence.trim();
  const cleanedEvidence = trimmed.replace(/^["'“‘]+|["'”’]+$/g, "").trim();
  const normalizedEvidence = normalizeForSearch(cleanedEvidence);

  if (!normalizedEvidence || normalizedEvidence.length < 3) return false;
  return normalizedResume.includes(normalizedEvidence);
}

/**
 * Maps AI SDK errors to user-friendly HTTP error responses with appropriate status codes.
 * Preserves handling of Google Gemini's own HTTP 429 quota and rate-limit responses.
 */
function mapAiErrorToResponse(error: unknown): NextResponse<AnalysisErrorResponse> {
  // If the AI SDK exhausted retries, unwrap the underlying root cause.
  const rootError =
    RetryError.isInstance(error) && error.lastError ? error.lastError : error;

  console.error("[POST /api/analyze-resume] AI analysis error:", {
    name: rootError instanceof Error ? rootError.name : typeof rootError,
    status: APICallError.isInstance(rootError) ? rootError.statusCode : undefined,
  });

  // 1. Quota or rate limit reached on AI provider (HTTP 429)
  if (APICallError.isInstance(rootError) && rootError.statusCode === 429) {
    return errorResponse(
      "The free AI quota was temporarily reached. Please wait a moment and try again.",
      "RATE_LIMITED",
      429
    );
  }

  // 2. Structured output parsing or schema validation failure (HTTP 500)
  if (
    NoObjectGeneratedError.isInstance(rootError) ||
    NoOutputGeneratedError.isInstance(rootError) ||
    TypeValidationError.isInstance(rootError) ||
    JSONParseError.isInstance(rootError)
  ) {
    return errorResponse(
      "The AI service returned an unparseable or incomplete analysis structure.",
      "MALFORMED_OUTPUT",
      500
    );
  }

  // 3. Request timeout or abort (HTTP 504)
  const isTimeout =
    (APICallError.isInstance(rootError) &&
      (rootError.statusCode === 408 || rootError.statusCode === 504)) ||
    (rootError instanceof Error &&
      (rootError.name === "AbortError" || rootError.name === "TimeoutError")) ||
    (APICallError.isInstance(rootError) &&
      rootError.cause instanceof Error &&
      (rootError.cause.name === "AbortError" || rootError.cause.name === "TimeoutError"));

  if (isTimeout) {
    return errorResponse(
      "The analysis request timed out. Please try again.",
      "PROVIDER_ERROR",
      504
    );
  }

  // 4. Any other upstream provider failure (HTTP 502)
  return errorResponse(
    "The AI service encountered an error while processing the request. Please try again.",
    "PROVIDER_ERROR",
    502
  );
}

/**
 * Main POST handler for resume analysis:
 * 1. Ingress payload guard
 * 2. Request parsing and input validation
 * 3. Resume text extraction
 * 4. AI request (Gemini structured output via gemini-3.5-flash-lite)
 * 5. Evidence quotation verification against resume text
 * 6. Score calculation (deterministic weighting)
 * 7. Response creation and contract validation
 * 8. Error handling
 */
export async function POST(req: NextRequest) {
  const startTime = performance.now();

  try {
    // -------------------------------------------------------------
    // Step 1: Ingress payload guard
    // -------------------------------------------------------------
    // Reject oversized payloads upfront before parsing the multipart body into memory
    // Buffer of 300,000 bytes accommodates up to 50,000 char JD + multipart framing (~3.97 MB total ceiling < 4.5 MB Vercel limit)
    const contentLength = req.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > MAX_RESUME_SIZE_BYTES + 300_000) {
      return errorResponse(
        `Request payload exceeds maximum allowed size (${MAX_RESUME_SIZE_LABEL}).`,
        "FILE_TOO_LARGE",
        400
      );
    }

    // -------------------------------------------------------------
    // Step 2: Request parsing and input validation
    // -------------------------------------------------------------
    const formData = await req.formData();
    const resumeFile = formData.get("resume");
    const jobDescriptionRaw = formData.get("jobDescription");

    if (!resumeFile || !(resumeFile instanceof File)) {
      return errorResponse(
        "No resume file was provided in the request.",
        "NO_FILE",
        400
      );
    }

    if (typeof jobDescriptionRaw !== "string") {
      return errorResponse(
        "A valid job description string is required.",
        "INVALID_JOB_DESCRIPTION",
        400
      );
    }

    const jdValidation = AnalysisRequestSchema.safeParse({
      jobDescription: jobDescriptionRaw,
    });
    if (!jdValidation.success) {
      const firstIssue = jdValidation.error.issues[0];
      return errorResponse(
        firstIssue ? firstIssue.message : "Invalid job description length.",
        "INVALID_JOB_DESCRIPTION",
        400
      );
    }

    // Verify AI service configuration on server before proceeding
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey || apiKey.trim() === "") {
      return errorResponse(
        "AI service configuration missing. Please verify server environment variables.",
        "MISSING_API_KEY",
        500
      );
    }

    const validationElapsed = (performance.now() - startTime).toFixed(0);
    console.log(`[POST /api/analyze-resume] Stage 1 (Validation) completed in ${validationElapsed}ms`, {
      fileSize: resumeFile.size,
      fileType: resumeFile.type,
      jdCharCount: jdValidation.data.jobDescription.length,
    });

    // -------------------------------------------------------------
    // Step 3: Resume text extraction
    // -------------------------------------------------------------
    const extractStart = performance.now();
    const arrayBuffer = await resumeFile.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    const extractionResult = await extractResumeText(resumeFile.name, buffer);

    const extractElapsed = (performance.now() - extractStart).toFixed(0);
    console.log(`[POST /api/analyze-resume] Stage 2 (Extraction) completed in ${extractElapsed}ms`, {
      detectedType: extractionResult.metadata.fileType,
      charCount: extractionResult.metadata.charCount,
      wordCount: extractionResult.metadata.wordCount,
      pageCount: extractionResult.metadata.pageCount,
    });

    // -------------------------------------------------------------
    // Step 4: AI request (Gemini structured output via gemini-3.5-flash-lite)
    // -------------------------------------------------------------
    const prompt = buildAnalysisUserPrompt(
      extractionResult.text,
      jdValidation.data.jobDescription
    );

    const aiStart = performance.now();
    let llmOutput;
    try {
      // Bounded at 50,000ms with maxRetries: 0 to guarantee execution completes
      // or cleanly times out before Vercel's 60s function limit.
      const result = await generateText({
        model: google("gemini-3.5-flash-lite"),
        instructions: ANALYSIS_SYSTEM_PROMPT,
        prompt,
        output: Output.object({
          schema: LlmAnalysisOutputSchema,
        }),
        maxRetries: 0,
        timeout: 50_000,
      });

      llmOutput = result.output;
      const aiElapsed = (performance.now() - aiStart).toFixed(0);
      console.log(`[POST /api/analyze-resume] Stage 3 (Gemini Generation) completed in ${aiElapsed}ms`);
    } catch (aiError) {
      const aiElapsed = (performance.now() - aiStart).toFixed(0);
      console.error(`[POST /api/analyze-resume] Stage 3 (Gemini Generation) failed after ${aiElapsed}ms:`, {
        name: aiError instanceof Error ? aiError.name : typeof aiError,
        message: aiError instanceof Error ? aiError.message : String(aiError),
      });
      return mapAiErrorToResponse(aiError);
    }

    if (!llmOutput) {
      return errorResponse(
        "The AI service returned an empty analysis payload.",
        "MALFORMED_OUTPUT",
        500
      );
    }

    // -------------------------------------------------------------
    // Step 5: Verify evidence citations against extracted resume text
    // -------------------------------------------------------------
    const verifiedMatchedSkills = llmOutput.matchedSkills.map((item) => ({
      ...item,
      isVerified: verifyEvidenceInResume(item.evidence, extractionResult.text),
    }));

    const verifiedAnalysis = {
      ...llmOutput,
      matchedSkills: verifiedMatchedSkills,
    };

    // -------------------------------------------------------------
    // Step 6: Deterministic score calculation
    // -------------------------------------------------------------
    const overallScore = calculateOverallScore(verifiedAnalysis.categoryScores);
    const scoreBand = determineScoreBand(overallScore);

    // -------------------------------------------------------------
    // Step 7: Response creation and contract validation
    // -------------------------------------------------------------
    const payload: AnalysisSuccessResponse = {
      success: true,
      overallScore,
      scoreBand,
      analysis: verifiedAnalysis,
      metadata: extractionResult.metadata,
      disclaimer: HEURISTIC_DISCLAIMER,
    };

    const finalValidation = AnalysisSuccessResponseSchema.safeParse(payload);
    if (!finalValidation.success) {
      console.error(
        "[POST /api/analyze-resume] Final payload failed schema validation:",
        finalValidation.error.issues
      );
      return errorResponse(
        "Internal error: generated analysis payload did not match response schema.",
        "MALFORMED_OUTPUT",
        500
      );
    }

    const totalElapsed = (performance.now() - startTime).toFixed(0);
    console.log(`[POST /api/analyze-resume] Request completed successfully in ${totalElapsed}ms`, {
      overallScore,
      scoreBand,
      matchedSkillsCount: verifiedAnalysis.matchedSkills.length,
      verifiedSkillsCount: verifiedAnalysis.matchedSkills.filter((s) => s.isVerified).length,
    });

    return NextResponse.json(finalValidation.data, { status: 200 });

  } catch (error: unknown) {
    const totalElapsed = (performance.now() - startTime).toFixed(0);

    // -------------------------------------------------------------
    // Step 8: Error handling
    // -------------------------------------------------------------
    // Expected document-parsing errors (e.g. empty file, scanned PDF, corrupt document)
    if (error instanceof ResumeParseError) {
      console.warn(`[POST /api/analyze-resume] Document parse error after ${totalElapsed}ms:`, {
        code: error.code,
      });
      return errorResponse(error.message, error.code, 400);
    }

    // Unexpected internal server or unhandled errors
    console.error(`[POST /api/analyze-resume] Unhandled request error after ${totalElapsed}ms:`, {
      name: error instanceof Error ? error.name : typeof error,
      message: error instanceof Error ? error.message : String(error),
    });
    return errorResponse(
      "An unexpected error occurred while parsing the document.",
      "PARSE_FAILED",
      500
    );
  }
}
