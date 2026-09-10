import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { applyServerError } from '../../lib/formError';
import { Header } from '../../components/Header/Header';
import { Footer } from '../../components/Footer/Footer';
import { PictureFrame } from '../../components/PictureFrame/PictureFrame';
import { OAuthButtons } from './OAuthButtons';
import { registerSchema } from './schemas';
import type { RegisterValues } from './schemas';
import heroIllustration from '../../assets/hero-shorten-illustration.png';
import './authForm.css';

export function RegisterPage() {
  const { status, register: registerUser } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) });

  if (status === 'authenticated') {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = handleSubmit(async (values) => {
    try {
      await registerUser(values);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      applyServerError<RegisterValues>(err, setError);
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
            alt="Shorten a long link into a branded opti.link URL"
          />

          <form className="authform-panel" onSubmit={onSubmit} noValidate>
            <h1 className="authform-title">Create an Account</h1>

            {errors.root && <p className="authform-error">{errors.root.message}</p>}

            <label className="authform-field">
              <span className="authform-label">Username</span>
              <input
                type="text"
                autoComplete="username"
                className="authform-input"
                {...register('username')}
              />
              {errors.username && <em className="authform-field-error">{errors.username.message}</em>}
            </label>

            <label className="authform-field">
              <span className="authform-label">Email</span>
              <input type="email" autoComplete="email" className="authform-input" {...register('email')} />
              {errors.email && <em className="authform-field-error">{errors.email.message}</em>}
            </label>

            <label className="authform-field">
              <span className="authform-label">Password</span>
              <input
                type="password"
                autoComplete="new-password"
                className="authform-input"
                {...register('password')}
              />
              {errors.password && <em className="authform-field-error">{errors.password.message}</em>}
            </label>

            <label className="authform-field">
              <span className="authform-label">Confirm password</span>
              <input
                type="password"
                autoComplete="new-password"
                className="authform-input"
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <em className="authform-field-error">{errors.confirmPassword.message}</em>
              )}
            </label>

            <button type="submit" disabled={isSubmitting} className="authform-submit">
              {isSubmitting ? 'Creating account…' : 'Create account'}
              {!isSubmitting && <span>→</span>}
            </button>

            <OAuthButtons />

            <p className="authform-footer">
              Already have an account? <Link to="/login">Log in</Link>
            </p>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
