# Vett Design System

Status: **approved starting palette**. These are Vett design tokens inspired by Claude's warm, restrained visual direction; they are not Anthropic's official or exact CSS values. Do not copy Claude logos, proprietary assets, or branding.

## Design intent

Vett is a tool, not a marketing site. The interface should feel calm, intelligent, clean, and trustworthy. The main page should take the user directly to the upload-and-analyze workflow, with no giant hero, pricing grid, testimonial carousel, or excessive decorative cards.

### Main screen

- Compact header: Vett wordmark at left; light/dark/system appearance control at right.
- Centered main content with a maximum width around `720px`.
- Short heading and one-sentence explanation.
- One prominent resume drop zone supporting `.pdf` and `.docx`.
- One labeled job-description textarea.
- One primary action: **Analyze resume**.
- Show file name, size, remove/replace action, and clear validation messages after selection.
- Results can appear on the same route below/over the form or on a dedicated results view, but navigation must remain minimal.
- Keep the score, evidence, and recommendations visually clear; do not let a large gauge dominate the report.

## Color tokens

All components must use these semantic tokens instead of hard-coded palette hex values. Exact raw colors belong in this file and `src/app/globals.css` only.

### Light theme

| Token | Value | Use |
|---|---|---|
| `--bg` | `#FAF9F5` | Main warm-cream canvas |
| `--surface` | `#FFFFFF` | Inputs and primary surfaces |
| `--surface-muted` | `#F5F4ED` | Quiet secondary regions |
| `--surface-hover` | `#F0EEE6` | Hovered neutral surface |
| `--text` | `#141413` | Primary text |
| `--text-secondary` | `#5E5D59` | Body/help text |
| `--text-muted` | `#87867F` | Muted labels, placeholders |
| `--border` | `#E8E6DC` | Standard borders/dividers |
| `--border-strong` | `#DEDCD1` | Stronger borders |
| `--accent` | `#D97757` | Terracotta brand accent, icons, small highlights |
| `--accent-hover` | `#C96442` | Accent hover/focus states |
| `--accent-soft` | `#F5E6D3` | Subtle accent surface |
| `--button-bg` | `#141413` | Primary button background |
| `--button-text` | `#FAF9F5` | Primary button text |
| `--success` | `#54734B` | Positive status (use with text/icon) |
| `--warning` | `#986C25` | Warning status (use with text/icon) |
| `--error` | `#B53333` | Error status (use with text/icon) |

### Dark theme

| Token | Value | Use |
|---|---|---|
| `--bg` | `#141413` | Main warm-charcoal canvas, not pure black |
| `--surface` | `#1F1E1D` | Elevated content surfaces |
| `--surface-muted` | `#30302E` | Inputs and secondary surfaces |
| `--surface-hover` | `#3D3D3A` | Hovered neutral surface |
| `--text` | `#FAF9F5` | Primary text |
| `--text-secondary` | `#B0AEA5` | Body/help text |
| `--text-muted` | `#87867F` | Muted labels |
| `--border` | `#30302E` | Standard borders/dividers |
| `--border-strong` | `#4D4C48` | Stronger borders |
| `--accent` | `#D97757` | Terracotta brand accent |
| `--accent-hover` | `#C96442` | Accent hover/focus states |
| `--accent-soft` | `#3A2822` | Subtle accent surface |
| `--button-bg` | `#FAF9F5` | Primary button background |
| `--button-text` | `#141413` | Primary button text |
| `--success` | `#A6C895` | Positive status (use with text/icon) |
| `--warning` | `#E6C078` | Warning status (use with text/icon) |
| `--error` | `#F0958E` | Error status (use with text/icon) |

### Theme implementation

Use CSS custom properties defined in `src/app/globals.css`. Scope the light palette under `:root` (or `[data-theme="light"]`) and dark palette under `[data-theme="dark"]`. Choose one theme attribute convention and use it consistently. A theme manager may set `data-theme` and support `system`, `light`, and `dark` preferences. Avoid hydration flicker.

Suggested starting CSS:

