// Ground pipeline — one flat quad per QR module (spec §4.1 item 1).
// This is the QR itself: never shaded, never dissolved.

struct VertexOut {
  @builtin(position) clipPosition: vec4<f32>,
  @location(0) color: vec3<f32>,
  @location(1) corner: vec2<f32>,
  @location(2) noise: f32,
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
  let contact = exp(-dot(cell.xy, cell.xy) * 0.1) * 0.16;
  let stone = palette.groundLight.rgb * (0.87 + noise * 0.1 - cell.z * 0.035 - contact);
  let qr = mix(palette.groundLight.rgb, palette.groundDark.rgb, cell.z);
  out.color = mix(qr, stone, frame.treeAlpha);
  out.corner = corner;
  out.noise = noise;
  return out;
}

@fragment
fn fragmentMain(in: VertexOut) -> @location(0) vec4<f32> {
  if (in.noise > 0.91 && frame.treeAlpha > 0.01) {
    let uv = rotateLeaf(in.corner, in.noise * 70.0);
    let petal = 1.0 - smoothstep(0.13, 0.17, length(uv * vec2<f32>(1.0, 1.8)));
    let tint = mix(palette.petal.rgb, palette.canopy.rgb, 0.35);
    return vec4<f32>(mix(in.color, tint, petal * frame.treeAlpha), 1.0);
  }
  return vec4<f32>(in.color, 1.0);
}
