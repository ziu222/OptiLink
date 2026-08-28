import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { applyServerError } from '../../lib/formError';
import { loginSchema } from './schemas';
import type { LoginValues } from './schemas';
import './auth.css';

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
    return <Navigate to="/" replace />;
  }

  const onSubmit = handleSubmit(async (values) => {
    try {
      await login(values.email, values.password);
      navigate('/', { replace: true });
    } catch (err) {
      applyServerError<LoginValues>(err, setError);
    }
  });

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={onSubmit} noValidate>
        <h1>Log in</h1>

        {errors.root && <p className="auth-form-error">{errors.root.message}</p>}

        <label className="auth-field">
          <span>Email</span>
          <input type="email" autoComplete="email" {...register('email')} />
          {errors.email && <em className="auth-error">{errors.email.message}</em>}
        </label>

        <label className="auth-field">
          <span>Password</span>
          <input type="password" autoComplete="current-password" {...register('password')} />
          {errors.password && <em className="auth-error">{errors.password.message}</em>}
        </label>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Logging in…' : 'Log in'}
        </button>

        <p className="auth-alt">
          No account? <Link to="/register">Create one</Link>
        </p>
      </form>
    </div>
  );
}
