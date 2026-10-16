import { FileText } from "lucide-react";
import { formatFileSize } from "@/lib/formatters";
import type { ResumeMetadata } from "@/lib/validation/resume-schema";
import type { CategoryScores } from "@/lib/validation/analysis-schema";

export interface ScoreOverviewProps {
  overallScore: number;
  scoreBand: "Strong Alignment" | "Moderate Alignment" | "Needs Improvement";
  metadata: ResumeMetadata;
  categoryScores: CategoryScores;
  matchedSkillsCount: number;
  missingSkillsCount: number;
  displayedKeywordsCount: number;
}

export function ScoreOverview({
  overallScore,
  scoreBand,
  metadata,
  categoryScores,
  matchedSkillsCount,
  missingSkillsCount,
  displayedKeywordsCount,
}: ScoreOverviewProps) {
  // Natural language headline based on the score band
  const matchHeading =
    scoreBand === "Strong Alignment"
      ? "Your resume is a strong match"
      : scoreBand === "Moderate Alignment"
      ? "Your resume is a moderate match"
      : "Your resume needs improvement to match";

  // Score color tokens aligned with design system
  const scoreColor =
    overallScore >= 75
      ? "text-success"
      : overallScore >= 50
      ? "text-accent"
      : "text-error";

  const scoreBadgeStyle =
    overallScore >= 75
      ? "bg-success/10 text-success border-success/20"
      : overallScore >= 50
      ? "bg-accent-soft text-accent border-accent/20"
      : "bg-error/10 text-error border-error/20";

  // Radial score meter geometry (38px radius, strokeWidth 6)
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset =
    circumference -
    (Math.min(100, Math.max(0, overallScore)) / 100) * circumference;

  // Category scores (weights and formula removed from UI display)
  const categories = [
    {
      key: "skillsMatch",
      label: "Required Skills Match",
      score: categoryScores.skillsMatch,
      description: "Direct presence of core technical and role-specific competencies.",
    },
    {
      key: "jobResponsibilities",
      label: "Role Responsibilities",
      score: categoryScores.jobResponsibilities,
      description: "Alignment with day-to-day duties, scope, and seniority expectations.",
    },
    {
      key: "projectsAndExperience",
      label: "Projects & Impact",
      score: categoryScores.projectsAndExperience,
      description: "Demonstrated project achievements, measurable impact, and depth.",
    },
    {
      key: "keywordCoverage",
      label: "Keyword Coverage",
      score: categoryScores.keywordCoverage,
      description: "Industry terminology, standard acronyms, and role phrasing.",
    },
  ];

  return (
    <section
      aria-labelledby="match-summary-heading"
      className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-xs space-y-6"
    >
      {/* Document Context Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2 min-w-0 flex-wrap">
          <FileText className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
          <span className="font-mono font-medium text-foreground truncate max-w-60 sm:max-w-xs">
            {metadata.fileName}
          </span>
          <span>•</span>
          <span className="uppercase font-medium tracking-wide">
            {metadata.fileType}
          </span>
          <span>•</span>
          <span>{formatFileSize(metadata.fileSize)}</span>
          <span>•</span>
          <span>{metadata.wordCount.toLocaleString()} words</span>
          {metadata.pageCount && (
            <>
              <span>•</span>
              <span>
                {metadata.pageCount}{" "}
                {metadata.pageCount === 1 ? "page" : "pages"}
              </span>
            </>
          )}
        </div>
        <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
          Resume–Job Match Estimate
        </span>
      </div>

      {/* Headline & Circular Score Indicator */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2.5 max-w-xl">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-semibold text-muted-foreground">
              Match Estimate
            </span>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap ${scoreBadgeStyle}`}
            >
              {scoreBand}
            </span>
          </div>

          <h2
            id="match-summary-heading"
            className="font-serif text-2xl sm:text-3xl font-normal tracking-tight text-foreground"
          >
            {matchHeading}
          </h2>

          <p className="text-xs sm:text-sm text-secondary-foreground leading-relaxed">
            We identified{" "}
            <strong className="font-semibold text-foreground">
              {matchedSkillsCount} matched {matchedSkillsCount === 1 ? "skill" : "skills"}
            </strong>{" "}
            with resume evidence, alongside{" "}
            <strong className="font-semibold text-foreground">
              {missingSkillsCount} unaddressed {missingSkillsCount === 1 ? "requirement" : "requirements"}
            </strong>{" "}
            and{" "}
            <strong className="font-semibold text-foreground">
              {displayedKeywordsCount} {displayedKeywordsCount === 1 ? "keyword" : "keywords"}
            </strong>{" "}
            to consider for this role.
          </p>
        </div>

        {/* Restrained Circular Score Indicator */}
        <div className="relative shrink-0 flex items-center justify-center self-center sm:self-auto">
          <svg
            className="h-24 w-24 -rotate-90 transform"
            viewBox="0 0 96 96"
            aria-hidden="true"
          >
            <circle
              cx="48"
              cy="48"
              r={radius}
              stroke="currentColor"
              strokeWidth="6"
              fill="transparent"
              className="text-border"
            />
            <circle
              cx="48"
              cy="48"
              r={radius}
              stroke="currentColor"
              strokeWidth="6"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeOffset}
              strokeLinecap="round"
              className={`${scoreColor} transition-all duration-700 ease-out`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-sans leading-none">
              {overallScore}
            </span>
            <span className="text-[11px] font-medium text-muted-foreground mt-0.5">
              / 100
            </span>
          </div>
        </div>
      </div>

      {/* Your Score Breakdown */}
      <div className="border-t border-border pt-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">
            Your Score Breakdown
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {categories.map((cat) => {
            const catColor =
              cat.score >= 75
                ? "bg-success"
                : cat.score >= 50
                ? "bg-accent"
                : "bg-error";

            return (
              <div
                key={cat.key}
                className="rounded-xl border border-border bg-surface-muted/40 p-4 space-y-2.5"
              >
                <div className="flex items-baseline justify-between text-xs">
                  <span className="font-semibold text-foreground">
                    {cat.label}
                  </span>
                  <span className="font-bold text-foreground font-mono">
                    {cat.score}
                    <span className="text-muted-foreground font-normal">
                      {" "}/ 100
                    </span>
                  </span>
                </div>

                {/* Accessible Slim Progress Meter */}
                <div
                  role="progressbar"
                  aria-label={cat.label}
                  aria-valuenow={cat.score}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  className="h-1.5 w-full rounded-full bg-border/60 overflow-hidden"
                >
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${catColor}`}
                    style={{ width: `${Math.max(4, cat.score)}%` }}
                  />
                </div>

                <p className="text-[11px] text-muted-foreground leading-normal">
                  {cat.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
