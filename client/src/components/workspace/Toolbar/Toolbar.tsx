import { MenuButton } from '../menu/MenuButton/MenuButton';
import type { MenuItem } from '../menu/MenuPopup/MenuPopup';
import './Toolbar.css';

export interface ToolbarMenu {
  ariaLabel: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

interface ToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  /** Select-style menus (Sort, Filter, …). Each renders as a MenuButton whose
      label reflects the current selection. */
  menus?: ToolbarMenu[];
  /** Optional action menu (e.g. multi-select, delete). Rendered only if non-empty. */
  actions?: MenuItem[];
  actionsLabel?: string;
}

// A 3rem control bar — search field on the left, a run of MenuButtons on the
// right — sized and styled to sit flush under a ContentPanel title bar.
export function Toolbar({
  search,
  onSearchChange,
  searchPlaceholder = 'Search',
  menus = [],
  actions,
  actionsLabel = 'Actions',
}: ToolbarProps) {
  return (
    <div className="toolbar">
      <div className="toolbar-search">
        <svg
          className="toolbar-search-icon"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path strokeLinecap="round" d="M21 21l-4.3-4.3" />
        </svg>
        <input
          type="search"
          className="toolbar-search-input"
          placeholder={searchPlaceholder}
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      {menus.map((menu) => {
        const current =
          menu.options.find((option) => option.value === menu.value) ?? menu.options[0];
        return (
          <div className="toolbar-segment" key={menu.ariaLabel}>
            <div className="toolbar-sep" aria-hidden="true" />
            <MenuButton
              align="right"
              label={current?.label ?? ''}
              ariaLabel={menu.ariaLabel}
              items={menu.options.map((option) => ({
                key: option.value,
                label: option.label,
                onSelect: () => menu.onChange(option.value),
              }))}
            />
          </div>
        );
      })}

      {actions && actions.length > 0 && (
        <div className="toolbar-segment">
          <div className="toolbar-sep" aria-hidden="true" />
          <MenuButton
            align="right"
            label={actionsLabel}
            ariaLabel={actionsLabel}
            items={actions}
          />
        </div>
      )}
    </div>
  );
}
