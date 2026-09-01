import './MenuPopup.css';

export interface MenuItem {
  key: string;
  label: string;
  onSelect: () => void;
  disabled?: boolean;
  /** Render as a destructive action (red text + border). */
  danger?: boolean;
}

interface MenuPopupProps {
  items: MenuItem[];
  align?: 'left' | 'right';
  id?: string;
  /** Called after an item fires, so the trigger can close the popup. */
  onClose?: () => void;
}

// The shared dropdown panel: an absolutely-positioned list of action buttons.
// Triggers (KebabMenu, MenuButton) own the open state and render this while open.
export function MenuPopup({ items, align = 'right', id, onClose }: MenuPopupProps) {
  return (
    <div className={`menu-popup menu-popup--${align}`} id={id} role="menu">
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          role="menuitem"
          className={`menu-item${item.danger ? ' menu-item--danger' : ''}`}
          disabled={item.disabled}
          onClick={() => {
            item.onSelect();
            onClose?.();
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
