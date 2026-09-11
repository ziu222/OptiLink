// Spring-only falling flowers. Each instance uses the Blender flower mesh,
// projected gently into the camera plane for a readable drifting silhouette.
struct VertexOut {
  @builtin(position) clipPosition: vec4<f32>,
  @location(0) color: vec3<f32>,
  @location(1) seed: f32,
}

@vertex
fn vertexMain(
  @location(0) position: vec3<f32>, @location(1) normal: vec3<f32>, @location(2) pigment: vec3<f32>,
  @location(3) instance: vec4<f32>, @location(4) seed: f32,
) -> VertexOut {
  let loopDuration = 12.0 + seed * 5.0;
  let t = fract((frame.time + seed * loopDuration) / loopDuration);
  let falling = min(t / 0.86, 1.0);
  let y = mix(instance.z, palette.bounds.z + 0.12, falling);
  let drift = sin(frame.time * 0.75 + seed * 6.283) * instance.w * frame.windStrength * t;
  let centre = vec3<f32>(instance.x + drift + sin(t * 9.0 + seed * 8.0) * 0.25, y, instance.y + drift * 0.55);
  let spin = frame.time * (0.42 + seed * 0.24) + seed * 6.283;
  let local = rotateLeaf(vec2<f32>(position.x, position.z), spin) * (palette.bounds.w * 0.023 * (0.76 + seed * 0.34));
  let world = revealPosition(centre) + frame.cameraRight.xyz * local.x + frame.cameraUp.xyz * local.y;
  let diffuse = 0.74 + max(0.0, dot(normalize(normal), normalize(vec3<f32>(-0.3, 0.8, 0.35)))) * 0.18;
  var out: VertexOut;
  out.clipPosition = frame.viewProj * vec4<f32>(world, 1.0);
  out.color = pow(clamp(mix(pigment, palette.petal.rgb, 0.45) * diffuse, vec3<f32>(0.0), vec3<f32>(1.0)), vec3<f32>(0.8));
  out.seed = seed;
  return out;
}

@fragment
fn fragmentMain(in: VertexOut) -> @location(0) vec4<f32> {
  if (dissolve(in.seed)) { discard; }
  return vec4<f32>(in.color, 1.0);
}
