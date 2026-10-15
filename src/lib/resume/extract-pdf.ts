export interface PdfExtractionResult {
  text: string;
  pageCount: number;
}

export class PdfExtractionError extends Error {
  code: "ENCRYPTED_PDF" | "SCANNED_PDF" | "CORRUPTED_FILE" | "PARSE_FAILED";

  constructor(
    message: string,
    code: "ENCRYPTED_PDF" | "SCANNED_PDF" | "CORRUPTED_FILE" | "PARSE_FAILED"
  ) {
    super(message);
    this.name = "PdfExtractionError";
    this.code = code;
  }
}

/**
 * Extracts plain text from a PDF buffer using PDF.js legacy build for Node.js.
 * Handles encrypted, corrupt, and scanned (zero-text) PDFs gracefully.
 */
export async function extractPdfText(
  buffer: Uint8Array
): Promise<PdfExtractionResult> {
  let pdfjs: typeof import("pdfjs-dist/legacy/build/pdf.mjs");

  try {
    // In Node.js / server runtime, import the worker bundle to register WorkerMessageHandler
    // in the main thread (fake worker mode), preventing attempts to dynamically import
    // unresolved relative worker scripts at runtime.
    await import("pdfjs-dist/legacy/build/pdf.worker.mjs");
    pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  } catch (initErr: unknown) {
    console.error("[extractPdfText] Failed to initialize PDF parsing engine:", initErr);
    throw new PdfExtractionError(
      "Failed to initialize PDF parsing engine.",
      "PARSE_FAILED"
    );
  }

  // Ensure data is an independent pure Uint8Array. PDF.js transfers the underlying
  // ArrayBuffer to its worker message port, which would detach the caller's buffer if shared.
  const uint8Data = new Uint8Array(buffer.slice());

  let doc;
  try {
    const loadingTask = pdfjs.getDocument({
      data: uint8Data,
      useSystemFonts: true,
      disableFontFace: true,
      // Provide standard font data and cMap URLs for non-embedded fonts
      standardFontDataUrl: "node_modules/pdfjs-dist/standard_fonts/",
      cMapUrl: "node_modules/pdfjs-dist/cmaps/",
      cMapPacked: true,
    });
    doc = await loadingTask.promise;
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
      throw new PdfExtractionError(
        "This PDF is password-protected or encrypted. Please remove password protection and try again.",
        "ENCRYPTED_PDF"
      );
    }

    if (
      errorName === "InvalidPDFException" ||
      errorMsg.includes("invalid pdf structure") ||
      errorMsg.includes("format error")
    ) {
      throw new PdfExtractionError(
        "The PDF file is corrupted or could not be parsed.",
        "CORRUPTED_FILE"
      );
    }

    throw new PdfExtractionError(
      "Unable to parse the PDF document. Please check the file and try again.",
      "PARSE_FAILED"
    );
  }

  const numPages = doc.numPages;
  const pageTexts: string[] = [];

  for (let i = 1; i <= numPages; i++) {
    try {
      const page = await doc.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item) => {
          if ("str" in item && typeof item.str === "string") {
            return item.str;
          }
          return "";
        })
        .join(" ")
        .trim();

      if (pageText) {
        pageTexts.push(pageText);
      }
    } catch {
      // Continue extracting other pages if one page has minor text errors
    }
  }

  const fullText = pageTexts.join("\n\n").trim();

  // Check if PDF has extractable text (detect scanned/image-only PDFs)
  const alphaNumericChars = fullText.replace(/[^a-zA-Z0-9]/g, "");
  if (alphaNumericChars.length < 10) {
    throw new PdfExtractionError(
      "This PDF contains no extractable text. It appears to be scanned or image-only. Scanned resumes requiring OCR are not supported in the MVP.",
      "SCANNED_PDF"
    );
  }

  return {
    text: fullText,
    pageCount: numPages,
  };
}
