import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PageHeader } from '../../components/workspace/PageHeader/PageHeader';
import { ContentPanel } from '../../components/workspace/panels/ContentPanel/ContentPanel';
import { OptionTabs } from '../../components/workspace/OptionTabs/OptionTabs';
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
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'clicks', label: 'Most clicks' },
];

const STATUS_OPTIONS: { value: LinkStatus; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

const TAB_ITEMS: { id: OptionTab; label: string }[] = [
  { id: 'none', label: 'None' },
  { id: 'basic', label: 'Basic' },
  { id: 'access', label: 'Access Control' },
];

const PAGE_SIZE = 5;

export function ShortenLinkPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<OptionTab>('none');
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
      <PageHeader title="Shorten Link" />
      <div className="page-content">
        <ContentPanel title="Shorten a Link">
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
                <button type="submit" disabled={isSubmitting} className="shorten-submit">
                  {isSubmitting ? 'Shortening…' : 'Shorten'}
                </button>
              </div>
              {errors.url && <em className="profile-field-error">{errors.url.message}</em>}
            </div>

            <OptionTabs
              items={TAB_ITEMS}
              value={activeTab}
              ariaLabel="Optional link settings"
              onChange={(id) =>
                setActiveTab((current) => (id !== 'none' && current === id ? 'none' : id))
              }
            />

            {activeTab === 'basic' && (
              <>
                <div className="shorten-tab-content">
                  <label className="profile-field">
                    <span className="profile-label">Title</span>
                    <input
                      type="text"
                      placeholder="Spring campaign landing page"
                      className="profile-input"
                      {...register('title')}
                    />
                    {errors.title && <em className="profile-field-error">{errors.title.message}</em>}
                  </label>

                  <label className="profile-field">
                    <span className="profile-label">Slug</span>
                    <div className="shorten-slug-frame">
                      <span className="shorten-slug-prefix">opti.link/</span>
                      <input
                        type="text"
                        placeholder="my-promo"
                        className="shorten-slug-input"
                        {...register('slug')}
                      />
                    </div>
                    {errors.slug && <em className="profile-field-error">{errors.slug.message}</em>}
                  </label>
                </div>

                <div className="shorten-tab-content">
                  <div className="profile-field">
                    <span className="profile-label">Redirect Mode</span>
                    <InputSelect
                      ariaLabel="Redirect mode"
                      value={watch('redirectMode')}
                      onChange={(value) => setValue('redirectMode', value)}
                      options={[
                        { value: 'standard', label: 'Standard' },
                        { value: 'splash', label: 'Splash' },
                      ]}
                    />
                  </div>

                  <div className="profile-field">
                    <span className="profile-label">Status</span>
                    <InputSelect
                      ariaLabel="Status"
                      value={watch('status')}
                      onChange={(value) => setValue('status', value)}
                      options={[
                        { value: 'active', label: 'Active' },
                        { value: 'inactive', label: 'Inactive' },
                      ]}
                    />
                  </div>
                </div>
              </>
            )}

            {activeTab === 'access' && (
              <div className="shorten-tab-content">
                <label className="profile-field">
                  <span className="profile-label">Password</span>
                  <input
                    type="password"
                    placeholder="Leave blank for no password"
                    className="profile-input"
                    {...register('password')}
                  />
                  {errors.password && <em className="profile-field-error">{errors.password.message}</em>}
                </label>

                <label className="profile-field">
                  <span className="profile-label">Expires</span>
                  <input
                    type="datetime-local"
                    lang="en-GB"
                    className="profile-input"
                    {...register('expiresAt')}
                  />
                  {errors.expiresAt && <em className="profile-field-error">{errors.expiresAt.message}</em>}
                </label>
              </div>
            )}

          </form>
        </ContentPanel>

        <ShortenedLinksPanel
          links={links}
          isLoading={loadingLinks}
          emptyLabel={
            search || status !== 'all' ? 'No links match your filters.' : undefined
          }
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
