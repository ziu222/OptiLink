import { ContentPanel } from './ContentPanel';
import { ShortenedLinkRow } from './ShortenedLinkRow';
import type { ShortenedLink } from '../../api/links';
import './shortenedLinks.css';

interface ShortenedLinksPanelProps {
  links: ShortenedLink[];
}

// List-layout container for shortened links, rendered as a workspace ContentPanel.
export function ShortenedLinksPanel({ links }: ShortenedLinksPanelProps) {
  return (
    <ContentPanel title="Shortened Links" className="shorten-list-panel">
      {links.length === 0 ? (
        <p className="link-list-empty">No shortened links yet.</p>
      ) : (
        <div className="link-list">
          {links.map((link) => (
            <ShortenedLinkRow key={link.id} link={link} />
          ))}
        </div>
      )}
    </ContentPanel>
  );
}
