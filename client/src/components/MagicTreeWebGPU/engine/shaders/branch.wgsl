// Branch pipeline — tapered tubes, unlit with a hand-computed brightness ramp
// (spec §4.1 item 2, §4.4). Trunk and branches don't sway.

struct VertexOut {
  @builtin(position) clipPosition: vec4<f32>,
  @location(0) color: vec3<f32>,
  @location(1) hash: f32,
  @location(2) world: vec3<f32>,
}

@vertex
fn vertexMain(
  @location(0) position: vec3<f32>,
  @location(1) normal: vec3<f32>,
  @location(2) hash: f32,
) -> VertexOut {
  var out: VertexOut;
  out.clipPosition = frame.viewProj * vec4<f32>(revealPosition(position + wind(position)), 1.0);
  // Upward-facing surfaces brighter, undersides darker. A fixed ramp, not a
  // lighting response: what the code says is exactly what renders.
  let shade = 0.72 + 0.22 * normal.y + 0.2 * normal.x - 0.13 * normal.z;
  out.color = clamp(palette.trunk.rgb * shade, vec3<f32>(0.0), vec3<f32>(1.0));
  out.hash = hash;
  out.world = position;
  return out;
}

@fragment
fn fragmentMain(in: VertexOut) -> @location(0) vec4<f32> {
  if (dissolve(in.hash)) {
    discard;
  }
  let grain = sin(in.world.x * 25.0 + sin(in.world.y * 1.6) * 0.7 + in.world.z * 21.0);
  let crack = smoothstep(0.72, 0.98, grain) * 0.18;
  let rings = smoothstep(0.94, 1.0, sin(in.world.y * 12.0 + in.world.x * 0.4)) * 0.07;
  return vec4<f32>(in.color * (1.05 - crack - rings), 1.0);
}
