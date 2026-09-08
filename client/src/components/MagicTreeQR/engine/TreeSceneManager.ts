import * as THREE from 'three';
import { buildQRMatrix, type QRGridData } from './QRMatrixBuilder';
import { buildPedestal } from './PedestalBuilder';
import { buildShrubFinders } from './ShrubFinderBuilder';
import { buildTreeMesh } from './TreeProceduralMesh';
import { buildWeather } from './WeatherSystem';
import { CameraAnimator } from './CameraAnimator';
import { AudioAmbience } from './AudioAmbience';
import { SEASON_THEMES, PALETTE_PRESETS, type MagicTreeConfig } from '../types/magicTree';

interface Disposable {
  dispose: () => void;
}

export class TreeSceneManager {
  readonly audio = new AudioAmbience();

  private canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private cameraAnimator: CameraAnimator;
  private clock = new THREE.Clock();
  private frameId: number | null = null;
  private sceneGroup: THREE.Group | null = null;
  private disposables: Disposable[] = [];
  private updaters: Array<(elapsed: number, delta: number) => void> = [];
  private gridSize = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
    this.renderer.shadowMap.enabled = true;

    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    this.cameraAnimator = new CameraAnimator(this.camera);

    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    const directional = new THREE.DirectionalLight(0xffffff, 0.9);
    directional.position.set(10, 20, 10);
    directional.castShadow = true;
    this.scene.add(ambient, directional);

    this.handleResize();
    window.addEventListener('resize', this.handleResize);
    this.frameId = requestAnimationFrame(this.renderLoop);
  }

  rebuild(config: MagicTreeConfig): void {
    this.clearScene();

    const grid: QRGridData = buildQRMatrix(config.targetUrl);
    this.gridSize = grid.size;
    const scale = this.cameraAnimator.frameGrid(grid.size);
    const theme = SEASON_THEMES[config.season];
    const accent = PALETTE_PRESETS.find((p) => p.id === config.palette)?.color ?? theme.canopyPrimary;

    this.scene.background = new THREE.Color(theme.background);

    const group = new THREE.Group();
    const pedestal = buildPedestal(grid, theme);
    const finders = buildShrubFinders(grid, theme);
    const tree = buildTreeMesh(grid, theme, accent);
    const weather = buildWeather(config.season, scale);

    group.add(pedestal.group, finders.group, tree.group, weather.points);
    this.scene.add(group);
    this.sceneGroup = group;

    this.disposables.push(pedestal, finders, tree, weather);
    this.updaters.push((elapsed) => tree.update(elapsed));
    this.updaters.push((_elapsed, delta) => weather.update(delta));
  }

  toggleView(): void {
    this.cameraAnimator.toggle();
  }

  private handleResize = (): void => {
    const { clientWidth, clientHeight } = this.canvas;
    if (clientWidth === 0 || clientHeight === 0) return;
    this.camera.aspect = clientWidth / clientHeight;
    this.camera.updateProjectionMatrix();
    // Aspect drives the framing distance, so re-fit when it changes.
    if (this.gridSize > 0) this.cameraAnimator.frameGrid(this.gridSize);
    this.renderer.setSize(clientWidth, clientHeight, false);
  };

  private renderLoop = (): void => {
    const delta = this.clock.getDelta();
    const elapsed = this.clock.getElapsedTime();

    this.cameraAnimator.update(delta);
    for (const update of this.updaters) update(elapsed, delta);

    this.renderer.render(this.scene, this.camera);
    this.frameId = requestAnimationFrame(this.renderLoop);
  };

  private clearScene(): void {
    if (this.sceneGroup) {
      this.scene.remove(this.sceneGroup);
    }
    this.disposables.forEach((d) => d.dispose());
    this.disposables = [];
    this.updaters = [];
  }

  dispose(): void {
    if (this.frameId !== null) cancelAnimationFrame(this.frameId);
    window.removeEventListener('resize', this.handleResize);
    this.clearScene();
    this.audio.dispose();
    this.renderer.dispose();
  }
}
