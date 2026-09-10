import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { DarkModeSwitch } from '../DarkMode/DarkModeSwitch';
import { KebabNav } from './KebabNav/KebabNav';
import './header.css';

const navLinks = [
  { label: 'Features', to: '/#features' },
  { label: 'Pricing', to: '/#pricing' },
  { label: 'FAQ', to: '/#faq' },
];

interface HeaderProps {
  /** Luôn hiển thị các hành động khi chưa đăng nhập (Login / Register), kể cả khi người dùng đã đăng nhập. */
  forceGuest?: boolean;
}

export function Header({ forceGuest = false }: HeaderProps) {
  const { user, status, logout } = useAuth();
  const navigate = useNavigate();

  const authed = status === 'authenticated' && !forceGuest;

  // Tài khoản mới chưa có fullName — dùng tạm username để lấy chữ cái đầu cho avatar.
  const displayName = user?.fullName || user?.username || '';

  const navItems = authed ? [...navLinks, { label: 'Dashboard', to: '/dashboard' }] : navLinks;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="site-header">
      <div className="site-header-bar">
        <Link to="/" className="site-header-logo">
          OptiLink
        </Link>

        <nav className="site-header-nav">
          {navItems.map(({ label, to }) => (
            <Link key={label} to={to} className="site-header-link">
              {label}
            </Link>
          ))}
        </nav>

        {authed ? (
          <div className="site-header-actions">
            <DarkModeSwitch compact />
            <button type="button" onClick={handleLogout} className="site-header-logout">
              Log out
            </button>
            <Link to="/dashboard" title="Go to dashboard" className="site-header-avatar">
              {displayName ? displayName.charAt(0).toUpperCase() : 'U'}
            </Link>
            <KebabNav
              authed
              navItems={navItems}
              initial={displayName ? displayName.charAt(0).toUpperCase() : 'U'}
              onLogout={handleLogout}
            />
          </div>
        ) : (
          <div className="site-header-actions">
            <DarkModeSwitch compact />
            <Link to="/login" className="site-header-login">
              Login
            </Link>
            <Link to="/register" className="site-header-register">
              Register
            </Link>
            <KebabNav authed={false} navItems={navItems} onLogout={handleLogout} />
          </div>
        )}
      </div>
    </header>
  );
}
