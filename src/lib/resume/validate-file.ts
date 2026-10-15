import { MAX_RESUME_SIZE_BYTES, MAX_RESUME_SIZE_LABEL } from "@/lib/constants";
import { formatFileSize } from "@/lib/formatters";

export type DetectedFileType = "pdf" | "docx";

export interface FileValidationResult {
  valid: boolean;
  fileType?: DetectedFileType;
  error?: string;
  code?:
    | "EMPTY_FILE"
    | "FILE_TOO_LARGE"
    | "UNSUPPORTED_FORMAT"
    | "CORRUPTED_FILE";
}

/**
 * Validates file size, extension, and binary magic bytes (signature).
 * Does not trust client-supplied MIME headers or extension alone.
 */
export function validateResumeBuffer(
  fileName: string,
  buffer: Uint8Array
): FileValidationResult {
  // 1. Check for empty buffer
  if (!buffer || buffer.length === 0) {
    return {
      valid: false,
      error: "The uploaded file is empty. Please upload a valid document.",
      code: "EMPTY_FILE",
    };
  }

  // 2. Check 4 MiB size limit (4 * 1024 * 1024 bytes)
  if (buffer.length > MAX_RESUME_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size (${formatFileSize(buffer.length)}) exceeds the maximum allowed limit of ${MAX_RESUME_SIZE_LABEL}.`,
      code: "FILE_TOO_LARGE",
    };
  }

  // 3. Check extension
  const lowerName = fileName.toLowerCase();
  const isPdfExt = lowerName.endsWith(".pdf");
  const isDocxExt = lowerName.endsWith(".docx");

  if (!isPdfExt && !isDocxExt) {
    const ext = lowerName.includes(".") ? `.${lowerName.split(".").pop()}` : "unknown";
    return {
      valid: false,
      error: `Unsupported file extension (${ext}). Vett only supports .pdf and .docx documents. Note that legacy .doc files are not supported.`,
      code: "UNSUPPORTED_FORMAT",
    };
  }

  // 4. Validate binary magic bytes
  // PDF magic bytes: '%PDF' (0x25, 0x50, 0x44, 0x46)
  const isPdfSignature =
    buffer.length >= 4 &&
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46;

  // DOCX (ZIP container) magic bytes: 'PK\x03\x04' (0x50, 0x4B, 0x03, 0x04)
  const isZipSignature =
    buffer.length >= 4 &&
    buffer[0] === 0x50 &&
    buffer[1] === 0x4b &&
    buffer[2] === 0x03 &&
    buffer[3] === 0x04;

  if (isPdfExt) {
    if (!isPdfSignature) {
      return {
        valid: false,
        error: "The file extension is .pdf, but the file content does not have a valid PDF signature. It may be corrupted or renamed.",
        code: "CORRUPTED_FILE",
      };
    }
    return { valid: true, fileType: "pdf" };
  }

  if (isDocxExt) {
    if (!isZipSignature) {
      return {
        valid: false,
        error: "The file extension is .docx, but the file content does not have a valid OpenXML/ZIP document signature. Note that legacy .doc files are not supported.",
        code: "UNSUPPORTED_FORMAT",
      };
    }
    return { valid: true, fileType: "docx" };
  }

  return {
    valid: false,
    error: "Unable to verify document format.",
    code: "UNSUPPORTED_FORMAT",
  };
}
