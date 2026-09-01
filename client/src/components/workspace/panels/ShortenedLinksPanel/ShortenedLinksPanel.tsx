import type { ReactNode } from 'react';
import { ContentPanel } from '../ContentPanel/ContentPanel';
import { ShortenedLinkRow } from '../../ShortenedLinkRow/ShortenedLinkRow';
import type { ShortenedLink } from '../../../../api/links';
import './ShortenedLinksPanel.css';

interface ShortenedLinksPanelProps {
  links: ShortenedLink[];
  title?: string;
  showViewDetail?: boolean;
  onDeleted?: (id: string) => void;
  /** Optional control bar rendered flush under the panel title. */
  toolbar?: ReactNode;
  /** Optional pager rendered flush at the bottom of the panel. */
  pagination?: ReactNode;
  isLoading?: boolean;
  emptyLabel?: string;
  /** Controlled row selection. Rows are selectable only when onToggleSelect is set. */
  selectedIds?: ReadonlySet<string>;
  onToggleSelect?: (id: string) => void;
}

// List-layout container for shortened links, rendered as a workspace ContentPanel.
export function ShortenedLinksPanel({
  links,
  title = 'Shortened Links',
  showViewDetail = true,
  onDeleted,
  toolbar,
  pagination,
  isLoading = false,
  emptyLabel,
  selectedIds,
  onToggleSelect,
}: ShortenedLinksPanelProps) {
  return (
    <ContentPanel title={title} className="shorten-list-panel" footer={pagination}>
      {toolbar}
      {isLoading && links.length === 0 ? (
        <p className="link-list-empty">Loading…</p>
      ) : links.length === 0 ? (
        <p className="link-list-empty">{emptyLabel ?? 'No shortened links yet.'}</p>
      ) : (
        <div className="link-list">
          {links.map((link) => (
            <ShortenedLinkRow
              key={link.id}
              link={link}
              showViewDetail={showViewDetail}
              onDeleted={onDeleted}
              selected={selectedIds?.has(link.id) ?? false}
              onSelect={onToggleSelect}
            />
          ))}
        </div>
      )}
    </ContentPanel>
  );
}
