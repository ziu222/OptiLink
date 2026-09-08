import * as THREE from 'three';
import { cellToWorld, type QRGridData } from './QRMatrixBuilder';
import type { SeasonTheme } from '../types/magicTree';

export interface TreeMeshResult {
  group: THREE.Group;
  update: (elapsedSeconds: number) => void;
  dispose: () => void;
}

const FORK_HEIGHT = 3.5;
const CROWN_BASE = 3.0;
const CROWN_HEIGHT = 2.5;

export function buildTreeMesh(
  grid: QRGridData,
  theme: SeasonTheme,
  accentColor: string
): TreeMeshResult {
  const group = new THREE.Group();
  const disposables: Array<{ dispose: () => void }> = [];

  const trunkGeo = new THREE.CylinderGeometry(0.4, 0.8, FORK_HEIGHT, 10);
  const trunkMat = new THREE.MeshStandardMaterial({ color: theme.trunk, roughness: 0.85 });
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.y = FORK_HEIGHT / 2;
  trunk.castShadow = true;
  group.add(trunk);
  disposables.push(trunkGeo, trunkMat);

  const canopyCells: Array<{ x: number; z: number }> = [];
  for (let r = 0; r < grid.size; r++) {
    for (let c = 0; c < grid.size; c++) {
      if (grid.zones[r][c] === 'canopy' && grid.matrix[r][c]) {
        canopyCells.push(cellToWorld(r, c, grid.size));
      }
    }
  }

  const branchMat = new THREE.MeshStandardMaterial({ color: theme.trunk, roughness: 0.85 });
  disposables.push(branchMat);
  const quadrants = [
    canopyCells.filter((p) => p.x >= 0 && p.z >= 0),
    canopyCells.filter((p) => p.x < 0 && p.z >= 0),
    canopyCells.filter((p) => p.x >= 0 && p.z < 0),
    canopyCells.filter((p) => p.x < 0 && p.z < 0),
  ];
  for (const quadrant of quadrants) {
    if (quadrant.length === 0) continue;
    const centroid = quadrant.reduce(
      (acc, p) => ({ x: acc.x + p.x / quadrant.length, z: acc.z + p.z / quadrant.length }),
      { x: 0, z: 0 }
    );
    const targetY = crownElevation(centroid.x, centroid.z, grid.size);
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(0, FORK_HEIGHT, 0),
      new THREE.Vector3(centroid.x * 0.5, FORK_HEIGHT + 0.6, centroid.z * 0.5),
      new THREE.Vector3(centroid.x, targetY, centroid.z)
    );
    const branchGeo = new THREE.TubeGeometry(curve, 12, 0.12, 6, false);
    const branch = new THREE.Mesh(branchGeo, branchMat);
    branch.castShadow = true;
    group.add(branch);
    disposables.push(branchGeo);
  }

  const leafTexture = createLeafTexture(accentColor || theme.canopyPrimary, theme.canopySecondary);
  const leafGeo = new THREE.PlaneGeometry(1.05, 1.05);
  const leafMat = new THREE.MeshStandardMaterial({
    map: leafTexture,
    transparent: true,
    alphaTest: 0.3,
    side: THREE.DoubleSide,
    roughness: 0.7,
  });
  disposables.push(leafGeo, leafMat, leafTexture);

  const count = Math.max(1, canopyCells.length);
  const leafMesh = new THREE.InstancedMesh(leafGeo, leafMat, count);
  leafMesh.count = canopyCells.length;
  leafMesh.castShadow = true;

  const basePositions: THREE.Vector3[] = [];
  const phases: number[] = [];
  const dummy = new THREE.Object3D();

  canopyCells.forEach((p, i) => {
    const y = crownElevation(p.x, p.z, grid.size);
    const pos = new THREE.Vector3(p.x, y, p.z);
    basePositions.push(pos);
    phases.push(Math.random() * Math.PI * 2);
    dummy.position.copy(pos);
    dummy.rotation.set(Math.random() * 0.3, Math.random() * Math.PI, Math.random() * 0.3);
    dummy.updateMatrix();
    leafMesh.setMatrixAt(i, dummy.matrix);
  });
  leafMesh.instanceMatrix.needsUpdate = true;
  group.add(leafMesh);

  const update = (elapsedSeconds: number) => {
    for (let i = 0; i < basePositions.length; i++) {
      const pos = basePositions[i];
      const phase = phases[i];
      dummy.position.set(pos.x, pos.y + Math.sin(elapsedSeconds * 1.2 + phase) * 0.06, pos.z);
      dummy.rotation.set(
        Math.sin(elapsedSeconds * 0.8 + phase) * 0.08,
        phase,
        Math.cos(elapsedSeconds * 0.8 + phase) * 0.08
      );
      dummy.updateMatrix();
      leafMesh.setMatrixAt(i, dummy.matrix);
    }
    leafMesh.instanceMatrix.needsUpdate = true;
  };

  return {
    group,
    update,
    dispose: () => disposables.forEach((d) => d.dispose()),
  };
}

function crownElevation(x: number, z: number, size: number): number {
  const canopyRadius = 0.38 * size;
  const t = Math.max(0, 1 - (x * x + z * z) / (canopyRadius * canopyRadius));
  return CROWN_BASE + CROWN_HEIGHT * Math.sqrt(t);
}

function createLeafTexture(primary: string, secondary: string): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const gradient = ctx.createRadialGradient(32, 32, 4, 32, 32, 32);
    gradient.addColorStop(0, primary);
    gradient.addColorStop(1, secondary);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(32, 32, 30, 0, Math.PI * 2);
    ctx.fill();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}
