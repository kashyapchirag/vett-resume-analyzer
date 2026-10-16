import { z } from "zod";

/**
 * Metadata about an extracted resume document.
 * Shared across document extractors and the analysis pipeline.
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
 * TypeScript type inferred directly from the runtime Zod schema.
 */
export type ResumeMetadata = z.infer<typeof ResumeMetadataSchema>;
