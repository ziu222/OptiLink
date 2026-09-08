import { describe, expect, it } from 'vitest';
import { buildSparklinePoints } from './ClicksSparkline';

const ys = (s: string) => s.split(' ').map((p) => Number(p.split(',')[1]));
const xs = (s: string) => s.split(' ').map((p) => Number(p.split(',')[0]));

describe('buildSparklinePoints', () => {
  it('spans the full width with the newest sample on the right', () => {
    const pts = buildSparklinePoints([0, 1, 2, 3], 120, 40);
    expect(xs(pts)[0]).toBe(0);
    expect(xs(pts).at(-1)).toBe(120);
  });

  it('maps a larger value to a smaller y (SVG y grows downward)', () => {
    const pts = buildSparklinePoints([0, 3], 120, 40);
    expect(ys(pts)[1]).toBeLessThan(ys(pts)[0]);
  });

  it('normalises the peak to the top pad', () => {
    expect(ys(buildSparklinePoints([2, 10], 100, 40)).at(-1)).toBe(3); // PAD
  });

  it('draws a flat baseline for all-zero data', () => {
    const y = ys(buildSparklinePoints([0, 0, 0], 120, 40));
    expect(new Set(y).size).toBe(1);
    expect(y[0]).toBe(37); // PAD + (height - 2*PAD)
  });

  it('centres a single sample', () => {
    expect(buildSparklinePoints([5], 120, 40)).toBe('60.00,3.00');
  });

  it('returns an empty string for empty data', () => {
    expect(buildSparklinePoints([], 120, 40)).toBe('');
  });
});
