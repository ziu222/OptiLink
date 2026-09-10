# Magic Tree botanical kit

Editable Blender 5.2 source and web geometry for a quiet, matte botanical garden.
No image/video generation service, stock models, texture atlas or glossy clearcoat.

## Contents

- `botanical-kit.blend`: named editable mesh objects, vertex pigment, roughness
  0.92 materials, camera and soft studio lighting.
- `botanical-kit.glb`: portable asset contact sheet, not a complete garden scene.
- `botanical-kit.png`: Blender Cycles contact-sheet render.
- `build_botanical.py`: reproducible authoring and export script.
- Web output in `client/src/components/MagicTreeWebGPU/assets`: versioned JSON
  manifest, branch attachment points and a little-endian float32 binary.

The nine meshes include a bent trunk with root flares and arching twig scaffolds;
five cupped spring petals; folded summer, copper autumn and frosted winter leaves;
and four separate grass tufts (autumn seed heads, shorter winter sedge).

## Rebuild

From the repository root, run Blender in background mode with
`--python art/magic-tree/build_botanical.py`. Output is overwritten only at the
explicit paths above. There are no external assets to download or pack.

The runtime export uses Y-up coordinates and triangle-list vertices with nine
float32 values: position XYZ, normal XYZ, linear pigment RGB. Manifest offsets
are measured in floats, counts in vertices. The .blend uses native Z-up.
The live renderer instances selected meshes, rotates skeleton and flower
attachment points together using the URL seed, and keeps scan framing independent
of the scenic materials. Studio lighting in this preview is not baked into meshes.

## Budgets

Branch: 14,766 triangles. Spring flower: 88 triangles; each leaf: 32.
Grass tufts: 340–364 triangles. Binary: approximately 1.77 MB before compression.
The binary is fetched once on the Magic Tree route, not included in the home page.
Winter uses fewer foliage instances; all seasonal changes release replaced GPU
buffers. Idle wind is low amplitude and pausable, with a reduced-motion path.

Blender mesh and glTF APIs: https://docs.blender.org/api/5.2/bpy.types.Mesh.html
and https://docs.blender.org/api/main/bpy.ops.export_scene.html.
