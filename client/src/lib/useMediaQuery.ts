import { useSyncExternalStore } from 'react';
import { MEDIA } from './breakpoints';

/**
 * Tracks whether `query` (a CSS media-query string) currently matches, and
 * re-renders the component when that flips. For layout that CSS `@media` can't
 * express on its own — an off-canvas drawer, a chart radius. Prefer the shared
 * `MEDIA` strings from `./breakpoints` so JS and CSS agree on the values.
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    () => window.matchMedia(query).matches,
    () => false, // this app is client-only; no real server snapshot
  );
}

/** True below the tablet breakpoint (<768px). */
export const useIsBelowMd = () => useMediaQuery(MEDIA.belowMd);

/** True below the desktop breakpoint (<1024px) — e.g. when the sidebar is a drawer. */
export const useIsBelowLg = () => useMediaQuery(MEDIA.belowLg);
