/**
 * Shared responsive breakpoints. See `docs/responsive-conventions.md`.
 *
 * A CSS `@media` query can't read a `var()`, so stylesheets hand-write the same
 * numbers by convention:
 *   - 768px  — mobile <-> tablet
 *   - 1024px — tablet <-> desktop
 * (480px is used only for small-phone fine-tuning.)
 *
 * The media strings below subtract 0.02px so a `max-width` runtime check and a
 * mobile-first `min-width: 768/1024` CSS rule never both match at the edge.
 */
export const BREAKPOINTS = { md: 768, lg: 1024 } as const;

export const MEDIA = {
  belowMd: '(max-width: 767.98px)',
  belowLg: '(max-width: 1023.98px)',
} as const;
