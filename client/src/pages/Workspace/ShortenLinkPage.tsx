import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PageHeader } from '../../components/workspace/PageHeader';
import { ContentPanel } from '../../components/workspace/ContentPanel';
import { OptionTabs } from '../../components/OptionTabs';
import { MenuSelect } from '../../components/MenuSelect';
import { ShortenedLinksPanel } from '../../components/workspace/ShortenedLinksPanel';
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

// Placeholder rows until the list is wired to GET /api/links.
const SAMPLE_LINKS: ShortenedLink[] = [
  {
    id: '1',
    title: 'Spring campaign landing page',
    originalUrl: 'https://example.com/marketing/spring-2026/landing?utm_source=newsletter&utm_medium=email',
    shortUrl: 'https://opti.link/spring',
    slug: 'spring',
    clicks: 1284,
    isActive: true,
  },
  {
    id: '2',
    title: 'Docs — getting started',
    originalUrl: 'https://docs.example.com/guides/getting-started/introduction',
    shortUrl: 'https://opti.link/docs-start',
    slug: 'docs-start',
    clicks: 342,
    isActive: true,
  },
  {
    id: '3',
    title: 'Old promo (retired)',
    originalUrl: 'https://example.com/promo/black-friday-2025',
    shortUrl: 'https://opti.link/bf25',
    slug: 'bf25',
    clicks: 57,
    isActive: false,
  },
];

export function ShortenLinkPage() {
  const [activeTab, setActiveTab] = useState<OptionTab>('none');
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting, isSubmitSuccessful },
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

  const onSubmit = handleSubmit(async () => {
    // TODO: wire to POST /api/links once the backend route exists.
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

          {isSubmitSuccessful && !errors.root && (
            <span className="profile-saved">Link created (stub).</span>
          )}
        </form>
      </ContentPanel>

      <ShortenedLinksPanel links={SAMPLE_LINKS} />
    </>
  );
}
