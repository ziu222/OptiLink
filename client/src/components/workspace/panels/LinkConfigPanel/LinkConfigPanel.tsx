import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ContentPanel } from '../ContentPanel/ContentPanel';
import { Field } from '../../Field/Field';
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
          <Field
            label="Title"
            hint="A label for this link in your dashboard. Not shown to visitors."
            full
            error={errors.title?.message}
          >
            <input
              type="text"
              className="field-input"
              placeholder="Untitle"
              {...register('title')}
            />
          </Field>

          <Field
            label="Original URL"
            hint="The destination this short link redirects to. Set when the link was created."
          >
            <input className="field-input" disabled value={link.originalUrl} />
          </Field>

          <Field
            label="Short URL"
            hint="The shareable link. Built from the slug and can't be changed here."
          >
            <input className="field-input" disabled value={link.shortUrl} />
          </Field>

          <Field
            label="Status"
            hint="Active links redirect normally; inactive links stop redirecting."
          >
            <InputSelect
              ariaLabel="Status"
              value={watch('status')}
              onChange={(value) => setValue('status', value)}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
              ]}
            />
          </Field>

          <Field
            label="Redirect Mode"
            hint="Standard sends visitors straight to the destination. Splash shows a brief interstitial first."
          >
            <InputSelect
              ariaLabel="Redirect mode"
              value={watch('redirectMode')}
              onChange={(value) => setValue('redirectMode', value)}
              options={[
                { value: 'standard', label: 'Standard' },
                { value: 'splash', label: 'Splash' },
              ]}
            />
          </Field>

          <Field
            label="Password"
            hint="Require visitors to enter a password before the link redirects."
            error={errors.password?.message}
          >
            <div className="link-password-frame">
              <input
                type="password"
                className="field-input"
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
          </Field>

          <Field
            label="Expiry"
            hint="Date and time after which the link stops working. Leave blank for no expiry."
            error={errors.expiresAt?.message}
          >
            <input
              type="datetime-local"
              lang="en-GB"
              className="field-input"
              {...register('expiresAt')}
            />
          </Field>
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
