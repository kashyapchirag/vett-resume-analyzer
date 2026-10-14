"use client";

import { useState, FormEvent } from "react";
import { ResumeDropzone } from "./ResumeDropzone";
import { JobDescriptionInput } from "./JobDescriptionInput";
import { MIN_JOB_DESCRIPTION_CHARS } from "@/lib/constants";
import { formatFileSize } from "@/lib/formatters";

export function AnalyzerForm() {
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const isJobDescriptionValid =
    jobDescription.trim().length >= MIN_JOB_DESCRIPTION_CHARS;
  const isFormValid = file !== null && fileError === null && isJobDescriptionValid;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isFormValid) return;
    setIsSubmitted(true);
  }

  function handleReset() {
    setIsSubmitted(false);
  }

  return (
    <div className="w-full space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <ResumeDropzone
          file={file}
          onFileSelect={(selectedFile) => {
            setFile(selectedFile);
            setIsSubmitted(false);
          }}
          error={fileError}
          onError={setFileError}
        />

        <JobDescriptionInput
          value={jobDescription}
          onChange={(val) => {
            setJobDescription(val);
            setIsSubmitted(false);
          }}
        />

        <div className="pt-2">
          <button
            type="submit"
            disabled={!isFormValid}
            className={`w-full h-12 rounded-2xl text-sm font-semibold tracking-wide transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 ${
              isFormValid
                ? "bg-[var(--button-bg)] text-[var(--button-text)] hover:opacity-90 active:scale-[0.99] cursor-pointer shadow-xs"
                : "bg-[var(--surface-muted)] text-[var(--text-muted)] border border-[var(--border)] cursor-not-allowed opacity-60"
            }`}
          >
            Analyze Resume
          </button>
          {!isFormValid && (
            <p className="mt-2 text-center text-xs text-[var(--text-muted)]">
              {!file
                ? "Upload a resume (.pdf or .docx) to continue"
                : !isJobDescriptionValid
                ? `Paste a job description (at least ${MIN_JOB_DESCRIPTION_CHARS} characters) to continue`
                : "Resolve input errors above to continue"}
            </p>
          )}
        </div>
      </form>

      {isSubmitted && file && (
        <div
          role="status"
          aria-live="polite"
          className="rounded-2xl border border-[var(--border-strong)] bg-[var(--surface)] p-5 space-y-3 shadow-xs transition-all"
        >
          <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text)]">
            <span
              className="inline-block h-2 w-2 rounded-full bg-[var(--accent)]"
              aria-hidden="true"
            />
            <span>Inputs Validated — Phase 1 Ready</span>
          </div>

          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Your resume <strong className="text-[var(--text)]">{file.name}</strong> ({formatFileSize(file.size)}) and job description ({jobDescription.trim().length} characters) have been verified on the client.
          </p>

          <div className="rounded-xl bg-[var(--surface-muted)] p-3.5 text-xs text-[var(--text-secondary)] space-y-1">
            <p className="font-medium text-[var(--text)]">Next pipeline steps:</p>
            <ul className="list-disc pl-4 space-y-0.5 text-[var(--text-muted)]">
              <li>Phase 2: Safe in-memory text extraction for PDF and DOCX.</li>
              <li>Phase 3: Structured AI prompt comparison and ATS match scoring.</li>
            </ul>
          </div>

          <div className="pt-1 flex justify-end">
            <button
              type="button"
              onClick={handleReset}
              className="text-xs font-medium text-[var(--accent)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] rounded-sm px-1 py-0.5 cursor-pointer"
            >
              Edit Inputs
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
