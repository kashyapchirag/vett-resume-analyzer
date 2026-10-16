import { SCORING_WEIGHTS } from "@/lib/constants";
import type { CategoryScores } from "@/lib/validation/analysis-schema";

/**
 * Calculates the overall Estimated ATS Match Score deterministically from
 * validated category sub-scores.
 *
 * Formula:
 * Overall = round(
 *   skillsMatch * 0.35 +
 *   jobResponsibilities * 0.25 +
 *   projectsAndExperience * 0.25 +
 *   keywordCoverage * 0.15
 * )
 *
 * @param scores Validated category sub-scores (each an integer from 0 to 100).
 * @returns Integer score between 0 and 100 inclusive.
 */
export function calculateOverallScore(scores: CategoryScores): number {
  const weightedSum =
    scores.skillsMatch * SCORING_WEIGHTS.skillsMatch +
    scores.jobResponsibilities * SCORING_WEIGHTS.jobResponsibilities +
    scores.projectsAndExperience * SCORING_WEIGHTS.projectsAndExperience +
    scores.keywordCoverage * SCORING_WEIGHTS.keywordCoverage;

  const roundedScore = Math.round(weightedSum);

  // Safeguard output within the [0, 100] boundary
  return Math.min(100, Math.max(0, roundedScore));
}
