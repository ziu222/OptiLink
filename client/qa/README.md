# Magic Tree browser verification

Run `npm run dev`, then open `/qa/magic-tree.html` in a WebGPU-capable browser.
This entry is served only by the dev server and is not part of the production
bundle. The `jsqr` dependency is development-only.

- **Run render and scan checks** decodes actual rendered canvas pixels with an
  independent QR decoder: four seasons, three URL lengths, desktop and phone
  canvas sizes. It also runs 20 rebuild/resize cycles with instrumented GPU
  buffer/texture lifetimes and verifies all resources are released on disposal.
- **Test motion and interruption** checks that animation changes pixels, pause
  and reduced motion freeze pixels, and reversing the camera mid-transition
  eventually produces a decodable QR.
- **Test unsupported browser** removes the capability in this test page only,
  mounts the real React container under StrictMode, and decodes its SVG fallback.
- **Test device loss** destroys the current test GPU device and verifies the
  production container switches to a decodable SVG.

The capability override is restored in `finally`. Tests publish results only
in the local page and do not transmit URLs or pixels to an external service.

Manual presentation pass: `/magic-tree` at desktop and 390 × 844; check every
season, URL editing, errors, reveal, keyboard activation, help dialog, share
feedback and QR download. Physical phone-camera scanning remains an additional
device-specific check; successful image decoding is not a substitute for it.
