# Stage 6 — Seasonal biopage and account polish

## Steps

1. Retire the legacy dashboard Magic Tree screen and navigation entry; redirect old bookmarks to WebGPU. Keep the WebGPU renderer and public experience unchanged.
2. Add four coordinated seasonal biopage presets, bounded ambient particles, explicit motion controls, responsive builder layout and preview text/image/visibility handling.
3. Refine account profile hierarchy, avatar fallback, live identity preview, dirty/save feedback and mobile layout.

Each step is a separate Conventional Commit. Merge the stage PR with a merge commit.

## Design

Muted botanical palettes, matte cards, restrained shadows and readable controls. Existing React/Vite stack, no extra runtime animation library or external reference assets. Ambient motion is decorative; default reduced-motion is respected, with an explicit local opt-in. Particle DOM is bounded at 24 (16 displayed on narrow screens), with no spawning timer or per-frame React updates.

## Verification

- 98 tests passed across 17 files, including seasonal preset serialization, independent copies, bounded particle markup and pause state.
- Production TypeScript/Vite build passed. Existing main bundle-size warning remains.
- Scoped lint passed.
- Browser: selected all four themes, checked corresponding effects and summer text color, verified reduced-motion default, explicit motion opt-in and computed paused state.
- Visual checks: desktop seasonal preview and profile; 390px iframe profile and theme picker. Profile input edits update avatar initial, identity, unsaved status and save-button availability.
- No real account profile changes or bio publishing performed. Authenticated save/publish round trips and physical low-end-device performance remain unverified.
- Local QA entry at client/qa/bio-profile.html is DEV-only and outside the production route graph.
