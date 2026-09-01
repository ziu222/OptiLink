import { useCallback, useId, useRef, useState } from 'react';
import { useDismiss } from '../../../../lib/useDismiss';
import { MenuPopup } from '../MenuPopup/MenuPopup';
import type { MenuItem } from '../MenuPopup/MenuPopup';
import './KebabMenu.css';

interface KebabMenuProps {
  items: MenuItem[];
  ariaLabel: string;
  align?: 'left' | 'right';
}

// Icon-button trigger that toggles a small popup list of actions. Closes on
// outside click, on Escape, and after any item fires.
export function KebabMenu({ items, ariaLabel, align = 'right' }: KebabMenuProps) {
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
        <MenuPopup items={items} align={align} id={menuId} onClose={() => setOpen(false)} />
      )}
    </div>
  );
}
