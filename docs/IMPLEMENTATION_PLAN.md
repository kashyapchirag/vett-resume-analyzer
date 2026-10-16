# Vett Implementation Plan

Build and validate one phase at a time. Do not jump to AI integration before the interface and parsing flow are testable.

## Phase 0 — Inspect and scaffold

### Tasks
- Inspect the workspace and preserve existing work.
- If empty, create the Next.js App Router project with TypeScript, Tailwind CSS v4, ESLint, and `@/*` alias using the current official scaffold.
- Confirm Node.js and npm versions. Use npm consistently for this project and keep `package-lock.json` as the only lockfile.
- Add only the dependencies required for the current phase.
- Set up `src/app/globals.css` with the approved light/dark CSS tokens from `docs/DESIGN_SYSTEM.md`.
- Establish root layout, page, lint, typecheck, and build scripts.

### Acceptance criteria
- App runs locally and builds.
- TypeScript strict mode is enabled.
- No API keys or secrets are present.
- The documented color tokens are the source of truth.

## Phase 1 — Minimal analyzer UI

### Tasks
- Build one focused application screen, not a marketing homepage.
- Provide one PDF/DOCX drop zone with click-to-browse, selected file name/size, remove/replace, and validation states.
- Provide a labeled job-description text area with sensible length feedback.
- Provide one primary Analyze button, disabled until required inputs are valid.
- Implement accessible light/dark/system theme behavior.
- Provide loading, empty, validation-error, and error states; use a clearly labeled temporary development state only if the backend is not yet implemented.

### Acceptance criteria
- Responsive from small mobile to desktop.
- Keyboard accessible; clear focus states; labels are visible.
- No fake analysis or invented score is shown as real.
- Color tokens match the design system in both themes.

## Phase 2 — Upload validation and text extraction

**Learning note:** Introduce Zod for appropriate runtime input validation in this phase only when it supports a real contract. Explain the schema to the user; do not rely on Zod alone for file-byte/content security checks. Follow `docs/ZOD_LEARNING_GUIDE.md`.

### Tasks
- Add file-size limit and allowed format checks in both client and server.
- Parse text-based PDF files using a server-compatible PDF.js path.
- Parse DOCX using Mammoth raw text extraction.
- Reject empty, malformed, encrypted/unreadable, or unsupported files with safe messages.
- Clearly identify scanned/image-only PDFs as unsupported by the MVP.

### Acceptance criteria
- Supported file input is not trusted based only on extension or browser MIME type.
- Uploads are not written to permanent storage.
- Extracted text is bounded before AI processing.
- Failures do not return server stack traces.

## Phase 3 — Analysis API and scoring

**Learning note:** Teach the user how the request schema and AI-output schema work, including `safeParse` and inferred types, with one valid/invalid example. Follow `docs/ZOD_LEARNING_GUIDE.md`.

### Tasks
- Add `POST /api/analyze-resume` with a typed multipart request contract.
- Validate the request and output with Zod.
- Add the Vercel AI SDK and one selected LLM provider using server-only credentials.
- Create a structured output schema for category subscores, matches, gaps, evidence, format checks, and recommendations.
- Prompt the model to treat resume and job description as untrusted data and avoid inventing evidence.
- Compute the aggregate score in a small pure function using the approved weights (35/25/25/15). Automated tests for this function will be added in Phase 5.
- Add graceful handling for missing configuration, provider errors, timeouts, empty outputs, and malformed model responses.

### Acceptance criteria
- API returns a typed success response or a stable safe error response.
- The final score is computed by application code, not trusted directly from the model.
- No secrets or document contents are logged.
- No permanent resume/report persistence is added.

## Phase 4 — Results interface

### Tasks
- Show Estimated ATS Match Score with a brief caveat.
- Show the four weighted categories and their scores.
- Show matching evidence, gaps/unclear requirements, separate format checks, and prioritized suggestions.
- Include retry/change-resume flow without forcing a full page reload where appropriate.
- Ensure the same result information works in light and dark mode and on narrow screens.

### Acceptance criteria
- Every result is traceable to the supplied resume/JD or explicitly described as a heuristic.
- Missing evidence is not phrased as proof that the candidate lacks a skill.
- Loading, success, and every error case are understandable.
- No decorative score visualization obscures its meaning.

## Phase 5 — Test, harden, deploy

Automated testing is intentionally postponed until the main MVP flow is implemented. Do not install testing libraries or configure a test runner before this phase unless the user explicitly asks to change the plan.

### Tasks
- Add scoring and schema unit tests.
- Add component tests for file selection, form validation, theme toggle, and result rendering.
- Add Playwright smoke tests for a valid flow and representative error flows.
- Verify mobile responsiveness, keyboard navigation, contrast, and reduced motion.
- Check dependency and host request/body limits; add appropriate rate limiting and abuse controls for the deployment environment.
- Write accurate deployment and environment-variable instructions.

### Acceptance criteria
- Run the available lint, typecheck, test, and production build commands and fix errors.
- Report any manual checks not performed.
- Verify a supported real PDF and DOCX resume can be parsed without permanent retention.
- Confirm no secret is included in the client bundle or committed files.

## Deferred features

Only consider these after MVP acceptance: authentication, accounts, saved analysis history, PostgreSQL/Prisma, resume rewriting, OCR, automatic job discovery, payments, multiple resume versions, and background jobs. Each should have a clear user need before implementation.
