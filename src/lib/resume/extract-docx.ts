import mammoth from "mammoth";

export interface DocxExtractionResult {
  text: string;
}

export class DocxExtractionError extends Error {
  code: "CORRUPTED_FILE" | "PARSE_FAILED";

  constructor(message: string, code: "CORRUPTED_FILE" | "PARSE_FAILED") {
    super(message);
    this.name = "DocxExtractionError";
    this.code = code;
  }
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
      throw new DocxExtractionError(
        "The DOCX document contains no readable text content.",
        "PARSE_FAILED"
      );
    }

    return { text };
  } catch (err: unknown) {
    if (err instanceof DocxExtractionError) {
      throw err;
    }
    throw new DocxExtractionError(
      "Failed to read DOCX document. The file may be corrupted or password-protected.",
      "CORRUPTED_FILE"
    );
  }
}
