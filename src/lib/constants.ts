/**
 * Maximum resume upload size in bytes: 3.5 MiB (3,670,016 bytes).
 * Ensures multipart request body (file + up to 50,000 char job description + headers)
 * remains comfortably below Vercel Functions' 4.5 MB request-body limit.
 */
export const MAX_RESUME_SIZE_BYTES = Math.floor(3.5 * 1024 * 1024);

/**
 * Human-readable label for the upload limit.
 */
export const MAX_RESUME_SIZE_LABEL = "3.5 MiB";

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

/**
 * Maximum character count for a job description (50,000 characters).
 * Keeps total multipart request payload safely below Vercel's 4.5 MB serverless limit.
 */
export const MAX_JOB_DESCRIPTION_CHARS = 50_000;

/**
 * Category weights for calculating the deterministic Estimated ATS Match Score.
 * Sum equals 1.0 (100%): Skills (35%), Responsibilities (25%), Projects (25%), Keywords (15%).
 */
export const SCORING_WEIGHTS = {
  skillsMatch: 0.35,
  jobResponsibilities: 0.25,
  projectsAndExperience: 0.25,
  keywordCoverage: 0.15,
} as const;
