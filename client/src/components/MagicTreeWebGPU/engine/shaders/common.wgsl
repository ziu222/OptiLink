// Shared uniform declarations — spec §4.2. Prepended to every shader module.

struct FrameUniforms {
  viewProj: mat4x4<f32>,
  // Camera basis in world space, for billboarding leaves and petals.
  cameraRight: vec4<f32>,
  cameraUp: vec4<f32>,
  time: f32,
  windStrength: f32,
  // 1 = tree fully drawn, 0 = nothing above ground (§6.1).
  treeAlpha: f32,
  _pad: f32,
}

struct Palette {
  groundLight: vec4<f32>,
  groundDark: vec4<f32>,
  trunk: vec4<f32>,
  canopy: vec4<f32>,
  petal: vec4<f32>,
  // x = canopy min Y, y = canopy height, z = ground Y, w = grid half extent
  bounds: vec4<f32>,
}

@group(0) @binding(0) var<uniform> frame: FrameUniforms;
@group(0) @binding(1) var<uniform> palette: Palette;

/**
 * Stochastic dissolve — spec §6.1. Keeps depth-write on and needs no sorting,
 * unlike a blended fade.
 */
fn dissolve(hash: f32) -> bool {
  return hash > frame.treeAlpha;
}
