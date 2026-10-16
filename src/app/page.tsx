import { Header } from "@/components/Header";
import { AnalyzerForm } from "@/components/AnalyzerForm";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col justify-between">
      <Header />

      <main className="flex-1 w-full flex flex-col items-center px-4 sm:px-6 py-8 sm:py-12">
        <div className="w-full max-w-5xl space-y-8">
          <AnalyzerForm />
        </div>
      </main>

      {/* Transparent, Honest Footer */}
      <footer className="w-full border-t border-border py-6 text-center text-xs text-muted-foreground">
        <div className="mx-auto max-w-5xl px-4 space-y-1.5 leading-relaxed">
          <p>
            Vett processes resumes and job descriptions in memory to extract text and request an analysis via Google Gemini. Vett does not permanently store your documents.
          </p>
          <p>© {new Date().getFullYear()} Vett. Built for job seekers.</p>
        </div>
      </footer>
    </div>
  );
}
