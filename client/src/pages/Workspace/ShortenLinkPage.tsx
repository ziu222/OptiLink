import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PageHeader } from '../../components/workspace/PageHeader/PageHeader';
import { ContentPanel } from '../../components/workspace/panels/ContentPanel/ContentPanel';
import { OptionTabs } from '../../components/workspace/OptionTabs/OptionTabs';
import { Button } from '../../components/workspace/Button/Button';
import { Field } from '../../components/workspace/Field/Field';
import { InputSelect } from '../../components/workspace/menu/InputSelect/InputSelect';
import { Toolbar } from '../../components/workspace/Toolbar/Toolbar';
import { Pagination } from '../../components/workspace/Pagination/Pagination';
import type { MenuItem } from '../../components/workspace/menu/MenuPopup/MenuPopup';
import { ShortenedLinksPanel } from '../../components/workspace/panels/ShortenedLinksPanel/ShortenedLinksPanel';
import { applyServerError } from '../../lib/formError';
import { createLink, deleteLink, listLinks } from '../../api/links';
import { shortenLinkSchema } from './shortenLinkSchema';
import type { ShortenLinkValues } from './shortenLinkSchema';
import type { ShortenedLink } from '../../api/links';
import './workspace.css';

type OptionTab = 'none' | 'basic' | 'access';
type LinkStatus = 'all' | 'active' | 'inactive';
type LinkSort = 'newest' | 'oldest' | 'clicks';

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

const TAB_ITEMS: { id: OptionTab; label: string }[] = [
  { id: 'none', label: 'Không' },
  { id: 'basic', label: 'Cơ bản' },
  { id: 'access', label: 'Kiểm soát truy cập' },
];

const PAGE_SIZE = 5;

export function ShortenLinkPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<OptionTab>('none');
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
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ShortenLinkValues>({
    resolver: zodResolver(shortenLinkSchema),
    shouldUnregister: false,
    defaultValues: {
      url: '',
      title: '',
      slug: '',
      password: '',
      expiresAt: '',
      redirectMode: 'standard',
      status: 'active',
    },
  });

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

  const onSubmit = handleSubmit(async (values) => {
    try {
      const link = await createLink({
        originalUrl: values.url,
        title: values.title || undefined,
        slug: values.slug || undefined,
        expiresAt: values.expiresAt || undefined,
        redirectMode: values.redirectMode,
        password: values.password || undefined,
      });
      reset();
      navigate(`/dashboard/links/${link.id}`);
    } catch (err) {
      applyServerError<ShortenLinkValues>(err, setError);
    }
  });

  return (
    <>
      <PageHeader title="Rút gọn liên kết" />
      <div className="page-content">
        <ContentPanel title="Tạo liên kết rút gọn">
          <form onSubmit={onSubmit} className="shorten-form">
            {errors.root && <p className="profile-error">{errors.root.message}</p>}

            <div>
              <div className="shorten-url-row">
                <input
                  type="url"
                  placeholder="https://example.com/very-long-link-to-shorten"
                  className="shorten-url-input"
                  {...register('url')}
                />
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Đang rút gọn…' : 'Rút gọn'}
                </Button>
              </div>
              {errors.url && <em className="profile-field-error">{errors.url.message}</em>}
            </div>

            <OptionTabs
              items={TAB_ITEMS}
              value={activeTab}
              ariaLabel="Cài đặt liên kết (tùy chọn)"
              onChange={(id) =>
                setActiveTab((current) => (id !== 'none' && current === id ? 'none' : id))
              }
            />

            {activeTab === 'basic' && (
              <>
                <div className="shorten-tab-content">
                  <Field
                    label="Tiêu đề"
                    hint="Nhãn hiển thị cho liên kết này trong bảng điều khiển của bạn. Không hiển thị với người truy cập."
                    error={errors.title?.message}
                  >
                    <input
                      type="text"
                      placeholder="Trang đích chiến dịch mùa xuân"
                      className="field-input"
                      {...register('title')}
                    />
                  </Field>

                  <Field
                    label="Slug"
                    hint="Phần đuôi tùy chỉnh của URL rút gọn (opti.link/slug-cua-ban). Để trống nếu muốn tạo ngẫu nhiên."
                    error={errors.slug?.message}
                  >
                    <div className="shorten-slug-frame">
                      <span className="shorten-slug-prefix">opti.link/</span>
                      <input
                        type="text"
                        placeholder="khuyen-mai"
                        className="shorten-slug-input"
                        {...register('slug')}
                      />
                    </div>
                  </Field>
                </div>

                <div className="shorten-tab-content">
                  <Field
                    label="Chế độ chuyển hướng"
                    hint="Chuẩn chuyển thẳng người truy cập đến đích. Trang chờ hiển thị một trang trung gian ngắn trước khi chuyển hướng."
                  >
                    <InputSelect
                      ariaLabel="Chế độ chuyển hướng"
                      value={watch('redirectMode')}
                      onChange={(value) => setValue('redirectMode', value)}
                      options={[
                        { value: 'standard', label: 'Chuẩn' },
                        { value: 'splash', label: 'Trang chờ' },
                      ]}
                    />
                  </Field>

                  <Field
                    label="Trạng thái"
                    hint="Liên kết đang hoạt động sẽ chuyển hướng; liên kết ngừng hoạt động vẫn được tạo nhưng chưa chuyển hướng."
                  >
                    <InputSelect
                      ariaLabel="Trạng thái"
                      value={watch('status')}
                      onChange={(value) => setValue('status', value)}
                      options={[
                        { value: 'active', label: 'Đang hoạt động' },
                        { value: 'inactive', label: 'Ngừng hoạt động' },
                      ]}
                    />
                  </Field>
                </div>
              </>
            )}

            {activeTab === 'access' && (
              <div className="shorten-tab-content">
                <Field
                  label="Mật khẩu"
                  hint="Yêu cầu người truy cập nhập mật khẩu trước khi liên kết chuyển hướng."
                  error={errors.password?.message}
                >
                  <input
                    type="password"
                    placeholder="Để trống nếu không cần mật khẩu"
                    className="field-input"
                    {...register('password')}
                  />
                </Field>

                <Field
                  label="Thời hạn"
                  hint="Ngày giờ mà sau đó liên kết ngừng hoạt động. Để trống nếu không giới hạn thời hạn."
                  error={errors.expiresAt?.message}
                >
                  <input
                    type="datetime-local"
                    className="field-input"
                    {...register('expiresAt')}
                  />
                </Field>
              </div>
            )}

          </form>
        </ContentPanel>

        <ShortenedLinksPanel
          links={links}
          isLoading={loadingLinks}
          emptyLabel={
            search || status !== 'all' ? 'Không có liên kết nào khớp với bộ lọc.' : undefined
          }
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
