import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ContentPanel } from '../ContentPanel/ContentPanel';
import { InputSelect } from '../../menu/InputSelect/InputSelect';
import { MenuButton } from '../../menu/MenuButton/MenuButton';
import { applyServerError } from '../../../../lib/formError';
import { updateLink } from '../../../../api/links';
import type { ShortenedLink } from '../../../../api/links';
import './LinkConfigPanel.css';

interface LinkConfigPanelProps {
  link: ShortenedLink;
  onSaved: (link: ShortenedLink) => void;
}

interface ConfigValues {
  title: string;
  status: 'active' | 'inactive';
  redirectMode: 'standard' | 'splash';
  expiresAt: string;
  password: string;
}

function toDatetimeLocal(iso?: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

function buildDefaults(link: ShortenedLink): ConfigValues {
  return {
    title: link.title ?? '',
    status: (link.isActive ?? true) ? 'active' : 'inactive',
    redirectMode: link.redirectMode ?? 'standard',
    expiresAt: toDatetimeLocal(link.expiresAt),
    password: '',
  };
}

// Editable view of a link's settings.
export function LinkConfigPanel({ link, onSaved }: LinkConfigPanelProps) {
  const [saved, setSaved] = useState(false);
  const [clearPassword, setClearPassword] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ConfigValues>({ defaultValues: buildDefaults(link) });

  useEffect(() => {
    reset(buildDefaults(link));
    setClearPassword(false);
  }, [link, reset]);

  const onSubmit = handleSubmit(async (values) => {
    setSaved(false);
    try {
      const updated = await updateLink(link.id, {
        title: values.title,
        status: values.status,
        redirectMode: values.redirectMode,
        expiresAt: values.expiresAt ? new Date(values.expiresAt).toISOString() : '',
        // '' removes the password; a value sets/changes it; undefined leaves it unchanged
        password: clearPassword ? '' : values.password || undefined,
      });
      onSaved(updated);
      reset(buildDefaults(updated));
      setClearPassword(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      applyServerError<ConfigValues>(err, setError);
    }
  });

  return (
    <ContentPanel title="Shortened Link Configuration">
      <form onSubmit={onSubmit}>
        {errors.root && <p className="profile-error">{errors.root.message}</p>}

        <div className="link-config">
          <div className="link-config-item link-config-item--full">
            <span className="link-config-label">Title</span>
            <input
              type="text"
              className="profile-input"
              placeholder="Untitle"
              {...register('title')}
            />
            {errors.title && <em className="profile-field-error">{errors.title.message}</em>}
          </div>

          <div className="link-config-item">
            <span className="link-config-label">Original URL</span>
            <input
              className="profile-input link-config-readonly"
              disabled
              value={link.originalUrl}
            />
          </div>

          <div className="link-config-item">
            <span className="link-config-label">Short URL</span>
            <input
              className="profile-input link-config-readonly"
              disabled
              value={link.shortUrl}
            />
          </div>

          <div className="link-config-item">
            <span className="link-config-label">Status</span>
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

          <div className="link-config-item">
            <span className="link-config-label">Redirect Mode</span>
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

          <div className="link-config-item">
            <span className="link-config-label">Password</span>
            <div className="link-password-frame">
              <input
                type="password"
                className="profile-input"
                autoComplete="new-password"
                disabled={clearPassword}
                placeholder={
                  clearPassword
                    ? 'Password will be removed'
                    : link.hasPassword
                      ? 'Leave blank to keep current'
                      : 'Leave blank for no password'
                }
                {...register('password')}
              />
              <div className="link-password-sep" aria-hidden="true" />
              <MenuButton
                label={clearPassword ? 'Removing' : link.hasPassword ? 'Protected' : 'None'}
                ariaLabel="Password options"
                items={
                  clearPassword
                    ? [
                        {
                          key: 'keep',
                          label: 'Keep current password',
                          onSelect: () => setClearPassword(false),
                        },
                      ]
                    : [
                        {
                          key: 'remove',
                          label: 'Remove password',
                          disabled: !link.hasPassword,
                          onSelect: () => setClearPassword(true),
                        },
                      ]
                }
              />
            </div>
            {errors.password && (
              <em className="profile-field-error">{errors.password.message}</em>
            )}
          </div>

          <div className="link-config-item">
            <span className="link-config-label">Expiry</span>
            <input
              type="datetime-local"
              lang="en-GB"
              className="profile-input"
              {...register('expiresAt')}
            />
            {errors.expiresAt && (
              <em className="profile-field-error">{errors.expiresAt.message}</em>
            )}
          </div>
        </div>

        <div className="profile-actions">
          {saved && <span className="profile-saved">Saved.</span>}
          <button type="submit" disabled={isSubmitting} className="profile-submit">
            {isSubmitting ? 'Updating…' : 'Update'}
          </button>
        </div>
      </form>
    </ContentPanel>
  );
}
