import { useCallback, useEffect, useState } from 'react';
import { PageHeader } from '../../components/workspace/PageHeader/PageHeader';
import { ContentPanel } from '../../components/workspace/panels/ContentPanel/ContentPanel';
import { Toolbar } from '../../components/workspace/Toolbar/Toolbar';
import { Pagination } from '../../components/workspace/Pagination/Pagination';
import { AdminUserRow } from '../../components/admin/AdminUserRow/AdminUserRow';
import type { MenuItem } from '../../components/workspace/menu/MenuPopup/MenuPopup';
import { deleteUser, listUsers } from '../../api/admin';
import type { AdminUser } from '../../api/admin';
import '../Workspace/workspace.css';
import './AdminList.css';

type UserStatus = 'all' | 'active' | 'banned';
type UserSort = 'newest' | 'oldest';

const STATUS_OPTIONS: { value: UserStatus; label: string }[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'active', label: 'Đang hoạt động' },
  { value: 'banned', label: 'Đã khóa' },
];

const SORT_OPTIONS: { value: UserSort; label: string }[] = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'oldest', label: 'Cũ nhất' },
];

const PAGE_SIZE = 10;

export function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [status, setStatus] = useState<UserStatus>('all');
  const [sort, setSort] = useState<UserSort>('newest');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [multiSelect, setMultiSelect] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const pageCount = Math.max(1, Math.ceil((total || 0) / PAGE_SIZE));

  const submitSearch = useCallback(() => {
    setAppliedSearch(search);
    setPage(1);
  }, [search]);

  const fetchUsers = useCallback(() => {
    let cancelled = false;
    setLoading(true);
    listUsers({ search: appliedSearch || undefined, status, sort, page, limit: PAGE_SIZE })
      .then((result) => {
        if (cancelled) return;
        setUsers(result.users);
        setTotal(result.total ?? result.users.length);
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

  useEffect(() => fetchUsers(), [fetchUsers]);

  // If the current page emptied out (last row deleted, or a filter narrowed
  // the results), step back a page.
  useEffect(() => {
    if (!loading && users.length === 0 && page > 1) {
      setPage((current) => current - 1);
    }
  }, [loading, users, page]);

  // Drop the selection whenever the visible set of users changes.
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

  const handleChanged = (updated: AdminUser) => {
    setUsers((current) => current.map((u) => (u.id === updated.id ? updated : u)));
  };

  const handleDeleted = (id: string) => {
    setUsers((current) => current.filter((u) => u.id !== id));
    setTotal((current) => Math.max(0, current - 1));
  };

  const deleteSelected = useCallback(async () => {
    if (selectedIds.size === 0) return;
    const count = selectedIds.size;
    if (!window.confirm(`Xóa ${count} người dùng đã chọn? Không thể hoàn tác.`)) {
      return;
    }
    await Promise.allSettled([...selectedIds].map((id) => deleteUser(id)));
    setSelectedIds(new Set());
    setMultiSelect(false);
    fetchUsers();
  }, [selectedIds, fetchUsers]);

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
          disabled: users.length === 0,
          onSelect: () => {
            setMultiSelect(true);
            setSelectedIds(new Set(users.map((u) => u.id)));
          },
        },
      ];

  return (
    <>
      <PageHeader title="Người dùng" />
      <div className="page-content">
        <ContentPanel
          title="Danh sách người dùng"
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
            searchPlaceholder="Tìm theo email, tên đăng nhập hoặc họ tên"
            actionsLabel={
              multiSelect && selectedIds.size ? `Hành động (${selectedIds.size})` : 'Hành động'
            }
            menus={[
              {
                ariaLabel: 'Lọc theo trạng thái',
                value: status,
                onChange: (value) => {
                  setStatus(value as UserStatus);
                  setPage(1);
                },
                options: STATUS_OPTIONS,
              },
              {
                ariaLabel: 'Sắp xếp người dùng',
                value: sort,
                onChange: (value) => {
                  setSort(value as UserSort);
                  setPage(1);
                },
                options: SORT_OPTIONS,
              },
            ]}
            actions={actionItems}
          />
          {loading && users.length === 0 ? (
            <p className="link-list-empty">Đang tải…</p>
          ) : users.length === 0 ? (
            <p className="link-list-empty">
              {appliedSearch || status !== 'all'
                ? 'Không có người dùng nào khớp với bộ lọc.'
                : 'Chưa có người dùng nào.'}
            </p>
          ) : (
            <div className="link-list admin-row-list admin-row-list--users">
              {users.map((u) => (
                <AdminUserRow
                  key={u.id}
                  user={u}
                  onChanged={handleChanged}
                  onDeleted={handleDeleted}
                  selected={selectedIds.has(u.id)}
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
