import test from "node:test";
import assert from "node:assert/strict";

// Import directly from production application code
import { calculateOverallScore } from "../src/lib/analysis/scoring.ts";
import {
  verifyEvidenceInResume,
  normalizeForSearch,
} from "../src/lib/analysis/evidence.ts";
import {
  AnalysisRequestSchema,
  CategoryScoresSchema,
} from "../src/lib/validation/analysis-schema.ts";
import {
  SCORING_WEIGHTS,
  MIN_JOB_DESCRIPTION_CHARS,
  MAX_JOB_DESCRIPTION_CHARS,
} from "../src/lib/constants.ts";

// ==============================================================================
// 1. Scoring Engine Tests (Production Code)
// ==============================================================================

test("calculateOverallScore - verifies production constants match 35/25/25/15 weights", () => {
  assert.equal(SCORING_WEIGHTS.skillsMatch, 0.35);
  assert.equal(SCORING_WEIGHTS.jobResponsibilities, 0.25);
  assert.equal(SCORING_WEIGHTS.projectsAndExperience, 0.25);
  assert.equal(SCORING_WEIGHTS.keywordCoverage, 0.15);

  const totalWeight =
    SCORING_WEIGHTS.skillsMatch +
    SCORING_WEIGHTS.jobResponsibilities +
    SCORING_WEIGHTS.projectsAndExperience +
    SCORING_WEIGHTS.keywordCoverage;
  assert.equal(Math.round(totalWeight * 100) / 100, 1.0);
});

test("calculateOverallScore - accurately computes weighted sum across score bands", () => {
  // All zeros -> 0
  assert.equal(
    calculateOverallScore({
      skillsMatch: 0,
      jobResponsibilities: 0,
      projectsAndExperience: 0,
      keywordCoverage: 0,
    }),
    0
  );

  // All hundreds -> 100
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

  // Rounding boundary:
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

test("calculateOverallScore - clamps outputs strictly within [0, 100]", () => {
  // Values below 0 clamped to 0
  assert.equal(
    calculateOverallScore({
      skillsMatch: -50,
      jobResponsibilities: 0,
      projectsAndExperience: 0,
      keywordCoverage: 0,
    }),
    0
  );

  // Values exceeding 100 clamped to 100
  assert.equal(
    calculateOverallScore({
      skillsMatch: 150,
      jobResponsibilities: 120,
      projectsAndExperience: 110,
      keywordCoverage: 100,
    }),
    100
  );
});

// ==============================================================================
// 2. Evidence Verification Tests (Production Code)
// ==============================================================================

test("verifyEvidenceInResume - validates verbatim, case-insensitive, and punctuation-trimmed quotes", () => {
  const resume =
    "Experienced software developer with 5+ years building scalable microservices in TypeScript and React. Deployed containerized applications to AWS with Docker.";

  // Verbatim match
  assert.equal(
    verifyEvidenceInResume(
      "building scalable microservices in TypeScript",
      resume
    ),
    true
  );

  // Match with surrounding curly / straight quotes and whitespace
  assert.equal(
    verifyEvidenceInResume(
      '  “Deployed containerized applications to AWS with Docker.” ',
      resume
    ),
    true
  );

  // Case-insensitive match
  assert.equal(
    verifyEvidenceInResume("typescript and react", resume),
    true
  );

  // Supports optional pre-normalized resume parameter
  const preNormalized = normalizeForSearch(resume);
  assert.equal(
    verifyEvidenceInResume(
      "containerized applications to aws",
      resume,
      preNormalized
    ),
    true
  );
});

test("verifyEvidenceInResume - rejects hallucinations, partial extensions, and empty citations", () => {
  const resume =
    "Experienced software developer with 5+ years building scalable microservices in TypeScript and React. Deployed containerized applications to AWS with Docker.";

  // Completely fabricated claim
  assert.equal(
    verifyEvidenceInResume(
      "Led a team of 50 Kubernetes architects in Golang",
      resume
    ),
    false
  );

  // Partial prefix match with hallucinated continuation
  assert.equal(
    verifyEvidenceInResume(
      "building scalable microservices in TypeScript and Ruby on Rails",
      resume
    ),
    false
  );

  // Too short (< 3 chars after trimming quotes)
  assert.equal(verifyEvidenceInResume('""', resume), false);
  assert.equal(verifyEvidenceInResume("AB", resume), false);
  assert.equal(verifyEvidenceInResume("", resume), false);
});

// ==============================================================================
// 3. Schema Validation Tests (Production Code)
// ==============================================================================

test("AnalysisRequestSchema - enforces production length boundaries on job descriptions", () => {
  // Too short (< MIN_JOB_DESCRIPTION_CHARS)
  const shortResult = AnalysisRequestSchema.safeParse({
    jobDescription: "Short text",
  });
  assert.equal(shortResult.success, false);
  if (!shortResult.success) {
    assert.match(
      shortResult.error.issues[0].message,
      new RegExp(`at least ${MIN_JOB_DESCRIPTION_CHARS}`)
    );
  }

  // Exactly at lower boundary (50 characters)
  const boundaryText = "a".repeat(MIN_JOB_DESCRIPTION_CHARS);
  const boundaryResult = AnalysisRequestSchema.safeParse({
    jobDescription: boundaryText,
  });
  assert.equal(boundaryResult.success, true);

  // Whitespace-only string that trims to empty
  const whitespaceResult = AnalysisRequestSchema.safeParse({
    jobDescription: "   ".repeat(20),
  });
  assert.equal(whitespaceResult.success, false);

  // Exceeds upper boundary (> MAX_JOB_DESCRIPTION_CHARS)
  const tooLongResult = AnalysisRequestSchema.safeParse({
    jobDescription: "a".repeat(MAX_JOB_DESCRIPTION_CHARS + 1),
  });
  assert.equal(tooLongResult.success, false);
  if (!tooLongResult.success) {
    assert.match(
      tooLongResult.error.issues[0].message,
      /cannot exceed/i
    );
  }

  // Valid realistic job description
  const validResult = AnalysisRequestSchema.safeParse({
    jobDescription:
      "We are seeking a senior full stack engineer with deep experience in TypeScript, React, and Node.js to lead platform scaling.",
  });
  assert.equal(validResult.success, true);
});

test("CategoryScoresSchema - strictly enforces integer ranges 0-100", () => {
  // Valid integer scores
  const validScores = CategoryScoresSchema.safeParse({
    skillsMatch: 85,
    jobResponsibilities: 70,
    projectsAndExperience: 65,
    keywordCoverage: 50,
  });
  assert.equal(validScores.success, true);

  // Rejects floating point score
  const floatScores = CategoryScoresSchema.safeParse({
    skillsMatch: 85.5,
    jobResponsibilities: 70,
    projectsAndExperience: 65,
    keywordCoverage: 50,
  });
  assert.equal(floatScores.success, false);

  // Rejects out of bounds (> 100)
  const highScores = CategoryScoresSchema.safeParse({
    skillsMatch: 101,
    jobResponsibilities: 70,
    projectsAndExperience: 65,
    keywordCoverage: 50,
  });
  assert.equal(highScores.success, false);

  // Rejects negative numbers (< 0)
  const negativeScores = CategoryScoresSchema.safeParse({
    skillsMatch: -1,
    jobResponsibilities: 70,
    projectsAndExperience: 65,
    keywordCoverage: 50,
  });
  assert.equal(negativeScores.success, false);
});
