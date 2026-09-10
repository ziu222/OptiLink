// Ground pipeline — one flat quad per QR module (spec §4.1 item 1).
// This is the QR itself: never shaded, never dissolved.

struct VertexOut {
  @builtin(position) clipPosition: vec4<f32>,
  @location(0) color: vec3<f32>,
}

// Modules must touch: a hairline gap puts a light seam through every finder
// pattern, which breaks the 1:1:3:1:1 run-length ratios decoders look for.
const CELL_FILL: f32 = 1.0;

@vertex
fn vertexMain(
  @location(0) corner: vec2<f32>,
  @location(1) cell: vec3<f32>,
) -> VertexOut {
  let world = vec3<f32>(
    cell.x + corner.x * CELL_FILL,
    palette.bounds.z,
    cell.y + corner.y * CELL_FILL,
  );

  var out: VertexOut;
  out.clipPosition = frame.viewProj * vec4<f32>(world, 1.0);
  out.color = mix(palette.groundLight.rgb, palette.groundDark.rgb, cell.z);
  return out;
}

@fragment
fn fragmentMain(in: VertexOut) -> @location(0) vec4<f32> {
  return vec4<f32>(in.color, 1.0);
}
