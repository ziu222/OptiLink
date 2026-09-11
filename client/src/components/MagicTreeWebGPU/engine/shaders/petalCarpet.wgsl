// Spring-only settled flowers. The mesh is Blender-authored: this pass keeps
// its little cup and five-petal silhouette instead of drawing screen quads.
struct VertexOut {
  @builtin(position) clipPosition: vec4<f32>,
  @location(0) color: vec3<f32>,
  @location(1) seed: f32,
}

fn turn(p: vec3<f32>, angle: f32) -> vec3<f32> {
  return vec3<f32>(p.x * cos(angle) - p.z * sin(angle), p.y, p.x * sin(angle) + p.z * cos(angle));
}

@vertex
fn vertexMain(
  @location(0) position: vec3<f32>, @location(1) normal: vec3<f32>, @location(2) pigment: vec3<f32>,
  @location(3) instance: vec4<f32>, @location(4) seed: f32,
) -> VertexOut {
  let local = turn(position, instance.w) * instance.z;
  let world = vec3<f32>(instance.x, palette.bounds.z + 0.045, instance.y) + local;
  let diffuse = 0.72 + max(0.0, dot(turn(normal, instance.w), normalize(vec3<f32>(-0.35, 0.8, 0.3)))) * 0.2;
  var out: VertexOut;
  out.clipPosition = frame.viewProj * vec4<f32>(revealPosition(world), 1.0);
  out.color = pow(clamp(mix(pigment, palette.petal.rgb, 0.35) * diffuse, vec3<f32>(0.0), vec3<f32>(1.0)), vec3<f32>(0.8));
  out.seed = seed;
  return out;
}

@fragment
fn fragmentMain(in: VertexOut) -> @location(0) vec4<f32> {
  if (dissolve(in.seed)) { discard; }
  return vec4<f32>(in.color, 1.0);
}
