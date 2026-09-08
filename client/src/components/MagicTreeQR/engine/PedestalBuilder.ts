import * as THREE from 'three';
import { cellToWorld, type QRGridData } from './QRMatrixBuilder';
import type { SeasonTheme } from '../types/magicTree';

export interface BuildResult {
  group: THREE.Group;
  dispose: () => void;
}

export function buildPedestal(grid: QRGridData, theme: SeasonTheme): BuildResult {
  const group = new THREE.Group();
  const disposables: Array<{ dispose: () => void }> = [];

  const baseGeo = new THREE.BoxGeometry(grid.size + 1.6, 0.5, grid.size + 1.6);
  const baseMat = new THREE.MeshStandardMaterial({ color: theme.trunk, roughness: 0.9 });
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = -0.25;
  base.receiveShadow = true;
  group.add(base);
  disposables.push(baseGeo, baseMat);

  const paverGeo = new THREE.BoxGeometry(0.94, 0.04, 0.94);
  const lightMat = new THREE.MeshStandardMaterial({ color: theme.groundLight, roughness: 0.8 });
  const darkMat = new THREE.MeshStandardMaterial({ color: theme.groundDark, roughness: 0.8 });
  disposables.push(paverGeo, lightMat, darkMat);

  const lightCount = countGroundCells(grid, false);
  const darkCount = countGroundCells(grid, true);
  const lightMesh = new THREE.InstancedMesh(paverGeo, lightMat, Math.max(1, lightCount));
  const darkMesh = new THREE.InstancedMesh(paverGeo, darkMat, Math.max(1, darkCount));
  lightMesh.receiveShadow = true;
  darkMesh.receiveShadow = true;

  const m = new THREE.Matrix4();
  let li = 0;
  let di = 0;
  for (let r = 0; r < grid.size; r++) {
    for (let c = 0; c < grid.size; c++) {
      if (grid.zones[r][c] === 'finder') continue; // ShrubFinderBuilder owns these cells
      const { x, z } = cellToWorld(r, c, grid.size);
      m.makeTranslation(x, 0.02, z);
      if (grid.matrix[r][c]) {
        darkMesh.setMatrixAt(di++, m);
      } else {
        lightMesh.setMatrixAt(li++, m);
      }
    }
  }
  lightMesh.count = li;
  darkMesh.count = di;
  lightMesh.instanceMatrix.needsUpdate = true;
  darkMesh.instanceMatrix.needsUpdate = true;
  group.add(lightMesh, darkMesh);
  // InstancedMesh.dispose() frees instanceMatrix; geometry.dispose() does not.
  disposables.push(lightMesh, darkMesh);

  return {
    group,
    dispose: () => disposables.forEach((d) => d.dispose()),
  };
}

function countGroundCells(grid: QRGridData, dark: boolean): number {
  let count = 0;
  for (let r = 0; r < grid.size; r++) {
    for (let c = 0; c < grid.size; c++) {
      if (grid.zones[r][c] === 'finder') continue;
      if (grid.matrix[r][c] === dark) count++;
    }
  }
  return count;
}
