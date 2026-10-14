# Vett

A minimal AI-powered resume and job-description analyzer. Users upload a resume, paste a job description, and receive an explainable **Estimated ATS Match Score** with evidence-backed strengths, gaps, and improvement suggestions.

> **Important:** The score is Vett's estimate against the job description supplied by the user. It is not an official score from an employer's ATS, and there is no universal ATS score shared by all employers.

## Product principles

- **Utility first:** The user should reach the upload form immediately. Do not build a large marketing landing page.
- **Minimal interface:** One primary workflow, few choices, generous whitespace, and restrained warm colors.
- **Explainable results:** Show why a result was suggested and which resume evidence supports it.
- **Privacy by default:** Do not persist resumes or full analysis input in the MVP.
- **Truthful feedback:** Never invent skills or experience. Missing evidence is not proof that a candidate lacks a skill.

## MVP workflow

1. The user uploads one PDF or DOCX resume.
2. The user pastes the target job description.
3. The server validates and extracts resume text.
4. The server sends the minimum necessary text to the configured LLM provider for structured comparison.
5. The server validates the analysis, calculates the weighted score in application code, and returns results.
6. The UI displays the score, category breakdown, matching evidence, gaps, parsing/format checks, and prioritized recommendations.

No account, database, history, file storage, OCR, or automatic job search is required for the first release.

## Recommended stack

- **Next.js App Router + React** — UI and server-side API routes in one application.
- **TypeScript with strict mode** — safer contracts across UI, parser, and AI analysis.
- **Tailwind CSS v4** — utility styling; design tokens live in CSS variables.
- **Zod** — runtime validation for request inputs and model output.
- **PDF.js** — extract text from text-based PDFs.
- **Mammoth** — extract raw text from DOCX files.
- **Vercel AI SDK** — structured LLM calls and a provider integration that can be changed later.
- **next-themes** (or an equally small, accessible implementation) — persist light/dark/system theme preference.
- **npm** — package manager for this project. Keep `package-lock.json` as the single lockfile.

Use the latest stable, mutually compatible package versions at setup time; do not pin an outdated version merely because an example in this document mentions it. Follow the current official Next.js and Tailwind installation guides.

**Testing policy:** automated testing is deliberately deferred until Phase 5. During initial setup and Phases 0–4, do not install Vitest, React Testing Library, Playwright, test-runner configuration, or test scripts unless the user explicitly asks to bring testing forward. Manual browser inspection plus lint, TypeScript checks, and production builds are enough for the initial stages.

## Repository instructions for Antigravity

Start by reading `AGENTS.md`. It is the always-on project instruction file. Also read the docs below before implementing relevant work:

- `docs/DESIGN_SYSTEM.md`
- `docs/ARCHITECTURE.md`
- `docs/IMPLEMENTATION_PLAN.md`
- `docs/ZOD_LEARNING_GUIDE.md`

## Local setup

Requirements: a currently supported Node.js LTS version and npm (included with Node.js). Check the current official Next.js documentation if the installed Node.js version is uncertain.

The extracted starter-pack folder is named `vett-resume-analyzer`. Open that exact folder as the Antigravity workspace. The folder already contains these Markdown instructions, so **do not create a nested `vett` or `vett-resume-analyzer` app directory**. Scaffold the Next.js app in this workspace while preserving every existing `.md` file and the `docs/` directory. Use npm and ensure the app's package name is `vett-resume-analyzer`.

If `create-next-app` refuses to scaffold into the non-empty workspace, scaffold in a temporary sibling folder with the official CLI using npm, then carefully merge only the generated application/configuration files into this workspace. Do not overwrite the provided documentation, and do not leave a nested app folder behind. The scaffold should include TypeScript, Tailwind CSS, ESLint, App Router, and the `@/*` import alias. Do not use another package manager or create additional lockfiles.

Install additional dependencies only when needed for the current implementation phase. These application dependencies can be added in the phases where they are first needed:

```bash
npm install zod ai mammoth pdfjs-dist next-themes
```

**Do not run the following during initial setup or Phases 0–4.** These test tools are reserved for Phase 5, when the user is ready to introduce automated testing:

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @playwright/test
```

Check package compatibility and the current PDF.js server-side usage before installing/implementing; these packages are a proposed stack, not a requirement to install all dependencies immediately. Introduce Zod when Phase 2/3 needs runtime validation rather than installing it during the UI-only scaffold. The user wants to learn Zod while building; follow `docs/ZOD_LEARNING_GUIDE.md` and explain schemas with concise examples when first introduced.

## Environment variables

Keep provider keys server-side and out of version control. Add a local `.env.local` only after choosing a provider. Commit an `.env.example` containing names and blank/example values only. Never commit real secrets.

The exact variable names depend on the selected AI SDK provider. Document the chosen provider and required environment variables when it is implemented.

## Quality checks

Use the scripts available in `package.json`. For initial setup and Phases 0–4, run the available checks equivalent to:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

Automated test commands such as `npm run test` and `npm run test:e2e` are not expected until Phase 5, after the test tools are intentionally installed and configured. Never report a check as passing unless it was actually run.

## Roadmap

1. Scaffold project and implement the minimal responsive upload screen with light/dark mode.
2. Implement safe PDF/DOCX text extraction and file validation.
3. Implement the analysis API, structured AI response schema, and weighted score calculation.
4. Implement the explainable results view and error/empty/loading states.
5. Add tests, accessibility checks, browser testing, and deployment configuration.
6. Later: authentication, report history, saved resumes, and other approved features.

## Further documentation

- `docs/DESIGN_SYSTEM.md` — approved colors and interface rules.
- `docs/ARCHITECTURE.md` — data flow, API contract, scoring and security.
- `docs/IMPLEMENTATION_PLAN.md` — phased plan and acceptance criteria.
- `docs/ZOD_LEARNING_GUIDE.md` — how to teach and apply Zod incrementally.
