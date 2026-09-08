import * as THREE from 'three';

export type CameraViewState = 'isometric' | 'topdown';

const ISO_POS = new THREE.Vector3(22, 24, 22);
const ISO_TARGET = new THREE.Vector3(0, 2.5, 0);
const ISO_UP = new THREE.Vector3(0, 1, 0);

const TOP_POS = new THREE.Vector3(0, 32, 0);
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

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;
    this.camera.position.copy(ISO_POS);
    this.camera.up.copy(ISO_UP);
    this.camera.lookAt(ISO_TARGET);
  }

  get currentState(): CameraViewState {
    return this.state;
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

      const startPos = this.fromState === 'isometric' ? ISO_POS : TOP_POS;
      const endPos = this.toState === 'isometric' ? ISO_POS : TOP_POS;
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
      const radius = Math.hypot(ISO_POS.x, ISO_POS.z);
      this.camera.position.set(
        Math.cos(this.idleAngle) * radius,
        ISO_POS.y,
        Math.sin(this.idleAngle) * radius
      );
      this.camera.up.copy(ISO_UP);
      this.camera.lookAt(ISO_TARGET);
    }
  }
}
