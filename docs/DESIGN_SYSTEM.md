# English Wizard Design System

Premium Magic + Education + Intelligence.

## Brand

- Name: English Wizard (always two words).
- Voice: encouraging, precise, never shaming. Corrections explain *why* before asking for a retry.
- Claims: never imply certification. Estimates are internal ("your evidence suggests…").

## Visual tokens

| Token | Value | Use |
|---|---|---|
| Primary | `#6840d6` / gradient `#8a57ff→#5a31ca` | primary actions, brand mark |
| Ink | `#172033` | body text |
| Deep panel | `#0d1930` | sidebar, skip link |
| Surface | `#f7f8fc`, panels `#ffffff` with `#e4e8f0` border | page background, cards |
| Focus ring | `3px solid #5a31ca` (`:focus-visible`) | all interactive elements |
| Radius | 10–18px | buttons, panels |
| Type scale | base × `--ew-text-scale` (NORMAL/LARGE/XLARGE) | adjustable text |

## Components

- `.panel` — white card, 1px border, 18px radius.
- `.button` / `.button.secondary` — filled purple / bordered ghost.
- `.eyebrow` — small uppercase section label.
- `.skip-link` — keyboard-only jump to `#main-content`.
- `TextSizeControl` — persistent A/A+/A++ scale control (fixed bottom-right).
- `WordExplainer` — inline word popover explanations.

## Accessibility contract

- Every page: single `<main id="main-content">`, one `h1`.
- Keyboard: skip link first tab stop; visible focus everywhere.
- Motion: `prefers-reduced-motion` collapses animations/transitions.
- Audio surfaces always expose transcripts or written forms.
- Color contrast follows WCAG AA; never color-only feedback.

## Terminology

| Term | Meaning |
|---|---|
| Mission | a scenario-based unit in a world |
| Session types | Quick Quest, Standard Journey, Deep Study, Boss Mission |
| Evidence | any scored learner production stored to the model |
| Mastery graph | capability nodes with staged states (EXPOSED→…) |
| Pathways | IELTS / Cambridge / Professional tracks (never certificates) |
| Worlds | thematic mission groups (Survival … Live in English) |
