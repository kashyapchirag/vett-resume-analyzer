import { Check, AlertCircle } from "lucide-react";
import type { MatchedSkill } from "@/lib/validation/analysis-schema";

export interface SkillsEvidenceSectionProps {
  matchedSkills: MatchedSkill[];
  missingSkills: string[];
  displayedKeywords: string[];
}

export function SkillsEvidenceSection({
  matchedSkills,
  missingSkills,
  displayedKeywords,
}: SkillsEvidenceSectionProps) {
  return (
    <section
      aria-labelledby="skills-evidence-heading"
      className="space-y-4"
    >
      <div className="space-y-1">
        <h2
          id="skills-evidence-heading"
          className="text-base font-semibold tracking-tight text-foreground"
        >
          Skills &amp; Competencies
        </h2>
        <p className="text-xs text-muted-foreground">
          Demonstrated skills alongside unaddressed requirements and keywords.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Matched Skills (Left Column, 7 cols on lg) */}
        <div className="lg:col-span-7 rounded-2xl border border-border bg-surface p-5 sm:p-6 space-y-4 shadow-xs flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between gap-4 border-b border-border pb-3 shrink-0">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 min-w-0">
              <Check className="h-4 w-4 text-success shrink-0" aria-hidden="true" />
              <span className="truncate">Matched Skills</span>
            </h3>
            <span className="whitespace-nowrap shrink-0 text-xs font-medium px-2.5 py-0.5 rounded-full bg-success/10 text-success border border-success/20">
              {matchedSkills.length} matched
            </span>
          </div>

          {/* List of matched skills */}
          {matchedSkills.length === 0 ? (
            <p className="text-xs text-muted-foreground italic py-3">
              No matching skills were detected from the job description.
            </p>
          ) : (
            <div className="flex-1 min-h-0 max-h-[500px] overflow-y-auto pr-1.5 pb-1 custom-scrollbar">
              <ul className="space-y-2">
                {matchedSkills.map((item, idx) => (
                  <li
                    key={idx}
                    className="rounded-xl border border-border bg-surface-muted/30 px-3.5 py-2.5 text-xs font-medium text-foreground flex items-center gap-2.5 transition-colors hover:border-border-strong hover:bg-surface-muted/50"
                  >
                    <Check className="h-3.5 w-3.5 text-success shrink-0" aria-hidden="true" />
                    <span className="leading-relaxed">{item.skill}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Missing Requirements & Other Keywords (Right Column, 5 cols on lg) */}
        <div className="lg:col-span-5 flex flex-col space-y-5 justify-start lg:self-start">
          {/* Missing Requirements Card */}
          <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6 space-y-3.5 shadow-xs">
            <div className="flex items-center justify-between gap-4 border-b border-border pb-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 min-w-0">
                <AlertCircle className="h-4 w-4 text-warning shrink-0" aria-hidden="true" />
                <span className="truncate">Missing Requirements</span>
              </h3>
              <span className="whitespace-nowrap shrink-0 text-xs font-medium px-2.5 py-0.5 rounded-full bg-warning/10 text-warning border border-warning/20">
                {missingSkills.length} missing
              </span>
            </div>

            {missingSkills.length === 0 ? (
              <p className="text-xs text-muted-foreground italic py-1">
                No missing requirements were detected from the job description.
              </p>
            ) : (
              <ul className="space-y-2 pt-1">
                {missingSkills.map((skill, idx) => (
                  <li
                    key={idx}
                    className="rounded-xl border border-border bg-surface-muted/30 px-3.5 py-2.5 text-xs text-secondary-foreground flex items-start gap-2.5"
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full bg-warning shrink-0 mt-1.5"
                      aria-hidden="true"
                    />
                    <span className="leading-relaxed">{skill}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Other Keywords to Consider Card */}
          <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6 space-y-3 shadow-xs">
            <div className="flex items-center justify-between gap-4 border-b border-border pb-3">
              <h3 className="text-sm font-semibold text-foreground truncate">
                Other Keywords to Consider
              </h3>
              <span className="whitespace-nowrap shrink-0 text-xs font-medium px-2.5 py-0.5 rounded-full bg-surface-muted text-secondary-foreground border border-border font-mono">
                {displayedKeywords.length}
              </span>
            </div>

            {displayedKeywords.length === 0 ? (
              <p className="text-xs text-muted-foreground italic py-1">
                No additional missing keywords detected.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2 pt-1">
                {displayedKeywords.map((kw, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center rounded-lg bg-surface-muted border border-border px-2.5 py-1 text-xs font-mono text-secondary-foreground hover:border-border-strong transition-colors"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
