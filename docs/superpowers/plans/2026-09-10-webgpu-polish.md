# Magic Tree WebGPU visual rebuild

Direction: a warm, spacious botanical diorama with a clearly visible trunk,
layered foliage, quiet wind and a direct transition into a scannable QR.
React/Vite and raw WebGPU remain the implementation stack. The reference is
used for visual behaviour; geometry, materials and shaders are original code.

Each step is one Conventional Commit. Each stage gets its own Conventional
Commit PR title, is verified, then merged into main before the next stage.
No attribution trailers or generated-by text in commits or PRs.

## Stage 1 — living tree
1. Deterministic spreading crown, seasonal art palette and public viewer route.
2. Procedural leaf, bark, wind, grass and particle shaders; browser validation.

## Stage 2 — reveal and presentation
1. Smooth camera/reveal, protected four-module quiet zone, lifecycle and motion controls.
2. Responsive immersive viewer, seasonal controls, sharing and accessible QR fallback.

## Stage 3 — verification
1. Browser visual refinement on desktop/mobile and regression checks.
2. Automated screenshot QR decoding, fallback and resource-lifecycle verification.

Acceptance: deterministic structures; no WebGPU validation errors; scan view
decodes to the exact input URL; fallback works without a GPU; mobile controls
remain usable; reduced motion freezes ambient animation; tests/build/lint pass.
