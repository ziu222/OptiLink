import { useCallback, useRef, useState } from 'react';
import { useDismiss } from '../lib/useDismiss';
import type { MenuItem } from './Menu';
import './menu.css';

interface MenuButtonProps {
  label: string;
  items: MenuItem[];
  ariaLabel?: string;
  align?: 'left' | 'right';
}

// Plain text button (no fill) that toggles the shared menu popup.
export function MenuButton({ label, items, ariaLabel, align = 'right' }: MenuButtonProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useDismiss(
    rootRef,
    open,
    useCallback(() => setOpen(false), []),
  );

  return (
    <div className="menu-button" ref={rootRef}>
      <button
        type="button"
        className="menu-button-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={ariaLabel ?? label}
        onClick={() => setOpen((current) => !current)}
      >
        {label}
      </button>

      {open && (
        <div className={`menu-popup menu-popup--${align}`} role="menu">
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
