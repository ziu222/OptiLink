/** A solid rounded plinth with a bevel, a shaded wall and a four-cell quiet zone. */
export function buildPlatformMesh(gridSize: number): Float32Array {
  const half = gridSize / 2 + 4.6;
  const points: [number, number][] = [];
  const radius = 0.9;
  for (let corner = 0; corner < 4; corner++) {
    const angle = corner * Math.PI / 2;
    const cx = (corner === 0 || corner === 3 ? 1 : -1) * (half - radius);
    const cz = (corner < 2 ? 1 : -1) * (half - radius);
    for (let i = 0; i <= 8; i++) {
      const a = angle + i / 8 * Math.PI / 2;
      points.push([cx + Math.cos(a) * radius, cz + Math.sin(a) * radius]);
    }
  }
  const out: number[] = [];
  const v = (x: number, y: number, z: number, nx: number, ny: number, nz: number) => out.push(x, y, z, nx, ny, nz);
  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    v(0, -0.035, 0, 0, 1, 0);
    v(a[0], -0.035, a[1], 0, 1, 0);
    v(b[0], -0.035, b[1], 0, 1, 0);
    const dx = b[0] - a[0], dz = b[1] - a[1];
    const length = Math.hypot(dx, dz);
    if (length < 1e-6) continue;
    const nx = dz / length, nz = -dx / length;
    const rings = [[1, -0.035], [1.012, -0.32], [1.006, -1.25], [0.998, -1.45]];
    for (let ring = 0; ring < rings.length - 1; ring++) {
      const [s1, y1] = rings[ring], [s2, y2] = rings[ring + 1];
      const ny = ring === 0 ? 0.7 : ring === 2 ? -0.25 : 0;
      const vert = (p: [number, number], scale: number, y: number) => v(p[0] * scale, y, p[1] * scale, nx, ny, nz);
      vert(a, s1, y1); vert(a, s2, y2); vert(b, s1, y1);
      vert(b, s1, y1); vert(a, s2, y2); vert(b, s2, y2);
    }
  }
  return new Float32Array(out);
}
