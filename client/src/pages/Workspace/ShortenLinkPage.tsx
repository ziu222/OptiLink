import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PageHeader } from '../../components/workspace/PageHeader';
import { ContentPanel } from '../../components/workspace/ContentPanel';
import { OptionTabs } from '../../components/OptionTabs';
import { MenuSelect } from '../../components/MenuSelect';
import { ShortenedLinksPanel } from '../../components/workspace/ShortenedLinksPanel';
import { applyServerError } from '../../lib/formError';
import { createLink, listLinks } from '../../api/links';
import { shortenLinkSchema } from './shortenLinkSchema';
import type { ShortenLinkValues } from './shortenLinkSchema';
import type { ShortenedLink } from '../../api/links';
import './workspace.css';

type OptionTab = 'none' | 'basic' | 'access';

const TAB_ITEMS: { id: OptionTab; label: string }[] = [
  { id: 'none', label: 'None' },
  { id: 'basic', label: 'Basic' },
  { id: 'access', label: 'Access Control' },
];

export function ShortenLinkPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<OptionTab>('none');
  const [links, setLinks] = useState<ShortenedLink[]>([]);
  const [loadingLinks, setLoadingLinks] = useState(true);
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
    listLinks()
      .then((result) => setLinks(result.links))
      .catch(() => {
        /* keep an empty list if the request fails */
      })
      .finally(() => setLoadingLinks(false));
  }, []);

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
      <ContentPanel title="Shorten a Link" className="shorten-panel">
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
                  <MenuSelect
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
                  <MenuSelect
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
                <input type="datetime-local" className="profile-input" {...register('expiresAt')} />
                {errors.expiresAt && <em className="profile-field-error">{errors.expiresAt.message}</em>}
              </label>
            </div>
          )}

        </form>
      </ContentPanel>

      {loadingLinks ? (
        <ContentPanel title="Shortened Links" className="shorten-list-panel">
          <p className="link-list-empty">Loading…</p>
        </ContentPanel>
      ) : (
        <ShortenedLinksPanel links={links} />
      )}
    </>
  );
}
