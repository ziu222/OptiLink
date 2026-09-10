// Canopy pipeline — camera-facing leaf quads with a gentle sway (spec §4.1
// item 3, §5.1). Alpha-tested, never blended, so depth-write stays on and
// thousands of quads need no sorting.

struct VertexOut {
  @builtin(position) clipPosition: vec4<f32>,
  @location(0) color: vec3<f32>,
  @location(1) corner: vec2<f32>,
  @location(2) hash: f32,
}

const LEAF_SIZE: f32 = 0.85;

@vertex
fn vertexMain(
  @location(0) corner: vec2<f32>,
  @location(1) instance: vec4<f32>,
) -> VertexOut {
  let seed = instance.w;
  let sway = sin(frame.time * 1.2 + seed * 6.283) * 0.05 * frame.windStrength;
  let centre = instance.xyz + vec3<f32>(sway, 0.0, sway * 0.6);
  let size = LEAF_SIZE * (0.7 + seed * 0.6);
  let world =
    centre + frame.cameraRight.xyz * corner.x * size + frame.cameraUp.xyz * corner.y * size;

  // Higher and randomly-varied leaves are brighter — this is what makes the
  // canopy read as volume instead of a flat silhouette.
  let heightT = clamp((instance.y - palette.bounds.x) / max(palette.bounds.y, 0.001), 0.0, 1.0);
  let shade = mix(0.70, 1.15, heightT * 0.6 + seed * 0.4);

  var out: VertexOut;
  out.clipPosition = frame.viewProj * vec4<f32>(world, 1.0);
  out.color = clamp(palette.canopy.rgb * shade, vec3<f32>(0.0), vec3<f32>(1.0));
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
