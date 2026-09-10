import * as THREE from 'three';

export type CameraViewState = 'isometric' | 'flat';

const BASE_ISO_POS = new THREE.Vector3(22, 24, 22);
const BASE_ISO_TARGET = new THREE.Vector3(0, 6, 0);
const BASE_FLAT_Y = 32;
const TRANSITION_SECONDS = 0.9;
export const FRAME_PADDING_FACTOR = 1.3;

export function quinticEase(t: number): number {
  return t < 0.5 ? 16 * t ** 5 : 1 - Math.pow(-2 * t + 2, 5) / 2;
}

export class CameraAnimator {
  private state: CameraViewState = 'isometric';
  private fromState: CameraViewState = 'isometric';
  private toState: CameraViewState = 'isometric';
  private animating = false;
  private progress = 0;

  private isoPos = BASE_ISO_POS.clone();
  private isoTarget = BASE_ISO_TARGET.clone();
  private flatPos = new THREE.Vector3(0, BASE_FLAT_Y, 0);
  private flatTarget = new THREE.Vector3(0, 0, 0);

  private camera: THREE.PerspectiveCamera;

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;
    this.camera.position.copy(this.isoPos);
    this.camera.up.set(0, 1, 0);
    this.camera.lookAt(this.isoTarget);
  }

  get currentState(): CameraViewState {
    return this.state;
  }

  /** Scales both camera distances to fit a gridSize × gridSize structure. */
  frameGrid(gridSize: number): void {
    const fovRad = (this.camera.fov * Math.PI) / 180;
    const halfTan = Math.tan(fovRad / 2);
    const width = gridSize * FRAME_PADDING_FACTOR;
    let flatY = width / (2 * halfTan);
    if (this.camera.aspect < 1) flatY = flatY / this.camera.aspect;
    flatY = Math.max(flatY, BASE_FLAT_Y);

    const scale = flatY / BASE_FLAT_Y;
    this.flatPos.set(0, flatY, 0);
    this.isoPos.copy(BASE_ISO_POS).multiplyScalar(scale);
    this.camera.far = Math.max(100, flatY * 3);
    this.camera.updateProjectionMatrix();
  }

  toggle(): void {
    if (this.animating) return;
    this.fromState = this.state;
    this.toState = this.state === 'isometric' ? 'flat' : 'isometric';
    this.progress = 0;
    this.animating = true;
  }

  update(deltaSeconds: number): void {
    if (this.animating) {
      this.progress = Math.min(1, this.progress + deltaSeconds / TRANSITION_SECONDS);
      const eased = quinticEase(this.progress);

      const startPos = this.fromState === 'isometric' ? this.isoPos : this.flatPos;
      const endPos = this.toState === 'isometric' ? this.isoPos : this.flatPos;
      const startTarget = this.fromState === 'isometric' ? this.isoTarget : this.flatTarget;
      const endTarget = this.toState === 'isometric' ? this.isoTarget : this.flatTarget;
      const startUp = this.fromState === 'isometric' ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(0, 0, -1);
      const endUp = this.toState === 'isometric' ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(0, 0, -1);

      this.camera.position.lerpVectors(startPos, endPos, eased);
      const target = new THREE.Vector3().lerpVectors(startTarget, endTarget, eased);
      this.camera.up.lerpVectors(startUp, endUp, eased).normalize();
      this.camera.lookAt(target);

      if (this.progress >= 1) {
        this.animating = false;
        this.state = this.toState;
      }
      return;
    }

    // Settled: re-apply every frame (not just during a transition) so a
    // mid-idle frameGrid() rescale still takes effect immediately — an
    // earlier attempt's top-down view stayed stale/clipped after a resize
    // specifically because this branch was missing.
    if (this.state === 'isometric') {
      this.camera.position.copy(this.isoPos);
      this.camera.up.set(0, 1, 0);
      this.camera.lookAt(this.isoTarget);
    } else {
      this.camera.position.copy(this.flatPos);
      this.camera.up.set(0, 0, -1);
      this.camera.lookAt(this.flatTarget);
    }
  }
}
