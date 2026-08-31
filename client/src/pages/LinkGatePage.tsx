import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams } from 'react-router-dom';
import { z } from 'zod';
import { Header } from '../components/Header/Header';
import { Footer } from '../components/Footer/Footer';
import { ContentPanel } from '../components/workspace/ContentPanel';
import { applyServerError } from '../lib/formError';
import { verifyLinkPassword } from '../api/links';
import './auth/authForm.css';

const gateSchema = z.object({
  password: z.string().min(1, 'Enter the password'),
});

type GateValues = z.infer<typeof gateSchema>;

export function LinkGatePage() {
  const { slug } = useParams<{ slug: string }>();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<GateValues>({ resolver: zodResolver(gateSchema) });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const originalUrl = await verifyLinkPassword(slug ?? '', values.password);
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
          <ContentPanel title="Link Password" className="gate-panel">
            <form className="gate-form" onSubmit={onSubmit} noValidate>
              {errors.root && <p className="authform-error">{errors.root.message}</p>}

              <label className="authform-field">
                <span className="authform-label">Password</span>
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
                This link is protected. Enter the password the link owner set to continue.
              </p>

              <button type="submit" disabled={isSubmitting} className="authform-submit">
                {isSubmitting ? 'Checking…' : 'Continue'}
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
