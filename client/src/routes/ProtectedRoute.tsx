import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './routeStatus.css';

export function ProtectedRoute() {
  const { status } = useAuth();

  if (status === 'loading') {
    return <p className="route-status">Loading…</p>;
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
