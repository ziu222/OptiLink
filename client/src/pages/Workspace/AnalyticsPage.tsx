import { useCallback, useEffect, useState } from 'react';
import { PageHeader } from '../../components/workspace/PageHeader/PageHeader';
import { StatTile } from '../../components/workspace/StatTile/StatTile';
import { Toolbar } from '../../components/workspace/Toolbar/Toolbar';
import { Pagination } from '../../components/workspace/Pagination/Pagination';
import { ShortenedLinksPanel } from '../../components/workspace/panels/ShortenedLinksPanel/ShortenedLinksPanel';
import { CountriesPanel } from '../../components/workspace/panels/CountriesPanel/CountriesPanel';
import { BreakdownPanel } from '../../components/workspace/panels/BreakdownPanel/BreakdownPanel';
import type { MenuItem } from '../../components/workspace/menu/MenuPopup/MenuPopup';
import { deleteLink, listLinks } from '../../api/links';
import type { ShortenedLink } from '../../api/links';
import { getLinkAnalytics, getOverview } from '../../api/analytics';
import type { LinkAnalyticsData, OverviewData } from '../../api/analytics';
import './workspace.css';

type LinkStatus = 'all' | 'active' | 'inactive';
type LinkSort = 'newest' | 'oldest' | 'clicks';
type FetchState = 'idle' | 'loading' | 'ready' | 'error';

const SORT_OPTIONS: { value: LinkSort; label: string }[] = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'oldest', label: 'Cũ nhất' },
  { value: 'clicks', label: 'Nhiều lượt nhấp nhất' },
];

const STATUS_OPTIONS: { value: LinkStatus; label: string }[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'active', label: 'Đang hoạt động' },
  { value: 'inactive', label: 'Ngừng hoạt động' },
];

const PAGE_SIZE = 5;

