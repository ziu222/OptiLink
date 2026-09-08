import './ClicksSparkline.css';

interface ClicksSparklineProps {
  /** Hourly counts, oldest -> newest. */
  data: number[];
  /** viewBox coordinate space; the rendered `<svg>` stretches to its container. */
  width?: number;
  height?: number;
  className?: string;
}

const PAD = 3; // keeps the 2px stroke clear of the top/bottom edge

// Pure: map a series to an SVG `points` string. Newest sample sits on the right,
// values normalised to the series max so the peak reaches the top pad. All-zero
// data collapses to a flat baseline. Exported for unit testing.
export function buildSparklinePoints(data: number[], width: number, height: number): string {
  const n = data.length;
  if (n === 0) return '';
  const max = Math.max(...data, 1);
  const plotH = height - PAD * 2;
  const x = (i: number) => (n === 1 ? width / 2 : (i / (n - 1)) * width);
  const y = (v: number) => PAD + plotH - (v / max) * plotH;
  return data.map((v, i) => `${x(i).toFixed(2)},${y(v).toFixed(2)}`).join(' ');
}

// A compact 24h clicks trend: a single line. Single series, so no legend — the
// caller labels it.
export function ClicksSparkline({
  data,
  width = 120,
  height = 40,
  className,
}: ClicksSparklineProps) {
  const total = data.reduce((sum, v) => sum + v, 0);
  const points = buildSparklinePoints(data, width, height);

  return (
    <svg
      className={['clicks-sparkline', className].filter(Boolean).join(' ')}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      role="img"
      aria-label={`Clicks per hour, last 24 hours — ${total} total`}
    >
      <title>{`Clicks per hour, last 24h (${total} total)`}</title>
      {points && (
        <polyline
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      )}
    </svg>
  );
}
