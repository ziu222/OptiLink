# Magic Tree verification — 2026-09-10

## Stage 3 results

- Production build passed. Client: 88 tests passed in 15 files.
- Real WebGPU canvas pixels decoded with jsQR: 24/24, four seasons × three URL
  lengths (20, 55, 200 characters) × 600×600 and 340×450 CSS-pixel canvases.
- Twenty rebuild/resize cycles held steady at 10 live buffers / 2 render
  targets. Explicit scene disposal returned both live counts to zero.
- Pixel comparisons confirmed moving foliage/petals, exact freeze with pause,
  exact freeze with reduced motion, and decodable QR after interrupted reveal.
- React StrictMode fallback mounted with navigator.gpu absent; SVG decoded.
- Forced device destruction switched the real container to SVG; it decoded.
- Browser shader/console error log was empty throughout the tests.
- Desktop and 390×844 phone presentation inspected in the browser.

These are browser/decoder checks, not a physical phone-camera scan or measured
mobile-hardware FPS benchmark. Existing unrelated lint warnings and the main
bundle-size warning remain outside this feature.

## Additional requested stage 4

1. Lower controls, enlarge tree framing, expose an explicit motion override,
   and refine 3D-to-QR choreography.
2. Detailed clustered grass geometry and seasonal ground accents, followed by
   rerunning the GPU scan/motion/resource checks and final browser inspection.
