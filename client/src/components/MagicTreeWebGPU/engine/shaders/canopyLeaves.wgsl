// Canopy pipeline — camera-facing leaf quads with a gentle sway (spec §4.1
// item 3, §5.1). Alpha-tested, never blended, so depth-write stays on and
// thousands of quads need no sorting.

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
) -> VertexOut {
  let seed = instance.w;
  let flutter = sin(frame.time * 2.1 + seed * 39.0) * 0.16 * frame.windStrength;
  let local = rotateLeaf(corner, seed * 6.283 + flutter);
  let centre = instance.xyz + wind(instance.xyz);
  let size = palette.bounds.w * 0.062 * (0.8 + seed * 0.45);
  let world =
    centre + frame.cameraRight.xyz * local.x * size + frame.cameraUp.xyz * local.y * size;

  // Higher and randomly-varied leaves are brighter — this is what makes the
  // canopy read as volume instead of a flat silhouette.
  let heightT = clamp((instance.y - palette.bounds.x) / max(palette.bounds.y, 0.001), 0.0, 1.0);
  let depth = clamp(1.0 - length(instance.xz) / max(palette.bounds.w, 1.0), 0.0, 1.0);
  let shade = 0.77 + heightT * 0.25 + seed * 0.18 - depth * 0.06;

  var out: VertexOut;
  out.clipPosition = frame.viewProj * vec4<f32>(world, 1.0);
  let blossomMix = select(seed * seed * 0.18, 0.2 + seed * 0.65, palette.canopy.w < 0.5);
  out.color = clamp(mix(palette.canopy.rgb * shade, palette.petal.rgb, blossomMix), vec3<f32>(0.0), vec3<f32>(1.0));
  out.corner = corner * 2.0;
  out.hash = seed;
  return out;
}

@fragment
fn fragmentMain(in: VertexOut) -> @location(0) vec4<f32> {
  if (dissolve(in.hash)) { discard; }
  if (palette.canopy.w < 0.5) {
    let angle = atan2(in.corner.y, in.corner.x);
    let radius = length(in.corner);
    let edge = 0.7 + 0.2 * cos(angle * 5.0);
    if (radius > edge) { discard; }
    let centre = 1.0 - smoothstep(0.07, 0.18, radius);
    let blush = smoothstep(0.3, 0.88, radius) * 0.16;
    let petal = mix(in.color, palette.canopy.rgb, blush);
    return vec4<f32>(mix(petal, vec3<f32>(0.76, 0.73, 0.41), centre * 0.55), 1.0);
  }
  let width = 0.72 * (1.0 - in.corner.y * in.corner.y);
  let serration = 0.025 * sin(in.corner.y * 36.0 + in.hash * 8.0);
  if (abs(in.corner.x) > width + serration || abs(in.corner.y) > 0.96) {
    discard;
  }
  if (dissolve(in.hash)) {
    discard;
  }
  let vein = 1.0 - smoothstep(0.015, 0.045, abs(in.corner.x));
  let fold = mix(0.91, 1.05, smoothstep(-0.1, 0.1, in.corner.x));
  let rib = sin((in.corner.y - abs(in.corner.x) * 0.65) * 30.0) * 0.025;
  return vec4<f32>(in.color * (fold + vein * 0.12 + rib), 1.0);
}
