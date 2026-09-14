import { useCallback, useEffect, useState } from 'react';
import { PageHeader } from '../../components/workspace/PageHeader/PageHeader';
import { ContentPanel } from '../../components/workspace/panels/ContentPanel/ContentPanel';
import { Toolbar } from '../../components/workspace/Toolbar/Toolbar';
import { Pagination } from '../../components/workspace/Pagination/Pagination';
import { AdminLinkRow } from '../../components/admin/AdminLinkRow/AdminLinkRow';
import type { MenuItem } from '../../components/workspace/menu/MenuPopup/MenuPopup';
import { deleteLink, listLinks } from '../../api/admin';
import type { AdminLink } from '../../api/admin';
import '../Workspace/workspace.css';
import './AdminList.css';

type LinkStatus = 'all' | 'active' | 'inactive';
type LinkSort = 'newest' | 'oldest' | 'clicks';

const STATUS_OPTIONS: { value: LinkStatus; label: string }[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'active', label: 'Đang hoạt động' },
  { value: 'inactive', label: 'Ngừng hoạt động' },
];

const SORT_OPTIONS: { value: LinkSort; label: string }[] = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'oldest', label: 'Cũ nhất' },
  { value: 'clicks', label: 'Nhiều lượt nhấp nhất' },
];

const PAGE_SIZE = 10;

export function AdminLinksPage() {
  const [links, setLinks] = useState<AdminLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [status, setStatus] = useState<LinkStatus>('all');
  const [sort, setSort] = useState<LinkSort>('newest');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [multiSelect, setMultiSelect] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const pageCount = Math.max(1, Math.ceil((total || 0) / PAGE_SIZE));

  const submitSearch = useCallback(() => {
    setAppliedSearch(search);
    setPage(1);
  }, [search]);

  const fetchLinks = useCallback(() => {
    let cancelled = false;
    setLoading(true);
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
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [appliedSearch, status, sort, page]);

  useEffect(() => fetchLinks(), [fetchLinks]);

  // If the current page emptied out (last row deleted, or a filter narrowed
  // the results), step back a page.
  useEffect(() => {
    if (!loading && links.length === 0 && page > 1) {
      setPage((current) => current - 1);
    }
  }, [loading, links, page]);

  // Drop the selection whenever the visible set of links changes.
  useEffect(() => {
    setSelectedIds(new Set());
  }, [appliedSearch, status, sort, page]);

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

  const handleDeleted = (id: string) => {
    setLinks((current) => current.filter((l) => l.id !== id));
    setTotal((current) => Math.max(0, current - 1));
  };

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
            setSelectedIds(new Set(links.map((l) => l.id)));
          },
        },
      ];

  return (
    <>
      <PageHeader title="Liên kết" />
      <div className="page-content">
        <ContentPanel
          title="Danh sách liên kết"
          footer={
            !loading && total > 0 ? (
              <Pagination page={page} pageCount={pageCount} onChange={setPage} />
            ) : undefined
          }
        >
          <Toolbar
            search={search}
            onSearchChange={setSearch}
            onSearchSubmit={submitSearch}
            searchPlaceholder="Tìm theo tiêu đề, URL hoặc chủ sở hữu"
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
          {loading && links.length === 0 ? (
            <p className="link-list-empty">Đang tải…</p>
          ) : links.length === 0 ? (
            <p className="link-list-empty">
              {appliedSearch || status !== 'all'
                ? 'Không có liên kết nào khớp với bộ lọc.'
                : 'Chưa có liên kết nào.'}
            </p>
          ) : (
            <div className="link-list admin-row-list admin-row-list--links">
              {links.map((l) => (
                <AdminLinkRow
                  key={l.id}
                  link={l}
                  onDeleted={handleDeleted}
                  selected={selectedIds.has(l.id)}
                  onSelect={toggleSelect}
                />
              ))}
            </div>
          )}
        </ContentPanel>
      </div>
    </>
  );
}
