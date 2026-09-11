// A different Blender-authored tuft for each season. Roots remain anchored.
struct VertexOut {
  @builtin(position) clipPosition: vec4<f32>,
  @location(0) color: vec3<f32>,
  @location(1) seed: f32,
}
fn turn(p: vec3<f32>, angle: f32) -> vec3<f32> {
  return vec3<f32>(p.x*cos(angle)-p.z*sin(angle),p.y,p.x*sin(angle)+p.z*cos(angle));
}
@vertex
fn vertexMain(@location(0) position: vec3<f32>, @location(1) normal: vec3<f32>,
  @location(2) pigment: vec3<f32>, @location(3) instance: vec4<f32>, @location(4) seed: f32) -> VertexOut {
  let wave = sin(frame.time * 0.85 + instance.x * 0.22 + instance.y * 0.15);
  var local = turn(position * vec3<f32>(1.12,1.0,1.12),instance.w) * instance.z;
  local.x += wave * position.y * position.y * 0.1 * frame.windStrength;
  local.z += wave * position.y * position.y * 0.05 * frame.windStrength;
  let world = vec3<f32>(instance.x,0.01,instance.y) + local;
  let n = turn(normal,instance.w);
  let diffuse = 0.76 + max(0.0,dot(n,normalize(vec3<f32>(-0.5,0.8,0.35)))) * 0.22;
  var out: VertexOut;
  out.clipPosition = frame.viewProj * vec4<f32>(revealPosition(world),1.0);
  out.color = pow(clamp(pigment * diffuse * (0.82 + seed * 0.12),vec3<f32>(0.0),vec3<f32>(1.0)),vec3<f32>(0.9));
  out.seed = seed;
  return out;
}
@fragment
fn fragmentMain(in: VertexOut) -> @location(0) vec4<f32> {
  if (dissolve(in.seed)) { discard; }
  return vec4<f32>(in.color,1.0);
}
