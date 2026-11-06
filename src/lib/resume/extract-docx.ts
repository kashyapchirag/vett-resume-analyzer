import mammoth from "mammoth";
import { ResumeParseError } from "./errors.ts";

export { ResumeParseError };

export interface DocxExtractionResult {
  text: string;
}

/**
 * Extracts plain text from a DOCX buffer using Mammoth.
 */
export async function extractDocxText(
  buffer: Uint8Array
): Promise<DocxExtractionResult> {
  try {
    const nodeBuffer = Buffer.from(buffer);
    const result = await mammoth.extractRawText({ buffer: nodeBuffer });
    const text = result.value.trim();

    if (!text || text.replace(/[^a-zA-Z0-9]/g, "").length < 5) {
      throw new ResumeParseError(
        "The DOCX document contains no readable text content.",
        "PARSE_FAILED"
      );
    }

    return { text };
  } catch (err: unknown) {
    if (err instanceof ResumeParseError) {
      throw err;
    }
    throw new ResumeParseError(
      "Failed to read DOCX document. The file may be corrupted or password-protected.",
      "CORRUPTED_FILE"
    );
  }
}
