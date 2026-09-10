// Shared uniform declarations — spec §4.2. Prepended to every shader module.

struct FrameUniforms {
  viewProj: mat4x4<f32>,
  time: f32,
  windStrength: f32,
  treeAlpha: f32,
  _pad: f32,
}

struct Palette {
  groundLight: vec4<f32>,
  groundDark: vec4<f32>,
  trunk: vec4<f32>,
  canopy: vec4<f32>,
  // x = canopy min Y, y = canopy height, z = ground Y, w = grid half extent
  bounds: vec4<f32>,
}

@group(0) @binding(0) var<uniform> frame: FrameUniforms;
@group(0) @binding(1) var<uniform> palette: Palette;
