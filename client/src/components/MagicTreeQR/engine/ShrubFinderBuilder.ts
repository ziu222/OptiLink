import * as THREE from 'three';
import { cellToWorld, type QRGridData } from './QRMatrixBuilder';
import type { SeasonTheme } from '../types/magicTree';
import type { BuildResult } from './PedestalBuilder';

const finderOrigins = (size: number): Array<[number, number]> => [
  [0, 0],
  [0, size - 7],
  [size - 7, 0],
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

  for (const [baseR, baseC] of finderOrigins(grid.size)) {
    for (let dr = 0; dr < 7; dr++) {
      for (let dc = 0; dc < 7; dc++) {
        const r = baseR + dr;
        const c = baseC + dc;
        const { x, z } = cellToWorld(r, c, grid.size);
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
