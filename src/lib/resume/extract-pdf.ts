import { createRequire } from "node:module";
import type pdfParseType from "pdf-parse";
import { ResumeParseError } from "./errors.ts";

export { ResumeParseError };

const require = createRequire(import.meta.url);
const pdfParse: typeof pdfParseType = require("pdf-parse");

export interface PdfExtractionResult {
  text: string;
  pageCount: number;
}

/**
 * Extracts plain text and page count metadata from a PDF buffer using pdf-parse.
 * Handles encrypted, corrupt, and scanned (zero-text) PDFs gracefully.
 */
export async function extractPdfText(
  buffer: Uint8Array
): Promise<PdfExtractionResult> {
  // Ensure an isolated Uint8Array with byteOffset 0 and exact ArrayBuffer allocation.
  // This prevents internal PDF.js makeSubStream indexing bugs when Node.js allocates
  // input Buffers from its shared 64KB Buffer pool.
  const cleanBuffer = new Uint8Array(buffer.byteLength);
  cleanBuffer.set(buffer);

  let data: pdfParseType.Result;
  try {
    data = await pdfParse(cleanBuffer as unknown as Buffer);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message.toLowerCase() : "";
    const errorName =
      err && typeof err === "object" && "name" in err && typeof err.name === "string"
        ? err.name
        : "";

    console.error("[extractPdfText] PDF parsing error:", err);

    if (
      errorMsg.includes("password") ||
      errorMsg.includes("encrypted") ||
      errorName === "PasswordException"
    ) {
      throw new ResumeParseError(
        "This PDF is password-protected or encrypted. Please remove password protection and try again.",
        "ENCRYPTED_PDF"
      );
    }

    if (
      errorName === "InvalidPDFException" ||
      errorName === "FormatError" ||
      errorMsg.includes("invalid pdf structure") ||
      errorMsg.includes("format error") ||
      errorMsg.includes("bad xref entry")
    ) {
      throw new ResumeParseError(
        "The PDF file is corrupted or could not be parsed.",
        "CORRUPTED_FILE"
      );
    }

    throw new ResumeParseError(
      "Unable to parse the PDF document. Please check the file and try again.",
      "PARSE_FAILED"
    );
  }

  const fullText = (data.text || "").trim();

  // Check if PDF has extractable text (detect scanned/image-only PDFs)
  const alphaNumericChars = fullText.replace(/[^a-zA-Z0-9]/g, "");
  if (alphaNumericChars.length < 10) {
    throw new ResumeParseError(
      "This PDF contains no extractable text. It appears to be scanned or image-only. Scanned resumes requiring OCR are not supported in the MVP.",
      "SCANNED_PDF"
    );
  }

  return {
    text: fullText,
    pageCount: data.numpages || 1,
  };
}
