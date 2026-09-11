// Blender-authored cupped flowers and folded leaves, instanced in world space.
struct VertexOut {
  @builtin(position) clipPosition: vec4<f32>,
  @location(0) pigment: vec3<f32>,
  @location(1) normal: vec3<f32>,
  @location(2) seed: f32,
  @location(3) height: f32,
}

fn orient(p: vec3<f32>, seed: f32) -> vec3<f32> {
  let a = seed * 75.39;
  let tilt = 0.3 + fract(seed * 17.0) * 2.5;
  let q = vec3<f32>(p.x, p.y * cos(tilt) - p.z * sin(tilt), p.y * sin(tilt) + p.z * cos(tilt));
  return vec3<f32>(q.x*cos(a)-q.z*sin(a),q.y,q.x*sin(a)+q.z*cos(a));
}

@vertex
fn vertexMain(@location(0) position: vec3<f32>, @location(1) normal: vec3<f32>,
  @location(2) pigment: vec3<f32>, @location(3) instance: vec4<f32>) -> VertexOut {
  let seed = instance.w;
  let release = smoothstep(seed * 0.2, 0.7 + seed * 0.12, frame.reveal);
  let drift = sin(release * 3.14159) * palette.bounds.w * 0.1;
  let centre = vec3<f32>(instance.x + cos(seed * 31.0) * drift,
    mix(instance.y, 0.12, release), instance.z + sin(seed * 31.0) * drift) + wind(instance.xyz) * (1.0 - release);
  let flutter = sin(frame.time * 1.25 + seed * 39.0) * 0.035 * frame.windStrength;
  let size = palette.bounds.w * 0.064 * (0.82 + seed * 0.28);
  let local = orient(position, seed + flutter * 0.008) * size;
  var out: VertexOut;
  out.clipPosition = frame.viewProj * vec4<f32>(centre + local, 1.0);
  out.pigment = pigment * (0.88 + seed * 0.16);
  out.normal = orient(normal, seed + flutter * 0.008);
  out.seed = seed;
  out.height = clamp((instance.y - palette.bounds.x) / max(palette.bounds.y,0.001),0.0,1.0);
  return out;
}

@fragment
fn fragmentMain(in: VertexOut, @builtin(front_facing) front: bool) -> @location(0) vec4<f32> {
  if (dissolve(in.seed)) { discard; }
  let normal = normalize(in.normal) * select(-1.0,1.0,front);
  let key = max(0.0,dot(normal,normalize(vec3<f32>(-0.5,0.8,0.35))));
  // Broad diffuse wrap and subtle transmission, deliberately no specular lobe.
  let light = 0.62 + key * 0.27 + in.height * 0.1;
  let pigment = mix(in.pigment, palette.petal.rgb * 0.75, 0.02);
  let color = pow(clamp(pigment * light,vec3<f32>(0.0),vec3<f32>(1.0)),vec3<f32>(0.8));
  return vec4<f32>(color,1.0);
}
