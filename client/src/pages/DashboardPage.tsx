import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './auth/auth.css';

export function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Welcome, {user?.fullName}</h1>
        <p className="dash-email">{user?.email}</p>
        <p className="dash-meta">
          Role: <strong>{user?.role}</strong> &middot; Tier: <strong>{user?.tier}</strong>
        </p>

        <div className="dash-actions">
          <Link className="dash-link" to="/builder">
            Open bio builder
          </Link>
          <button type="button" onClick={onLogout}>
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}
