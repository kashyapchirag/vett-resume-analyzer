/**
 * Maximum resume upload size in bytes: 4 MiB (4,194,304 bytes).
 */
export const MAX_RESUME_SIZE_BYTES = 4 * 1024 * 1024;

/**
 * Human-readable label for the upload limit.
 */
export const MAX_RESUME_SIZE_LABEL = "4 MiB";

/**
 * Allowed file extensions for resume uploads in the MVP.
 */
export const ALLOWED_RESUME_EXTENSIONS = [".pdf", ".docx"] as const;

/**
 * Allowed MIME types for client-side selection filtering.
 */
export const ALLOWED_RESUME_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

/**
 * Minimum recommended character count for a job description.
 */
export const MIN_JOB_DESCRIPTION_CHARS = 50;
