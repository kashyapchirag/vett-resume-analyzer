import { Info, ArrowLeft } from "lucide-react";

export interface ResumeReadabilitySectionProps {
  formatObservations: string[];
  onReset: () => void;
}

export function ResumeReadabilitySection({
  formatObservations,
  onReset,
}: ResumeReadabilitySectionProps) {
  return (
    <>
      {/* Resume Layout & Readability */}
      {formatObservations.length > 0 && (
        <section
          aria-labelledby="formatting-heading"
          className="rounded-xl border border-border bg-surface p-5 sm:p-6 space-y-2.5 shadow-xs"
        >
          <h3
            id="formatting-heading"
            className="text-sm font-semibold text-foreground"
          >
            Resume Layout &amp; Readability
          </h3>
          <p className="text-xs text-muted-foreground">
            Observations on document structure, section layout, and machine-readability.
          </p>
          <ul className="space-y-2 text-xs sm:text-sm text-secondary-foreground list-none pl-0.5 pt-1">
            {formatObservations.map((obs, i) => (
              <li key={i} className="flex items-start gap-3">
                <span
                  className="h-1.5 w-1.5 rounded-full bg-accent shrink-0 mt-2"
                  aria-hidden="true"
                />
                <span className="leading-relaxed">{obs}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Simplified Disclaimer & Action Bar */}
      <footer className="space-y-4 pt-2">
        <div
          role="note"
          className="rounded-xl border border-border bg-surface-muted/40 p-4 sm:p-5 text-xs text-secondary-foreground space-y-1.5 leading-relaxed"
        >
          <div className="font-semibold text-foreground flex items-center gap-2">
            <Info className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
            <span>About This Estimate</span>
          </div>
          <p className="text-muted-foreground leading-relaxed pl-6">
            This match score is an independent estimate based on comparing your supplied resume with the job description. It is designed for guidance and does not predict or guarantee how any employer&apos;s proprietary ATS or hiring team will evaluate your application.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <p className="text-xs text-muted-foreground">
            Analysis evaluated in-memory against your supplied job description.
          </p>
          <button
            type="button"
            onClick={onReset}
            className="w-full sm:w-auto rounded-xl bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.99] px-5 py-2.5 text-xs font-semibold shadow-xs transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Analyze Another Resume</span>
          </button>
        </div>
      </footer>
    </>
  );
}
