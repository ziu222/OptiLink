import type { ReactNode } from 'react';
import { MenuButton } from '../menu/MenuButton/MenuButton';
import type { MenuItem } from '../menu/MenuPopup/MenuPopup';
import './Toolbar.css';

const svgProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

// Icons for the built-in Sort / Filter option values (Heroicons outline).
// Unknown values simply render without an icon.
const OPTION_ICONS: Record<string, ReactNode> = {
  all: (
    <svg {...svgProps}>
      <path d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  ),
  active: (
    <svg {...svgProps}>
      <path d="M9 12.75l2.25 2.25 4.5-4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  inactive: (
    <svg {...svgProps}>
      <path d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  newest: (
    <svg {...svgProps}>
      <path d="M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0l-3.75-3.75M17.25 21L21 17.25" />
    </svg>
  ),
  oldest: (
    <svg {...svgProps}>
      <path d="M3 4.5h14.25M3 9h9.75M3 13.5h5.25m5.25-.75L17.25 9m0 0L21 12.75M17.25 9v12" />
    </svg>
  ),
  clicks: (
    <svg {...svgProps}>
      <path d="M2.25 18L9 11.25l4.306 4.306a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
    </svg>
  ),
};

// Icons for the built-in Actions-menu item keys. A caller-supplied `icon` on
// the item still wins; unknown keys render without one.
const ACTION_ICONS: Record<string, ReactNode> = {
  multi: (
    <svg {...svgProps}>
      <path d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25A2.25 2.25 0 0113.5 8.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  ),
  'select-all': (
    <svg {...svgProps}>
      <path d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  ),
  'delete-selected': (
    <svg {...svgProps}>
      <path d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.02-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  ),
  exit: (
    <svg {...svgProps}>
      <path d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
};

export interface ToolbarMenu {
  ariaLabel: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

interface ToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  /** Fired when the search field is submitted (Enter). The list only refetches
      on this, not on every keystroke. */
  onSearchSubmit?: () => void;
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
  onSearchSubmit,
  searchPlaceholder = 'Search',
  menus = [],
  actions,
  actionsLabel = 'Actions',
}: ToolbarProps) {
  return (
    <div className="toolbar">
      <form
        className="toolbar-search"
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          onSearchSubmit?.();
        }}
      >
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
      </form>

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
                icon: OPTION_ICONS[option.value],
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
            items={actions.map((action) => ({
              ...action,
              icon: action.icon ?? ACTION_ICONS[action.key],
            }))}
          />
        </div>
      )}
    </div>
  );
}
