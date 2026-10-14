"use client";

import { useRef, useState, DragEvent, ChangeEvent, KeyboardEvent } from "react";
import {
  MAX_RESUME_SIZE_BYTES,
  MAX_RESUME_SIZE_LABEL,
  ALLOWED_RESUME_EXTENSIONS,
} from "@/lib/constants";
import { formatFileSize } from "@/lib/formatters";

interface ResumeDropzoneProps {
  file: File | null;
  onFileSelect: (file: File | null) => void;
  error: string | null;
  onError: (error: string | null) => void;
}

export function ResumeDropzone({
  file,
  onFileSelect,
  error,
  onError,
}: ResumeDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  function validateFile(candidate: File): boolean {
    const fileName = candidate.name.toLowerCase();
    const hasValidExt = ALLOWED_RESUME_EXTENSIONS.some((ext) =>
      fileName.endsWith(ext)
    );

    if (!hasValidExt) {
      const ext = fileName.includes(".")
        ? `.${fileName.split(".").pop()}`
        : "unknown";
      onError(
        `Unsupported file type (${ext}). Please upload a .pdf or .docx file.`
      );
      return false;
    }

    if (candidate.size > MAX_RESUME_SIZE_BYTES) {
      onError(
        `File is too large (${formatFileSize(candidate.size)}). Maximum upload size is ${MAX_RESUME_SIZE_LABEL}.`
      );
      return false;
    }

    if (candidate.size === 0) {
      onError("The selected file is empty. Please choose a valid document.");
      return false;
    }

    onError(null);
    return true;
  }

  function handleFile(candidate: File) {
    if (validateFile(candidate)) {
      onFileSelect(candidate);
    } else {
      onFileSelect(null);
    }
  }

  function onDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }

  function onDragLeave(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      handleFile(droppedFiles[0]);
    }
  }

  function onInputChange(e: ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files;
    if (selected && selected.length > 0) {
      handleFile(selected[0]);
    }
    // Reset input value so re-uploading the same file triggers change
    e.target.value = "";
  }

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      inputRef.current?.click();
    }
  }

  function handleRemove() {
    onFileSelect(null);
    onError(null);
  }

  function handleReplace() {
    inputRef.current?.click();
  }

  const fileExt = file?.name.split(".").pop()?.toUpperCase() ?? "";

  return (
    <div className="w-full space-y-2">
      <div className="flex items-baseline justify-between">
        <label
          id="resume-label"
          className="text-sm font-medium text-[var(--text)]"
        >
          Resume document
        </label>
        <span className="text-xs text-[var(--text-muted)]">
          PDF or DOCX (max {MAX_RESUME_SIZE_LABEL})
        </span>
      </div>

      <input
        ref={inputRef}
        type="file"
        id="resume-input"
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={onInputChange}
        className="sr-only"
        style={{ display: "none" }}
        aria-labelledby="resume-label"
        aria-describedby={error ? "resume-error" : "resume-hint"}
      />

      {file ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-[var(--border-strong)] bg-[var(--surface)] p-4 transition-colors sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] font-semibold text-xs tracking-wider"
              style={{ width: "40px", height: "40px" }}
            >
              {fileExt}
            </div>
            <div className="min-w-0 truncate">
              <p className="truncate text-sm font-medium text-[var(--text)]">
                {file.name}
              </p>
              <p className="text-xs text-[var(--text-secondary)]">
                {formatFileSize(file.size)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              type="button"
              onClick={handleReplace}
              className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-1.5 text-xs font-medium text-[var(--text)] hover:bg-[var(--surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] transition-colors cursor-pointer"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--error)] hover:bg-[var(--surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--error)] transition-colors cursor-pointer"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={handleKeyDown}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          aria-labelledby="resume-label"
          className={`flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed p-6 text-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${
            isDragging
              ? "border-[var(--accent)] bg-[var(--accent-soft)]/20"
              : error
              ? "border-[var(--error)] bg-[var(--surface)]"
              : "border-[var(--border-strong)] bg-[var(--surface)] hover:border-[var(--accent)] hover:bg-[var(--surface-hover)]"
          }`}
        >
          <div className="flex flex-col items-center gap-2">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]"
              style={{ width: "40px", height: "40px" }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ width: "20px", height: "20px" }}
                aria-hidden="true"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <line x1="9" y1="15" x2="12" y2="12" />
                <line x1="15" y1="15" x2="12" y2="12" />
              </svg>
            </div>
            <div className="text-sm font-medium text-[var(--text)]">
              <span className="text-[var(--accent)] underline underline-offset-2">
                Click to upload
              </span>{" "}
              or drag and drop your resume
            </div>
            <p id="resume-hint" className="text-xs text-[var(--text-muted)]">
              PDF or DOCX documents (up to {MAX_RESUME_SIZE_LABEL})
            </p>
          </div>
        </div>
      )}

      {error && (
        <div
          id="resume-error"
          role="alert"
          className="flex items-center gap-2 rounded-lg border border-[var(--error)]/30 bg-[var(--surface)] p-2.5 text-xs text-[var(--error)]"
        >
          <span aria-hidden="true" className="font-bold">
            !
          </span>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
