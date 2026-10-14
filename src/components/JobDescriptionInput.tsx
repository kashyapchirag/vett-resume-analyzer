"use client";

import { ChangeEvent } from "react";
import { MIN_JOB_DESCRIPTION_CHARS } from "@/lib/constants";

interface JobDescriptionInputProps {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}

export function JobDescriptionInput({
  value,
  onChange,
  disabled = false,
}: JobDescriptionInputProps) {
  const charCount = value.trim().length;
  const isTooShort = charCount > 0 && charCount < MIN_JOB_DESCRIPTION_CHARS;

  function handleChange(e: ChangeEvent<HTMLTextAreaElement>) {
    onChange(e.target.value);
  }

  return (
    <div className="w-full space-y-2">
      <div className="flex items-baseline justify-between">
        <label
          htmlFor="job-description-textarea"
          className="text-sm font-medium text-[var(--text)]"
        >
          Job description
        </label>
        <span
          className={`text-xs ${
            isTooShort ? "text-[var(--warning)]" : "text-[var(--text-muted)]"
          }`}
        >
          {charCount} characters{" "}
          {charCount === 0
            ? `(min ${MIN_JOB_DESCRIPTION_CHARS})`
            : isTooShort
            ? `(needs ${MIN_JOB_DESCRIPTION_CHARS - charCount} more)`
            : ""}
        </span>
      </div>

      <textarea
        id="job-description-textarea"
        rows={8}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        placeholder="Paste the complete job description here, including responsibilities, required skills, and qualifications..."
        aria-describedby="job-description-hint"
        className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm leading-relaxed text-[var(--text)] placeholder:text-[var(--text-muted)] transition-all focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 disabled:cursor-not-allowed disabled:opacity-60"
      />

      <p id="job-description-hint" className="text-xs text-[var(--text-muted)]">
        Paste full job requirements and responsibilities for the most accurate ATS match comparison.
      </p>
    </div>
  );
}
