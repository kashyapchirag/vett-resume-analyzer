import { z } from "zod";

/**
 * Metadata about an extracted resume document.
 */
export const ResumeMetadataSchema = z.object({
  fileName: z.string().min(1, "File name cannot be empty"),
  fileType: z.enum(["pdf", "docx"]),
  fileSize: z.number().int().positive("File size must be positive"),
  charCount: z.number().int().nonnegative(),
  wordCount: z.number().int().nonnegative(),
  pageCount: z.number().int().positive().optional(),
});

/**
 * Successful response contract for resume text extraction.
 */
export const ParseResumeSuccessSchema = z.object({
  success: z.literal(true),
  text: z.string().min(1, "Extracted text cannot be empty"),
  metadata: ResumeMetadataSchema,
});

/**
 * Error response contract for resume text extraction.
 */
export const ParseResumeErrorSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  code: z.enum([
    "NO_FILE",
    "EMPTY_FILE",
    "FILE_TOO_LARGE",
    "UNSUPPORTED_FORMAT",
    "CORRUPTED_FILE",
    "ENCRYPTED_PDF",
    "SCANNED_PDF",
    "PARSE_FAILED",
  ]),
});

/**
 * TypeScript types inferred directly from the runtime Zod schemas.
 */
export type ResumeMetadata = z.infer<typeof ResumeMetadataSchema>;
export type ParseResumeSuccess = z.infer<typeof ParseResumeSuccessSchema>;
export type ParseResumeError = z.infer<typeof ParseResumeErrorSchema>;
export type ParseResumeResponse = ParseResumeSuccess | ParseResumeError;
