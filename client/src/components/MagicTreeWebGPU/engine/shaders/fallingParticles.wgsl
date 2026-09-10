// Falling petals / leaves / snow — spec §4.1 item 4, §5.2. The whole fall
// loop is a function of the time uniform: no stored state, no compute pass.

struct VertexOut {
  @builtin(position) clipPosition: vec4<f32>,
  @location(0) color: vec3<f32>,
  @location(1) corner: vec2<f32>,
  @location(2) hash: f32,
}

const PARTICLE_SIZE: f32 = 0.45;

@vertex
fn vertexMain(
  @location(0) corner: vec2<f32>,
  @location(1) instance: vec4<f32>,
  @location(2) seed: f32,
) -> VertexOut {
  let loopDuration = 6.0 + seed * 4.0;
  let t = fract((frame.time + seed * loopDuration) / loopDuration);
  let y = mix(instance.z, palette.bounds.z, t);
  let drift = sin(frame.time * 0.8 + seed * 6.283) * instance.w * frame.windStrength * t;
  let centre = vec3<f32>(instance.x + drift, y, instance.y + drift * 0.5);

  let size = PARTICLE_SIZE * (0.7 + seed * 0.6);
  let world =
    centre + frame.cameraRight.xyz * corner.x * size + frame.cameraUp.xyz * corner.y * size;

  var out: VertexOut;
  out.clipPosition = frame.viewProj * vec4<f32>(world, 1.0);
  out.color = clamp(palette.petal.rgb * mix(0.85, 1.1, seed), vec3<f32>(0.0), vec3<f32>(1.0));
  out.corner = corner;
  out.hash = seed;
  return out;
}

@fragment
fn fragmentMain(in: VertexOut) -> @location(0) vec4<f32> {
  if (length(in.corner) > 0.5) {
    discard;
  }
  if (dissolve(in.hash)) {
    discard;
  }
  return vec4<f32>(in.color, 1.0);
}
