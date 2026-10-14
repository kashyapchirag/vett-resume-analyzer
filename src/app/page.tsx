import { Header } from "@/components/Header";
import { AnalyzerForm } from "@/components/AnalyzerForm";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col justify-between">
      <Header />

      <main className="flex-1 w-full flex flex-col items-center px-4 sm:px-6 py-8 sm:py-12">
        <div className="w-full max-w-[720px] space-y-8">
          {/* Hero section */}
          <section className="space-y-3 text-center sm:text-left">
            <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-foreground">
              Compare your resume against any job description
            </h1>
            <p className="text-sm sm:text-base text-secondary-foreground leading-relaxed">
              Get an explainable Estimated ATS Match Score with evidence-backed strengths, identified gaps, and actionable recommendations.
            </p>
            <div className="inline-block rounded-lg border border-border bg-surface-muted px-3 py-1.5 text-xs text-muted-foreground">
              Note: This is Vett&apos;s independent estimate against your supplied job description, not an official score from an employer&apos;s ATS.
            </div>
          </section>

          {/* Workflow Form */}
          <section aria-label="Resume analysis form">
            <AnalyzerForm />
          </section>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="w-full border-t border-border py-6 text-center text-xs text-muted-foreground">
        <div className="mx-auto max-w-[720px] px-4 space-y-1">
          <p>
            Privacy by default: your resume is analyzed in memory and never permanently stored or shared.
          </p>
          <p>© {new Date().getFullYear()} Vett. Built for job seekers.</p>
        </div>
      </footer>
    </div>
  );
}
