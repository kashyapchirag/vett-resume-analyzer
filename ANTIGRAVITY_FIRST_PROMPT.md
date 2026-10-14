# First prompt to give Antigravity

Open the extracted `vett-resume-analyzer` folder in Antigravity and paste the prompt below. Keep `AGENTS.md` in the repository root so Antigravity automatically loads the project instructions.

---

You are working on **Vett**, a minimal AI-powered resume and job-description analyzer.

Before changing anything, read `AGENTS.md`, `README.md`, `docs/DESIGN_SYSTEM.md`, `docs/ARCHITECTURE.md`, and `docs/IMPLEMENTATION_PLAN.md`, and `docs/ZOD_LEARNING_GUIDE.md`.

## Task: Phase 0 and Phase 1 only

1. Inspect the workspace, Node.js/npm versions, existing scripts, and files. Preserve useful work; do not scaffold over an existing project or create a nested app folder.
2. This documentation workspace is named `vett-resume-analyzer`. Scaffold the Next.js App Router app in this workspace (not a nested folder), use npm, and set the package name to `vett-resume-analyzer`. Preserve all supplied Markdown files and the `docs/` directory. If the CLI refuses because the workspace is non-empty, scaffold in a temporary sibling directory with `npx create-next-app@latest vett-resume-analyzer-scaffold --use-npm`, then carefully merge the app/configuration files into this workspace without overwriting the provided docs. Use npm exclusively and do not create a different lockfile. Use TypeScript strict mode, Tailwind CSS v4, ESLint, and the `@/*` alias.
3. Set up the light/dark CSS custom properties exactly as documented in `docs/DESIGN_SYSTEM.md`. Use semantic tokens, not one-off hex values in components.
4. Implement only the minimal analyzer screen: compact brand header, theme control, one PDF/DOCX upload area, one job-description textarea, and one Analyze Resume button.
5. Make the layout responsive and accessible, with visible field labels, keyboard support, focus indicators, file name/size, remove/replace action, validation messages, and clear disabled/loading states.
6. Do not build a marketing landing page, dashboard, login/authentication, database, resume history, or real AI analysis in this phase. Do not display a fake score. If the analyze action has no backend yet, show an explicit not-yet-connected state rather than pretending success.
7. Install only dependencies required for Phase 0/1. Do not install parser, AI SDK, database, authentication, or automated-testing packages in this phase. Do not create test files, testing configuration, or test scripts. Automated testing is explicitly deferred until Phase 5.
8. Run only the available lint, TypeScript check, and production build. Fix issues caused by this change. Do not run or configure an automated test suite.
9. Keep explanations beginner-friendly. The user wants to learn technologies while building, especially Zod, but Zod is not needed for this UI-only phase. Do not install or use Zod yet. When Phase 2/3 first introduces Zod, follow `docs/ZOD_LEARNING_GUIDE.md`: explain each schema, show valid/invalid examples, and give the user one small experiment to try.
10. Summarize the files changed, commands run and their real results, and the next smallest step (Phase 2).

Follow `AGENTS.md` throughout. If you discover a meaningful ambiguity or incompatible existing setup, inspect and report it rather than making a destructive assumption.
