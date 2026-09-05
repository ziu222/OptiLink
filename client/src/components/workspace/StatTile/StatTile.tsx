import { ContentPanel } from '../panels/ContentPanel/ContentPanel';
import './StatTile.css';

interface StatTileProps {
  title: string;
  value: string | number;
  suffix?: string;
}

// Headline figure with a muted qualifier beside it, e.g. "250" + "clicks".
export function StatTile({ title, value, suffix }: StatTileProps) {
  return (
    <ContentPanel title={title} className="stat-tile">
      <p className="stat-tile-value">
        <span className="stat-tile-number">{value}</span>
        {suffix && <span className="stat-tile-suffix">{suffix}</span>}
      </p>
    </ContentPanel>
  );
}
