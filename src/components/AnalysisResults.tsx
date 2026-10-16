"use client";

import { useMemo } from "react";
import type { AnalysisSuccessResponse } from "@/lib/validation/analysis-schema";
import { ScoreOverview } from "./analysis-results/ScoreOverview";
import { RoleAlignmentSection } from "./analysis-results/RoleAlignmentSection";
import { SkillsEvidenceSection } from "./analysis-results/SkillsEvidenceSection";
import { RecommendationsSection } from "./analysis-results/RecommendationsSection";
import { ResumeReadabilitySection } from "./analysis-results/ResumeReadabilitySection";

export interface AnalysisResultsProps {
  result: AnalysisSuccessResponse;
  onReset: () => void;
}

export function AnalysisResults({ result, onReset }: AnalysisResultsProps) {
  const { overallScore, scoreBand, analysis, metadata } = result;
  const {
    categoryScores,
    matchedSkills,
    missingSkills,
    responsibilityAlignment,
    projectAssessment,
    missingKeywords,
    actionableSuggestions,
    formatObservations,
  } = analysis;

  // Filter out any keyword that is already covered by missing requirements (case-insensitive deduplication)
  // Preserves original API data without mutation.
  const displayedKeywords = useMemo(() => {
    const missingSkillsNormalized = new Set(
      missingSkills.map((s) => s.trim().toLowerCase()),
    );

    const filtered = missingKeywords.filter(
      (kw) => !missingSkillsNormalized.has(kw.trim().toLowerCase()),
    );

    return Array.from(new Set(filtered.map((kw) => kw.trim()))).filter(Boolean);
  }, [missingSkills, missingKeywords]);

  return (
    <article
      role="region"
      aria-label="Resume Analysis Results"
      className="w-full space-y-8 animate-in fade-in duration-300"
    >
      {/* 1. Executive Summary & Match Overview */}
      <ScoreOverview
        overallScore={overallScore}
        scoreBand={scoreBand}
        metadata={metadata}
        categoryScores={categoryScores}
        matchedSkillsCount={matchedSkills.length}
        missingSkillsCount={missingSkills.length}
        displayedKeywordsCount={displayedKeywords.length}
      />

      {/* 2. Role Alignment & Experience Assessment */}
      <RoleAlignmentSection
        responsibilityAlignment={responsibilityAlignment}
        projectAssessment={projectAssessment}
      />

      {/* 3. Skills & Competency Verification */}
      <SkillsEvidenceSection
        matchedSkills={matchedSkills}
        missingSkills={missingSkills}
        displayedKeywords={displayedKeywords}
      />

      {/* 4. Ways to Improve Your Resume */}
      <RecommendationsSection actionableSuggestions={actionableSuggestions} />

      {/* 5. Resume Layout, Readability, Disclaimer & Reset Action */}
      <ResumeReadabilitySection
        formatObservations={formatObservations}
        onReset={onReset}
      />
    </article>
  );
}
