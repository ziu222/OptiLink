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
  let noise = fract(sin(dot(cell.xy, vec2<f32>(12.9898, 78.233))) * 43758.5453);
  let contact = exp(-dot(cell.xy, cell.xy) * 0.11) * 0.07;
  // The QR is the terrain: quiet cream cells stay open while dark cells get
  // a muted moss base beneath exactly one low-poly grass tuft.
  let empty = palette.groundLight.rgb * (0.985 - noise * 0.035 - contact);
  let planted = mix(palette.groundLight.rgb, palette.grass.rgb, 0.28) * (0.94 + noise * 0.05);
  let garden = mix(empty, planted, cell.z);
  let qr = mix(palette.groundLight.rgb, palette.groundDark.rgb, cell.z);
  out.color = mix(qr, garden, frame.treeAlpha);
  return out;
}

@fragment
fn fragmentMain(in: VertexOut) -> @location(0) vec4<f32> {
  return vec4<f32>(in.color, 1.0);
}
