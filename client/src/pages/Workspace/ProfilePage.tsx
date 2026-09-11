import { useForm, useWatch } from 'react-hook-form';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../contexts/AuthContext';
import { applyServerError } from '../../lib/formError';
import { PageHeader } from '../../components/workspace/PageHeader/PageHeader';
import { ContentPanel } from '../../components/workspace/panels/ContentPanel/ContentPanel';
import { Button } from '../../components/workspace/Button/Button';
import { profileSchema } from './profileSchema';
import type { ProfileValues } from './profileSchema';
import './workspace.css';
import './ProfilePage.css';

export function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [saved, setSaved] = useState(false);
  const [failedAvatar, setFailedAvatar] = useState('');
  const {
    register,
    handleSubmit,
    control,
    setError,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user?.username ?? '',
      fullName: user?.fullName ?? '',
      avatarUrl: user?.avatarUrl ?? '',
    },
  });

  const [avatarUrl, fullName, username] = useWatch({ control, name: ['avatarUrl', 'fullName', 'username'] });
  const displayName = fullName || username || 'Your profile';

  const onSubmit = handleSubmit(async (values) => {
    setSaved(false);
    try {
      await updateProfile({
        username: values.username.trim().toLowerCase(),
        fullName: values.fullName.trim(),
        avatarUrl: values.avatarUrl?.trim() || undefined,
      });
      reset({ ...values, username: values.username.trim().toLowerCase(), fullName: values.fullName.trim() });
      setSaved(true);
    } catch (err) {
      applyServerError<ProfileValues>(err, setError);
    }
  });

  return (
    <>
      <PageHeader title="Your profile" />
      <section className="profile-page">
        <div className="profile-intro"><div><p className="profile-eyebrow">MAKE IT YOURS</p><h2>A familiar face. A personal space.</h2><p>Quản lý thông tin tài khoản của bạn tại một nơi.</p></div><Link to="/builder" className="profile-bio-link">Thiết kế biopage ↗</Link></div>
        <ContentPanel title="Personal details" className="profile-panel">
          <form onSubmit={onSubmit} className="profile-form" onChange={() => setSaved(false)}>
            {errors.root && <p role="alert" className="profile-error">{errors.root.message}</p>}

            <div className="profile-grid">
              <div className="profile-avatar-column">
                <div className="profile-avatar-frame">
                  <div className="profile-avatar-inner">
                    {avatarUrl && avatarUrl !== failedAvatar ? (
                      <img src={avatarUrl} alt="" className="profile-avatar-image" onError={() => setFailedAvatar(avatarUrl)} />
                    ) : (
                      <span>
                        {displayName.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="profile-identity"><strong>{displayName}</strong><span>@{username || 'username'}</span></div>

                <label className="profile-field">
                  <span className="profile-label">Avatar URL</span>
                  <input
                    type="text"
                    placeholder="https://…"
                    className="profile-input"
                    aria-invalid={!!errors.avatarUrl}
                    aria-describedby="avatar-help"
                    {...register('avatarUrl')}
                  />
                  <small id="avatar-help" className="profile-hint">Dùng đường dẫn ảnh công khai. Ảnh vuông sẽ hiển thị đẹp nhất.</small>
                  {errors.avatarUrl && <em className="profile-field-error">{errors.avatarUrl.message}</em>}
                </label>
              </div>

              <div className="profile-fields-column">
                <label className="profile-field">
                  <span className="profile-label">Full name</span>
                  <input type="text" autoComplete="name" aria-invalid={!!errors.fullName} className="profile-input" {...register('fullName')} />
                  {errors.fullName && <em className="profile-field-error">{errors.fullName.message}</em>}
                </label>

                <label className="profile-field">
                  <span className="profile-label">User name</span>
                  <input type="text" autoComplete="username" spellCheck={false} aria-invalid={!!errors.username} className="profile-input" {...register('username')} />
                  {errors.username && (
                    <em className="profile-field-error">{errors.username.message}</em>
                  )}
                </label>

                <label className="profile-field">
                  <span className="profile-label">Email</span>
                  <input type="email" disabled value={user?.email ?? ''} className="profile-input" />
                </label>

                <p className="profile-security-note">Email gắn với tài khoản đăng nhập và không thể chỉnh sửa tại đây. Đổi mật khẩu chưa được hỗ trợ.</p>
              </div>
            </div>

            <div className="profile-actions">
              <span className={saved ? 'profile-saved' : 'profile-hint'} role="status">{saved ? 'Đã lưu thay đổi.' : isDirty ? 'Bạn có thay đổi chưa lưu.' : 'Thông tin tài khoản của bạn.'}</span>
              <Button type="submit" disabled={isSubmitting || !isDirty}>
                {isSubmitting ? 'Saving…' : 'Save changes'}
              </Button>
            </div>
          </form>
        </ContentPanel>
      </section>
    </>
  );
}
