import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { DarkModeSwitch } from '../DarkModeSwitch';
import './header.css';

const navLinks = [
  { label: 'Features', to: '/#features' },
  { label: 'Pricing', to: '/#pricing' },
  { label: 'FAQ', to: '/#faq' },
];

export function Header() {
  const { user, status, logout } = useAuth();
  const navigate = useNavigate();

  const navItems =
    status === 'authenticated' ? [...navLinks, { label: 'Dashboard', to: '/dashboard' }] : navLinks;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="site-header">
      <div className="site-header__bar">
        <Link to="/" className="site-header__logo">
          OptiLink
        </Link>

        <nav className="site-header__nav">
          {navItems.map(({ label, to }) => (
            <Link key={label} to={to} className="site-header__link">
              {label}
            </Link>
          ))}
        </nav>

        {status === 'authenticated' ? (
          <div className="site-header__actions">
            <DarkModeSwitch compact />
            <button type="button" onClick={handleLogout} className="site-header__logout">
              Log out
            </button>
            <Link to="/dashboard" title="Go to dashboard" className="site-header__avatar">
              {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
            </Link>
          </div>
        ) : (
          <div className="site-header__actions">
            <DarkModeSwitch compact />
            <Link to="/login" className="site-header__login">
              Login
            </Link>
            <Link to="/register" className="site-header__register">
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
