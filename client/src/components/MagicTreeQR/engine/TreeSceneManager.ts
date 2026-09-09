import * as THREE from 'three';
import { buildQRMatrix, cellToWorld } from './QRMatrixBuilder';
import { generateVoxelBlocks, type BlockType } from './VoxelBlockGenerator';
import { baseColorForType, buildCubeMaterials } from './VoxelMaterials';
import { buildGroundingDecal } from './GroundingDecal';
import { CameraAnimator } from './CameraAnimator';
import { SEASON_THEMES, PALETTE_PRESETS, type MagicTreeConfig } from '../types/magicTree';

const BLOCK_TYPES: BlockType[] = ['dirt', 'grass', 'trunk', 'fallenPetals', 'cherryBlossom'];

interface Disposable {
  dispose: () => void;
}

export class TreeSceneManager {
  private canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private cameraAnimator: CameraAnimator;
  private clock = new THREE.Clock();
  private frameId: number | null = null;
  private sceneGroup: THREE.Group | null = null;
  private disposables: Disposable[] = [];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;

    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    this.cameraAnimator = new CameraAnimator(this.camera);

    this.handleResize();
    window.addEventListener('resize', this.handleResize);
    this.frameId = requestAnimationFrame(this.renderLoop);
  }

  rebuild(config: MagicTreeConfig): void {
    this.clearScene();

    const { size, matrix } = buildQRMatrix(config.targetUrl);
    const blocks = generateVoxelBlocks(matrix, size);
    const theme = SEASON_THEMES[config.season];
    const accent = PALETTE_PRESETS.find((p) => p.id === config.palette)?.color ?? theme.canopyPrimary;

    this.scene.background = new THREE.Color(theme.background);
    this.cameraAnimator.frameGrid(size);

    const group = new THREE.Group();

    for (const type of BLOCK_TYPES) {
      const typeBlocks = blocks.filter((b) => b.type === type);
      if (typeBlocks.length === 0) continue;

      const geometry = new THREE.BoxGeometry(0.96, 0.96, 0.96);
      const materials = buildCubeMaterials(baseColorForType(type, theme, accent));
      const mesh = new THREE.InstancedMesh(geometry, materials, typeBlocks.length);

      const dummy = new THREE.Object3D();
      typeBlocks.forEach((block, i) => {
        const { x, z } = cellToWorld(block.row, block.col, size);
        dummy.position.set(x, block.layer, z);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;

      group.add(mesh);
      // InstancedMesh.dispose() frees instanceMatrix; geometry.dispose() does not.
      this.disposables.push(geometry, ...materials, mesh);
    }

    const decal = buildGroundingDecal(size * 0.5);
    group.add(decal.mesh);
    this.disposables.push(decal);

    this.scene.add(group);
    this.sceneGroup = group;
  }

  toggleView(): void {
    this.cameraAnimator.toggle();
  }

  private handleResize = (): void => {
    const { clientWidth, clientHeight } = this.canvas;
    if (clientWidth === 0 || clientHeight === 0) return;
    this.camera.aspect = clientWidth / clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(clientWidth, clientHeight, false);
  };

  private renderLoop = (): void => {
    const delta = this.clock.getDelta();
    this.cameraAnimator.update(delta);
    this.renderer.render(this.scene, this.camera);
    this.frameId = requestAnimationFrame(this.renderLoop);
  };

  private clearScene(): void {
    if (this.sceneGroup) this.scene.remove(this.sceneGroup);
    this.disposables.forEach((d) => d.dispose());
    this.disposables = [];
  }

  dispose(): void {
    if (this.frameId !== null) cancelAnimationFrame(this.frameId);
    window.removeEventListener('resize', this.handleResize);
    this.clearScene();
    this.renderer.dispose();
  }
}
