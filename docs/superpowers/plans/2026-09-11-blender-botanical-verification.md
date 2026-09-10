# Stage 5 — Blender botanical garden

## Steps

1. Author editable matte botanical meshes in Blender 5.2 and export the .blend,
   portable GLB contact sheet, Cycles preview, and compact WebGPU binary.
2. Integrate real curved flower/leaf/grass meshes, authored branch attachments,
   low-amplitude idle wind, slower sparse falling particles, and explicit 3D/QR
   controls. Retain pause, reduced motion and user opt-in.
3. Verify binary geometry, loading/retry behaviour, browser visuals and QR safety.

## Results

- Blender background export and Cycles render succeeded. Nine editable assets,
  1.77 MB binary, no texture downloads. Web foliage follows the authored scaffold.
- 95 unit tests passed in 16 files. Production build and scoped lint passed.
- 24/24 actual WebGPU QR decodes: four seasons, three URL lengths, 600×600 and
  340×450 canvases.
- 20 rebuild/resize cycles held steady at 12 buffers and 2 render targets.
  Explicit disposal returned both tracked live counts to zero.
- Motion changes pixels; pause and reduced motion freeze them exactly.
  Interrupted camera transition still settles into a decodable QR.
- Unsupported WebGPU and forced device loss both display a decodable static QR.
- Desktop and a real 390×844 iframe viewport inspected, including the complete
  quiet zone in the flat view. No browser shader/console errors observed.
- Existing unrelated main-bundle size warning remains; the botanical binary is
  loaded only when the Magic Tree route is opened.

## Limits

Physical phone-camera scans and low-end mobile GPU FPS have not been measured.
The model is a newly authored interpretation, not an exact copy of the reference.
The .blend studio render uses Cycles soft lights; the web uses diffuse shader
lighting without a specular lobe, not the full Blender renderer.
