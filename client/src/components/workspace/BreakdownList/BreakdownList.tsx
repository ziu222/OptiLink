import './BreakdownList.css';

interface BreakdownPoint {
  label: string;
  value: number;
}

interface BreakdownListProps {
  data: BreakdownPoint[];
  /** Fixed-order palette, indexed by row - used when getColor is omitted. */
  colors?: string[];
  /** (point, index) => color; overrides colors for sequential/magnitude data. */
  getColor?: (point: BreakdownPoint, index: number) => string;
}

// Ranked rows for a chart's data - swatch + label on the left, count/percent
// on the right, a share-of-total bar underneath. Pairs with a pie chart for a
// categorical breakdown, or with CountryMap for a sequential one.
export function BreakdownList({ data, colors = [], getColor }: BreakdownListProps) {
  const total = data.reduce((sum, point) => sum + point.value, 0) || 1;
  const colorFor = (point: BreakdownPoint, index: number) =>
    getColor ? getColor(point, index) : colors[index % colors.length];

  return (
    <div className="breakdown-list">
      {data.map((point, index) => {
        const pct = (point.value / total) * 100;
        return (
          <div key={point.label} className="breakdown-row">
            <div className="breakdown-row-head">
              <span className="breakdown-row-label">
                <span
                  className="breakdown-swatch"
                  style={{ backgroundColor: colorFor(point, index) }}
                />
                <span className="breakdown-row-text">{point.label}</span>
              </span>
              <span className="breakdown-row-value">
                {point.value} · {pct.toFixed(1)}%
              </span>
            </div>
            <div className="breakdown-bar-track">
              <div
                className="breakdown-bar-fill"
                style={{ width: `${pct}%`, backgroundColor: colorFor(point, index) }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
