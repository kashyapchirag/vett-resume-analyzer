"use client";

import { SCORING_WEIGHTS } from "@/lib/constants";
import { formatFileSize } from "@/lib/formatters";
import type { AnalysisSuccessResponse } from "@/lib/validation/analysis-schema";

interface AnalysisResultsProps {
  result: AnalysisSuccessResponse;
  onReset: () => void;
}

export function AnalysisResults({ result, onReset }: AnalysisResultsProps) {
  const { overallScore, scoreBand, analysis, metadata, disclaimer } = result;
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

  const categories = [
    {
      key: "skillsMatch",
      label: "Required Skills Match",
      weight: `${Math.round(SCORING_WEIGHTS.skillsMatch * 100)}%`,
      score: categoryScores.skillsMatch,
      description: "Direct presence of mandatory and preferred technical skills.",
    },
    {
      key: "jobResponsibilities",
      label: "Role Responsibilities",
      weight: `${Math.round(SCORING_WEIGHTS.jobResponsibilities * 100)}%`,
      score: categoryScores.jobResponsibilities,
      description: "Alignment with required duties, scope, and seniority expectations.",
    },
    {
      key: "projectsAndExperience",
      label: "Projects & Impact",
      weight: `${Math.round(SCORING_WEIGHTS.projectsAndExperience * 100)}%`,
      score: categoryScores.projectsAndExperience,
      description: "Demonstrable project outcomes, technical depth, and domain relevance.",
    },
    {
      key: "keywordCoverage",
      label: "Keyword Coverage",
      weight: `${Math.round(SCORING_WEIGHTS.keywordCoverage * 100)}%`,
      score: categoryScores.keywordCoverage,
      description: "Standard industry terminology and domain concepts.",
    },
  ];

  return (
    <article
      role="region"
      aria-label="Resume Analysis Results"
      className="w-full space-y-8 animate-in fade-in duration-300"
    >
      {/* 1. Scorecard Header */}
      <div className="rounded-3xl border border-border bg-surface p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full bg-success"
                aria-hidden="true"
              />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                ATS Heuristic Analysis
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Estimated ATS Match Score
            </h2>
            <p className="text-xs text-secondary-foreground">
              Evaluated against supplied job description for{" "}
              <span className="font-semibold text-foreground font-mono">
                {metadata.fileName}
              </span>
            </p>
          </div>

          <div className="flex items-baseline gap-3 bg-surface-muted border border-border rounded-2xl px-5 py-4 self-start sm:self-auto">
            <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground">
              {overallScore}
            </span>
            <div className="text-xs space-y-0.5">
              <span className="text-muted-foreground font-medium block">/ 100</span>
              <span
                className={`font-semibold inline-block ${
                  overallScore >= 75
                    ? "text-success"
                    : overallScore >= 50
                    ? "text-warning"
                    : "text-error"
                }`}
              >
                {scoreBand}
              </span>
            </div>
          </div>
        </div>

        {/* Category Breakdown Bars */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Category Sub-Scores & Weights
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {categories.map((cat) => (
              <div
                key={cat.key}
                className="rounded-2xl border border-border bg-surface-muted p-4 space-y-2.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-foreground">
                      {cat.label}
                    </span>
                    <span className="ml-1.5 text-muted-foreground font-mono text-[11px]">
                      ({cat.weight})
                    </span>
                  </div>
                  <span className="font-bold text-foreground font-mono">
                    {cat.score} / 100
                  </span>
                </div>

                {/* Accessible Progress Meter */}
                <div
                  role="progressbar"
                  aria-label={cat.label}
                  aria-valuenow={cat.score}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  className="h-2 w-full rounded-full bg-border overflow-hidden"
                >
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      cat.score >= 75
                        ? "bg-success"
                        : cat.score >= 50
                        ? "bg-warning"
                        : "bg-error"
                    }`}
                    style={{ width: `${Math.max(4, cat.score)}%` }}
                  />
                </div>

                <p className="text-[11px] text-muted-foreground leading-tight">
                  {cat.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Document Metadata Badges */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border text-xs text-muted-foreground">
          <span className="px-2.5 py-1 rounded-lg bg-surface-muted border border-border font-medium">
            Format: {metadata.fileType.toUpperCase()}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-surface-muted border border-border font-medium">
            Size: {formatFileSize(metadata.fileSize)}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-surface-muted border border-border font-medium">
            Words: {metadata.wordCount.toLocaleString()}
          </span>
          {metadata.pageCount && (
            <span className="px-2.5 py-1 rounded-lg bg-surface-muted border border-border font-medium">
              Pages: {metadata.pageCount}
            </span>
          )}
        </div>

        {/* Prominent Heuristic Disclaimer Banner */}
        <div
          role="note"
          className="rounded-2xl border border-accent/20 bg-accent-soft/40 p-4 text-xs text-secondary-foreground space-y-1"
        >
          <div className="font-semibold text-accent flex items-center gap-1.5">
            <span aria-hidden="true">ℹ️</span>
            <span>Heuristic Disclaimer</span>
          </div>
          <p className="leading-relaxed">{disclaimer}</p>
        </div>
      </div>

      {/* 2. Skills Analysis: Matched vs. Missing */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Matched Skills with Citations */}
        <section
          aria-labelledby="matched-skills-heading"
          className="rounded-3xl border border-border bg-surface p-6 shadow-xs space-y-4"
        >
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3
              id="matched-skills-heading"
              className="text-sm font-bold text-foreground flex items-center gap-2"
            >
              <span className="text-success" aria-hidden="true">✓</span>
              <span>Matched Skills with Resume Evidence</span>
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-success/15 text-success">
              {matchedSkills.length}
            </span>
          </div>

          {matchedSkills.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">
              No direct skill matches were identified with verifiable resume evidence.
            </p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {matchedSkills.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-border bg-surface-muted p-3.5 space-y-1.5 text-xs"
                >
                  <span className="font-semibold text-foreground inline-block">
                    {item.skill}
                  </span>
                  <blockquote className="text-secondary-foreground italic border-l-2 border-accent pl-2.5 font-sans leading-relaxed">
                    &ldquo;{item.evidence}&rdquo;
                  </blockquote>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Missing / Unaddressed Skills */}
        <section
          aria-labelledby="missing-skills-heading"
          className="rounded-3xl border border-border bg-surface p-6 shadow-xs space-y-4"
        >
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3
              id="missing-skills-heading"
              className="text-sm font-bold text-foreground flex items-center gap-2"
            >
              <span className="text-warning" aria-hidden="true">!</span>
              <span>Missing or Unaddressed Requirements</span>
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-warning/15 text-warning">
              {missingSkills.length}
            </span>
          </div>

          {missingSkills.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">
              No prominent skill gaps were detected based on the job description.
            </p>
          ) : (
            <div className="space-y-2">
              <p className="text-[11px] text-muted-foreground">
                The resume lacks clear evidence for the following items mentioned in the job description:
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {missingSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="rounded-xl border border-border bg-surface-muted px-3 py-1 text-xs font-medium text-secondary-foreground"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      {/* 3. Role Responsibilities & Projects Assessment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Responsibilities Alignment */}
        <section
          aria-labelledby="responsibilities-heading"
          className="rounded-3xl border border-border bg-surface p-6 shadow-xs space-y-4"
        >
          <h3
            id="responsibilities-heading"
            className="text-sm font-bold text-foreground border-b border-border pb-3"
          >
            Role Responsibilities Alignment
          </h3>

          <div className="space-y-4 text-xs">
            {responsibilityAlignment.strengths.length > 0 && (
              <div className="space-y-1.5">
                <span className="font-semibold text-success flex items-center gap-1.5">
                  <span aria-hidden="true">✓</span> Demonstrated Strengths
                </span>
                <ul className="space-y-1 list-disc list-inside text-secondary-foreground leading-relaxed pl-1">
                  {responsibilityAlignment.strengths.map((str, i) => (
                    <li key={i}>{str}</li>
                  ))}
                </ul>
              </div>
            )}

            {responsibilityAlignment.gaps.length > 0 && (
              <div className="space-y-1.5">
                <span className="font-semibold text-warning flex items-center gap-1.5">
                  <span aria-hidden="true">•</span> Unaddressed Duties / Gaps
                </span>
                <ul className="space-y-1 list-disc list-inside text-muted-foreground leading-relaxed pl-1">
                  {responsibilityAlignment.gaps.map((gap, i) => (
                    <li key={i}>{gap}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>

        {/* Project & Experience Assessment */}
        <section
          aria-labelledby="projects-heading"
          className="rounded-3xl border border-border bg-surface p-6 shadow-xs space-y-4"
        >
          <h3
            id="projects-heading"
            className="text-sm font-bold text-foreground border-b border-border pb-3"
          >
            Projects & Practical Impact
          </h3>

          <div className="space-y-4 text-xs">
            {projectAssessment.strengths.length > 0 && (
              <div className="space-y-1.5">
                <span className="font-semibold text-success flex items-center gap-1.5">
                  <span aria-hidden="true">✓</span> Concrete Accomplishments
                </span>
                <ul className="space-y-1 list-disc list-inside text-secondary-foreground leading-relaxed pl-1">
                  {projectAssessment.strengths.map((str, i) => (
                    <li key={i}>{str}</li>
                  ))}
                </ul>
              </div>
            )}

            {projectAssessment.gaps.length > 0 && (
              <div className="space-y-1.5">
                <span className="font-semibold text-warning flex items-center gap-1.5">
                  <span aria-hidden="true">•</span> Areas Needing More Depth or Metrics
                </span>
                <ul className="space-y-1 list-disc list-inside text-muted-foreground leading-relaxed pl-1">
                  {projectAssessment.gaps.map((gap, i) => (
                    <li key={i}>{gap}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* 4. Missing Keywords & Format Observations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Missing Keywords */}
        <section
          aria-labelledby="keywords-heading"
          className="rounded-3xl border border-border bg-surface p-6 shadow-xs space-y-3"
        >
          <h3
            id="keywords-heading"
            className="text-sm font-bold text-foreground border-b border-border pb-3"
          >
            Relevant Missing Keywords
          </h3>
          {missingKeywords.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">
              No critical industry keywords were found missing.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2 pt-1">
              {missingKeywords.map((kw, i) => (
                <span
                  key={i}
                  className="rounded-lg bg-surface-muted border border-border px-2.5 py-1 text-xs font-mono text-secondary-foreground"
                >
                  {kw}
                </span>
              ))}
            </div>
          )}
        </section>

        {/* Formatting & Structure Observations */}
        <section
          aria-labelledby="formatting-heading"
          className="rounded-3xl border border-border bg-surface p-6 shadow-xs space-y-3"
        >
          <h3
            id="formatting-heading"
            className="text-sm font-bold text-foreground border-b border-border pb-3"
          >
            Structure & Readability Observations
          </h3>
          {formatObservations.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">
              Standard document structure and readable presentation.
            </p>
          ) : (
            <ul className="space-y-1.5 text-xs text-secondary-foreground list-disc list-inside">
              {formatObservations.map((obs, i) => (
                <li key={i}>{obs}</li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* 5. Actionable Suggestions */}
      {actionableSuggestions.length > 0 && (
        <section
          aria-labelledby="suggestions-heading"
          className="rounded-3xl border border-border bg-surface p-6 sm:p-8 shadow-xs space-y-4"
        >
          <h3
            id="suggestions-heading"
            className="text-base font-bold text-foreground flex items-center gap-2 border-b border-border pb-3"
          >
            <span className="text-accent" aria-hidden="true">💡</span>
            <span>Actionable Resume Improvement Suggestions</span>
          </h3>
          <ol className="space-y-3 text-xs sm:text-sm text-secondary-foreground list-decimal list-inside leading-relaxed">
            {actionableSuggestions.map((suggestion, idx) => (
              <li key={idx} className="pl-1">
                <span className="font-medium text-foreground">{suggestion}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* 6. Action Bar */}
      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-muted-foreground">
          Analysis generated based on provided text.
        </p>
        <button
          type="button"
          onClick={onReset}
          className="rounded-2xl border border-border bg-surface-muted px-4 py-2 text-xs font-semibold text-foreground hover:bg-surface-hover active:scale-[0.99] transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          Analyze Another Resume
        </button>
      </div>
    </article>
  );
}
