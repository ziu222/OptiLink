import { describe, expect, it } from 'vitest';
import { generateBranches } from './BranchGenerator';
import { BRANCH_VERTEX_FLOATS, buildBranchMesh } from './BranchMesh';
import { seedFromUrl } from './seedFromUrl';

const SEED = seedFromUrl('https://optilink.app');
const segments = generateBranches(SEED, 33);
const mesh = buildBranchMesh(segments, SEED);

describe('buildBranchMesh', () => {
  it('is deterministic', () => {
    expect(buildBranchMesh(segments, SEED)).toEqual(mesh);
  });

  it('emits one tube per segment', () => {
    expect(mesh.vertexCount).toBe(segments.length * 12);
    expect(mesh.indexCount).toBe(segments.length * 36);
    expect(mesh.vertices).toHaveLength(mesh.vertexCount * BRANCH_VERTEX_FLOATS);
  });

  it('emits no NaN', () => {
    expect(mesh.vertices.every(Number.isFinite)).toBe(true);
  });

  it('keeps every index inside the vertex buffer', () => {
    for (const index of mesh.indices) {
      expect(index).toBeLessThan(mesh.vertexCount);
    }
  });

  it('emits unit normals', () => {
    for (let v = 0; v < mesh.vertexCount; v++) {
      const o = v * BRANCH_VERTEX_FLOATS;
      expect(Math.hypot(mesh.vertices[o + 3], mesh.vertices[o + 4], mesh.vertices[o + 5])).toBeCloseTo(1, 5);
    }
  });

  it('places ring vertices at the segment radius', () => {
    const segment = segments[0];
    for (let r = 0; r < 6; r++) {
      const o = r * BRANCH_VERTEX_FLOATS;
      const distance = Math.hypot(
        mesh.vertices[o] - segment.start[0],
        mesh.vertices[o + 1] - segment.start[1],
        mesh.vertices[o + 2] - segment.start[2]
      );
      expect(distance).toBeCloseTo(segment.startRadius, 5);
    }
  });

  it('carries one stable dissolve hash per segment', () => {
    const first = mesh.vertices[6];
    for (let v = 0; v < 12; v++) {
      expect(mesh.vertices[v * BRANCH_VERTEX_FLOATS + 6]).toBe(first);
    }
    expect(first).toBeGreaterThanOrEqual(0);
    expect(first).toBeLessThan(1);
  });

  it('handles an empty tree', () => {
    const empty = buildBranchMesh([], SEED);
    expect(empty.vertexCount).toBe(0);
    expect(empty.indexCount).toBe(0);
  });
});
