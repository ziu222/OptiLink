import { Matrix4, Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
import { CameraMatrices } from './CameraMatrices';

const GRID = 33;

function makeCamera(width = 1200, height = 800): CameraMatrices {
  const camera = new CameraMatrices();
  camera.setViewport(width, height);
  camera.frameGrid(GRID);
  return camera;
}

function project(camera: CameraMatrices, point: [number, number, number]): Vector3 {
  const viewProj = new Matrix4().fromArray(camera.viewProj());
  return new Vector3(...point).applyMatrix4(viewProj);
}

function settleFlat(camera: CameraMatrices): void {
  camera.toggle();
  camera.update(2);
}

describe('CameraMatrices transitions', () => {
  it('starts isometric and reaches flat after a full transition', () => {
    const camera = makeCamera();
    expect(camera.state).toBe('isometric');
    settleFlat(camera);
    expect(camera.state).toBe('flat');
    expect(camera.isSettledFlat).toBe(true);
  });

  it('reverses from wherever it is instead of dropping a mid-transition tap', () => {
    const camera = makeCamera();
    camera.toggle();
    camera.update(0.45);
    const midway = camera.transitionProgress;
    expect(midway).toBeGreaterThan(0);
    expect(midway).toBeLessThan(1);

    camera.toggle();
    camera.update(0.05);
    // Continues from the captured position, no jump back to either end.
    expect(camera.transitionProgress).toBeLessThan(midway);
    expect(camera.transitionProgress).toBeGreaterThan(0);

    camera.update(2);
    expect(camera.transitionProgress).toBe(0);
  });

  it('never overshoots the target', () => {
    const camera = makeCamera();
    camera.toggle();
    for (let i = 0; i < 20; i++) camera.update(0.1);
    expect(camera.transitionProgress).toBe(1);
  });
});

describe('treeAlpha (§6.1)', () => {
  it('is fully on in the isometric view', () => {
    expect(makeCamera().treeAlpha).toBe(1);
  });

  it('is zero once the flat view is settled', () => {
    const camera = makeCamera();
    settleFlat(camera);
    expect(camera.treeAlpha).toBe(0);
  });

  it('reaches zero before the camera finishes settling', () => {
    // A half-faded tree hanging over a settled QR would break the scan.
    const camera = makeCamera();
    camera.toggle();
    let alphaAtNearFlat = 1;
    for (let i = 0; i < 100; i++) {
      camera.update(0.01);
      if (camera.transitionProgress >= 0.9) {
        alphaAtNearFlat = camera.treeAlpha;
        break;
      }
    }
    expect(alphaAtNearFlat).toBe(0);
  });
});

describe('projection', () => {
  it('emits 16 finite floats', () => {
    const viewProj = makeCamera().viewProj();
    expect(viewProj).toHaveLength(16);
    expect(Array.from(viewProj).every(Number.isFinite)).toBe(true);
  });

  it('frames the whole grid inside clip space when flat', () => {
    const camera = makeCamera();
    settleFlat(camera);
    const half = GRID / 2;
    for (const [x, z] of [
      [-half, -half],
      [half, -half],
      [-half, half],
      [half, half],
    ]) {
      const ndc = project(camera, [x, 0, z]);
      expect(Math.abs(ndc.x)).toBeLessThan(1);
      expect(Math.abs(ndc.y)).toBeLessThan(1);
      // WebGPU clip space is z in [0, 1], not [-1, 1].
      expect(ndc.z).toBeGreaterThanOrEqual(0);
      expect(ndc.z).toBeLessThanOrEqual(1);
    }
  });

  it('has zero parallax in the settled flat view', () => {
    // The voxel feature's first flat camera was a perspective one, which
    // skewed tall geometry and made the QR unreadable.
    const camera = makeCamera();
    settleFlat(camera);
    const onGround = project(camera, [12, 0, 12]);
    const highUp = project(camera, [12, 10, 12]);
    expect(highUp.x).toBeCloseTo(onGround.x, 6);
    expect(highUp.y).toBeCloseTo(onGround.y, 6);
  });

  it('still has perspective in the isometric view', () => {
    const camera = makeCamera();
    // Off the camera's diagonal, or the x offset is zero for geometric reasons.
    const onGround = project(camera, [12, 0, -4]);
    const highUp = project(camera, [12, 10, -4]);
    expect(Math.abs(highUp.x - onGround.x)).toBeGreaterThan(0.01);
  });

  it('reframes when the viewport changes', () => {
    const wide = makeCamera(1600, 600);
    const tall = makeCamera(600, 1600);
    settleFlat(wide);
    settleFlat(tall);
    expect(Array.from(wide.viewProj())).not.toEqual(Array.from(tall.viewProj()));
    // A portrait viewport must still fit the grid.
    const corner = project(tall, [GRID / 2, 0, GRID / 2]);
    expect(Math.abs(corner.x)).toBeLessThan(1);
    expect(Math.abs(corner.y)).toBeLessThan(1);
  });
});
