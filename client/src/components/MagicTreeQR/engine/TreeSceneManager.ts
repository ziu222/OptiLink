import * as THREE from 'three';
import { buildQRMatrix, cellToWorld } from './QRMatrixBuilder';
import { generateVoxelBlocks, type BlockType } from './VoxelBlockGenerator';
import { baseColorForType, buildCubeMaterials } from './VoxelMaterials';
import { buildGroundingDecal } from './GroundingDecal';
import { CameraAnimator, FRAME_PADDING_FACTOR } from './CameraAnimator';
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
  private orthoCamera: THREE.OrthographicCamera;
  private orthoHalfWidth = 10;
  private gridSize = 0;
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

    // True top-down projection for the settled "flat" state: zero parallax,
    // so a tall canopy column reads at exactly its own grid cell regardless
    // of height — a perspective camera cannot do this (see plan note above).
    this.orthoCamera = new THREE.OrthographicCamera(-10, 10, 10, -10, 0.1, 500);
    this.orthoCamera.position.set(0, 100, 0);
    this.orthoCamera.up.set(0, 0, -1);
    this.orthoCamera.lookAt(0, 0, 0);

    this.handleResize();
    window.addEventListener('resize', this.handleResize);
    this.frameId = requestAnimationFrame(this.renderLoop);
  }

  rebuild(config: MagicTreeConfig): void {
    this.clearScene();

    const { size, matrix } = buildQRMatrix(config.targetUrl);
    this.gridSize = size;
    const blocks = generateVoxelBlocks(matrix, size);
    const theme = SEASON_THEMES[config.season];
    const accent = PALETTE_PRESETS.find((p) => p.id === config.palette)?.color ?? theme.canopyPrimary;

    this.scene.background = new THREE.Color(theme.background);
    this.cameraAnimator.frameGrid(size);
    this.orthoHalfWidth = (size * FRAME_PADDING_FACTOR) / 2;
    this.updateOrthoFrustum();

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

  private updateOrthoFrustum(): void {
    const aspect = this.camera.aspect || 1;
    const base = this.orthoHalfWidth;
    if (aspect >= 1) {
      this.orthoCamera.top = base;
      this.orthoCamera.bottom = -base;
      this.orthoCamera.left = -base * aspect;
      this.orthoCamera.right = base * aspect;
    } else {
      this.orthoCamera.left = -base;
      this.orthoCamera.right = base;
      this.orthoCamera.top = base / aspect;
      this.orthoCamera.bottom = -base / aspect;
    }
    this.orthoCamera.updateProjectionMatrix();
  }

  private handleResize = (): void => {
    const { clientWidth, clientHeight } = this.canvas;
    if (clientWidth === 0 || clientHeight === 0) return;
    this.camera.aspect = clientWidth / clientHeight;
    this.camera.updateProjectionMatrix();
    if (this.gridSize > 0) this.cameraAnimator.frameGrid(this.gridSize);
    this.updateOrthoFrustum();
    this.renderer.setSize(clientWidth, clientHeight, false);
  };

  private renderLoop = (): void => {
    const delta = this.clock.getDelta();
    this.cameraAnimator.update(delta);
    const activeCamera: THREE.Camera =
      this.cameraAnimator.currentState === 'flat' ? this.orthoCamera : this.camera;
    this.renderer.render(this.scene, activeCamera);
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
