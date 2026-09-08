import * as THREE from 'three';

export type CameraViewState = 'isometric' | 'topdown';

const ISO_TARGET = new THREE.Vector3(0, 2.5, 0);
const ISO_UP = new THREE.Vector3(0, 1, 0);

/** Baseline top-down height; framing only ever scales up from here. */
const BASE_TOP_Y = 32;
const TOP_TARGET = new THREE.Vector3(0, 0, 0);
const TOP_UP = new THREE.Vector3(0, 0, -1);

const TRANSITION_SECONDS = 0.9;
const IDLE_ROTATE_SPEED = 0.08;

export function quinticEase(t: number): number {
  return t < 0.5 ? 16 * t ** 5 : 1 - Math.pow(-2 * t + 2, 5) / 2;
}

export class CameraAnimator {
  private state: CameraViewState = 'isometric';
  private fromState: CameraViewState = 'isometric';
  private toState: CameraViewState = 'isometric';
  private animating = false;
  private progress = 0;
  private idleAngle = 0;
  private camera: THREE.PerspectiveCamera;
  private isoPos = new THREE.Vector3(22, 24, 22);
  private topPos = new THREE.Vector3(0, BASE_TOP_Y, 0);

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;
    this.camera.position.copy(this.isoPos);
    this.camera.up.copy(ISO_UP);
    this.camera.lookAt(ISO_TARGET);
  }

  get currentState(): CameraViewState {
    return this.state;
  }

  /**
   * Pull the camera back far enough that a `gridSize` diorama fits the frustum
   * top-down. Returns the scale relative to the baseline framing (>= 1).
   */
  frameGrid(gridSize: number): number {
    const halfTan = Math.tan(((this.camera.fov * Math.PI) / 180) / 2);
    const width = (gridSize + 1.6) * 1.15; // pedestal slab + safety margin
    let y = width / (2 * halfTan);
    // Vertical fov is the fixed one, so a portrait canvas is the tighter axis.
    if (this.camera.aspect < 1) y /= this.camera.aspect;
    y = Math.max(y, BASE_TOP_Y);

    const scale = y / BASE_TOP_Y;
    this.topPos.set(0, y, 0);
    this.isoPos.set(22 * scale, 24 * scale, 22 * scale);
    // Keep the far plane behind the pulled-back camera.
    this.camera.far = Math.max(100, y * 3);
    this.camera.updateProjectionMatrix();

    // The idle loop re-applies isoPos every frame, but a settled top-down
    // camera is never written again — move it now or the new framing is ignored.
    if (!this.animating && this.state === 'topdown') {
      this.camera.position.copy(this.topPos);
      this.camera.up.copy(TOP_UP);
      this.camera.lookAt(TOP_TARGET);
    }
    return scale;
  }

  toggle(): void {
    if (this.animating) return;
    this.fromState = this.state;
    this.toState = this.state === 'isometric' ? 'topdown' : 'isometric';
    this.progress = 0;
    this.animating = true;
  }

  update(deltaSeconds: number): void {
    if (this.animating) {
      this.progress = Math.min(1, this.progress + deltaSeconds / TRANSITION_SECONDS);
      const eased = quinticEase(this.progress);

      const startPos = this.fromState === 'isometric' ? this.isoPos : this.topPos;
      const endPos = this.toState === 'isometric' ? this.isoPos : this.topPos;
      const startTarget = this.fromState === 'isometric' ? ISO_TARGET : TOP_TARGET;
      const endTarget = this.toState === 'isometric' ? ISO_TARGET : TOP_TARGET;
      const startUp = this.fromState === 'isometric' ? ISO_UP : TOP_UP;
      const endUp = this.toState === 'isometric' ? ISO_UP : TOP_UP;

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

    if (this.state === 'isometric') {
      this.idleAngle += deltaSeconds * IDLE_ROTATE_SPEED;
      const radius = Math.hypot(this.isoPos.x, this.isoPos.z);
      this.camera.position.set(
        Math.cos(this.idleAngle) * radius,
        this.isoPos.y,
        Math.sin(this.idleAngle) * radius
      );
      this.camera.up.copy(ISO_UP);
      this.camera.lookAt(ISO_TARGET);
    }
  }
}
