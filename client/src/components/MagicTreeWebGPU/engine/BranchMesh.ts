import { Vector3 } from 'three';
import type { BranchSegment } from './BranchGenerator';
import { pseudoRandom } from './seedFromUrl';

/**
 * Tapered tube geometry for the branch pipeline — spec §4.1 item 2.
 *
 * Built once per rebuild into one interleaved vertex buffer; the vertex shader
 * only applies the shared view-projection, since trunk and branches don't sway.
 */

/** position(3) + normal(3) + dissolve hash(1) */
export const BRANCH_VERTEX_FLOATS = 7;
const RADIAL_SEGMENTS = 6;

export interface BranchMeshData {
  vertices: Float32Array;
  indices: Uint32Array;
  vertexCount: number;
  indexCount: number;
}

/**
 * An orthonormal basis around `dir`. Same explicit reference axis as
 * BranchGenerator: a vertical trunk crossed with world-up is a zero vector.
 */
function basisFor(dir: Vector3): { right: Vector3; forward: Vector3 } {
  const ref = Math.abs(dir.y) > 0.99 ? new Vector3(1, 0, 0) : new Vector3(0, 1, 0);
  const right = new Vector3().crossVectors(dir, ref).normalize();
  const forward = new Vector3().crossVectors(dir, right).normalize();
  return { right, forward };
}

export function buildBranchMesh(segments: BranchSegment[], seed: number): BranchMeshData {
  const vertices = new Float32Array(segments.length * RADIAL_SEGMENTS * 2 * BRANCH_VERTEX_FLOATS);
  const indices = new Uint32Array(segments.length * RADIAL_SEGMENTS * 6);
  let v = 0;
  let i = 0;
  let baseVertex = 0;

  const axis = new Vector3();
  for (let s = 0; s < segments.length; s++) {
    const segment = segments[s];
    axis
      .set(
        segment.end[0] - segment.start[0],
        segment.end[1] - segment.start[1],
        segment.end[2] - segment.start[2]
      )
      .normalize();
    const { right, forward } = basisFor(axis);
    const hash = pseudoRandom(s, segment.depth, seed + 17);

    for (let ring = 0; ring < 2; ring++) {
      const centre = ring === 0 ? segment.start : segment.end;
      const radius = ring === 0 ? segment.startRadius : segment.endRadius;
      for (let r = 0; r < RADIAL_SEGMENTS; r++) {
        const angle = (r / RADIAL_SEGMENTS) * Math.PI * 2;
        const nx = right.x * Math.cos(angle) + forward.x * Math.sin(angle);
        const ny = right.y * Math.cos(angle) + forward.y * Math.sin(angle);
        const nz = right.z * Math.cos(angle) + forward.z * Math.sin(angle);
        vertices[v++] = centre[0] + nx * radius;
        vertices[v++] = centre[1] + ny * radius;
        vertices[v++] = centre[2] + nz * radius;
        vertices[v++] = nx;
        vertices[v++] = ny;
        vertices[v++] = nz;
        vertices[v++] = hash;
      }
    }

    for (let r = 0; r < RADIAL_SEGMENTS; r++) {
      const next = (r + 1) % RADIAL_SEGMENTS;
      const a = baseVertex + r;
      const b = baseVertex + next;
      const c = baseVertex + RADIAL_SEGMENTS + r;
      const d = baseVertex + RADIAL_SEGMENTS + next;
      indices[i++] = a;
      indices[i++] = c;
      indices[i++] = b;
      indices[i++] = b;
      indices[i++] = c;
      indices[i++] = d;
    }
    baseVertex += RADIAL_SEGMENTS * 2;
  }

  return {
    vertices,
    indices,
    vertexCount: baseVertex,
    indexCount: i,
  };
}
