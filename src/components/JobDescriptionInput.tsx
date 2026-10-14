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
          className="text-sm font-medium text-foreground"
        >
          Job description
        </label>
        <span
          className={`text-xs ${
            isTooShort ? "text-warning" : "text-muted-foreground"
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
        className="w-full rounded-2xl border border-border bg-surface p-4 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground transition-all focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 disabled:cursor-not-allowed disabled:opacity-60"
      />

      <p id="job-description-hint" className="text-xs text-muted-foreground">
        Paste full job requirements and responsibilities for the most accurate ATS match comparison.
      </p>
    </div>
  );
}
