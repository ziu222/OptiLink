// Falling petals / leaves / snow — spec §4.1 item 4, §5.2. The whole fall
// loop is a function of the time uniform: no stored state, no compute pass.

struct VertexOut {
  @builtin(position) clipPosition: vec4<f32>,
  @location(0) color: vec3<f32>,
  @location(1) corner: vec2<f32>,
  @location(2) hash: f32,
}

@vertex
fn vertexMain(
  @location(0) corner: vec2<f32>,
  @location(1) instance: vec4<f32>,
  @location(2) seed: f32,
) -> VertexOut {
  let loopDuration = 11.0 + seed * 6.0;
  let t = fract((frame.time + seed * loopDuration) / loopDuration);
  // Spend the last part of the cycle resting on the platform, then respawn.
  let falling = min(t / 0.84, 1.0);
  let y = mix(instance.z, palette.bounds.z + 0.06, falling);
  let drift = sin(frame.time * 0.8 + seed * 6.283) * instance.w * frame.windStrength * t;
  let centre = vec3<f32>(instance.x + drift + sin(t * 12.0 + seed * 8.0) * 0.45, y, instance.y + drift * 0.5);

  let size = palette.bounds.w * 0.058 * (0.75 + seed * 0.55) * (1.0 - smoothstep(0.94, 1.0, t));
  let local = rotateLeaf(corner, frame.time * (0.6 + seed) + seed * 6.28);
  let world = revealPosition(centre) + frame.cameraRight.xyz * local.x * size
    + frame.cameraUp.xyz * local.y * size * (0.65 + 0.35 * sin(frame.time + seed * 19.0));

  var out: VertexOut;
  out.clipPosition = frame.viewProj * vec4<f32>(world, 1.0);
  out.color = mix(palette.canopy.rgb * 0.85, palette.petal.rgb, 0.18 + seed * 0.35);
  out.corner = corner;
  out.hash = seed;
  return out;
}

@fragment
fn fragmentMain(in: VertexOut) -> @location(0) vec4<f32> {
  if (length(in.corner * vec2<f32>(1.0, 1.5)) > 0.5) {
    discard;
  }
  if (dissolve(in.hash)) {
    discard;
  }
  return vec4<f32>(in.color, 1.0);
}
