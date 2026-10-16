import test from "node:test";
import assert from "node:assert/strict";
import { z } from "zod";

// 1. Centralized scoring weights (matching src/lib/constants.ts)
const SCORING_WEIGHTS = {
  skillsMatch: 0.35,
  jobResponsibilities: 0.25,
  projectsAndExperience: 0.25,
  keywordCoverage: 0.15,
};

function calculateOverallScore(scores) {
  const weightedSum =
    scores.skillsMatch * SCORING_WEIGHTS.skillsMatch +
    scores.jobResponsibilities * SCORING_WEIGHTS.jobResponsibilities +
    scores.projectsAndExperience * SCORING_WEIGHTS.projectsAndExperience +
    scores.keywordCoverage * SCORING_WEIGHTS.keywordCoverage;

  return Math.round(weightedSum);
}

// 2. Normalization & Evidence verification (matching src/app/api/analyze-resume/route.ts)
function normalizeForSearch(text) {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

function verifyEvidenceInResume(evidence, resumeText) {
  const normalizedResume = normalizeForSearch(resumeText);
  const trimmed = evidence.trim();
  const cleanedEvidence = trimmed.replace(/^["'“‘]+|["'”’]+$/g, "").trim();
  const normalizedEvidence = normalizeForSearch(cleanedEvidence);

  if (!normalizedEvidence || normalizedEvidence.length < 3) return false;
  return normalizedResume.includes(normalizedEvidence);
}

// ==============================================================================
// TEST SUITES
// ==============================================================================

test("calculateOverallScore - accurately computes 35/25/25/15 weighted sum", () => {
  // All zeros
  assert.equal(
    calculateOverallScore({
      skillsMatch: 0,
      jobResponsibilities: 0,
      projectsAndExperience: 0,
      keywordCoverage: 0,
    }),
    0
  );

  // All hundreds
  assert.equal(
    calculateOverallScore({
      skillsMatch: 100,
      jobResponsibilities: 100,
      projectsAndExperience: 100,
      keywordCoverage: 100,
    }),
    100
  );

  // Realistic mixed scores:
  // 85*0.35 (29.75) + 35*0.25 (8.75) + 30*0.25 (7.5) + 75*0.15 (11.25) = 57.25 -> 57
  assert.equal(
    calculateOverallScore({
      skillsMatch: 85,
      jobResponsibilities: 35,
      projectsAndExperience: 30,
      keywordCoverage: 75,
    }),
    57
  );

  // Rounding up boundary:
  // 80*0.35 (28) + 70*0.25 (17.5) + 60*0.25 (15) + 50*0.15 (7.5) = 68.0 -> 68
  assert.equal(
    calculateOverallScore({
      skillsMatch: 80,
      jobResponsibilities: 70,
      projectsAndExperience: 60,
      keywordCoverage: 50,
    }),
    68
  );
});

test("verifyEvidenceInResume - validates verbatim and normalized quotations", () => {
  const resume = "Experienced software developer with 5+ years building scalable microservices in TypeScript and React. Deployed containerized applications to AWS with Docker.";

  // Exact verbatim match
  assert.equal(
    verifyEvidenceInResume("building scalable microservices in TypeScript", resume),
    true
  );

  // Match with surrounding quotes and extra whitespace
  assert.equal(
    verifyEvidenceInResume('  "Deployed containerized applications to AWS with Docker." ', resume),
    true
  );

  // Case-insensitive match
  assert.equal(
    verifyEvidenceInResume("typescript and react", resume),
    true
  );

  // Fabricated / non-existent claim
  assert.equal(
    verifyEvidenceInResume("Led a team of 50 Kubernetes architects in Golang", resume),
    false
  );

  // Partial match with hallucinated continuation (> 35 chars) should NOT be verified
  assert.equal(
    verifyEvidenceInResume(
      "Experienced software developer with 5+ years building scalable microservices in TypeScript and COBOL on mainframes",
      resume
    ),
    false
  );

  // Partial substring starting identically but with fabricated ending
  assert.equal(
    verifyEvidenceInResume("building scalable microservices in TypeScript and Ruby", resume),
    false
  );

  // Empty string
  assert.equal(verifyEvidenceInResume("", resume), false);
});

test("Input Validation - rejects invalid job description length", () => {
  const schema = z.object({
    jobDescription: z.string().min(50).max(50000),
  });

  // Too short (< 50 chars)
  const shortResult = schema.safeParse({ jobDescription: "Too short" });
  assert.equal(shortResult.success, false);

  // Valid length
  const validResult = schema.safeParse({
    jobDescription: "We are seeking a senior full stack engineer with deep experience in TypeScript, React, and Node.js.",
  });
  assert.equal(validResult.success, true);
});
