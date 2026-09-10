import manifestText from '../assets/botanical.json?raw';
import binaryUrl from '../assets/botanical.bin?url';
import type { SeasonId } from '../../MagicTreeQR/types/magicTree';
import type { CanopyData } from './LeafInstances';
import { pseudoRandom } from './seedFromUrl';

export type BotanicalMesh = 'branch' | SeasonId | `grass_${SeasonId}`;
export interface BotanicalManifest {
  version: number;
  stride: number;
  meshes: Record<BotanicalMesh, { offset: number; count: number }>;
  anchors: [number, number, number, number][];
}
export const botanicalManifest: BotanicalManifest = JSON.parse(manifestText);
export interface BotanicalAssets { mesh: (name: BotanicalMesh) => Float32Array }
let pending: Promise<BotanicalAssets> | null = null;

/** The Blender binary is fetched once, then reused through rebuild/StrictMode. */
export function loadBotanicalAssets(): Promise<BotanicalAssets> {
  pending ??= fetch(binaryUrl).then(async response => {
    if (!response.ok) throw new Error('Botanical mesh unavailable');
    const binary = await response.arrayBuffer();
    if (binary.byteLength % 4) throw new Error('Invalid botanical mesh alignment');
    const floats = new Float32Array(binary);
    if (botanicalManifest.version !== 1 || botanicalManifest.stride !== 9) throw new Error('Unsupported botanical mesh');
    for (const entry of Object.values(botanicalManifest.meshes)) {
      if (entry.offset < 0 || entry.count <= 0 || entry.offset + entry.count * 9 > floats.length) throw new Error('Incomplete botanical mesh');
    }
    return { mesh: (name: BotanicalMesh) => {
      const { offset, count } = botanicalManifest.meshes[name];
      return floats.subarray(offset, offset + count * 9);
    } };
  }).catch(error => { pending = null; throw error; });
  return pending;
}

/** URL variations rotate the authored skeleton and its attached sprays together. */
export function botanicalTransform(x: number, y: number, z: number, seed: number, grid: number): [number, number, number] {
  const a = pseudoRandom(0, 0, seed) * Math.PI * 2;
  return [(x * Math.cos(a) - z * Math.sin(a)) * grid, y * grid,
    (x * Math.sin(a) + z * Math.cos(a)) * grid];
}

export function botanicalCanopy(seed: number, grid: number, season: SeasonId): CanopyData {
  const leaves: CanopyData['leaves'] = [];
  const density = season === 'winter' ? 3 : season === 'autumn' ? 12 : 22;
  botanicalManifest.anchors.forEach(([x,y,z,r], i) => {
    if (i % 2) return;
    for (let k = 0; k < density; k++) {
      const a = pseudoRandom(i,k,seed+40) * Math.PI * 2;
      const v = pseudoRandom(i,k,seed+41) * 2 - 1;
      const radius = r * 1.95 * Math.cbrt(pseudoRandom(i,k,seed+42));
      const ring = Math.sqrt(1-v*v) * radius;
      leaves.push({ position: botanicalTransform((x+Math.cos(a)*ring)*1.3,(y+v*radius)*1.1,(z+Math.sin(a)*ring)*1.3,seed,grid),
        seed: pseudoRandom(i,k,seed+43) });
    }
  });
  const ys = leaves.map(leaf => leaf.position[1]);
  const minY = Math.min(...ys);
  return { leaves, minY, height: Math.max(...ys)-minY };
}

export function botanicalBranches(assets: BotanicalAssets, seed: number, grid: number) {
  const source = assets.mesh('branch');
  const count = source.length / 9;
  const vertices = new Float32Array(count * 7);
  const indices = new Uint32Array(count);
  for (let i = 0; i < count; i++) {
    const o = i * 9;
    vertices.set(botanicalTransform(source[o]*1.3,source[o+1]*1.1,source[o+2]*1.3,seed,grid),i*7);
    const n = botanicalTransform(source[o+3]/1.3,source[o+4]/1.1,source[o+5]/1.3,seed,1);
    const length = Math.hypot(...n);
    vertices.set(n.map(value => value / length),i*7+3);
    vertices[i*7+6] = pseudoRandom(Math.floor(i/3),0,seed);
    indices[i] = i;
  }
  return { vertices, indices, indexCount: count };
}
