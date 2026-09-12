import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './routeStatus.css';
import { LoadingCircle } from '../components/workspace/LoadingCircle/LoadingCircle';

export function ProtectedRoute() {
  const { status } = useAuth();

  if (status === 'loading') {
    return <LoadingCircle label="Đang tải hồ sơ…" />;
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
