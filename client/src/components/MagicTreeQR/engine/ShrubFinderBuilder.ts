import * as THREE from 'three';
import { cellToWorld, type QRGridData } from './QRMatrixBuilder';
import type { SeasonTheme } from '../types/magicTree';
import type { BuildResult } from './PedestalBuilder';

// Each corner owns an 8x8 zone (the 'finder' zone QRMatrixBuilder marks and
// PedestalBuilder skips): the 7x7 finder pattern plus its 1-module light
// separator. The separator sits on the two edges facing the data area, so the
// 7x7 origin is not always the 8x8 block origin.
interface FinderCorner {
  /** top-left of the 8x8 zone */
  block: [number, number];
  /** top-left of the 7x7 finder pattern inside that zone */
  pattern: [number, number];
}

const finderCorners = (size: number): FinderCorner[] => [
  { block: [0, 0], pattern: [0, 0] },
  { block: [0, size - 8], pattern: [0, size - 7] },
  { block: [size - 8, 0], pattern: [size - 7, 0] },
];

export function buildShrubFinders(grid: QRGridData, theme: SeasonTheme): BuildResult {
  const group = new THREE.Group();
  const disposables: Array<{ dispose: () => void }> = [];

  const hedgeGeo = new THREE.BoxGeometry(0.94, 0.9, 0.94);
  const hedgeMat = new THREE.MeshStandardMaterial({ color: theme.groundDark, roughness: 0.95 });
  const coreGeo = new THREE.DodecahedronGeometry(0.5);
  const coreMat = new THREE.MeshStandardMaterial({ color: theme.canopyPrimary, roughness: 0.6 });
  const pavGeo = new THREE.BoxGeometry(0.94, 0.04, 0.94);
  const pavMat = new THREE.MeshStandardMaterial({ color: theme.groundLight, roughness: 0.8 });
  disposables.push(hedgeGeo, hedgeMat, coreGeo, coreMat, pavGeo, pavMat);

  for (const { block, pattern } of finderCorners(grid.size)) {
    for (let br = 0; br < 8; br++) {
      for (let bc = 0; bc < 8; bc++) {
        const r = block[0] + br;
        const c = block[1] + bc;
        const { x, z } = cellToWorld(r, c, grid.size);

        // Offsets within the 7x7 finder pattern; outside 0..6 means separator.
        const dr = r - pattern[0];
        const dc = c - pattern[1];
        if (dr < 0 || dr > 6 || dc < 0 || dc > 6) {
          const sep = new THREE.Mesh(pavGeo, pavMat);
          sep.position.set(x, 0.02, z);
          group.add(sep);
          continue;
        }

        const isOuterFrame = dr === 0 || dr === 6 || dc === 0 || dc === 6;
        const isCore = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4;

        if (isOuterFrame) {
          const hedge = new THREE.Mesh(hedgeGeo, hedgeMat);
          hedge.position.set(x, 0.45, z);
          hedge.castShadow = true;
          group.add(hedge);
        } else {
          const pav = new THREE.Mesh(pavGeo, pavMat);
          pav.position.set(x, 0.02, z);
          group.add(pav);
          if (isCore && dr === 3 && dc === 3) {
            const core = new THREE.Mesh(coreGeo, coreMat);
            core.position.set(x, 0.55, z);
            core.castShadow = true;
            group.add(core);
          }
        }
      }
    }
  }

  return {
    group,
    dispose: () => disposables.forEach((d) => d.dispose()),
  };
}
