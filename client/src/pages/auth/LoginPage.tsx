import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { applyServerError } from '../../lib/formError';
import { Header } from '../../components/Header/Header';
import { Footer } from '../../components/Footer/Footer';
import { PictureFrame } from '../../components/Home/PictureFrame';
import { OAuthButtons } from './OAuthButtons';
import { loginSchema } from './schemas';
import type { LoginValues } from './schemas';
import './authForm.css';

export function LoginPage() {
  const { status, login } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  if (status === 'authenticated') {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = handleSubmit(async (values) => {
    try {
      await login(values.email, values.password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      applyServerError<LoginValues>(err, setError);
    }
  });

  return (
    <div className="authform-shell">
      <Header />

      <main className="authform-main">
        <div className="authform-layout">
          <PictureFrame className="authform-frame" />

          <form className="authform-panel" onSubmit={onSubmit} noValidate>
            <h1 className="authform-title">Welcome Back</h1>

            {errors.root && <p className="authform-error">{errors.root.message}</p>}

            <label className="authform-field">
              <span className="authform-label">Email</span>
              <input type="email" autoComplete="email" className="authform-input" {...register('email')} />
              {errors.email && <em className="authform-field-error">{errors.email.message}</em>}
            </label>

            <label className="authform-field">
              <div className="authform-row">
                <span className="authform-label">Password</span>
                <a href="#" className="authform-hint-link">
                  Forgot password?
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
              {isSubmitting ? 'Logging in…' : 'Log in'}
              {!isSubmitting && <span>→</span>}
            </button>

            <OAuthButtons />

            <p className="authform-footer">
              No account? <Link to="/register">Sign up for free</Link>
            </p>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
