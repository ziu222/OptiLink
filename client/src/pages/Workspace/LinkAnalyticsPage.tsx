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

const BREADCRUMB = [{ label: 'Thống kê', to: '/dashboard/analytics' }];

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
          title={linkState === 'error' ? 'Không tìm thấy liên kết' : 'Đang tải…'}
        />
        {linkState === 'error' && (
          <p className="link-list-empty">Liên kết này không tồn tại hoặc không thuộc về bạn.</p>
        )}
      </>
    );
  }

  return (
    <>
      <PageHeader breadcrumb={BREADCRUMB} title={link.title || 'Chưa có tiêu đề'} />

      <div className="page-content">
        {linkAnalyticsState === 'loading' && <p className="link-list-empty">Đang tải…</p>}
        {linkAnalyticsState === 'error' && (
          <p className="link-list-empty">Không thể tải thống kê cho liên kết này.</p>
        )}
        {linkAnalyticsState === 'ready' && linkAnalytics && (
          <>
            <div className="analytics-stats analytics-stats--pair">
              <StatTile title="Tổng lượt nhấp" value={linkAnalytics.totalClicks} />
              <StatTile title="Lượt nhấp hôm nay" value={linkAnalytics.clicksToday} />
            </div>

            <div className="analytics-breakdown">
              <CountriesPanel data={linkAnalytics.locations} />
              <BreakdownPanel
                title="Thiết bị"
                data={linkAnalytics.devices.map((d) => ({ label: d.device, value: d.clicks }))}
              />
              <BreakdownPanel
                title="Nguồn truy cập"
                data={linkAnalytics.sources.map((s) => ({ label: s.source, value: s.clicks }))}
              />
            </div>
          </>
        )}
      </div>
    </>
  );
}
