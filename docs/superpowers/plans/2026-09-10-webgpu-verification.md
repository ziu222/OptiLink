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

## Stage 4 results

- Lowered navigation and controls, tightened tree framing, and added an explicit
  user opt-in to motion when the system requests reduced motion.
- Coordinated camera travel with folding/fading branches, foliage, and grass;
  the settled scan view hides decorative text and preserves the QR quiet zone.
- Replaced flat grass cards with five-segment curved, tapered blades grouped in
  tufts, root-to-tip shading, small flowers, and seasonal fallen-petal accents.
- Production build, all 88 client tests, and scoped feature/QA lint passed again.
- Latest shaders passed all 24 actual GPU QR decodes and 20 rebuild/resize
  cycles; disposal released all tracked buffers and render targets.
- Motion, pause, reduced-motion, interrupted-transition, unsupported-browser,
  and forced-device-loss checks all passed again, including fallback decoding.
- Final desktop tree and unobstructed QR presentation inspected in the browser.
  Phone framing was inspected at 390×844 during this stage; decoder coverage
  includes 340×450 canvases. Physical phone-camera scanning remains unverified.
