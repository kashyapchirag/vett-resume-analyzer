# Vett — File-by-File Guide & Engineering Reference

> **Purpose:** A practical reference and learning guide explaining what each file in Vett does, what it returns, and how it connects to the rest of the application. It is designed for onboarding, code reviews, and technical interview preparation.

---

## Table of Contents

1. [Application Architecture Map](#1-application-architecture-map)
2. [Frontend Components](#2-frontend-components)
   - [`src/app/page.tsx`](#21-srcapppagetsx)
   - [`src/app/layout.tsx`](#22-srcapplayouttsx)
   - [`src/components/Header.tsx`](#23-srccomponentsheadertsx)
   - [`src/components/ThemeToggle.tsx`](#24-srccomponentsthemetoggletsx)
   - [`src/components/AnalyzerForm.tsx`](#25-srccomponentsanalyzerformtsx)
   - [`src/components/ResumeDropzone.tsx`](#26-srccomponentsresumedropzonetsx)
   - [`src/components/JobDescriptionInput.tsx`](#27-srccomponentsjobdescriptioninputtsx)
   - [`src/components/AnalysisResults.tsx`](#28-srccomponentsanalysisresultstsx)
   - [`src/components/analysis-results/*`](#29-srccomponentsanalysis-results-child-components)
3. [API Route & Document Processing](#3-api-route--document-processing)
   - [`src/app/api/analyze-resume/route.ts`](#31-srcappapianalyze-resumeroutets)
   - [`src/lib/resume/extract-text.ts`](#32-srclibresumeextract-textts)
   - [`src/lib/resume/validate-file.ts`](#33-srclibresumevalidate-filets)
   - [`src/lib/resume/extract-pdf.ts`](#34-srclibresumeextract-pdfts)
   - [`src/lib/resume/extract-docx.ts`](#35-srclibresumeextract-docxts)
4. [AI Analysis & Scoring](#4-ai-analysis--scoring)
   - [`src/lib/analysis/prompts.ts`](#41-srclibanalysispromptsts)
   - [`src/lib/analysis/scoring.ts`](#42-srclibanalysisscoringts)
5. [Validation Schemas & Utilities](#5-validation-schemas--utilities)
   - [`src/lib/validation/analysis-schema.ts`](#51-srclibvalidationanalysis-schemats)
   - [`src/lib/validation/resume-schema.ts`](#52-srclibvalidationresume-schemats)
   - [`src/lib/constants.ts`](#53-srclibconstantsts)
   - [`src/lib/formatters.ts`](#54-srclibformattersts)
   - [`src/types/modules.d.ts`](#55-srctypesmodulesdts)
6. [Configuration & Testing](#6-configuration--testing)
   - [`src/app/globals.css`](#61-srcappglobalscss)
   - [`next.config.ts`](#62-nextconfigts)
   - [`package.json`](#63-packagejson)
   - [`tests/scoring-and-validation.test.mjs`](#64-testsscoring-and-validationtestmjs)
7. [Function Return-Value Cheat Sheet](#7-function-return-value-cheat-sheet)
8. [Interview-Ready Explanations](#8-interview-ready-explanations)

---

# 1. Application Architecture Map

```
[ User Browser ]
  │
  ├─► page.tsx + Header.tsx + ThemeToggle.tsx (App shell & theme)
  │
  └─► AnalyzerForm.tsx (Coordinates file selection & job description)
        │
        ├─► ResumeDropzone.tsx (File picker & client-side size check <= 3.5 MiB)
        └─► JobDescriptionInput.tsx (Textarea with 50–50k char boundary)
              │
              ▼ (FormData: resume + jobDescription)
[ Next.js API Route Handlers ]
  │
  └─► POST /api/analyze-resume (src/app/api/analyze-resume/route.ts)
        │
        ├─► Payload Guard: Content-Length <= 3.97 MB (rejects oversized uploads)
        ├─► extractResumeText() (extract-text.ts)
        │     ├─► validateResumeBuffer() (validate-file.ts: check %PDF or PK.. magic bytes)
        │     ├─► extractPdfText() (extract-pdf.ts: PDF.js fake worker with cloned buffer)
        │     └─► extractDocxText() (extract-docx.ts: Mammoth raw text extraction)
        │
        ├─► Vercel AI SDK generateText() (AI Model: gemini-3.5-flash-lite)
        │     └─► System prompt + XML-delimited user prompt (prompts.ts)
        │     └─► Output.object validated against LlmAnalysisOutputSchema
        │
        ├─► verifyEvidenceInResume() (route.ts: normalized substring check of citations)
        ├─► calculateOverallScore() (scoring.ts: deterministic 35/25/25/15 weighted score)
        └─► AnalysisSuccessResponseSchema.safeParse() (Runtime contract validation)
              │
              ▼ (JSON Response: AnalysisSuccessResponse)
[ Results Visualization ]
  │
  └─► AnalysisResults.tsx (Parent container)
        ├─► ScoreOverview.tsx (Match score, score band, metadata, category cards)
        ├─► RoleAlignmentSection.tsx (Duties alignment & project depth)
        ├─► SkillsEvidenceSection.tsx (Verified skills, missing skills, keyword coverage)
        ├─► RecommendationsSection.tsx (Actionable resume suggestions)
        └─► ResumeReadabilitySection.tsx (Format checks, disclaimer & reset button)
```

---

# 2. Frontend Components

## 2.1 `src/app/page.tsx`
- **Role:** Main landing layout (Server Component).
- **Responsibility:** Composes the top-level application structure (`Header`, `AnalyzerForm`, footer copyright/disclaimer).
- **Returns:** React element tree.

## 2.2 `src/app/layout.tsx`
- **Role:** Root HTML document shell.
- **Responsibility:** Sets metadata, loads `globals.css`, and injects an inline `themeInitScript` into `<head>` to prevent flash of unstyled content (FOUC) by synchronizing `data-theme` with `localStorage` before the first paint.
- **Returns:** React element tree wrapping `{children}`.

## 2.3 `src/components/Header.tsx`
- **Role:** Application header.
- **Responsibility:** Renders the Vett wordmark, product subtitle, and mounts the `ThemeToggle` component.
- **Returns:** Header JSX.

## 2.4 `src/components/ThemeToggle.tsx`
- **Role:** Appearance mode switcher (Client Component).
- **Responsibility:** Provides Light, Dark, and System buttons using Lucide React icons (`Sun`, `Moon`, `Monitor`).
- **Key Mechanism:** Uses `useSyncExternalStore` to subscribe to browser `storage` and OS `matchMedia("(prefers-color-scheme: dark)")` events, keeping the root `data-theme` attribute updated without hydration mismatches.
- **Returns:** Segmented button group JSX.

## 2.5 `src/components/AnalyzerForm.tsx`
- **Role:** Primary client workflow controller (Client Component).
- **Responsibility:**
  - Manages input state (`file`, `fileError`, `jobDescription`, `isLoading`, `apiError`, `analysisResult`).
  - Enforces button enable conditions (valid file + job description between 50 and 50,000 characters).
  - Submits multipart `FormData` to `POST /api/analyze-resume`.
  - On success, switches from the input form to `AnalysisResults`.
  - On error, displays clear user-facing error banners.
- **Returns:** Input form JSX or `AnalysisResults` JSX.

## 2.6 `src/components/ResumeDropzone.tsx`
- **Role:** Drag-and-drop file upload target (Client Component).
- **Responsibility:**
  - Accepts `.pdf` and `.docx` files up to 3.5 MiB (`MAX_RESUME_SIZE_BYTES = 3,670,016`).
  - Provides drag-over visual feedback, file replacement, and file removal.
  - Performs initial client-side extension and size pre-validation to provide instant user feedback before submission.
- **Returns:** Dropzone container JSX with hidden native file input.

## 2.7 `src/components/JobDescriptionInput.tsx`
- **Role:** Controlled textarea for target job descriptions (Client Component).
- **Responsibility:**
  - Controlled input bound to parent state.
  - Displays a live character count and minimum/maximum character alerts (50 to 50,000 characters).
  - Includes accessible ARIA descriptions and labels.
- **Returns:** Textarea JSX with character counter.

## 2.8 `src/components/AnalysisResults.tsx`
- **Role:** Coordinating parent for analysis visualization (Client Component).
- **Responsibility:**
  - Receives `result: AnalysisSuccessResponse` and `onReset: () => void`.
  - Deduplicates keywords against missing requirements using `useMemo`.
  - Delegates rendering to 5 specialized child section components.
- **Returns:** Structured results article JSX.

## 2.9 `src/components/analysis-results/*` Child Components
- **`ScoreOverview.tsx`:** Renders document summary metadata (file name, type, size, words, pages), composite Estimated ATS Match Score, qualitative alignment band badge, and four categorical score cards with visual progress bars.
- **`RoleAlignmentSection.tsx`:** Two-column card comparing responsibility alignment (demonstrated duties vs. gaps) and project assessment (demonstrated impact vs. gaps).
- **`SkillsEvidenceSection.tsx`:** Three-column desktop grid showcasing matched skills with quote citations and verification status badges, missing required skills, and missing industry keywords.
- **`RecommendationsSection.tsx`:** Numbered list of prioritized, actionable suggestions to improve resume presentation and alignment.
- **`ResumeReadabilitySection.tsx`:** Formatting and readability observations, ATS score disclaimer, and a prominent "Analyze another resume" reset action.

---

# 3. API Route & Document Processing

## 3.1 `src/app/api/analyze-resume/route.ts`
- **Role:** End-to-end resume analysis HTTP gateway (Server-only Node.js Route Handler).
- **Runtime Configuration:** `runtime = "nodejs"`, `maxDuration = 60`.
- **Pipeline Steps:**
  1. **Ingress Payload Guard:** Checks `Content-Length` header against `MAX_RESUME_SIZE_BYTES + 300_000` (~3.97 MB) to reject oversized requests before parsing the body into memory.
  2. **Input Validation:** Unpacks `multipart/form-data`, validates that `resume` is a `File` instance, and validates `jobDescription` against `AnalysisRequestSchema` (50–50,000 characters).
  3. **Configuration Guard:** Verifies server environment variable `GOOGLE_GENERATIVE_AI_API_KEY` is present.
  4. **Text Extraction:** Converts file to `Uint8Array` and calls `extractResumeText()`.
  5. **AI Structured Generation:** Constructs XML-delimited prompts and calls Vercel AI SDK `generateText()` with Google Gemini (`gemini-3.5-flash-lite`) constrained to `LlmAnalysisOutputSchema`.
  6. **Evidence Verification:** Iterates through `matchedSkills` and invokes `verifyEvidenceInResume()` to test whether cited quotes occur in normalized resume text, adding the `isVerified: boolean` flag.
  7. **Deterministic Scoring:** Invokes `calculateOverallScore()` to compute the weighted overall score ($35/25/25/15$) and maps it to a score band.
  8. **Response Contract Validation:** Validates the combined response payload with `AnalysisSuccessResponseSchema.safeParse()`.
  9. **Error Handling:** Maps provider exceptions (rate limits, timeouts, schema failures) to typed HTTP error responses via `mapAiErrorToResponse()`.
- **Returns:** `NextResponse.json<AnalysisSuccessResponse>` (200) or `NextResponse.json<AnalysisErrorResponse>` (400, 429, 500, 502, 504).

## 3.2 `src/lib/resume/extract-text.ts`
- **Role:** Document extraction coordinator.
- **Function:** `extractResumeText(fileName: string, buffer: Uint8Array): Promise<ExtractResumeResult>`
- **Behavior:**
  - Captures `fileSize = buffer.length` immediately to protect against buffer detachment.
  - Calls `validateResumeBuffer()`.
  - Routes to `extractPdfText()` or `extractDocxText()`.
  - Normalizes line endings (`\r\n` to `\n`), trims whitespace, and clamps text to `MAX_EXTRACTED_RESUME_CHARS` (100,000 characters).
  - Computes word and character counts.
- **Returns:** `{ text: string, metadata: ResumeMetadata }`. Throws `ResumeParseError` on failure.

## 3.3 `src/lib/resume/validate-file.ts`
- **Role:** Binary signature and size validator.
- **Function:** `validateResumeBuffer(fileName: string, buffer: Uint8Array): FileValidationResult`
- **Checks:**
  - Non-empty buffer (`buffer.length > 0`).
  - Size ceiling ($\le 3.5\text{ MiB}$).
  - Supported extensions (`.pdf`, `.docx`).
  - Binary magic bytes:
    - PDF: `0x25 0x50 0x44 0x46` (`%PDF`)
    - DOCX: `0x50 0x4B 0x03 0x04` (`PK\x03\x04`)
- **Returns:** `{ valid: true, fileType: "pdf" | "docx" }` or `{ valid: false, error: string, code: string }`.

## 3.4 `src/lib/resume/extract-pdf.ts`
- **Role:** In-memory PDF parser using PDF.js.
- **Function:** `extractPdfText(buffer: Uint8Array): Promise<PdfExtractionResult>`
- **Key Implementation Details:**
  - Eagerly imports `pdfjs-dist/legacy/build/pdf.worker.mjs` to register `globalThis.pdfjsWorker.WorkerMessageHandler`, enabling workerless execution in Node.js.
  - Copies buffer (`new Uint8Array(buffer.slice())`) so that PDF.js structured cloning cannot neuter/detach the caller's buffer.
  - Iterates over all pages extracting text content items.
  - Heuristic check: rejects documents with $<10$ alphanumeric characters as `SCANNED_PDF` (image-only PDFs).
- **Returns:** `{ text: string, pageCount: number }`.

## 3.5 `src/lib/resume/extract-docx.ts`
- **Role:** In-memory Word DOCX parser using Mammoth.
- **Function:** `extractDocxText(buffer: Uint8Array): Promise<DocxExtractionResult>`
- **Key Implementation Details:**
  - Wraps `Uint8Array` in Node.js `Buffer.from(buffer)` and calls `mammoth.extractRawText()`.
  - Rejects documents with $<5$ alphanumeric characters as empty/corrupted.
- **Returns:** `{ text: string }`.

---

# 4. AI Analysis & Scoring

## 4.1 `src/lib/analysis/prompts.ts`
- **Role:** Prompt construction and prompt-injection defense.
- **Contents:**
  - `ANALYSIS_SYSTEM_PROMPT`: Directs the model to act as an objective evaluator, treat candidate text strictly as data to evaluate rather than instructions, extract verifiable quotes, and evaluate categorical scores from 0 to 100.
  - `buildAnalysisUserPrompt(resumeText, jobDescription)`: Wraps untrusted user content inside explicit XML boundaries (`<resume_text>` and `<job_description>`), instructing the model to disregard instructions contained within the documents.

## 4.2 `src/lib/analysis/scoring.ts`
- **Role:** Deterministic scoring engine.
- **Function:** `calculateOverallScore(scores: CategoryScores): number`
- **Formula:**
  $$\text{Score} = \text{round}(S_{\text{skills}} \times 0.35 + S_{\text{responsibilities}} \times 0.25 + S_{\text{projects}} \times 0.25 + S_{\text{keywords}} \times 0.15)$$
- **Guarantees:** Always returns an integer bounded between 0 and 100. Scoring logic is pure TypeScript, completely isolated from LLM hallucinations.

---

# 5. Validation Schemas & Utilities

## 5.1 `src/lib/validation/analysis-schema.ts`
- **Role:** Primary runtime validation schemas and inferred types for the analysis workflow.
- **Key Schemas:**
  - `AnalysisRequestSchema`: Validates `jobDescription` (trimmed string, 50 to 50,000 characters).
  - `CategoryScoresSchema`: Enforces four integer sub-scores between 0 and 100.
  - `MatchedSkillSchema`: Object containing `skill` (string), `evidence` (string), and `isVerified` (optional boolean).
  - `LlmAnalysisOutputSchema`: Target schema passed to Vercel AI SDK `Output.object`.
  - `AnalysisSuccessResponseSchema`: Validates final API response including `overallScore`, `scoreBand`, `analysis`, `metadata`, and `disclaimer`.
  - `AnalysisErrorResponseSchema`: Validates error responses with strict code enum.

## 5.2 `src/lib/validation/resume-schema.ts`
- **Role:** Resume metadata contract.
- **Key Schema:** `ResumeMetadataSchema` (validates `fileName`, `fileType`, `fileSize`, `charCount`, `wordCount`, and optional `pageCount`).

## 5.3 `src/lib/constants.ts`
- **Role:** Centralized configuration values.
- **Exports:**
  - `MAX_RESUME_SIZE_BYTES = 3,670,016` (3.5 MiB)
  - `MAX_RESUME_SIZE_LABEL = "3.5 MiB"`
  - `ALLOWED_RESUME_EXTENSIONS = [".pdf", ".docx"]`
  - `MIN_JOB_DESCRIPTION_CHARS = 50`
  - `MAX_JOB_DESCRIPTION_CHARS = 50_000`
  - `SCORING_WEIGHTS`: `{ skillsMatch: 0.35, jobResponsibilities: 0.25, projectsAndExperience: 0.25, keywordCoverage: 0.15 }`

## 5.4 `src/lib/formatters.ts`
- **Role:** Display formatting helpers.
- **Function:** `formatFileSize(bytes: number): string` (formats byte counts into `B`, `KB`, or `MB` with fixed decimals).

## 5.5 `src/types/modules.d.ts`
- **Role:** Ambient TypeScript declarations for packages lacking built-in types (`mammoth` and `pdfjs-dist/legacy/build/pdf.worker.mjs`).

---

# 6. Configuration & Testing

## 6.1 `src/app/globals.css`
- Configures Tailwind CSS v4 using `@theme`. Maps light and dark color palettes to CSS custom properties (`--bg-background`, `--text-foreground`, `--border-border`, `--accent-color`), ensuring instant theme switching without re-rendering components.

## 6.2 `next.config.ts`
- Configures `serverExternalPackages: ["pdfjs-dist"]` so Next.js does not attempt to bundle PDF.js into serverless chunks, preserving Node.js CJS/ESM worker resolution.

## 6.3 `package.json`
- Defines project scripts (`dev`, `build`, `start`, `lint`, `test`) and dependencies (`@ai-sdk/google`, `ai`, `pdfjs-dist`, `mammoth`, `zod`, `lucide-react`). Specifies Node engine requirement: `"node": "24.x"`.

## 6.4 `tests/scoring-and-validation.test.mjs`
- Automated test suite using Node.js's native test runner (`node --test`).
- Tests:
  1. `calculateOverallScore`: Verifies exact mathematical weighting and clamping.
  2. `verifyEvidenceInResume`: Verifies verbatim matching, normalized matching, and rejection of hallucinated quotes.
  3. `AnalysisRequestSchema`: Tests min/max character boundary enforcement.

---

# 7. Function Return-Value Cheat Sheet

| Function / Expression | Return Type | Purpose |
|---|---|---|
| `validateFile(candidate)` | `boolean` | Client-side extension and size check |
| `validateResumeBuffer(name, buf)` | `FileValidationResult` | Server-side magic bytes and size check |
| `extractPdfText(buf)` | `Promise<PdfExtractionResult>` | PDF text and page count via PDF.js |
| `extractDocxText(buf)` | `Promise<DocxExtractionResult>` | DOCX raw text via Mammoth |
| `extractResumeText(name, buf)` | `Promise<ExtractResumeResult>` | Coordinated extraction result with metadata |
| `verifyEvidenceInResume(quote, text)` | `boolean` | Substring verification in normalized resume text |
| `calculateOverallScore(scores)` | `number` | Deterministic weighted integer ($0$ to $100$) |
| `determineScoreBand(score)` | `"Strong Alignment" \| "Moderate Alignment" \| "Needs Improvement"` | Alignment band mapping |
| `generateText({ ... })` | `Promise<GenerateTextResult>` | Vercel AI SDK call returning typed structured output |
| `schema.safeParse(data)` | `{ success: true, data } \| { success: false, error }` | Runtime Zod validation result |
| `NextResponse.json(body, init)` | `NextResponse` | Formatted HTTP response object for Next.js App Router |

---

# 8. Interview-Ready Explanations

### Q1. How does Vett prevent LLM hallucinations from corrupting the ATS score?
Vett isolates scoring from the LLM. The model is asked only to evaluate categorical sub-scores (0–100) based on specific criteria. The final aggregate score is calculated entirely in pure TypeScript using a deterministic weighted formula ($35/25/25/15$). Even if the model behaves unpredictably, the composite score mathematically reflects the underlying category values.

### Q2. How does the citation verification (`isVerified`) work, and what are its limits?
When the LLM cites resume evidence for a matched skill, `verifyEvidenceInResume()` normalizes both the quote and the extracted resume text (collapsing whitespace, removing punctuation and quotes, lowercasing) and checks whether the quote is a substring of the resume text.
**Limit:** This proves **textual presence** (that the candidate wrote those words in the document). It does **not** prove the real-world factual truth of whether the candidate actually possesses the skill.

### Q3. How does Vett handle prompt injection risks?
Resumes and job descriptions are untrusted user inputs. Vett frames both inputs inside strict XML tags (`<resume_text>` and `<job_description>`), accompanied by system instructions commanding the model to treat content within those tags strictly as data to evaluate. Furthermore, by using Vercel AI SDK structured outputs constrained to a Zod schema, the model cannot return arbitrary free-text jailbreaks. However, as with all LLM applications, prompt boundaries are an adversarial mitigation, not a mathematical guarantee.

### Q4. What was the `ArrayBuffer` detachment bug with PDF.js, and how was it solved?
In JavaScript, transferring an `ArrayBuffer` across worker threads detaches the source buffer, resetting its `byteLength` to 0. When PDF.js parsed a document, `buffer.length` evaluated to 0 when creating the metadata, failing Zod validation. We solved this in two steps:
1. `extract-text.ts` records `fileSize = buffer.length` immediately upon receiving the buffer.
2. `extract-pdf.ts` clones the buffer (`new Uint8Array(buffer.slice())`) so PDF.js only detaches an isolated memory copy.

### Q5. Why does Vett use both TypeScript and Zod?
TypeScript provides static type safety during development and build time, but type annotations are completely erased from the compiled JavaScript runtime. They cannot validate untrusted network inputs, uploaded files, or external LLM API responses. Zod performs runtime schema validation on actual data objects, protecting the application against malformed payloads while inferring matching TypeScript types.

### Q6. How does Vett handle rate limiting?
In the API route, `mapAiErrorToResponse()` intercepts Google Gemini's HTTP 429 errors when API quotas are reached and returns a clean `RATE_LIMITED` user response. For general application-level abuse prevention, the MVP leaves rate limiting to the infrastructure layer (e.g. Vercel Firewall, Cloudflare, or Edge Middleware) rather than maintaining in-memory or database rate limits.
