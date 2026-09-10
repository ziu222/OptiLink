// Grass ring — spec §4.1 item 5, §5.3. Sways from the tip, stays outside the
// QR footprint, and is never dissolved: it can't cover a module.

struct VertexOut {
  @builtin(position) clipPosition: vec4<f32>,
  @location(0) color: vec3<f32>,
}

const BLADE_WIDTH: f32 = 0.22;
const TIP_SWAY: f32 = 0.35;

@vertex
fn vertexMain(
  @location(0) corner: vec2<f32>,
  @location(1) instance: vec4<f32>,
  @location(2) seed: f32,
) -> VertexOut {
  // 0 at the base, 1 at the tip: bases stay put, tips move most.
  let tipT = corner.y + 0.5;
  let wave = sin(frame.time * 1.3 + instance.x * 0.3 + instance.y * 0.2);
  let sway = (0.15 + wave * TIP_SWAY * frame.windStrength) * tipT * tipT;
  let width = BLADE_WIDTH * (1.0 - tipT * 0.97);
  let facingX = cos(instance.w);
  let facingZ = sin(instance.w);

  let world = vec3<f32>(
    instance.x + facingX * corner.x * width + sway,
    palette.bounds.z + tipT * instance.z,
    instance.y + facingZ * corner.x * width + sway * 0.6,
  );

  var out: VertexOut;
  out.clipPosition = frame.viewProj * vec4<f32>(world, 1.0);
  out.color = mix(palette.grass.rgb * (0.55 + seed * 0.2), palette.grass.rgb * 1.38, tipT);
  return out;
}

@fragment
fn fragmentMain(in: VertexOut) -> @location(0) vec4<f32> {
  return vec4<f32>(in.color, 1.0);
}
