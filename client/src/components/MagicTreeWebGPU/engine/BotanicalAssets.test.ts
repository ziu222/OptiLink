/// <reference types="node" />
import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
import { botanicalBranches, botanicalCanopy, botanicalManifest, loadBotanicalAssets } from './BotanicalAssets';
import type { BotanicalAssets, BotanicalMesh } from './BotanicalAssets';
import type { SeasonId } from '../../MagicTreeQR/types/magicTree';

const bytes = readFileSync(new URL('../assets/botanical.bin', import.meta.url));
const binary = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
const floats = new Float32Array(binary);
const assets: BotanicalAssets = { mesh: (name: BotanicalMesh) => {
  const { offset,count } = botanicalManifest.meshes[name];
  return floats.subarray(offset,offset+count*9);
} };

describe('Blender botanical asset contract', () => {
  it('exports nine complete non-overlapping triangle meshes', () => {
    expect(Object.keys(botanicalManifest.meshes)).toHaveLength(9);
    let end = 0;
    for (const entry of Object.values(botanicalManifest.meshes)) {
      expect(entry.offset).toBe(end);
      expect(entry.count % 3).toBe(0);
      end = entry.offset + entry.count * 9;
    }
    expect(end).toBe(floats.length);
    expect(floats.every(Number.isFinite)).toBe(true);
  });
  it('exports unit normals and bounded matte pigment', () => {
    for (let i=0;i<floats.length;i+=9) {
      expect(Math.hypot(floats[i+3],floats[i+4],floats[i+5])).toBeCloseTo(1,4);
      for (let j=6;j<9;j++) {
        expect(floats[i+j]).toBeGreaterThanOrEqual(0);
        expect(floats[i+j]).toBeLessThanOrEqual(1);
      }
    }
  });
  it('contains cupped petals rather than a flat billboard', () => {
    const spring = assets.mesh('spring');
    const heights = Array.from(spring).filter((_,i) => i%9===1);
    expect(Math.max(...heights)-Math.min(...heights)).toBeGreaterThan(0.1);
  });
  it('has four distinct grass geometries', () => {
    const seasons: SeasonId[] = ['spring','summer','autumn','winter'];
    for (let i=1;i<4;i++) expect(assets.mesh(`grass_${seasons[i]}`)).not.toEqual(assets.mesh(`grass_${seasons[i-1]}`));
  });
  it('keeps authored branches finite after URL rotation and scaling', () => {
    const branch = botanicalBranches(assets,1234,33);
    expect(branch.vertices.every(Number.isFinite)).toBe(true);
    expect(branch.indices.at(-1)).toBe(branch.indexCount-1);
    for (let i=0;i<branch.vertices.length;i+=7) expect(Math.hypot(...branch.vertices.subarray(i+3,i+6))).toBeCloseTo(1,4);
  });
  it('is deterministic with a readable, sparse winter canopy', () => {
    const summer = botanicalCanopy(1234,33,'summer');
    expect(summer).toEqual(botanicalCanopy(1234,33,'summer'));
    expect(summer).not.toEqual(botanicalCanopy(5678,33,'summer'));
    expect(summer.leaves.length).toBeGreaterThan(botanicalCanopy(1234,33,'winter').leaves.length);
    expect(summer.minY).toBeGreaterThan(0);
    expect(summer.leaves.length).toBeLessThan(3500);
  });
  it('retries failed loads and caches a successful asset fetch', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({ok:false}).mockResolvedValue({ok:true,arrayBuffer:async()=>binary});
    vi.stubGlobal('fetch',fetchMock);
    try {
      await expect(loadBotanicalAssets()).rejects.toThrow('unavailable');
      const [a,b] = await Promise.all([loadBotanicalAssets(),loadBotanicalAssets()]);
      expect(a).toBe(b);
      expect(a.mesh('spring')).toEqual(assets.mesh('spring'));
      expect(fetchMock).toHaveBeenCalledTimes(2);
    } finally { vi.unstubAllGlobals(); }
  });
});
