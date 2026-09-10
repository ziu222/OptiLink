struct VertexOut {
  @builtin(position) clipPosition: vec4<f32>,
  @location(0) color: vec3<f32>,
}
@vertex
fn vertexMain(@location(0) position: vec3<f32>, @location(1) normal: vec3<f32>) -> VertexOut {
  var out: VertexOut;
  out.clipPosition = frame.viewProj * vec4<f32>(position, 1.0);
  let shade = select(0.73 + normal.y * 0.18 + normal.x * 0.08 - normal.z * 0.04, 1.0, normal.y > 0.99);
  out.color = palette.groundLight.rgb * mix(1.0, shade, frame.treeAlpha);
  return out;
}
@fragment
fn fragmentMain(in: VertexOut) -> @location(0) vec4<f32> {
  return vec4<f32>(in.color, 1.0);
}
