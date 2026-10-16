# Vett — Resume & Job Description Analyzer

Vett is a focused, privacy-first web application that compares a candidate's resume against a job description. It generates an explainable **Estimated ATS Match Score** alongside evidence-backed strengths, identified requirement gaps, and actionable improvement recommendations.

Unlike opaque ATS simulators, Vett calculates its scores deterministically in application code, verifies AI-quoted evidence directly against the original resume text, and processes documents entirely in memory without permanent storage.

> **Disclaimer:** The match score is Vett's independent heuristic estimate based on textual alignment with the provided job description. It is not an official score from an employer's Applicant Tracking System (ATS), and there is no universal score shared across employers.

---

## Key Features

- **Document Ingestion:** Drag-and-drop or browse for `.pdf` and `.docx` resumes up to 3.5 MiB.
- **In-Memory Text Extraction:** Mozilla PDF.js parses text-based PDFs; Mammoth extracts raw text from DOCX files without saving files to disk.
- **Structured AI Alignment:** Uses Google Gemini (`gemini-3.5-flash-lite`) via the Vercel AI SDK to extract categorical evaluations into a strict schema.
- **Evidence Verification:** Automatically cross-checks AI-quoted resume citations against the original document text to flag unverified citations.
- **Deterministic Heuristic Scoring:** Overall match scores are computed using fixed application-level weights (35% skills, 25% responsibilities, 25% projects, 15% keywords), preventing LLM score hallucination.
- **Actionable Report:** Clear score breakdown, verified skills, missing requirements, keyword coverage, formatting observations, and prioritized suggestions.
- **Light & Dark Themes:** Accessible, zero-flash appearance toggle supporting light, dark, and system preferences.

---

## Technology Stack

| Layer | Technology | Details |
|---|---|---|
| **Framework** | Next.js 16 (App Router) | Full-stack React framework with Node.js runtime API route handlers |
| **UI & Styling** | React 19, Tailwind CSS v4 | Component-driven UI styled with semantic CSS custom property design tokens |
| **Language** | TypeScript 5 (Strict Mode) | End-to-end type safety across UI, parsers, and API contracts |
| **Runtime Validation** | Zod 4 | Runtime schema validation for requests, AI output, and API responses |
| **AI Integration** | Vercel AI SDK (`ai` 7, `@ai-sdk/google`) | Structured object generation using `gemini-3.5-flash-lite` |
| **Document Parsers** | PDF.js (`pdfjs-dist`), Mammoth | Server-side in-memory text extraction for `.pdf` and `.docx` |
| **Icons** | Lucide React | Lightweight, accessible UI icons |
| **Testing** | Node.js Test Runner | Native unit tests for scoring, evidence verification, and validation |

---

## Architecture & Analysis Pipeline

```
[ User Input ]
  ├── Resume (.pdf / .docx, <= 3.5 MiB)
  └── Job Description (50 to 50,000 chars)
        │
        ▼
[ POST /api/analyze-resume ]
  ├── 1. Ingress Guard: Content-Length check (< 3.97 MB)
  ├── 2. Input Validation: Zod schema check on job description length
  ├── 3. In-Memory Extraction:
  │      ├── PDF: PDF.js fake worker with isolated memory buffer
  │      └── DOCX: Mammoth raw text extraction
  │      └── Text normalized & clamped to 100,000 characters
  ├── 4. Structured AI Generation:
  │      └── Gemini 3.5 Flash Lite via Vercel AI SDK (LlmAnalysisOutputSchema)
  ├── 5. Evidence Verification:
  │      └── Normalized substring search verifies quotes in resume text
  ├── 6. Deterministic Scoring:
  │      └── Weighted score: 35% Skills + 25% Responsibilities + 25% Projects + 15% Keywords
  └── 7. Response Contract Validation:
         └── AnalysisSuccessResponseSchema.safeParse()
        │
        ▼
[ UI: AnalysisResults ]
  ├── ScoreOverview (Composite score, band & category cards)
  ├── RoleAlignmentSection (Responsibilities & project alignment)
  ├── SkillsEvidenceSection (Verified skills, missing requirements, keywords)
  ├── RecommendationsSection (Prioritized suggestions)
  └── ResumeReadabilitySection (Formatting notes & reset)
```

