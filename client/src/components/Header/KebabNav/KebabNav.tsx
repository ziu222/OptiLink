import { useCallback, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { EllipsisVertical } from 'lucide-react';
import { getTheme, setTheme } from '../../../lib/theme';
import { useDismiss } from '../../../lib/useDismiss';
import './KebabNav.css';

interface KebabNavProps {
  authed: boolean;
  /** Same list the desktop nav renders — Features/Pricing/FAQ (+ Dashboard when authed). */
  navItems: { label: string; to: string }[];
  /** Single letter for the profile-frame trigger; only used when authed. */
  initial?: string;
  onLogout: () => void;
}

// Dưới 1024px, thanh nav căn giữa của site-header, các hành động đăng nhập và
// nút đổi giao diện gộp vào menu này. Từ >=1024px thì KebabNav.css ẩn nó đi.
// Nút mở là khung hồ sơ khi đã đăng nhập, ngược lại là biểu tượng ba chấm.
// Menu đóng khi bấm ra ngoài, khi nhấn Escape, và sau khi chọn một mục
// nav/đăng nhập (riêng hàng đổi giao diện vẫn giữ menu mở để thấy thay đổi).
export function KebabNav({ authed, navItems, initial, onLogout }: KebabNavProps) {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(getTheme() === 'dark');
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const close = useCallback(() => setOpen(false), []);
  useDismiss(rootRef, open, close);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    setTheme(next ? 'dark' : 'light');
  };

  return (
    <div className="kebab-nav" ref={rootRef}>
      <button
        type="button"
        className={`kebab-nav-trigger${authed ? ' kebab-nav-trigger--avatar' : ''}`}
        aria-label="Menu"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((current) => !current)}
      >
        {authed ? initial || 'U' : <EllipsisVertical size={22} aria-hidden="true" />}
      </button>

      {open && (
        <div id={menuId} className="kebab-nav-panel" role="menu">
          {navItems.map(({ label, to }) => (
            <Link
              key={label}
              to={to}
              role="menuitem"
              className="kebab-nav-item"
              onClick={close}
            >
              {label}
            </Link>
          ))}

          <div className="kebab-nav-divider" />

          <button
            type="button"
            role="menuitem"
            className="kebab-nav-item"
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            onClick={toggleTheme}
          >
            {dark ? 'Light mode' : 'Dark mode'}
          </button>

          <div className="kebab-nav-divider" />

          {authed ? (
            <button
              type="button"
              role="menuitem"
              className="kebab-nav-item"
              onClick={() => {
                close();
                onLogout();
              }}
            >
              Log out
            </button>
          ) : (
            <>
              <Link to="/login" role="menuitem" className="kebab-nav-item" onClick={close}>
                Login
              </Link>
              <Link to="/register" role="menuitem" className="kebab-nav-item" onClick={close}>
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
