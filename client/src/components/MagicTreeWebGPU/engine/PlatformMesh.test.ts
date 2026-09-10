import { describe, expect, it } from 'vitest';
import { buildPlatformMesh } from './PlatformMesh';

describe('platform and QR quiet zone', () => {
  it('keeps a continuous top surface beyond the four-module margin', () => {
    for (const size of [21, 33, 57, 97]) {
      const vertices = buildPlatformMesh(size);
      expect(vertices.every(Number.isFinite)).toBe(true);
      let topTriangles = 0;
      for (let i = 0; i < vertices.length; i += 18) {
        if (vertices[i + 4] !== 1) continue;
        topTriangles++;
        expect(vertices[i + 1]).toBeCloseTo(-0.035);
        // Fan rim vertices must remain outside the full QR quiet-zone square.
        for (const offset of [6, 12]) {
          expect(Math.max(Math.abs(vertices[i + offset]), Math.abs(vertices[i + offset + 2])))
            .toBeGreaterThan(size / 2 + 4);
        }
      }
      expect(topTriangles).toBeGreaterThan(24);
    }
  });
});
