/**
 * Normalizes text by collapsing whitespace and lowercasing for fuzzy substring comparison.
 */
export function normalizeForSearch(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

/**
 * Verifies whether an AI-generated quote actually corresponds to the extracted resume text.
 * Strips surrounding quotation marks and checks for verbatim or normalized presence.
 * Requires the full normalized evidence to be present in the resume text to prevent
 * hallucinated suffixes from being marked as verified.
 *
 * @param evidence Quoted evidence string from the analysis.
 * @param resumeText Extracted text from the resume.
 * @param preNormalizedResume Optional pre-normalized resume text to avoid recomputing in loops.
 * @returns boolean indicating whether the quote was verified in the resume text.
 */
export function verifyEvidenceInResume(
  evidence: string,
  resumeText: string,
  preNormalizedResume?: string
): boolean {
  const normalizedResume = preNormalizedResume ?? normalizeForSearch(resumeText);
  const trimmed = evidence.trim();
  const cleanedEvidence = trimmed.replace(/^["'“‘]+|["'”’]+$/g, "").trim();
  const normalizedEvidence = normalizeForSearch(cleanedEvidence);

  if (!normalizedEvidence || normalizedEvidence.length < 3) return false;
  return normalizedResume.includes(normalizedEvidence);
}
