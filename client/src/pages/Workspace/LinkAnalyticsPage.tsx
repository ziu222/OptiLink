import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PageHeader } from '../../components/workspace/PageHeader/PageHeader';
import { StatTile } from '../../components/workspace/StatTile/StatTile';
import { CountriesPanel } from '../../components/workspace/panels/CountriesPanel/CountriesPanel';
import { BreakdownPanel } from '../../components/workspace/panels/BreakdownPanel/BreakdownPanel';
import { getLink } from '../../api/links';
import type { ShortenedLink } from '../../api/links';
import { getLinkAnalytics } from '../../api/analytics';
import type { LinkAnalyticsData } from '../../api/analytics';
import './workspace.css';

type FetchState = 'idle' | 'loading' | 'ready' | 'error';

const BREADCRUMB = [{ label: 'Analytics', to: '/dashboard/analytics' }];

export function LinkAnalyticsPage() {
  const { id } = useParams<{ id: string }>();
  const [link, setLink] = useState<ShortenedLink | null>(null);
  const [linkState, setLinkState] = useState<'loading' | 'ready' | 'error'>('loading');

  const [linkAnalytics, setLinkAnalytics] = useState<LinkAnalyticsData | null>(null);
  const [linkAnalyticsState, setLinkAnalyticsState] = useState<FetchState>('idle');

  useEffect(() => {
    if (!id) return;
    getLink(id)
      .then((result) => {
        setLink(result);
        setLinkState('ready');
      })
      .catch(() => setLinkState('error'));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLinkAnalyticsState('loading');
    getLinkAnalytics(id)
      .then((result) => {
        if (cancelled) return;
        setLinkAnalytics(result);
        setLinkAnalyticsState('ready');
      })
      .catch(() => {
        if (!cancelled) setLinkAnalyticsState('error');
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (linkState !== 'ready' || !link) {
    return (
      <>
        <PageHeader
          breadcrumb={BREADCRUMB}
          title={linkState === 'error' ? 'Link not found' : 'Loading…'}
        />
        {linkState === 'error' && (
          <p className="link-list-empty">This link doesn’t exist or isn’t yours.</p>
        )}
      </>
    );
  }

  return (
    <>
      <PageHeader breadcrumb={BREADCRUMB} title={link.title || 'Untitle'} />

      <div className="page-content">
        {linkAnalyticsState === 'loading' && <p className="link-list-empty">Loading…</p>}
        {linkAnalyticsState === 'error' && (
          <p className="link-list-empty">Couldn’t load analytics for this link.</p>
        )}
        {linkAnalyticsState === 'ready' && linkAnalytics && (
          <>
            <div className="analytics-stats analytics-stats--pair">
              <StatTile title="Total Clicks" value={linkAnalytics.totalClicks} />
              <StatTile title="Clicks Today" value={linkAnalytics.clicksToday} />
            </div>

            <div className="analytics-breakdown">
              <CountriesPanel data={linkAnalytics.locations} />
              <BreakdownPanel
                title="Devices"
                data={linkAnalytics.devices.map((d) => ({ label: d.device, value: d.clicks }))}
              />
            </div>
          </>
        )}
      </div>
    </>
  );
}