---

## Input Limits & Constraints

| Parameter | Limit | Reason |
|---|---|---|
| **Resume File Size** | 3.5 MiB (`3,670,016` bytes) | Keeps multipart payload safely below Vercel's 4.5 MB request limit |
| **Supported Formats** | `.pdf`, `.docx` | Standard text-based candidate resume formats |
| **Job Description Length** | 50 to 50,000 characters | Ensures sufficient context while bounding token usage |
| **Extracted Resume Text** | 100,000 characters | Prevents memory exhaustion and oversized prompt payloads |
| **Max Request Payload** | ~3.97 MB (`MAX_RESUME_SIZE_BYTES + 300_000`) | Enforced before parsing multipart body |

---

## Getting Started

### Prerequisites

- **Node.js:** Node.js `24.x` (see `engines` in `package.json`, `.nvmrc`, and `.node-version`).
- **npm:** Included with Node.js.
- **Google Gemini API Key:** A free API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

### Installation

1. Clone the repository and navigate into the workspace:
   ```bash
   git clone <repository-url>
   cd vett-resume-analyzer
   ```

2. Install dependencies using npm:
   ```bash
   npm install
   ```

3. Configure your local environment:
   ```bash
   cp .env.example .env.local
   ```
   Open `.env.local` and add your Google Gemini API key:
   ```env
   GOOGLE_GENERATIVE_AI_API_KEY="your-gemini-api-key-here"
   ```

4. Start the local development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Scripts & Verification

Run project checks before committing:

```bash
# Run unit tests (Node.js native test runner)
npm test

# Check code formatting and linting rules
npm run lint

# Verify static TypeScript types without emitting code
npx tsc --noEmit

# Test production build
npm run build
```

---

## Deploying to Vercel

1. Push your repository to GitHub, GitLab, or Bitbucket.
2. Import the project into [Vercel](https://vercel.com/).
3. Vercel automatically detects Next.js. Keep the default build settings:
   - **Framework Preset:** Next.js
   - **Build Command:** `next build --webpack` (configured in `package.json`)
   - **Install Command:** `npm install`
4. Add the server-only environment variable in **Project Settings > Environment Variables**:
   - `GOOGLE_GENERATIVE_AI_API_KEY` = `your-api-key`
5. Click **Deploy**.

> **Note on Abuse Protection:** The current application implementation does not include custom application-level rate limiting. For public deployments, configure rate limiting and bot protection at the hosting or edge layer (e.g., Vercel Firewall, Cloudflare, or Edge Middleware) to manage API traffic.

---

## Privacy & AI Limitations

- **In-Memory Processing:** Resumes and job descriptions are processed in memory and never stored in a database, disk cache, or cloud storage bucket by Vett.
- **AI Sub-Processor:** Resume text and job description content are sent to Google Gemini (`gemini-3.5-flash-lite`) to produce the analysis. Their data handling is subject to the [Google AI Studio Terms of Service](https://ai.google.dev/terms).
- **Prompt Injection Defense:** Input documents are framed inside XML tags (`<resume_text>`, `<job_description>`) with strict system prompt boundaries. While this mitigates prompt injection, no LLM workflow is guaranteed 100% immune to adversarial inputs.
- **Evidence Verification Scope:** The `isVerified` check verifies exact textual presence in the extracted resume; it confirms the candidate wrote the citation, not the real-world truth of the experience.
- **Scanned Documents:** Vett does not include OCR. Image-only or scanned PDFs without extractable text are rejected with an informative message.

---

## Further Documentation

- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — Detailed system architecture, data flow, and technical decisions.
- [`docs/FILE_GUIDE.md`](./docs/FILE_GUIDE.md) — Comprehensive guide to file responsibilities, contracts, and interview concepts.
- [`docs/PRIVACY.md`](./docs/PRIVACY.md) — Draft privacy and data handling notice.
- [`docs/DESIGN_SYSTEM.md`](./docs/DESIGN_SYSTEM.md) — Approved color palette, typography tokens, and layout guidelines.
- [`docs/ZOD_LEARNING_GUIDE.md`](./docs/ZOD_LEARNING_GUIDE.md) — Beginner-friendly guide to runtime schema validation with Zod.
