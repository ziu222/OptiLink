import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { applyServerError } from '../../lib/formError';
import { registerSchema } from './schemas';
import type { RegisterValues } from './schemas';
import './auth.css';

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
    return <Navigate to="/" replace />;
  }

  const onSubmit = handleSubmit(async (values) => {
    try {
      await registerUser(values);
      navigate('/', { replace: true });
    } catch (err) {
      applyServerError<RegisterValues>(err, setError);
    }
  });

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={onSubmit} noValidate>
        <h1>Create your account</h1>

        {errors.root && <p className="auth-form-error">{errors.root.message}</p>}

        <label className="auth-field">
          <span>Full name</span>
          <input type="text" autoComplete="name" {...register('fullName')} />
          {errors.fullName && <em className="auth-error">{errors.fullName.message}</em>}
        </label>

        <label className="auth-field">
          <span>Email</span>
          <input type="email" autoComplete="email" {...register('email')} />
          {errors.email && <em className="auth-error">{errors.email.message}</em>}
        </label>

        <label className="auth-field">
          <span>Password</span>
          <input type="password" autoComplete="new-password" {...register('password')} />
          {errors.password && <em className="auth-error">{errors.password.message}</em>}
        </label>

        <label className="auth-field">
          <span>Confirm password</span>
          <input type="password" autoComplete="new-password" {...register('confirmPassword')} />
          {errors.confirmPassword && (
            <em className="auth-error">{errors.confirmPassword.message}</em>
          )}
        </label>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating…' : 'Sign up'}
        </button>

        <p className="auth-alt">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
}
