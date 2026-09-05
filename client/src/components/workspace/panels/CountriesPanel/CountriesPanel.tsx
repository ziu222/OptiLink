import { ContentPanel } from '../ContentPanel/ContentPanel';
import { CountryMap } from '../../CountryMap/CountryMap';
import { BreakdownList } from '../../BreakdownList/BreakdownList';
import { shadeForShare } from '../../../../utils/sequentialScale';
import type { LocationBreakdown } from '../../../../api/analytics';
import './CountriesPanel.css';

const regionNames = (() => {
  try {
    return new Intl.DisplayNames(['en'], { type: 'region' });
  } catch {
    return null;
  }
})();

const countryName = (code: string): string => {
  try {
    return regionNames?.of(code) ?? code;
  } catch {
    return code;
  }
};

interface CountriesPanelProps {
  data: LocationBreakdown[];
}

// World map of click counts by country (left half) plus the same data as a
// labeled, percent-ranked list with share-of-total bars (right half). Country
// counts are a magnitude, not an identity, so both the map and the list use
// one sequential hue rather than a categorical palette.
export function CountriesPanel({ data }: CountriesPanelProps) {
  const totals = new Map<string, number>();
  for (const row of data) {
    const code = row.country || 'Unknown';
    totals.set(code, (totals.get(code) ?? 0) + row.clicks);
  }

  const points = Array.from(totals, ([label, value]) => ({ label, value })).sort(
    (a, b) => b.value - a.value,
  );
  const max = Math.max(...points.map((p) => p.value), 1);
  const hasData = points.some((p) => p.value > 0);
  const namedPoints = points.map((p) => ({ ...p, label: countryName(p.label) }));

  return (
    <ContentPanel title="Countries" className="countries-panel">
      {!hasData ? (
        <p className="link-list-empty">No clicks yet.</p>
      ) : (
        <div className="countries-panel-grid">
          <CountryMap data={points} max={max} />
          <BreakdownList data={namedPoints} getColor={(d) => shadeForShare(d.value, max)} />
        </div>
      )}
    </ContentPanel>
  );
}
