import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { applyServerError } from '../../lib/formError';
import { Header } from '../../components/Header/Header';
import { Footer } from '../../components/Footer/Footer';
import { PictureFrame } from '../../components/PictureFrame/PictureFrame';
import { OAuthButtons } from './OAuthButtons';
import { loginSchema } from './schemas';
import type { LoginValues } from './schemas';
import heroIllustration from '../../assets/hero-shorten-illustration.png';
import './authForm.css';

export function LoginPage() {
  const { status, user, login } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  if (status === 'authenticated') {
    return <Navigate to={user?.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }

  const onSubmit = handleSubmit(async (values) => {
    try {
      const loggedInUser = await login(values.identifier, values.password);
      navigate(loggedInUser.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    } catch (err) {
      applyServerError<LoginValues>(err, setError);
    }
  });

  return (
    <div className="authform-shell">
      <Header />

      <main className="authform-main">
        <div className="authform-layout">
          <PictureFrame
            className="authform-frame"
            src={heroIllustration}
            alt="Rút gọn một liên kết dài thành URL opti.link mang thương hiệu riêng"
          />

          <form className="authform-panel" onSubmit={onSubmit} noValidate>
            <h1 className="authform-title">Chào mừng trở lại</h1>

            {errors.root && <p className="authform-error">{errors.root.message}</p>}

            <label className="authform-field">
              <span className="authform-label">Email hoặc tên đăng nhập</span>
              <input
                type="text"
                autoComplete="username"
                className="authform-input"
                {...register('identifier')}
              />
              {errors.identifier && (
                <em className="authform-field-error">{errors.identifier.message}</em>
              )}
            </label>

            <label className="authform-field">
              <div className="authform-row">
                <span className="authform-label">Mật khẩu</span>
                <a href="#" className="authform-hint-link">
                  Quên mật khẩu?
                </a>
              </div>
              <input
                type="password"
                autoComplete="current-password"
                className="authform-input"
                {...register('password')}
              />
              {errors.password && <em className="authform-field-error">{errors.password.message}</em>}
            </label>

            <button type="submit" disabled={isSubmitting} className="authform-submit">
              {isSubmitting ? 'Đang đăng nhập…' : 'Đăng nhập'}
              {!isSubmitting && <span>→</span>}
            </button>

            <OAuthButtons />

            <p className="authform-footer">
              Chưa có tài khoản? <Link to="/register">Đăng ký miễn phí</Link>
            </p>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
