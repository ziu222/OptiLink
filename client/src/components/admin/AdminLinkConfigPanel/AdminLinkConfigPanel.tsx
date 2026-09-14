import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ContentPanel } from '../../workspace/panels/ContentPanel/ContentPanel';
import { Button } from '../../workspace/Button/Button';
import { Field } from '../../workspace/Field/Field';
import { InputSelect } from '../../workspace/menu/InputSelect/InputSelect';
import { MenuButton } from '../../workspace/menu/MenuButton/MenuButton';
import { applyServerError } from '../../../lib/formError';
import { updateLink } from '../../../api/admin';
import type { AdminLink } from '../../../api/admin';
import './AdminLinkConfigPanel.css';

interface AdminLinkConfigPanelProps {
  link: AdminLink;
  onSaved: (link: AdminLink) => void;
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

function buildDefaults(link: AdminLink): ConfigValues {
  return {
    title: link.title ?? '',
    status: (link.isActive ?? true) ? 'active' : 'inactive',
    redirectMode: link.redirectMode ?? 'standard',
    expiresAt: toDatetimeLocal(link.expiresAt),
    password: '',
  };
}

// Admin's editable view of a link's settings — same fields/behavior as the
// owner's own LinkConfigPanel, backed by the admin API instead (no ownership
// check server-side).
export function AdminLinkConfigPanel({ link, onSaved }: AdminLinkConfigPanelProps) {
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
    <ContentPanel title="Cấu hình liên kết rút gọn">
      <form onSubmit={onSubmit}>
        {errors.root && <p className="profile-error">{errors.root.message}</p>}

        <div className="link-config">
          <Field
            label="Tiêu đề"
            hint="Tên gợi nhớ cho liên kết này trong bảng điều khiển. Không hiển thị với khách truy cập."
            full
            error={errors.title?.message}
          >
            <input
              type="text"
              className="field-input"
              placeholder="Chưa có tiêu đề"
              {...register('title')}
            />
          </Field>

          <Field
            label="URL gốc"
            hint="Địa chỉ đích mà liên kết rút gọn này chuyển hướng đến. Được đặt khi tạo liên kết."
          >
            <input className="field-input" disabled value={link.originalUrl} />
          </Field>

          <Field
            label="URL rút gọn"
            hint="Liên kết có thể chia sẻ. Được tạo từ slug và không thể thay đổi ở đây."
          >
            <input className="field-input" disabled value={link.shortUrl} />
          </Field>

          <Field
            label="Trạng thái"
            hint="Liên kết đang hoạt động sẽ chuyển hướng bình thường; liên kết ngừng hoạt động sẽ không chuyển hướng nữa."
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
            label="Mật khẩu"
            hint="Yêu cầu khách truy cập nhập mật khẩu trước khi liên kết chuyển hướng."
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
                    ? 'Mật khẩu sẽ được xóa'
                    : link.hasPassword
                      ? 'Để trống để giữ mật khẩu hiện tại'
                      : 'Để trống nếu không cần mật khẩu'
                }
                {...register('password')}
              />
              <div className="link-password-sep" aria-hidden="true" />
              <MenuButton
                label={clearPassword ? 'Đang xóa' : link.hasPassword ? 'Đã bảo vệ' : 'Không có'}
                ariaLabel="Tùy chọn mật khẩu"
                items={
                  clearPassword
                    ? [
                        {
                          key: 'keep',
                          label: 'Giữ mật khẩu hiện tại',
                          onSelect: () => setClearPassword(false),
                        },
                      ]
                    : [
                        {
                          key: 'remove',
                          label: 'Xóa mật khẩu',
                          disabled: !link.hasPassword,
                          onSelect: () => setClearPassword(true),
                        },
                      ]
                }
              />
            </div>
          </Field>

          <Field
            label="Hết hạn"
            hint="Ngày giờ mà sau đó liên kết ngừng hoạt động. Để trống nếu không giới hạn thời gian."
            error={errors.expiresAt?.message}
          >
            <input
              type="datetime-local"
              className="field-input"
              {...register('expiresAt')}
            />
          </Field>
        </div>

        <div className="profile-actions">
          {saved && <span className="profile-saved">Đã lưu.</span>}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Đang cập nhật…' : 'Cập nhật'}
          </Button>
        </div>
      </form>
    </ContentPanel>
  );
}
