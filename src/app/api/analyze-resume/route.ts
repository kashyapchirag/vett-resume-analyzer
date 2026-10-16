import { NextRequest, NextResponse } from "next/server";
import { generateText, Output, APICallError, TypeValidationError, JSONParseError, NoOutputGeneratedError } from "ai";
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
import { ANALYSIS_SYSTEM_PROMPT, buildAnalysisUserPrompt } from "@/lib/analysis/prompts";

export const runtime = "nodejs";
export const maxDuration = 30;

const HEURISTIC_DISCLAIMER =
  "This score is an estimate based on heuristic comparison between your resume and the supplied job description. It does not predict or guarantee the outcome of any employer's proprietary ATS or hiring decision.";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("resume");
    const jobDescriptionRaw = formData.get("jobDescription");

    // 1. Validate file presence
    if (!file || !(file instanceof File)) {
      const errorResponse: AnalysisErrorResponse = {
        success: false,
        error: "No resume file was provided in the request.",
        code: "NO_FILE",
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // 2. Validate job description input
    if (typeof jobDescriptionRaw !== "string") {
      const errorResponse: AnalysisErrorResponse = {
        success: false,
        error: "A valid job description string is required.",
        code: "INVALID_JOB_DESCRIPTION",
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    const jdValidation = AnalysisRequestSchema.safeParse({
      jobDescription: jobDescriptionRaw,
    });

    if (!jdValidation.success) {
      const firstIssue = jdValidation.error.issues[0];
      const errorResponse: AnalysisErrorResponse = {
        success: false,
        error: firstIssue ? firstIssue.message : "Invalid job description length.",
        code: "INVALID_JOB_DESCRIPTION",
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // 3. Convert file to in-memory Uint8Array
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // 4. Validate and extract resume text using existing parser
    const extractionResult = await extractResumeText(file.name, buffer);

    // 5. Verify server environment configuration
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey || apiKey.trim() === "") {
      const errorResponse: AnalysisErrorResponse = {
        success: false,
        error: "AI service configuration missing. Please verify server environment variables.",
        code: "MISSING_API_KEY",
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }

    // 6. Build delimited prompt
    const userPrompt = buildAnalysisUserPrompt(
      extractionResult.text,
      jdValidation.data.jobDescription
    );

    // 7. Invoke Gemini via Vercel AI SDK 7
    let llmOutput;
    try {
      const result = await generateText({
        model: google("gemini-3.8-flash"),
        instructions: ANALYSIS_SYSTEM_PROMPT,
        prompt: userPrompt,
        output: Output.object({
          schema: LlmAnalysisOutputSchema,
        }),
        maxRetries: 2,
        timeout: 25_000,
      });

      llmOutput = result.output;
    } catch (aiErr: unknown) {
      // Structured AI SDK error handling
      if (APICallError.isInstance(aiErr)) {
        if (aiErr.statusCode === 429) {
          const errorResponse: AnalysisErrorResponse = {
            success: false,
            error: "The free AI quota was temporarily reached. Please wait a moment and try again.",
            code: "RATE_LIMITED",
          };
          return NextResponse.json(errorResponse, { status: 429 });
        }

        const errorResponse: AnalysisErrorResponse = {
          success: false,
          error: "The AI service encountered an error while processing the request.",
          code: "PROVIDER_ERROR",
        };
        return NextResponse.json(errorResponse, { status: 502 });
      }

      if (
        TypeValidationError.isInstance(aiErr) ||
        JSONParseError.isInstance(aiErr) ||
        NoOutputGeneratedError.isInstance(aiErr)
      ) {
        const errorResponse: AnalysisErrorResponse = {
          success: false,
          error: "The AI service returned an unparseable or incomplete analysis structure.",
          code: "MALFORMED_OUTPUT",
        };
        return NextResponse.json(errorResponse, { status: 500 });
      }

      if (aiErr instanceof Error && aiErr.name === "AbortError") {
        const errorResponse: AnalysisErrorResponse = {
          success: false,
          error: "The analysis request timed out. Please try again.",
          code: "PROVIDER_ERROR",
        };
        return NextResponse.json(errorResponse, { status: 504 });
      }

      throw aiErr;
    }

    if (!llmOutput) {
      const errorResponse: AnalysisErrorResponse = {
        success: false,
        error: "The AI service returned an empty analysis payload.",
        code: "MALFORMED_OUTPUT",
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }

    // 8. Deterministic aggregate score calculation in application code
    const overallScore = calculateOverallScore(llmOutput.categoryScores);

    const scoreBand: "Strong Alignment" | "Moderate Alignment" | "Needs Improvement" =
      overallScore >= 75
        ? "Strong Alignment"
        : overallScore >= 50
        ? "Moderate Alignment"
        : "Needs Improvement";

    // 9. Assemble response payload
    const payload: AnalysisSuccessResponse = {
      success: true,
      overallScore,
      scoreBand,
      analysis: llmOutput,
      metadata: extractionResult.metadata,
      disclaimer: HEURISTIC_DISCLAIMER,
    };

    // 10. Validate complete response against schema
    const validationCheck = AnalysisSuccessResponseSchema.safeParse(payload);
    if (!validationCheck.success) {
      console.error(
        "[POST /api/analyze-resume] Response schema validation failed:",
        JSON.stringify(
          validationCheck.error.issues.map((i) => ({
            path: i.path,
            code: i.code,
            message: i.message,
          })),
          null,
          2
        )
      );

      const errorResponse: AnalysisErrorResponse = {
        success: false,
        error: "Internal error: generated analysis payload did not match response schema.",
        code: "MALFORMED_OUTPUT",
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }

    return NextResponse.json(validationCheck.data, { status: 200 });
  } catch (err: unknown) {
    if (err instanceof ResumeParseError) {
      const errorResponse: AnalysisErrorResponse = {
        success: false,
        error: err.message,
        code: err.code,
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    const unexpectedError: AnalysisErrorResponse = {
      success: false,
      error: "An unexpected error occurred while analyzing the document.",
      code: "PARSE_FAILED",
    };
    return NextResponse.json(unexpectedError, { status: 500 });
  }
}
