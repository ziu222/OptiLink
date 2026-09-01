import type { MouseEvent, ReactNode } from 'react';
import './InfoRow.css';

const cx = (...p: Array<string | false | null | undefined>) => p.filter(Boolean).join(' ');

// The frame: a grid shell with borders, selection state and column config.
export function InfoRow({
  children,
  columns = 3,
  mobileLayout,
  selected = false,
  onSelect,
  className,
  ariaLabel,
}: {
  children: ReactNode;
  columns?: number | string; // number → equal columns; string → grid-template-columns
  mobileLayout?: 'stack'; // opt into the <=640px reflow (see InfoRow.css)
  selected?: boolean;
  onSelect?: () => void; // presence also makes the row selectable
  className?: string;
  ariaLabel?: string;
}) {
  // Toggle selection on a background click; let links and buttons handle their own.
  const selectOnBackground = (e: MouseEvent<HTMLDivElement>) => {
    if (!(e.target as HTMLElement).closest('a, button')) onSelect?.();
  };
  return (
    <div
      className={cx('info-row', onSelect && 'is-selectable', selected && 'is-selected', className)}
      data-columns={typeof columns === 'number' ? columns : undefined}
      data-mobile={mobileLayout}
      style={typeof columns === 'string' ? { gridTemplateColumns: columns } : undefined}
      onClick={onSelect ? selectOnBackground : undefined}
      aria-selected={onSelect ? selected : undefined}
      aria-label={ariaLabel}
    >
      {children}
    </div>
  );
}

// One column: a vertical stack of the slots below.
export function Cell({
  children,
  align,
  mobileSpan,
  className,
}: {
  children: ReactNode;
  align?: 'start' | 'end';
  mobileSpan?: boolean; // full width at <=640px (pairs with mobileLayout="stack")
  className?: string;
}) {
  return (
    <div
      className={cx(
        'info-cell',
        align === 'end' && 'info-cell--end',
        mobileSpan && 'info-cell--mobile-span',
        className,
      )}
    >
      {children}
    </div>
  );
}

// Bold primary line; an external link when `href` is set.
export function Main({ href, children }: { href?: string; children: ReactNode }) {
  return href ? (
    <a className="info-cell-main" href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  ) : (
    <span className="info-cell-main">{children}</span>
  );
}

// Muted, truncated secondary line; an external link when `href` is set.
export function Sub({ href, children }: { href?: string; children: ReactNode }) {
  return href ? (
    <a className="info-cell-sub" href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  ) : (
    <span className="info-cell-sub">{children}</span>
  );
}

// Inline metadata line, e.g. "status • 12 clicks".
export function Extra({ children }: { children: ReactNode }) {
  return <span className="info-cell-extra">{children}</span>;
}

// Small uppercase label; green when `active`.
export function Status({ active, children }: { active?: boolean; children: ReactNode }) {
  return <span className={cx('info-status', active && 'is-active')}>{children}</span>;
}

// Right-aligned control cluster.
export function Actions({ children }: { children: ReactNode }) {
  return <span className="info-actions">{children}</span>;
}

// Square dot between inline metadata bits.
export function Separator() {
  return <span className="info-sep" aria-hidden="true" />;
}
