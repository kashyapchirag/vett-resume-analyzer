import { Check, AlertCircle } from "lucide-react";
import type {
  ResponsibilityAlignment,
  ProjectAssessment,
} from "@/lib/validation/analysis-schema";

export interface RoleAlignmentSectionProps {
  responsibilityAlignment: ResponsibilityAlignment;
  projectAssessment: ProjectAssessment;
}

export function RoleAlignmentSection({
  responsibilityAlignment,
  projectAssessment,
}: RoleAlignmentSectionProps) {
  return (
    <section
      aria-labelledby="strengths-gaps-heading"
      className="space-y-4"
    >
      <div className="space-y-1">
        <h2
          id="strengths-gaps-heading"
          className="text-base font-semibold tracking-tight text-foreground"
        >
          Role Alignment &amp; Experience Assessment
        </h2>
        <p className="text-xs text-muted-foreground">
          How your demonstrated background compares against the expectations of the role.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Role Responsibilities */}
        <div className="rounded-xl border border-border bg-surface p-5 space-y-4 shadow-xs">
          <h3 className="text-xs font-semibold text-foreground border-b border-border pb-2.5">
            Role Responsibilities
          </h3>

          <div className="space-y-3.5 text-xs leading-relaxed">
            {responsibilityAlignment.strengths.length > 0 && (
              <div className="space-y-2">
                <span className="font-semibold text-success flex items-center gap-1.5 text-xs">
                  <Check className="h-3.5 w-3.5 text-success shrink-0" aria-hidden="true" />
                  <span>Strengths</span>
                </span>
                <ul className="space-y-2 list-none text-secondary-foreground pl-0.5">
                  {responsibilityAlignment.strengths.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span
                        className="h-1.5 w-1.5 rounded-full bg-success shrink-0 mt-2"
                        aria-hidden="true"
                      />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {responsibilityAlignment.gaps.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-border/60">
                <span className="font-semibold text-warning flex items-center gap-1.5 text-xs">
                  <AlertCircle className="h-3.5 w-3.5 text-warning shrink-0" aria-hidden="true" />
                  <span>Gaps to address</span>
                </span>
                <ul className="space-y-2 list-none text-muted-foreground pl-0.5">
                  {responsibilityAlignment.gaps.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span
                        className="h-1.5 w-1.5 rounded-full bg-warning shrink-0 mt-2"
                        aria-hidden="true"
                      />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Projects & Practical Impact */}
        <div className="rounded-xl border border-border bg-surface p-5 space-y-4 shadow-xs">
          <h3 className="text-xs font-semibold text-foreground border-b border-border pb-2.5">
            Projects &amp; Practical Impact
          </h3>

          <div className="space-y-3.5 text-xs leading-relaxed">
            {projectAssessment.strengths.length > 0 && (
              <div className="space-y-2">
                <span className="font-semibold text-success flex items-center gap-1.5 text-xs">
                  <Check className="h-3.5 w-3.5 text-success shrink-0" aria-hidden="true" />
                  <span>Key strengths</span>
                </span>
                <ul className="space-y-2 list-none text-secondary-foreground pl-0.5">
                  {projectAssessment.strengths.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span
                        className="h-1.5 w-1.5 rounded-full bg-success shrink-0 mt-2"
                        aria-hidden="true"
                      />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {projectAssessment.gaps.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-border/60">
                <span className="font-semibold text-warning flex items-center gap-1.5 text-xs">
                  <AlertCircle className="h-3.5 w-3.5 text-warning shrink-0" aria-hidden="true" />
                  <span>Areas for more detail</span>
                </span>
                <ul className="space-y-2 list-none text-muted-foreground pl-0.5">
                  {projectAssessment.gaps.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span
                        className="h-1.5 w-1.5 rounded-full bg-warning shrink-0 mt-2"
                        aria-hidden="true"
                      />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
