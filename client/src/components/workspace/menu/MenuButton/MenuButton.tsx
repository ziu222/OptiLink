import { useCallback, useRef, useState } from 'react';
import { useDismiss } from '../../../../lib/useDismiss';
import { MenuPopup } from '../MenuPopup/MenuPopup';
import type { MenuItem } from '../MenuPopup/MenuPopup';
import './MenuButton.css';

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

      {open && <MenuPopup items={items} align={align} onClose={() => setOpen(false)} />}
    </div>
  );
}