```css
:root,
[data-theme="light"] {
  color-scheme: light;
  --bg: #FAF9F5;
  --surface: #FFFFFF;
  --surface-muted: #F5F4ED;
  --surface-hover: #F0EEE6;
  --text: #141413;
  --text-secondary: #5E5D59;
  --text-muted: #87867F;
  --border: #E8E6DC;
  --border-strong: #DEDCD1;
  --accent: #D97757;
  --accent-hover: #C96442;
  --accent-soft: #F5E6D3;
  --button-bg: #141413;
  --button-text: #FAF9F5;
  --success: #54734B;
  --warning: #986C25;
  --error: #B53333;
}

[data-theme="dark"] {
  color-scheme: dark;
  --bg: #141413;
  --surface: #1F1E1D;
  --surface-muted: #30302E;
  --surface-hover: #3D3D3A;
  --text: #FAF9F5;
  --text-secondary: #B0AEA5;
  --text-muted: #87867F;
  --border: #30302E;
  --border-strong: #4D4C48;
  --accent: #D97757;
  --accent-hover: #C96442;
  --accent-soft: #3A2822;
  --button-bg: #FAF9F5;
  --button-text: #141413;
  --success: #A6C895;
  --warning: #E6C078;
  --error: #F0958E;
}

body {
  background: var(--bg);
  color: var(--text);
}

.app-background {
  background:
    radial-gradient(
      ellipse at 50% 0%,
      rgb(217 119 87 / 8%),
      transparent 55%
    ),
    var(--bg);
}

[data-theme="dark"] .app-background {
  background:
    radial-gradient(
      ellipse at 50% 0%,
      rgb(217 119 87 / 8%),
      transparent 55%
    ),
    var(--bg);
}
```

The warm glow is optional and should be barely visible. Do not place big animated gradients behind forms or reports. Avoid gradient text.

## Typography

- **UI/body:** Inter if loaded with `next/font`, otherwise `system-ui, sans-serif`.
- **Optional display heading:** Lora or Georgia for a subtle editorial touch. Use it sparingly (e.g. only the main heading); the UI should remain highly readable.
- Body text: 14–16px, line-height around 1.5–1.7.
- Labels: 13–14px, medium weight.
- Main heading: 30–36px on desktop, responsive smaller on mobile; normal/medium weight rather than ultra-bold.
- Score: 44–56px, clear and legible. Always pair it with the words “Estimated ATS Match Score” and contextual explanation.
- Use a consistent type scale and avoid more than two font families.

## Spacing, borders, and controls

- Content max width: approximately `720px` for the main workflow; use wider layout for detailed results only if it improves readability.
- Main horizontal padding: 20–24px desktop, 16px mobile.
- Use a consistent 4px spacing scale, with most gaps at 8, 12, 16, 24, and 32px.
- Input radius: 10–12px (`--radius-input: 12px`).
- Surface/card radius: 12–16px (`--radius-card: 16px`).
- Border width: 1px.
- Buttons: target height around 44–48px, clear labels, visible focus ring.
- Shadows: none or extremely subtle. Prefer borders and surface contrast over floating-card stacks.
- The upload target may use a dashed border, but do not overdecorate it.
- Icons should be modest in size and should never replace labels or error text.

## Interaction and accessibility

- Keyboard access for file selection, theme control, text input, and submission.
- Visible focus indicators in both themes.
- Every input has an associated visible label; placeholder text is not the label.
- Respect reduced-motion preferences and avoid nonessential motion.
- Do not use color alone to communicate status; include text/icon and ensure adequate contrast.
- Provide clear disabled/loading states and prevent duplicate submissions.
- On small screens, stack all controls vertically and ensure the primary action is easy to reach.

## Result-view principles

- Display the overall estimate and a short caveat that results vary between employer systems.
- Show separate category breakdowns: required skills (35%), job responsibilities (25%), relevant experience/projects (25%), and keyword coverage (15%).
- Show matched evidence and gaps as separate sections.
- Keep resume parsing/format warnings separate from job-match score.
- Recommendations should be concise, prioritized, and specific to evidence in the uploaded resume and supplied job description.
- Avoid green/red judgement banners like “You will pass/fail ATS.” Do not promise interview outcomes.
