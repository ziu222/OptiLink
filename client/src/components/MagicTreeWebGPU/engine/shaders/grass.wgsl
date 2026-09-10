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
  let sway = sin(frame.time * 1.2 + seed * 6.283) * TIP_SWAY * frame.windStrength * tipT;
  let facingX = cos(instance.w);
  let facingZ = sin(instance.w);

  let world = vec3<f32>(
    instance.x + facingX * corner.x * BLADE_WIDTH + sway,
    palette.bounds.z + tipT * instance.z,
    instance.y + facingZ * corner.x * BLADE_WIDTH + sway * 0.6,
  );

  var out: VertexOut;
  out.clipPosition = frame.viewProj * vec4<f32>(world, 1.0);
  out.color = clamp(palette.grass.rgb * mix(0.75, 1.1, tipT * 0.6 + seed * 0.4), vec3<f32>(0.0), vec3<f32>(1.0));
  return out;
}

@fragment
fn fragmentMain(in: VertexOut) -> @location(0) vec4<f32> {
  return vec4<f32>(in.color, 1.0);
}
