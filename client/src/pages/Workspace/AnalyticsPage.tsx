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
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'clicks', label: 'Most clicks' },
];

const STATUS_OPTIONS: { value: LinkStatus; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

const PAGE_SIZE = 5;

export function AnalyticsPage() {
  const [overview, setOverview] = useState<OverviewData | null>(null);

  const [links, setLinks] = useState<ShortenedLink[]>([]);
  const [loadingLinks, setLoadingLinks] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
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

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchLinks = useCallback(() => {
    let cancelled = false;
    listLinks({ search: debouncedSearch || undefined, status, sort, page, limit: PAGE_SIZE })
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
  }, [debouncedSearch, status, sort, page]);

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
  }, [debouncedSearch, status, sort, page]);

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
    if (!window.confirm(`Delete ${count} link${count > 1 ? 's' : ''}? This can’t be undone.`)) {
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
          label: `Delete selected${selectedIds.size ? ` (${selectedIds.size})` : ''}`,
          disabled: selectedIds.size === 0,
          danger: true,
          onSelect: deleteSelected,
        },
        {
          key: 'exit',
          label: 'Exit multi-select',
          onSelect: () => {
            setMultiSelect(false);
            setSelectedIds(new Set());
          },
        },
      ]
    : [
        {
          key: 'multi',
          label: 'Multi-select',
          onSelect: () => setMultiSelect(true),
        },
        {
          key: 'select-all',
          label: 'Select all',
          disabled: links.length === 0,
          onSelect: () => {
            setMultiSelect(true);
            setSelectedIds(new Set(links.map((link) => link.id)));
          },
        },
      ];

  return (
    <>
      <PageHeader title="Analytics" />

      <div className="page-content">
        {overview && (
          <div className="analytics-stats">
            <StatTile title="Total Links" value={overview.totalLinks} />
            <StatTile title="Total Clicks" value={overview.totalClicks} />
            <StatTile title="Clicks Today" value={overview.clicksToday} />
          </div>
        )}

        {links.length > 0 && (
          <div className="analytics-breakdown">
            {linkAnalyticsState === 'loading' && <p className="link-list-empty">Loading…</p>}
            {linkAnalyticsState === 'error' && (
              <p className="link-list-empty">Couldn’t load analytics for this link.</p>
            )}
            {linkAnalyticsState === 'ready' && linkAnalytics && (
              <>
                <CountriesPanel data={linkAnalytics.locations} />
                <BreakdownPanel
                  title="Devices"
                  data={linkAnalytics.devices.map((d) => ({ label: d.device, value: d.clicks }))}
                />
              </>
            )}
          </div>
        )}

        <ShortenedLinksPanel
          title="Links"
          links={links}
          isLoading={loadingLinks}
          emptyLabel={search || status !== 'all' ? 'No links match your filters.' : undefined}
          onDeleted={() => fetchLinks()}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          toolbar={
            <Toolbar
              search={search}
              onSearchChange={setSearch}
              searchPlaceholder="Search links"
              actionsLabel={
                multiSelect && selectedIds.size ? `Actions (${selectedIds.size})` : 'Actions'
              }
              menus={[
                {
                  ariaLabel: 'Filter by status',
                  value: status,
                  onChange: (value) => {
                    setStatus(value as LinkStatus);
                    setPage(1);
                  },
                  options: STATUS_OPTIONS,
                },
                {
                  ariaLabel: 'Sort links',
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
