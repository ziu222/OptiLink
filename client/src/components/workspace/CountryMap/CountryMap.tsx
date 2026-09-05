import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { ISO_NUMERIC_BY_ALPHA2 } from '../../../utils/isoNumericByAlpha2';
import { shadeForShare, NO_DATA_COLOR } from '../../../utils/sequentialScale';
import './CountryMap.css';

// react-simple-maps' own documented example source - a public, versioned
// world-atlas topojson, keyed by ISO 3166-1 numeric id.
const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

interface CountryMapProps {
  /** label = ISO alpha-2 country code */
  data: { label: string; value: number }[];
  /** Shading ceiling; defaults to the busiest country in data. */
  max?: number;
}

// Choropleth world map - one shaded country per row of click data, matched by
// ISO numeric id (translated from our alpha-2 country codes).
export function CountryMap({ data, max }: CountryMapProps) {
  const ceiling = max ?? Math.max(...data.map((d) => d.value), 1);
  const countByNumericId = new Map(
    data.map((d) => [ISO_NUMERIC_BY_ALPHA2[d.label], d.value]),
  );

  return (
    <div className="country-map-frame">
      <ComposableMap projection="geoEqualEarth" className="country-map">
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const count = countByNumericId.get(Number(geo.id)) ?? 0;
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  className="country-map-geo"
                  fill={count ? shadeForShare(count, ceiling) : NO_DATA_COLOR}
                  stroke="var(--bg)"
                  strokeWidth={0.5}
                >
                  <title>
                    {geo.properties?.name ?? 'Unknown'}: {count} click{count === 1 ? '' : 's'}
                  </title>
                </Geography>
              );
            })
          }
        </Geographies>
      </ComposableMap>
    </div>
  );
}
