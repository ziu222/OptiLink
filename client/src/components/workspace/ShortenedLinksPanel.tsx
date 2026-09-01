import type { ReactNode } from 'react';
import { ContentPanel } from './ContentPanel';
import { ShortenedLinkRow } from './ShortenedLinkRow';
import type { ShortenedLink } from '../../api/links';
import './shortenedLinks.css';

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
            />
          ))}
        </div>
      )}
    </ContentPanel>
  );
}
