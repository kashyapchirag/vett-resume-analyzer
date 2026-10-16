"use client";

import { useState, FormEvent } from "react";
import { ResumeDropzone } from "./ResumeDropzone";
import { JobDescriptionInput } from "./JobDescriptionInput";
import { AnalysisResults } from "./AnalysisResults";
import {
  MIN_JOB_DESCRIPTION_CHARS,
  MAX_JOB_DESCRIPTION_CHARS,
} from "@/lib/constants";
import type {
  AnalysisSuccessResponse,
  AnalysisErrorResponse,
} from "@/lib/validation/analysis-schema";

export function AnalyzerForm() {
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] =
    useState<AnalysisSuccessResponse | null>(null);

  const isJobDescriptionValid =
    jobDescription.trim().length >= MIN_JOB_DESCRIPTION_CHARS &&
    jobDescription.trim().length <= MAX_JOB_DESCRIPTION_CHARS;

  const isFormValid =
    file !== null && fileError === null && isJobDescriptionValid && !isLoading;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isFormValid || !file) return;

    setIsLoading(true);
    setApiError(null);

    try {
      // Create FormData without manual Content-Type header so browser sets multipart boundary
      const formData = new FormData();
      formData.append("resume", file);
      formData.append("jobDescription", jobDescription.trim());

      const res = await fetch("/api/analyze-resume", {
        method: "POST",
        body: formData,
      });

      const data: AnalysisSuccessResponse | AnalysisErrorResponse =
        await res.json();

      if (!res.ok || !data.success) {
        setApiError(
          "error" in data && typeof data.error === "string"
            ? data.error
            : "An unexpected error occurred while analyzing the resume."
        );
      } else {
        setAnalysisResult(data);
      }
    } catch {
      setApiError(
        "Network connection error while communicating with the analysis server. Please check your connection and try again."
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleReset() {
    setAnalysisResult(null);
    setApiError(null);
  }

  // If analysis succeeded, render the complete AnalysisResults report
  if (analysisResult) {
    return (
      <div className="w-full space-y-6">
        <AnalysisResults result={analysisResult} onReset={handleReset} />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <ResumeDropzone
          file={file}
          onFileSelect={(selectedFile) => {
            setFile(selectedFile);
            setApiError(null);
          }}
          error={fileError}
          onError={setFileError}
        />

        <JobDescriptionInput
          value={jobDescription}
          disabled={isLoading}
          onChange={(val) => {
            setJobDescription(val);
            setApiError(null);
          }}
        />

        <div className="pt-2">
          <button
            type="submit"
            disabled={!isFormValid}
            className={`w-full h-12 rounded-2xl text-sm font-semibold tracking-wide transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 flex items-center justify-center gap-2 ${
              isFormValid
                ? "bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.99] cursor-pointer shadow-xs"
                : "bg-surface-muted text-muted-foreground border border-border cursor-not-allowed opacity-60"
            }`}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Analyzing your resume against the job description…</span>
              </>
            ) : (
              <span>Analyze Resume</span>
            )}
          </button>
          {!isFormValid && !isLoading && (
            <p className="mt-2 text-center text-xs text-muted-foreground">
              {!file
                ? "Upload a resume (.pdf or .docx) to continue"
                : jobDescription.trim().length < MIN_JOB_DESCRIPTION_CHARS
                ? `Paste a job description (at least ${MIN_JOB_DESCRIPTION_CHARS} characters) to continue`
                : jobDescription.trim().length > MAX_JOB_DESCRIPTION_CHARS
                ? `Job description exceeds ${MAX_JOB_DESCRIPTION_CHARS.toLocaleString()} character limit`
                : "Resolve input errors above to continue"}
            </p>
          )}
        </div>
      </form>

      {/* Server Analysis Error State */}
      {apiError && (
        <div
          role="alert"
          className="rounded-2xl border border-error/30 bg-surface p-5 text-xs text-error space-y-1.5 shadow-xs transition-all"
        >
          <div className="font-semibold flex items-center gap-1.5">
            <span aria-hidden="true">⚠️</span>
            <span>Resume Analysis Failed</span>
          </div>
          <p className="text-secondary-foreground leading-relaxed">{apiError}</p>
        </div>
      )}
    </div>
  );
}
