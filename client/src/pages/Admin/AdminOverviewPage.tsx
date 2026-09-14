import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { PageHeader } from '../../components/workspace/PageHeader/PageHeader';
import { ContentPanel } from '../../components/workspace/panels/ContentPanel/ContentPanel';
import { StatTile } from '../../components/workspace/StatTile/StatTile';
import { getGlobalStats, getGrowthStats } from '../../api/admin';
import type { GlobalStats, GrowthPoint } from '../../api/admin';
import { useIsBelowMd } from '../../lib/useMediaQuery';
import '../Workspace/workspace.css';

const formatDay = (iso: string): string => {
  const d = new Date(`${iso}T00:00:00`);
  return `${d.getDate()}/${d.getMonth() + 1}`;
};

export function AdminOverviewPage() {
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [growth, setGrowth] = useState<GrowthPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsBelowMd();

  useEffect(() => {
    let cancelled = false;
    Promise.all([getGlobalStats(), getGrowthStats()])
      .then(([s, g]) => {
        if (cancelled) return;
        setStats(s);
        setGrowth(g);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const chartData = growth.map((point) => ({ ...point, label: formatDay(point.date) }));

  return (
    <>
      <PageHeader title="Tổng quan hệ thống" />
      <div className="page-content">
        <div className="analytics-stats">
          <StatTile title="Tổng người dùng" value={loading ? '—' : (stats?.totalUsers ?? 0)} />
          <StatTile title="Tổng liên kết" value={loading ? '—' : (stats?.totalLinks ?? 0)} />
          <StatTile title="Tổng lượt nhấp" value={loading ? '—' : (stats?.totalClicks ?? 0)} />
        </div>

        <div className="analytics-stats analytics-stats--pair">
          <StatTile title="Người dùng Miễn phí" value={loading ? '—' : (stats?.freeUsers ?? 0)} />
          <StatTile title="Người dùng Cao cấp" value={loading ? '—' : (stats?.premiumUsers ?? 0)} />
        </div>

        <ContentPanel title="Tăng trưởng 30 ngày qua">
          {loading ? (
            <p className="link-list-empty">Đang tải…</p>
          ) : (
            <ResponsiveContainer width="100%" height={isMobile ? 280 : 320}>
              <BarChart data={chartData} margin={isMobile ? { bottom: 20 } : undefined}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="label"
                  stroke="var(--text)"
                  fontSize={12}
                  interval={isMobile ? 4 : 2}
                  {...(isMobile ? { angle: -45, textAnchor: 'end', height: 50 } : {})}
                />
                <YAxis stroke="var(--text)" fontSize={12} allowDecimals={false} width={isMobile ? 28 : 60} />
                <Tooltip
                  formatter={(value, name) => [
                    value,
                    name === 'newUsers' ? 'Người dùng mới' : 'Liên kết mới',
                  ]}
                  labelFormatter={(label) => `Ngày ${label}`}
                />
                <Legend
                  formatter={(value) => (value === 'newUsers' ? 'Người dùng mới' : 'Liên kết mới')}
                />
                <Bar dataKey="newUsers" fill="#aac9ef" />
                <Bar dataKey="newLinks" fill="#a4dfca" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ContentPanel>
      </div>
    </>
  );
}
