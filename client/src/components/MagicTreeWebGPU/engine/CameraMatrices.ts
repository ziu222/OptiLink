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

const ISO_DIRECTION = new Vector3(22, 20, 26).normalize();
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

  private isoPos = ISO_DIRECTION.clone().multiplyScalar(40);
  private isoTarget = new Vector3(0, 6, 0);
  private viewProjMatrix = new Matrix4();
  private out = new Float32Array(16);
  private readonly right = new Float32Array(3);
  private readonly up = new Float32Array(3);
  private crownPoints: readonly [number, number, number][] = [];

  setCrownPoints(points: readonly [number, number, number][]): void { this.crownPoints = points; }

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

  /**
   * Frames the whole structure: the grid for the flat view, and the grid plus
   * the tree's own height for the isometric one. Framing on the grid alone
   * puts a tall canopy off-screen.
   */
  frameStructure(gridSize: number, structureHeight = 0): void {
    const halfTan = Math.tan((FOV_DEG * Math.PI) / 180 / 2);
    const width = (gridSize + 10) * 1.04;
    let flatY = width / (2 * halfTan);
    if (this.aspect < 1) flatY /= this.aspect;

    this.flatY = Math.max(flatY, BASE_FLAT_Y);
    this.orthoHalfWidth = width / 2;

    const radius = (gridSize / 2 + 5) * FRAME_PADDING_FACTOR;
    this.isoTarget.set(0, structureHeight * 0.44, 0);
    const right = new Vector3().crossVectors(ISO_UP, ISO_DIRECTION).normalize();
    const up = new Vector3().crossVectors(ISO_DIRECTION, right).normalize();
    let distance = 0;
    const fit = (x: number, y: number, z: number) => {
      const p = new Vector3(x, y, z).sub(this.isoTarget);
      distance = Math.max(distance, p.dot(ISO_DIRECTION) + Math.abs(p.dot(right)) / (halfTan * this.aspect),
        p.dot(ISO_DIRECTION) + Math.abs(p.dot(up)) / halfTan);
    };
    const base = gridSize / 2 + 5;
    for (const x of [-base, base]) for (const z of [-base, base]) fit(x, -1.7, z);
    // The crown is an ellipsoid, not a box with wide corners at its highest
    // point. Fitting that empty box made the real tree needlessly small.
    if (this.crownPoints.length) {
      for (const [x, y, z] of this.crownPoints) fit(x, y + gridSize * 0.025, z);
    } else for (let j = 0; j <= 12; j++) {
      const phi = j / 12 * Math.PI;
      for (let i = 0; i < 24; i++) {
        const a = i / 24 * Math.PI * 2;
        fit(Math.cos(a) * Math.sin(phi) * gridSize * 0.59,
          structureHeight * (0.65 + 0.35 * Math.cos(phi)) + 0.6,
          Math.sin(a) * Math.sin(phi) * gridSize * 0.59);
      }
    }
    distance *= 1.05;
    this.isoPos.copy(ISO_DIRECTION).multiplyScalar(distance).add(this.isoTarget);
    this.far = Math.max(100, Math.max(this.flatY, distance + radius) * 3);
  }

  /**
   * Reverses from wherever the transition currently is, and scales the
   * duration by the remaining distance — a tap mid-transition is honoured
   * instead of being dropped.
   */
  toggle(immediate = false): void {
    this.target = this.target >= 1 ? 0 : 1;
    this.from = this.progress;
    this.elapsed = 0;
    this.duration = TRANSITION_SECONDS * Math.max(0.25, Math.abs(this.target - this.from));
    if (immediate) this.progress = this.target;
  }

  get targetIsFlat(): boolean { return this.target === 1; }

  update(deltaSeconds: number): void {
    if (this.progress === this.target) return;
    this.elapsed += deltaSeconds;
    const t = Math.min(1, this.elapsed / this.duration);
    this.progress = this.from + (this.target - this.from) * quinticEase(t);
    if (t >= 1) this.progress = this.target;
  }

  /** World-space camera right vector; valid after the last viewProj() call. */
  get cameraRight(): Float32Array {
    return this.right;
  }

  /** World-space camera up vector; valid after the last viewProj() call. */
  get cameraUp(): Float32Array {
    return this.up;
  }

  /** Column-major mat4x4<f32>, ready to write into the frame uniform buffer. */
  viewProj(): Float32Array {
    const eye = new Vector3().lerpVectors(
      this.isoPos,
      new Vector3(0, this.flatY, 0),
      this.progress
    );
    const target = new Vector3().lerpVectors(this.isoTarget, new Vector3(0, 0, 0), this.progress);
    const up = new Vector3().lerpVectors(ISO_UP, FLAT_UP, this.progress).normalize();

    const world = new Matrix4().lookAt(eye, target, up);
    world.setPosition(eye);
    // Basis columns, read before invert() mutates the matrix: leaves and
    // petals billboard against these.
    this.right.set([world.elements[0], world.elements[1], world.elements[2]]);
    this.up.set([world.elements[4], world.elements[5], world.elements[6]]);
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