export function AnalyticsPage() {
  const [overview, setOverview] = useState<OverviewData | null>(null);

  const [links, setLinks] = useState<ShortenedLink[]>([]);
  const [loadingLinks, setLoadingLinks] = useState(true);
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [status, setStatus] = useState<LinkStatus>('all');
  const [sort, setSort] = useState<LinkSort>('newest');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [multiSelect, setMultiSelect] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const pageCount = Math.max(1, Math.ceil((total || 0) / PAGE_SIZE));

  const [selectedLinkId, setSelectedLinkId] = useState('');
  const [linkAnalytics, setLinkAnalytics] = useState<LinkAnalyticsData | null>(null);
  const [linkAnalyticsState, setLinkAnalyticsState] = useState<FetchState>('idle');

  useEffect(() => {
    getOverview()
      .then(setOverview)
      .catch(() => {
        /* stat tiles just stay hidden if the overview fails to load */
      });
  }, []);

  // Search runs only on submit (Enter) via the Toolbar's onSearchSubmit, not on
  // every keystroke — see the <Toolbar> below.
  const submitSearch = useCallback(() => {
    setAppliedSearch(search);
    setPage(1);
  }, [search]);

  const fetchLinks = useCallback(() => {
    let cancelled = false;
    listLinks({ search: appliedSearch || undefined, status, sort, page, limit: PAGE_SIZE })
      .then((result) => {
        if (cancelled) return;
        setLinks(result.links);
        setTotal(result.total ?? result.links.length);
      })
      .catch(() => {
        /* keep the current list if the request fails */
      })
      .finally(() => {
        if (!cancelled) setLoadingLinks(false);
      });
    return () => {
      cancelled = true;
    };
  }, [appliedSearch, status, sort, page]);

  useEffect(() => fetchLinks(), [fetchLinks]);

  // If the current page emptied out (last row deleted, or a filter narrowed
  // the results), step back a page.
  useEffect(() => {
    if (!loadingLinks && links.length === 0 && page > 1) {
      setPage((current) => current - 1);
    }
  }, [loadingLinks, links, page]);

  // Drop the selection whenever the visible set of links changes.
  useEffect(() => {
    setSelectedIds(new Set());
  }, [appliedSearch, status, sort, page]);

  // Default the breakdown selector to the first loaded link.
  useEffect(() => {
    if (!selectedLinkId && links.length > 0) {
      setSelectedLinkId(links[0].id);
    }
  }, [links, selectedLinkId]);

  useEffect(() => {
    if (!selectedLinkId) {
      setLinkAnalytics(null);
      setLinkAnalyticsState('idle');
      return;
    }
    let cancelled = false;
    setLinkAnalyticsState('loading');
    getLinkAnalytics(selectedLinkId)
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
  }, [selectedLinkId]);

  const toggleSelect = useCallback(
    (id: string) => {
      setSelectedIds((prev) => {
        if (multiSelect) {
          const next = new Set(prev);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return next;
        }
        return prev.has(id) ? new Set<string>() : new Set<string>([id]);
      });
    },
    [multiSelect],
  );

  const deleteSelected = useCallback(async () => {
    if (selectedIds.size === 0) return;
    const count = selectedIds.size;
    if (!window.confirm(`Xóa ${count} liên kết đã chọn? Không thể hoàn tác.`)) {
      return;
    }
    await Promise.allSettled([...selectedIds].map((id) => deleteLink(id)));
    setSelectedIds(new Set());
    setMultiSelect(false);
    fetchLinks();
  }, [selectedIds, fetchLinks]);

  const actionItems: MenuItem[] = multiSelect
    ? [
        {
          key: 'delete-selected',
          label: `Xóa mục đã chọn${selectedIds.size ? ` (${selectedIds.size})` : ''}`,
          disabled: selectedIds.size === 0,
          danger: true,
          onSelect: deleteSelected,
        },
        {
          key: 'exit',
          label: 'Thoát chế độ chọn nhiều',
          onSelect: () => {
            setMultiSelect(false);
            setSelectedIds(new Set());
          },
        },
      ]
    : [
        {
          key: 'multi',
          label: 'Chọn nhiều',
          onSelect: () => setMultiSelect(true),
        },
        {
          key: 'select-all',
          label: 'Chọn tất cả',
          disabled: links.length === 0,
          onSelect: () => {
            setMultiSelect(true);
            setSelectedIds(new Set(links.map((link) => link.id)));
          },
        },
      ];

  return (
    <>
      <PageHeader title="Thống kê" />

      <div className="page-content">
        {overview && (
          <div className="analytics-stats">
            <StatTile title="Tổng số liên kết" value={overview.totalLinks} />
            <StatTile title="Tổng lượt nhấp" value={overview.totalClicks} />
            <StatTile title="Lượt nhấp hôm nay" value={overview.clicksToday} />
          </div>
        )}

        {links.length > 0 && (
          <div className="analytics-breakdown">
            {linkAnalyticsState === 'loading' && <p className="link-list-empty">Đang tải…</p>}
            {linkAnalyticsState === 'error' && (
              <p className="link-list-empty">Không thể tải thống kê cho liên kết này.</p>
            )}
            {linkAnalyticsState === 'ready' && linkAnalytics && (
              <>
                <CountriesPanel data={linkAnalytics.locations} />
                <BreakdownPanel
                  title="Thiết bị"
                  data={linkAnalytics.devices.map((d) => ({ label: d.device, value: d.clicks }))}
                />
                <BreakdownPanel
                  title="Nguồn truy cập"
                  data={linkAnalytics.sources.map((s) => ({ label: s.source, value: s.clicks }))}
                />
              </>
            )}
          </div>
        )}

        <ShortenedLinksPanel
          title="Liên kết"
          links={links}
          isLoading={loadingLinks}
          emptyLabel={search || status !== 'all' ? 'Không có liên kết nào khớp với bộ lọc.' : undefined}
          onDeleted={() => fetchLinks()}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          toolbar={
            <Toolbar
              search={search}
              onSearchChange={setSearch}
              onSearchSubmit={submitSearch}
              searchPlaceholder="Tìm kiếm liên kết"
              actionsLabel={
                multiSelect && selectedIds.size ? `Hành động (${selectedIds.size})` : 'Hành động'
              }
              menus={[
                {
                  ariaLabel: 'Lọc theo trạng thái',
                  value: status,
                  onChange: (value) => {
                    setStatus(value as LinkStatus);
                    setPage(1);
                  },
                  options: STATUS_OPTIONS,
                },
                {
                  ariaLabel: 'Sắp xếp liên kết',
                  value: sort,
                  onChange: (value) => {
                    setSort(value as LinkSort);
                    setPage(1);
                  },
                  options: SORT_OPTIONS,
                },
              ]}
              actions={actionItems}
            />
          }
          pagination={
            !loadingLinks && total > 0 ? (
              <Pagination page={page} pageCount={pageCount} onChange={setPage} />
            ) : undefined
          }
        />
      </div>
    </>
  );
}
