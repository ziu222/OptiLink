import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PageHeader } from '../../components/workspace/PageHeader';
import { ContentPanel } from '../../components/workspace/ContentPanel';
import { shortenLinkSchema } from './shortenLinkSchema';
import type { ShortenLinkValues } from './shortenLinkSchema';
import './workspace.css';

type OptionTab = 'none' | 'basic' | 'access';

const TAB_ITEMS: { id: Exclude<OptionTab, 'none'>; label: string }[] = [
  { id: 'basic', label: 'Basic' },
  { id: 'access', label: 'Access Control' },
];

export function ShortenLinkPage() {
  const [activeTab, setActiveTab] = useState<OptionTab>('none');
  const {
    register,
    handleSubmit,
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

          <div className="shorten-tabs">
            <button
              type="button"
              className={`shorten-tab${activeTab === 'none' ? ' is-active' : ''}`}
              onClick={() => setActiveTab('none')}
            >
              None
            </button>
            {TAB_ITEMS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                className={`shorten-tab${activeTab === id ? ' is-active' : ''}`}
                onClick={() => setActiveTab((current) => (current === id ? 'none' : id))}
              >
                {label}
              </button>
            ))}
          </div>

          {activeTab === 'basic' && (
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
    </>
  );
}
