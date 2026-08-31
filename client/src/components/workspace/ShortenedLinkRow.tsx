import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu } from '../Menu';
import type { MenuItem } from '../Menu';
import { copyText } from '../../lib/clipboard';
import type { ShortenedLink } from '../../api/links';

interface ShortenedLinkRowProps {
  link: ShortenedLink;
  showViewDetail?: boolean;
}

// One row of the Shortened Links list: a 3-column grid (left / center / right),
// each column stacking a main / sub / extra slot.
export function ShortenedLinkRow({ link, showViewDetail = true }: ShortenedLinkRowProps) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const name = link.title || 'Untitle';
  const isActive = link.isActive ?? true;

  const handleCopy = async () => {
    if (!(await copyText(link.shortUrl))) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const menuItems: MenuItem[] = [
    ...(showViewDetail
      ? [
          {
            key: 'detail',
            label: 'View Detail',
            onSelect: () => navigate(`/dashboard/links/${link.id}`),
          },
        ]
      : []),
    { key: 'copy', label: 'Copy short link', onSelect: handleCopy },
  ];

  return (
    <div className="link-row">
      <div className="link-cell link-cell--left">
        <span className="link-cell-main">{name}</span>
        <a
          className="link-cell-sub"
          href={link.originalUrl}
          target="_blank"
          rel="noreferrer"
        >
          {link.originalUrl}
        </a>
        <span className="link-cell-extra">
          <span className={`link-status${isActive ? ' is-active' : ''}`}>
            {isActive ? 'Active' : 'Inactive'}
          </span>
          <span className="link-extra-sep" aria-hidden="true" />
          <span>{link.clicks.toLocaleString()} clicks</span>
        </span>
      </div>

      <div className="link-cell link-cell--center">
        <a
          className="link-cell-main link-short"
          href={link.shortUrl}
          target="_blank"
          rel="noreferrer"
        >
          {link.shortUrl}
        </a>
      </div>

      <div className="link-cell link-cell--right">
        <span className="link-cell-main link-actions">
          {copied && (
            <span className="link-copied" role="status">
              Copied
            </span>
          )}
          <Menu items={menuItems} ariaLabel={`Options for ${name}`} />
        </span>
      </div>
    </div>
  );
}
