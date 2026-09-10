// Five curved segments per blade, plus a tiny flower on selected stems.
struct VertexOut {
  @builtin(position) clipPosition: vec4<f32>,
  @location(0) color: vec3<f32>,
  @location(1) hash: f32,
  @location(2) uv: vec2<f32>,
  @location(3) blossom: f32,
}

@vertex
fn vertexMain(@builtin(vertex_index) vertex: u32, @location(1) instance: vec4<f32>, @location(2) seed: f32) -> VertexOut {
  var corners = array<vec2<f32>, 6>(vec2<f32>(-0.5, 0.0), vec2<f32>(0.5, 0.0), vec2<f32>(-0.5, 1.0),
    vec2<f32>(-0.5, 1.0), vec2<f32>(0.5, 0.0), vec2<f32>(0.5, 1.0));
  let corner = corners[vertex % 6u];
  let blossom = vertex >= 30u;
  let t = select((f32(vertex / 6u) + corner.y) / 5.0, 1.0, blossom);
  let wave = sin(frame.time * 1.45 + instance.x * 0.25 + instance.y * 0.18);
  let ripple = sin(frame.time * 2.7 + seed * 31.0) * 0.08;
  let bend = (0.22 + seed * 0.48 + (wave * 0.2 + ripple) * frame.windStrength) * t * t * instance.z;
  let width = (0.16 + seed * 0.17) * pow(1.0 - t * 0.995, 0.8);
  let side = vec3<f32>(cos(instance.w), 0.0, sin(instance.w));
  let forward = vec3<f32>(-sin(instance.w), 0.0, cos(instance.w));
  let root = vec3<f32>(instance.x, 0.0, instance.y);
  var world = root + vec3<f32>(0.0, t * instance.z, 0.0) + forward * bend;
  if (blossom) {
    world += (frame.cameraRight.xyz * corner.x + frame.cameraUp.xyz * (corner.y - 0.5)) * 0.5;
  } else {
    world += side * corner.x * width;
  }
  var out: VertexOut;
  out.clipPosition = frame.viewProj * vec4<f32>(revealPosition(world), 1.0);
  out.color = mix(palette.grass.rgb * (0.46 + seed * 0.25), palette.grass.rgb * 1.4, t);
  out.hash = seed;
  out.uv = select(vec2<f32>(corner.x, t), vec2<f32>(corner.x, corner.y - 0.5) * 2.0, blossom);
  out.blossom = select(0.0, 1.0, blossom);
  return out;
}

@fragment
fn fragmentMain(in: VertexOut) -> @location(0) vec4<f32> {
  if (dissolve(in.hash)) { discard; }
  if (in.blossom > 0.5) {
    if (in.hash > 0.045) { discard; }
    let radius = length(in.uv);
    let edge = 0.65 + 0.22 * cos(atan2(in.uv.y, in.uv.x) * 5.0);
    if (radius > edge) { discard; }
    let centre = 1.0 - smoothstep(0.12, 0.23, radius);
    return vec4<f32>(mix(palette.petal.rgb, vec3<f32>(0.91, 0.69, 0.21), centre), 1.0);
  }
  let ridge = 1.0 - smoothstep(0.0, 0.12, abs(in.uv.x));
  let fold = select(0.84, 1.05, in.uv.x > 0.0);
  return vec4<f32>(in.color * (fold + ridge * 0.08), 1.0);
}
