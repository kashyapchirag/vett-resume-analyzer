"use client";

import { useState, FormEvent } from "react";
import { ResumeDropzone } from "./ResumeDropzone";
import { JobDescriptionInput } from "./JobDescriptionInput";
import { MIN_JOB_DESCRIPTION_CHARS } from "@/lib/constants";
import { formatFileSize } from "@/lib/formatters";
import type { ParseResumeSuccess, ParseResumeError } from "@/lib/validation/resume-schema";

export function AnalyzerForm() {
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [parseResult, setParseResult] = useState<ParseResumeSuccess | null>(null);
  const [showFullPreview, setShowFullPreview] = useState(false);

  const isJobDescriptionValid =
    jobDescription.trim().length >= MIN_JOB_DESCRIPTION_CHARS;
  const isFormValid =
    file !== null && fileError === null && isJobDescriptionValid && !isLoading;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isFormValid || !file) return;

    setIsLoading(true);
    setApiError(null);
    setParseResult(null);

    try {
      const formData = new FormData();
      formData.append("resume", file);

      const res = await fetch("/api/parse-resume", {
        method: "POST",
        body: formData,
      });

      const data: ParseResumeSuccess | ParseResumeError = await res.json();

      if (!res.ok || !data.success) {
        setApiError(
          "error" in data
            ? data.error
            : "Failed to extract text from the uploaded document."
        );
      } else {
        setParseResult(data);
      }
    } catch {
      setApiError(
        "Network or server error while connecting to the resume parser."
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleReset() {
    setParseResult(null);
    setApiError(null);
  }

  return (
    <div className="w-full space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <ResumeDropzone
          file={file}
          onFileSelect={(selectedFile) => {
            setFile(selectedFile);
            setParseResult(null);
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
            setParseResult(null);
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
                <span>Extracting Resume Text...</span>
              </>
            ) : (
              <span>Analyze Resume</span>
            )}
          </button>
          {!isFormValid && !isLoading && (
            <p className="mt-2 text-center text-xs text-muted-foreground">
              {!file
                ? "Upload a resume (.pdf or .docx) to continue"
                : !isJobDescriptionValid
                ? `Paste a job description (at least ${MIN_JOB_DESCRIPTION_CHARS} characters) to continue`
                : "Resolve input errors above to continue"}
            </p>
          )}
        </div>
      </form>

      {/* Server Parsing Error State */}
      {apiError && (
        <div
          role="alert"
          className="rounded-2xl border border-error/30 bg-surface p-4 text-xs text-error space-y-1 shadow-xs"
        >
          <div className="font-semibold flex items-center gap-1.5">
            <span aria-hidden="true">⚠️</span>
            <span>Document Parsing Failed</span>
          </div>
          <p className="text-secondary-foreground">{apiError}</p>
        </div>
      )}

      {/* Real Phase 2 Extraction Result */}
      {parseResult && (
        <div
          role="status"
          aria-live="polite"
          className="rounded-2xl border border-border-strong bg-surface p-5 space-y-4 shadow-xs transition-all"
        >
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full bg-success"
                aria-hidden="true"
              />
              <span className="text-sm font-semibold text-foreground">
                Resume Text Extracted (Phase 2)
              </span>
            </div>
            <span className="text-xs font-medium uppercase tracking-wider text-accent bg-accent-soft px-2 py-0.5 rounded-md">
              {parseResult.metadata.fileType}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="rounded-xl border border-border bg-surface-muted p-2.5">
              <p className="text-muted-foreground">File Size</p>
              <p className="font-semibold text-foreground mt-0.5">
                {formatFileSize(parseResult.metadata.fileSize)}
              </p>
            </div>
            {parseResult.metadata.pageCount !== undefined && (
              <div className="rounded-xl border border-border bg-surface-muted p-2.5">
                <p className="text-muted-foreground">Pages</p>
                <p className="font-semibold text-foreground mt-0.5">
                  {parseResult.metadata.pageCount}
                </p>
              </div>
            )}
            <div className="rounded-xl border border-border bg-surface-muted p-2.5">
              <p className="text-muted-foreground">Words</p>
              <p className="font-semibold text-foreground mt-0.5">
                {parseResult.metadata.wordCount.toLocaleString()}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-surface-muted p-2.5">
              <p className="text-muted-foreground">Characters</p>
              <p className="font-semibold text-foreground mt-0.5">
                {parseResult.metadata.charCount.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Extracted Text Snippet Preview */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-medium text-foreground">
                Extracted Text Preview:
              </span>
              <button
                type="button"
                onClick={() => setShowFullPreview(!showFullPreview)}
                className="text-accent hover:underline cursor-pointer"
              >
                {showFullPreview ? "Show less" : "Show full preview"}
              </button>
            </div>
            <div className="rounded-xl bg-surface-muted p-3 text-xs font-mono text-secondary-foreground leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap border border-border">
              {showFullPreview
                ? parseResult.text
                : `${parseResult.text.slice(0, 350)}${
                    parseResult.text.length > 350 ? "..." : ""
                  }`}
            </div>
          </div>

          <div className="rounded-xl bg-surface-muted p-3 text-xs text-secondary-foreground space-y-1">
            <p className="font-medium text-foreground">Next pipeline step:</p>
            <p className="text-muted-foreground">
              Phase 3 will send this extracted text and your job description ({jobDescription.trim().length} chars) to the LLM for structured scoring and evidence comparison.
            </p>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={handleReset}
              className="text-xs font-medium text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm px-1 py-0.5 cursor-pointer"
            >
              Reset / Edit Inputs
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
