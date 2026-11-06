export type ResumeParseErrorCode =
  | "EMPTY_FILE"
  | "FILE_TOO_LARGE"
  | "UNSUPPORTED_FORMAT"
  | "CORRUPTED_FILE"
  | "ENCRYPTED_PDF"
  | "SCANNED_PDF"
  | "PARSE_FAILED";

/**
 * Unified error class representing any expected failure during resume document
 * validation, parsing, or text extraction.
 */
export class ResumeParseError extends Error {
  readonly code: ResumeParseErrorCode;

  constructor(message: string, code: ResumeParseErrorCode) {
    super(message);
    this.name = "ResumeParseError";
    this.code = code;
  }
}
