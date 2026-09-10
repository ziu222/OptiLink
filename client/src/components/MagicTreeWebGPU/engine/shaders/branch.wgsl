// Branch pipeline — tapered tubes, unlit with a hand-computed brightness ramp
// (spec §4.1 item 2, §4.4). Trunk and branches don't sway.

struct VertexOut {
  @builtin(position) clipPosition: vec4<f32>,
  @location(0) color: vec3<f32>,
  @location(1) hash: f32,
}

@vertex
fn vertexMain(
  @location(0) position: vec3<f32>,
  @location(1) normal: vec3<f32>,
  @location(2) hash: f32,
) -> VertexOut {
  var out: VertexOut;
  out.clipPosition = frame.viewProj * vec4<f32>(position, 1.0);
  // Upward-facing surfaces brighter, undersides darker. A fixed ramp, not a
  // lighting response: what the code says is exactly what renders.
  let shade = mix(0.65, 1.10, normal.y * 0.5 + 0.5);
  out.color = clamp(palette.trunk.rgb * shade, vec3<f32>(0.0), vec3<f32>(1.0));
  out.hash = hash;
  return out;
}

@fragment
fn fragmentMain(in: VertexOut) -> @location(0) vec4<f32> {
  if (dissolve(in.hash)) {
    discard;
  }
  return vec4<f32>(in.color, 1.0);
}
