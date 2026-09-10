import { Matrix4, Vector3, WebGPUCoordinateSystem } from 'three';

/**
 * Isometric/flat camera matrices for the WebGPU tree — spec §6/§6.1.
 *
 * Produces a view-projection matrix for the frame uniform buffer instead of
 * mutating a THREE camera object. Two things are load-bearing here:
 *   - the settled flat state uses a true orthographic projection, so the QR
 *     has zero parallax skew (the voxel feature shipped a perspective flat
 *     view first and it was unreadable);
 *   - `treeAlpha` derives from the same transition progress, so the
 *     above-ground dissolve is always in step with the camera, including
 *     mid-transition reversals.
 */

export type CameraViewState = 'isometric' | 'flat';

const BASE_ISO_POS = new Vector3(22, 24, 22);
const BASE_ISO_TARGET = new Vector3(0, 6, 0);
const BASE_FLAT_Y = 32;
const TRANSITION_SECONDS = 0.9;
const FRAME_PADDING_FACTOR = 1.3;
const FOV_DEG = 45;
const NEAR = 0.1;

/** The tree is gone before the camera settles — never half-faded over a QR. */
const DISSOLVE_START = 0.35;
const DISSOLVE_END = 0.85;

const ISO_UP = new Vector3(0, 1, 0);
const FLAT_UP = new Vector3(0, 0, -1);

export function quinticEase(t: number): number {
  return t < 0.5 ? 16 * t ** 5 : 1 - Math.pow(-2 * t + 2, 5) / 2;
}

export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

export class CameraMatrices {
  private progress = 0;
  private from = 0;
  private target = 0;
  private elapsed = 0;
  private duration = TRANSITION_SECONDS;

  private aspect = 1;
  private flatY = BASE_FLAT_Y;
  private orthoHalfWidth = 10;
  private far = 500;

  private isoPos = BASE_ISO_POS.clone();
  private viewProjMatrix = new Matrix4();
  private out = new Float32Array(16);

  get state(): CameraViewState {
    return this.progress >= 0.5 ? 'flat' : 'isometric';
  }

  /** 0 = isometric, 1 = settled flat. */
  get transitionProgress(): number {
    return this.progress;
  }

  get isSettledFlat(): boolean {
    return this.progress >= 1;
  }

  /** 1 = tree fully drawn, 0 = nothing above ground (§6.1). */
  get treeAlpha(): number {
    return 1 - smoothstep(DISSOLVE_START, DISSOLVE_END, this.progress);
  }

  setViewport(width: number, height: number): void {
    this.aspect = height > 0 ? width / height : 1;
  }

  /** Scales both camera distances to fit a gridSize × gridSize structure. */
  frameGrid(gridSize: number): void {
    const halfTan = Math.tan((FOV_DEG * Math.PI) / 180 / 2);
    const width = gridSize * FRAME_PADDING_FACTOR;
    let flatY = width / (2 * halfTan);
    if (this.aspect < 1) flatY /= this.aspect;

    this.flatY = Math.max(flatY, BASE_FLAT_Y);
    this.isoPos.copy(BASE_ISO_POS).multiplyScalar(this.flatY / BASE_FLAT_Y);
    this.orthoHalfWidth = width / 2;
    this.far = Math.max(100, this.flatY * 3);
  }

  /**
   * Reverses from wherever the transition currently is, and scales the
   * duration by the remaining distance — a tap mid-transition is honoured
   * instead of being dropped.
   */
  toggle(): void {
    this.target = this.target >= 1 ? 0 : 1;
    this.from = this.progress;
    this.elapsed = 0;
    this.duration = TRANSITION_SECONDS * Math.max(0.25, Math.abs(this.target - this.from));
  }

  update(deltaSeconds: number): void {
    if (this.progress === this.target) return;
    this.elapsed += deltaSeconds;
    const t = Math.min(1, this.elapsed / this.duration);
    this.progress = this.from + (this.target - this.from) * quinticEase(t);
    if (t >= 1) this.progress = this.target;
  }

  /** Column-major mat4x4<f32>, ready to write into the frame uniform buffer. */
  viewProj(): Float32Array {
    const eye = new Vector3().lerpVectors(
      this.isoPos,
      new Vector3(0, this.flatY, 0),
      this.progress
    );
    const target = new Vector3().lerpVectors(BASE_ISO_TARGET, new Vector3(0, 0, 0), this.progress);
    const up = new Vector3().lerpVectors(ISO_UP, FLAT_UP, this.progress).normalize();

    const world = new Matrix4().lookAt(eye, target, up);
    world.setPosition(eye);
    const view = world.invert();

    // Perspective while moving, true orthographic once settled: by then the
    // camera is straight overhead and the tree has dissolved (§6.1), so the
    // switch is invisible and the settled QR has no parallax.
    const projection = new Matrix4();
    if (this.isSettledFlat) {
      const halfW = this.aspect >= 1 ? this.orthoHalfWidth * this.aspect : this.orthoHalfWidth;
      const halfH = this.aspect >= 1 ? this.orthoHalfWidth : this.orthoHalfWidth / this.aspect;
      projection.makeOrthographic(-halfW, halfW, halfH, -halfH, NEAR, this.far, WebGPUCoordinateSystem);
    } else {
      const top = NEAR * Math.tan((FOV_DEG * Math.PI) / 180 / 2);
      const right = top * this.aspect;
      projection.makePerspective(-right, right, top, -top, NEAR, this.far, WebGPUCoordinateSystem);
    }

    this.viewProjMatrix.multiplyMatrices(projection, view);
    this.out.set(this.viewProjMatrix.elements);
    return this.out;
  }
}
