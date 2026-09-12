import { useForm, useWatch } from 'react-hook-form';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../contexts/AuthContext';
import { applyServerError } from '../../lib/formError';
import { PageHeader } from '../../components/workspace/PageHeader/PageHeader';
import { ContentPanel } from '../../components/workspace/panels/ContentPanel/ContentPanel';
import { Button } from '../../components/workspace/Button/Button';
import { uploadBioMedia } from '../../api/bio';
import { profileSchema } from './profileSchema';
import type { ProfileValues } from './profileSchema';
import './workspace.css';
import './ProfilePage.css';
import { LoadingCircle } from '../../components/workspace/LoadingCircle/LoadingCircle';

export function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [saved, setSaved] = useState(false);
  const [failedAvatar, setFailedAvatar] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? '');
  const [avatarDirty, setAvatarDirty] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    setError,
    clearErrors,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user?.username ?? '',
      fullName: user?.fullName ?? '',
    },
  });

  const [fullName, username] = useWatch({ control, name: ['fullName', 'username'] });
  const displayName = fullName || username || 'Your profile';

  const onSubmit = handleSubmit(async (values) => {
    setSaved(false);
    try {
      await updateProfile({
        username: values.username.trim().toLowerCase(),
        fullName: values.fullName.trim(),
        avatarUrl: avatarUrl || undefined,
      });
      reset({ ...values, username: values.username.trim().toLowerCase(), fullName: values.fullName.trim() });
      setAvatarDirty(false);
      setSaved(true);
    } catch (err) {
      applyServerError<ProfileValues>(err, setError);
    }
  });

  const handleAvatarUpload = async (file: File | undefined) => {
    if (!file) return;
    setSaved(false);
    setUploadingAvatar(true);
    clearErrors('root');
    const previousUrl = avatarUrl;
    const previewUrl = URL.createObjectURL(file);
    setAvatarUrl(previewUrl);
    try {
      const permanentUrl = await uploadBioMedia(file);
      setAvatarUrl(permanentUrl);
      setAvatarDirty(true);
      setFailedAvatar('');
    } catch {
      setAvatarUrl(previousUrl);
      setError('root', { message: 'Không thể tải ảnh lên. Hãy thử lại.' });
    } finally {
      URL.revokeObjectURL(previewUrl);
      setUploadingAvatar(false);
    }
  };

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

                <label className={`profile-avatar-upload${uploadingAvatar ? ' is-uploading' : ''}`}>
                  <span>{uploadingAvatar ? <LoadingCircle inline label="Đang tải ảnh…" /> : 'Tải ảnh avatar'}</span>
                  <small>PNG, JPG hoặc WebP · ảnh vuông hiển thị đẹp nhất</small>
                  <input type="file" disabled={uploadingAvatar || isSubmitting} accept="image/png,image/jpeg,image/webp" onChange={(event) => void handleAvatarUpload(event.target.files?.[0])} />
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
              <span className={saved ? 'profile-saved' : 'profile-hint'} role="status">{saved ? 'Đã lưu thay đổi.' : isDirty || avatarDirty ? 'Bạn có thay đổi chưa lưu.' : 'Thông tin tài khoản của bạn.'}</span>
              <Button type="submit" disabled={isSubmitting || uploadingAvatar || (!isDirty && !avatarDirty)}>
                {isSubmitting ? <LoadingCircle inline label="Đang lưu…" /> : 'Save changes'}
              </Button>
            </div>
          </form>
        </ContentPanel>
      </section>
    </>
  );
}
