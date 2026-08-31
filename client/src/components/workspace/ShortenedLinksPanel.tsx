import { ContentPanel } from './ContentPanel';
import { ShortenedLinkRow } from './ShortenedLinkRow';
import type { ShortenedLink } from '../../api/links';
import './shortenedLinks.css';

interface ShortenedLinksPanelProps {
  links: ShortenedLink[];
  title?: string;
  showViewDetail?: boolean;
}

// List-layout container for shortened links, rendered as a workspace ContentPanel.
export function ShortenedLinksPanel({
  links,
  title = 'Shortened Links',
  showViewDetail = true,
}: ShortenedLinksPanelProps) {
  return (
    <ContentPanel title={title} className="shorten-list-panel">
      {links.length === 0 ? (
        <p className="link-list-empty">No shortened links yet.</p>
      ) : (
        <div className="link-list">
          {links.map((link) => (
            <ShortenedLinkRow key={link.id} link={link} showViewDetail={showViewDetail} />
          ))}
        </div>
      )}
    </ContentPanel>
  );
}
