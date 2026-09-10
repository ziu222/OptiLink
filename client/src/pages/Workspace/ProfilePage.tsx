import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../contexts/AuthContext';
import { applyServerError } from '../../lib/formError';
import { PageHeader } from '../../components/workspace/PageHeader/PageHeader';
import { ContentPanel } from '../../components/workspace/panels/ContentPanel/ContentPanel';
import { Button } from '../../components/workspace/Button/Button';
import { profileSchema } from './profileSchema';
import type { ProfileValues } from './profileSchema';
import './workspace.css';

export function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user?.username ?? '',
      fullName: user?.fullName ?? '',
      avatarUrl: user?.avatarUrl ?? '',
    },
  });

  const avatarUrl = watch('avatarUrl');

  const onSubmit = handleSubmit(async (values) => {
    try {
      await updateProfile({
        username: values.username.trim().toLowerCase(),
        fullName: values.fullName.trim(),
        avatarUrl: values.avatarUrl?.trim() || undefined,
      });
    } catch (err) {
      applyServerError<ProfileValues>(err, setError);
    }
  });

  return (
    <>
      <PageHeader title="Account Information" />
      <section className="profile-page">
        <ContentPanel title="My Profile" className="profile-panel">
          <form onSubmit={onSubmit} className="profile-form">
            {errors.root && <p className="profile-error">{errors.root.message}</p>}

            <div className="profile-grid">
              <div className="profile-avatar-column">
                <div className="profile-avatar-frame">
                  <div className="profile-avatar-inner">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="" className="profile-avatar-image" />
                    ) : (
                      <span>
                        {(user?.fullName || user?.username || '').charAt(0).toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                </div>

                <label className="profile-field">
                  <span className="profile-label">Avatar URL</span>
                  <input
                    type="text"
                    placeholder="https://…"
                    className="profile-input"
                    {...register('avatarUrl')}
                  />
                  {errors.avatarUrl && <em className="profile-field-error">{errors.avatarUrl.message}</em>}
                </label>
              </div>

              <div className="profile-fields-column">
                <label className="profile-field">
                  <span className="profile-label">Full name</span>
                  <input type="text" className="profile-input" {...register('fullName')} />
                  {errors.fullName && <em className="profile-field-error">{errors.fullName.message}</em>}
                </label>

                <label className="profile-field">
                  <span className="profile-label">User name</span>
                  <input type="text" className="profile-input" {...register('username')} />
                  {errors.username && (
                    <em className="profile-field-error">{errors.username.message}</em>
                  )}
                </label>

                <label className="profile-field">
                  <span className="profile-label">Email</span>
                  <input type="email" disabled value={user?.email ?? ''} className="profile-input" />
                </label>

                <label className="profile-field">
                  <span className="profile-label">Password</span>
                  <input
                    type="password"
                    disabled
                    placeholder="Not available yet"
                    className="profile-input"
                  />
                </label>
              </div>
            </div>

            <div className="profile-actions">
              {isSubmitSuccessful && !errors.root && <span className="profile-saved">Saved.</span>}
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving…' : 'Save changes'}
              </Button>
            </div>
          </form>
        </ContentPanel>
      </section>
    </>
  );
}
