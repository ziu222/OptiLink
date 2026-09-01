import { useCallback, useId, useRef, useState } from 'react';
import { useDismiss } from '../lib/useDismiss';
import './menu.css';

export interface MenuItem {
  key: string;
  label: string;
  onSelect: () => void;
  disabled?: boolean;
  /** Render as a destructive action (red text + border). */
  danger?: boolean;
}

interface MenuProps {
  items: MenuItem[];
  ariaLabel: string;
  align?: 'left' | 'right';
}

// Icon-button trigger that toggles a small popup list of actions. Closes on
// outside click, on Escape, and after any item fires.
export function Menu({ items, ariaLabel, align = 'right' }: MenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useDismiss(
    rootRef,
    open,
    useCallback(() => setOpen(false), []),
  );

  return (
    <div className="menu" ref={rootRef}>
      <button
        type="button"
        className="menu-trigger"
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((current) => !current)}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="currentColor"
          stroke="none"
          aria-hidden="true"
        >
          <circle cx="12" cy="5" r="1.6" />
          <circle cx="12" cy="12" r="1.6" />
          <circle cx="12" cy="19" r="1.6" />
        </svg>
      </button>

      {open && (
        <div className={`menu-popup menu-popup--${align}`} id={menuId} role="menu">
          {items.map((item) => (
            <button
              key={item.key}
              type="button"
              role="menuitem"
              className={`menu-item${item.danger ? ' menu-item--danger' : ''}`}
              disabled={item.disabled}
              onClick={() => {
                item.onSelect();
                setOpen(false);
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
