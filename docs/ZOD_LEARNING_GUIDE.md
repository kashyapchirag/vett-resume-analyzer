# Zod Learn-as-You-Build Guide

This document is for the developer building Vett while learning Zod for the first time. The goal is practical understanding, not a separate course before coding.

## What Zod does

TypeScript checks types during development and compilation, but it does not validate values that arrive at runtime from forms, HTTP requests, uploaded files, or an external AI model. Zod lets us describe the shape and constraints of data and check actual values against those rules.

In Vett, use Zod for contracts such as:

- Job-description/request fields sent to the analysis API.
- Structured output returned by the LLM.
- Any other external data shape that needs runtime guarantees.

Zod does **not** replace file security checks, PDF/DOCX parsing, authorization, safe error handling, or evaluation of whether an AI statement is true. Validate uploaded file size, extension, media type, and content/signature separately on the server.

## Learning sequence in this project

### Phase 0–1: do not add Zod yet

Build the app scaffold and minimal interface first. Do not install Zod just to have it installed. Client-side UI checks can be simple at this stage; real server validation comes when the API and file-processing flow are introduced.

### Phase 2: learn a small input schema

When job-description validation and upload handling are implemented, start with a small schema, for example:

```ts
import { z } from "zod";

const JobDescriptionSchema = z.object({
  jobDescription: z.string().trim().min(50).max(12000),
});

const result = JobDescriptionSchema.safeParse({
  jobDescription: "A detailed job description...",
});

if (!result.success) {
  // Return a safe validation error to the client.
} else {
  // result.data has passed this schema.
}
```

Teach the user the key parts only when this code is introduced:

- `z.object(...)`: expects an object with a defined shape.
- `z.string()`: expects a string.
- `.trim()`: trims surrounding whitespace during parsing.
- `.min(...)` and `.max(...)`: apply length bounds.
- `.safeParse(...)`: returns a success result with data, or a failure result with validation issues.

The example is illustrative. Choose real limits deliberately and keep client and server limits consistent where suitable. Do not apply the job-description schema to the file bytes.

### Phase 3: learn to validate AI output and infer types

When the LLM analysis is integrated, define a Zod schema for the exact structured fields the UI needs. Constrain numeric values, required fields, and string/array shapes. Validate the model response before using it.

If useful, derive a TypeScript type from the schema:

```ts
type Analysis = z.infer<typeof AnalysisSchema>;
```

Explain that `z.infer` derives the compile-time TypeScript type from the schema, while `safeParse` checks a real value at runtime. They solve related but different problems.

## Required teaching pattern for Antigravity

Whenever Zod is first added or a meaningful schema changes, Antigravity should:

1. State the specific risk being prevented in everyday language.
2. Explain the schema line by line, focusing only on concepts used by that change.
3. Show one valid input and one invalid input, and explain the result.
4. Explain where the validation runs and why server-side validation is required even if the frontend also validates.
5. Give the user one small experiment to run or one safe schema edit to try.
6. Summarize the learning in a few sentences; avoid an unnecessary long lecture.

Antigravity must not claim that defining a schema validates data automatically. Application code must actually call `.parse()` or `.safeParse()` (prefer `safeParse` when handling expected user input errors) at the relevant boundary.

## Important boundaries

- Keep schemas focused and readable; avoid a generic validation framework.
- Do not expose raw Zod internals or stack traces to end users. Convert issues into safe, actionable messages.
- Validate the LLM response before trusting its shape, but remember shape validation cannot prove factual correctness.
- Do not add automated tests during Phases 0–4. Automated test setup remains deferred until Phase 5, per `AGENTS.md`.
