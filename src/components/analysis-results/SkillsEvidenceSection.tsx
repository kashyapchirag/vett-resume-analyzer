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
          Skills &amp; Competency Verification
        </h2>
        <p className="text-xs text-muted-foreground">
          Direct citations from your resume alongside unaddressed requirements and keywords.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:items-stretch">
        {/* Matched Skills with Evidence (Left Column, 7 cols on lg) */}
        <div className="lg:col-span-7 rounded-2xl border border-border bg-surface p-5 sm:p-6 space-y-4 shadow-xs flex flex-col lg:h-full lg:max-h-[580px]">
          {/* Header: pinned / static, does not scroll */}
          <div className="flex items-center justify-between gap-4 border-b border-border pb-3 shrink-0">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 min-w-0">
              <Check className="h-4 w-4 text-success shrink-0" aria-hidden="true" />
              <span className="truncate">Matched Skills with Resume Evidence</span>
            </h3>
            <span className="whitespace-nowrap shrink-0 text-xs font-medium px-2.5 py-0.5 rounded-full bg-success/10 text-success border border-success/20">
              {matchedSkills.length} matched
            </span>
          </div>

          {/* Scrollable list on desktop, natural flow on mobile/tablet */}
          {matchedSkills.length === 0 ? (
            <p className="text-xs text-muted-foreground italic py-3">
              No direct skill matches were confirmed with explicit resume quotes.
            </p>
          ) : (
            <div className="flex-1 min-h-0 lg:overflow-y-auto pr-1.5 pb-2 space-y-3 custom-scrollbar">
              {matchedSkills.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-border/80 bg-surface-muted/30 p-3.5 sm:p-4 space-y-2 transition-colors hover:border-border-strong"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-sm text-foreground">
                      {item.skill}
                    </span>
                    {item.isVerified === false ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-warning whitespace-nowrap shrink-0">
                        <AlertCircle className="h-3 w-3" aria-hidden="true" />
                        <span>Unconfirmed in Text</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-success whitespace-nowrap shrink-0">
                        <Check className="h-3 w-3" aria-hidden="true" />
                        <span>Evidence Verified</span>
                      </span>
                    )}
                  </div>
                  <div className="border-l-2 border-accent/50 pl-3 py-0.5">
                    <p className="text-[11px] text-muted-foreground font-medium mb-0.5">
                      {item.isVerified === false
                        ? "Citation not confirmed in extracted resume text:"
                        : "Quoted from resume:"}
                    </p>
                    <blockquote className="text-xs sm:text-sm text-secondary-foreground italic leading-relaxed">
                      &ldquo;{item.evidence}&rdquo;
                    </blockquote>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Missing Requirements & Other Keywords (Right Column, 5 cols on lg) */}
        <div className="lg:col-span-5 flex flex-col space-y-5 justify-between">
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

            <p className="text-xs text-secondary-foreground leading-relaxed">
              The job description asks for these, but we couldn&apos;t find clear evidence in your resume.
            </p>

            {missingSkills.length === 0 ? (
              <p className="text-xs text-muted-foreground italic py-1">
                No missing requirements were detected from the job description.
              </p>
            ) : (
              <ul className="space-y-2 pt-1">
                {missingSkills.map((skill, idx) => (
                  <li
                    key={idx}
                    className="rounded-lg border border-border bg-surface-muted/50 px-3.5 py-2.5 text-xs text-secondary-foreground flex items-start gap-3"
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full bg-warning shrink-0 mt-2"
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

            <p className="text-xs text-muted-foreground leading-relaxed">
              Relevant terms from the job description not directly detected in your resume:
            </p>

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
