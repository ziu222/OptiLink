import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import './WorkspaceTopbar.css';

// Mobile-only bar (hidden >=1024px) that holds the hamburger for the sidebar
// drawer. The dashboard has no desktop top bar; this only exists so the nav is
// reachable once the sidebar goes off-canvas. See WorkspaceLayout.
export function WorkspaceTopbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { user } = useAuth();
  const displayName = user?.fullName || user?.username || '';

  return (
    <header className="workspace-topbar">
      <button
        type="button"
        className="workspace-topbar-menu"
        onClick={onMenuClick}
        aria-label="Open navigation"
      >
        <Menu size={22} aria-hidden="true" />
      </button>
      <Link to="/" className="workspace-topbar-brand">
        OptiLink
      </Link>
      <Link
        to="/dashboard/profile"
        className="workspace-topbar-avatar"
        aria-label="My profile"
      >
        {displayName ? displayName.charAt(0).toUpperCase() : 'U'}
      </Link>
    </header>
  );
}
