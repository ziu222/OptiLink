// Grounding decal — spec §4.1 item 6. A soft elliptical darkening under the
// structure, the same cheap depth cue the voxel tree uses. Blended, drawn
// last, depth-write off, and lifted above the ground quads: the voxel version
// shipped once buried underneath them, invisible.

struct VertexOut {
  @builtin(position) clipPosition: vec4<f32>,
  @location(0) corner: vec2<f32>,
}

const DECAL_LIFT: f32 = -1.65;
const DECAL_RADIUS_FACTOR: f32 = 1.9;
const DECAL_STRENGTH: f32 = 0.22;

@vertex
fn vertexMain(@location(0) corner: vec2<f32>) -> VertexOut {
  let radius = palette.bounds.w * DECAL_RADIUS_FACTOR;
  var out: VertexOut;
  out.clipPosition = frame.viewProj * vec4<f32>(
    corner.x * radius * 2.0,
    palette.bounds.z + DECAL_LIFT,
    corner.y * radius * 2.0,
    1.0,
  );
  out.corner = corner;
  return out;
}

@fragment
fn fragmentMain(in: VertexOut) -> @location(0) vec4<f32> {
  let distance = length(max(abs(in.corner) - vec2<f32>(0.19), vec2<f32>(0.0)));
  let falloff = 1.0 - smoothstep(0.03, 0.23, distance);
  // Fades out with the tree: in the settled flat view nothing may darken a
  // QR module, not even a shadow (§1.5.1 outranks the decal).
  let strength = DECAL_STRENGTH * frame.treeAlpha;
  return vec4<f32>(0.0, 0.0, 0.0, falloff * strength);
}
