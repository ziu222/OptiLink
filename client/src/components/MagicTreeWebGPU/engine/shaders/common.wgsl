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
  reveal: f32,
}

struct Palette {
  groundLight: vec4<f32>,
  groundDark: vec4<f32>,
  trunk: vec4<f32>,
  canopy: vec4<f32>,
  petal: vec4<f32>,
  grass: vec4<f32>,
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

fn wind(position: vec3<f32>) -> vec3<f32> {
  let height = smoothstep(0.0, max(palette.bounds.x + palette.bounds.y, 1.0), position.y);
  let wave = sin(frame.time * 0.85 + position.x * 0.17 + position.z * 0.12);
  let gust = sin(frame.time * 0.37 + position.z * 0.2) * 0.35;
  return vec3<f32>(wave + gust, sin(frame.time + position.x * 0.2) * 0.12, wave * 0.45)
    * height * frame.windStrength * 0.15;
}

fn rotateLeaf(p: vec2<f32>, angle: f32) -> vec2<f32> {
  return vec2<f32>(p.x * cos(angle) - p.y * sin(angle), p.x * sin(angle) + p.y * cos(angle));
}

// The crown folds down as the camera rises, then dissolves before the grid
// settles. All attached geometry uses the same transform to stay connected.
fn revealPosition(position: vec3<f32>) -> vec3<f32> {
  let fold = smoothstep(0.04, 0.86, frame.reveal);
  return position * vec3<f32>(1.0 - fold * 0.06, 1.0 - fold * 0.96, 1.0 - fold * 0.06);
}
