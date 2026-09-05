import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { ContentPanel } from '../ContentPanel/ContentPanel';
import { BreakdownList } from '../../BreakdownList/BreakdownList';
import './BreakdownPanel.css';

// Fixed-order categorical palette - never cycled or reassigned per filter, so
// a category keeps its color as the list changes. Pastel tints of the
// dataviz-skill hues.
const SERIES_COLORS = [
  '#aac9ef', // blue
  '#f7c3ae', // orange
  '#a4dfca', // aqua
  '#f8d999', // yellow
  '#f6cadb', // magenta
  '#99cd99', // green
  '#b7b0dc', // violet
  '#f4b6b6', // red
];

interface BreakdownPoint {
  label: string;
  value: number;
}

interface BreakdownPanelProps {
  title: string;
  data: BreakdownPoint[];
  emptyMessage?: string;
}

// Pie chart + legend (left half) plus the same data as a labeled,
// percent-ranked list with share-of-total bars (right half). Generic over any
// single-field group-by (device, platform, browser).
export function BreakdownPanel({ title, data, emptyMessage = 'No clicks yet.' }: BreakdownPanelProps) {
  const hasData = data.some((point) => point.value > 0);

  return (
    <ContentPanel title={title} className="breakdown-panel">
      {!hasData ? (
        <p className="link-list-empty">{emptyMessage}</p>
      ) : (
        <div className="breakdown-panel-grid">
          <div className="breakdown-panel-chart">
            <ResponsiveContainer width="100%" height={340}>
              <PieChart>
                <Pie data={data} dataKey="value" nameKey="label" innerRadius={0} outerRadius={140}>
                  {data.map((point, index) => (
                    <Cell key={point.label} fill={SERIES_COLORS[index % SERIES_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, _name, item) => [
                    `${value} clicks`,
                    (item.payload as BreakdownPoint).label,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="breakdown-panel-legend">
              {data.map((point, index) => (
                <span className="breakdown-panel-legend-item" key={point.label}>
                  <span
                    className="breakdown-swatch"
                    style={{ backgroundColor: SERIES_COLORS[index % SERIES_COLORS.length] }}
                  />
                  {point.label}
                </span>
              ))}
            </div>
          </div>

          <BreakdownList data={data} colors={SERIES_COLORS} />
        </div>
      )}
    </ContentPanel>
  );
}
