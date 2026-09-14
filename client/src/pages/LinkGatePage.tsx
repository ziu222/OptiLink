import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { Header } from '../components/Header/Header';
import { Footer } from '../components/Footer/Footer';
import { ContentPanel } from '../components/workspace/panels/ContentPanel/ContentPanel';
import { applyServerError } from '../lib/formError';
import { verifyLinkPassword } from '../api/links';
import './auth/authForm.css';

const gateSchema = z.object({
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

type GateValues = z.infer<typeof gateSchema>;

export function LinkGatePage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const src = searchParams.get('src') ?? undefined;
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<GateValues>({ resolver: zodResolver(gateSchema) });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const originalUrl = await verifyLinkPassword(slug ?? '', values.password, src);
      window.location.assign(originalUrl);
    } catch (err) {
      applyServerError<GateValues>(err, setError);
    }
  });

  return (
    <div className="authform-shell">
      <Header forceGuest />

      <main className="authform-main">
        <div className="gate-center">
          <ContentPanel title="Mật khẩu liên kết" className="gate-panel">
            <form className="gate-form" onSubmit={onSubmit} noValidate>
              {errors.root && <p className="authform-error">{errors.root.message}</p>}

              <label className="authform-field">
                <span className="authform-label">Mật khẩu</span>
                <input
                  type="password"
                  autoComplete="off"
                  autoFocus
                  className="authform-input"
                  {...register('password')}
                />
                {errors.password && (
                  <em className="authform-field-error">{errors.password.message}</em>
                )}
              </label>

              <p className="gate-hint">
                Liên kết này được bảo vệ. Nhập mật khẩu do chủ liên kết đặt để tiếp tục.
              </p>

              <button type="submit" disabled={isSubmitting} className="authform-submit">
                {isSubmitting ? 'Đang kiểm tra…' : 'Tiếp tục'}
                {!isSubmitting && <span>→</span>}
              </button>
            </form>
          </ContentPanel>
        </div>
      </main>

      <Footer />
    </div>
  );
}
