# Responsive conventions

The client (`client/`) is plain per-component CSS — no Tailwind, no CSS
framework. These are the shared rules so breakpoints stay consistent.

## Breakpoints

| Value    | Meaning                | Notes                                  |
| -------- | ---------------------- | -------------------------------------- |
| `768px`  | mobile ↔ tablet        | primary "stack to one column" point    |
| `1024px` | tablet ↔ desktop       | full multi-column desktop layout       |
| `480px`  | small-phone tweak only | use sparingly, never as a main layout jump |

Do not introduce other values. Older code used `640 / 900 / 1000` — migrate
those to the table above when you touch the file (`640 → 768`, `900 → 1024`).

## Direction

Keep the existing per-area convention; only the numbers are shared.

- **Workspace / dashboard** (`pages/Workspace/*`, `components/workspace/*`) —
  desktop-first: base rules are the desktop layout, `@media (max-width: …)`
  overrides step down.
- **Marketing + auth** (`components/Home/*`, `Header/`, `Footer/`,
  `pages/auth/*`) — mobile-first: base rules are the phone layout,
  `@media (min-width: …)` overrides step up.

## Runtime breakpoints

A CSS `@media` query cannot read a `var()`, so the pixel values live in two
places by necessity. When JS needs to branch on viewport (drawer open/close,
a chart dimension), import from `client/src/lib/breakpoints.ts` and use
`client/src/lib/useMediaQuery.ts` (`useIsBelowMd` / `useIsBelowLg`) — never a
second hand-rolled `matchMedia`.

## Shared spacing across a padding-cancel boundary

Where a child cancels a parent's padding with a negative margin (e.g.
`PageHeader` vs `.workspace-main`), drive both sides from one CSS custom
property (`--workspace-pad`) so a breakpoint only has to change the value in
one place. The `@media` query still uses a literal pixel value; only the
property it sets is shared.

## Inputs

Keep form controls at `font-size: 16px` (or larger) so mobile Safari doesn't
zoom on focus.
