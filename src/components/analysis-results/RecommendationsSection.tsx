import { ShieldCheck } from "lucide-react";

export interface RecommendationsSectionProps {
  actionableSuggestions: string[];
}

export function RecommendationsSection({
  actionableSuggestions,
}: RecommendationsSectionProps) {
  if (actionableSuggestions.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="suggestions-heading"
      className="rounded-2xl border border-border bg-surface p-6 sm:p-7 shadow-xs space-y-4"
    >
      <div className="space-y-1.5 border-b border-border pb-3">
        <span className="text-xs font-semibold text-accent">
          Recommendations
        </span>
        <h2
          id="suggestions-heading"
          className="text-base sm:text-lg font-semibold text-foreground"
        >
          Ways to Improve Your Resume
        </h2>
        <p className="text-xs sm:text-sm text-secondary-foreground">
          Practical suggestions grounded in the provided documents to address alignment gaps.
        </p>
      </div>

      {/* Authenticity Notice with ShieldCheck */}
      <div className="rounded-xl border border-accent/20 bg-accent-soft/30 px-4 py-3 text-xs text-secondary-foreground flex items-start sm:items-center gap-2.5">
        <ShieldCheck className="h-4.5 w-4.5 text-accent shrink-0" aria-hidden="true" />
        <p className="leading-relaxed">
          <strong className="text-foreground font-medium">Authenticity matters:</strong> Only add skills, tools, or responsibilities that you have genuinely worked with or practiced. Never fabricate qualifications.
        </p>
      </div>

      <div className="space-y-2.5">
        {actionableSuggestions.map((suggestion, idx) => (
          <div
            key={idx}
            className="flex items-start gap-3 rounded-xl border border-border bg-surface-muted/30 p-3.5 sm:p-4 text-xs sm:text-sm text-foreground leading-relaxed"
          >
            <span className="text-accent font-mono font-bold text-xs shrink-0 pt-0.5">
              {(idx + 1).toString().padStart(2, "0")}
            </span>
            <span className="text-secondary-foreground">
              {suggestion}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
