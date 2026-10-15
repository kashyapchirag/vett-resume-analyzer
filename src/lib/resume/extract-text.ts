import { validateResumeBuffer, DetectedFileType } from "./validate-file";
import { extractPdfText, PdfExtractionError } from "./extract-pdf";
import { extractDocxText, DocxExtractionError } from "./extract-docx";
import { ResumeMetadata } from "@/lib/validation/resume-schema";

export interface ExtractResumeResult {
  text: string;
  metadata: ResumeMetadata;
}

export class ResumeParseError extends Error {
  code:
    | "EMPTY_FILE"
    | "FILE_TOO_LARGE"
    | "UNSUPPORTED_FORMAT"
    | "CORRUPTED_FILE"
    | "ENCRYPTED_PDF"
    | "SCANNED_PDF"
    | "PARSE_FAILED";

  constructor(
    message: string,
    code:
      | "EMPTY_FILE"
      | "FILE_TOO_LARGE"
      | "UNSUPPORTED_FORMAT"
      | "CORRUPTED_FILE"
      | "ENCRYPTED_PDF"
      | "SCANNED_PDF"
      | "PARSE_FAILED"
  ) {
    super(message);
    this.name = "ResumeParseError";
    this.code = code;
  }
}

/**
 * Maximum character limit for extracted resume text to bound processing cost and memory.
 */
export const MAX_EXTRACTED_RESUME_CHARS = 100_000;

/**
 * Validates and extracts readable text and metadata from a resume file buffer.
 */
export async function extractResumeText(
  fileName: string,
  buffer: Uint8Array
): Promise<ExtractResumeResult> {
  // Capture file size upfront before any parser operations that may transfer or detach the ArrayBuffer
  const fileSize = buffer.length;

  // 1. Validate file size, extension, and magic bytes
  const validation = validateResumeBuffer(fileName, buffer);
  if (!validation.valid || !validation.fileType) {
    throw new ResumeParseError(
      validation.error || "File validation failed.",
      validation.code || "UNSUPPORTED_FORMAT"
    );
  }

  const fileType: DetectedFileType = validation.fileType;
  let rawText = "";
  let pageCount: number | undefined;

  try {
    if (fileType === "pdf") {
      const pdfResult = await extractPdfText(buffer);
      rawText = pdfResult.text;
      pageCount = pdfResult.pageCount;
    } else if (fileType === "docx") {
      const docxResult = await extractDocxText(buffer);
      rawText = docxResult.text;
    }
  } catch (err: unknown) {
    if (err instanceof PdfExtractionError || err instanceof DocxExtractionError) {
      throw new ResumeParseError(err.message, err.code);
    }
    throw new ResumeParseError(
      "An unexpected error occurred while parsing the document.",
      "PARSE_FAILED"
    );
  }

  // 2. Normalize and bound text
  const cleanText = rawText.replace(/\r\n/g, "\n").trim();
  const boundedText =
    cleanText.length > MAX_EXTRACTED_RESUME_CHARS
      ? cleanText.slice(0, MAX_EXTRACTED_RESUME_CHARS)
      : cleanText;

  const charCount = boundedText.length;
  const wordCount = boundedText.split(/\s+/).filter(Boolean).length;

  return {
    text: boundedText,
    metadata: {
      fileName,
      fileType,
      fileSize,
      charCount,
      wordCount,
      ...(pageCount ? { pageCount } : {}),
    },
  };
}
