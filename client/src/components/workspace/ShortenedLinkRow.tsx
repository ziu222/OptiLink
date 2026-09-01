import { useState } from 'react';
import type { MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu } from '../Menu';
import type { MenuItem } from '../Menu';
import { copyText } from '../../lib/clipboard';
import { deleteLink } from '../../api/links';
import type { ShortenedLink } from '../../api/links';

interface ShortenedLinkRowProps {
  link: ShortenedLink;
  showViewDetail?: boolean;
  onDeleted?: (id: string) => void;
  selected?: boolean;
  onSelect?: (id: string) => void;
}

// One row of the Shortened Links list: a 3-column grid (left / center / right),
// each column stacking a main / sub / extra slot.
export function ShortenedLinkRow({
  link,
  showViewDetail = true,
  onDeleted,
  selected = false,
  onSelect,
}: ShortenedLinkRowProps) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const name = link.title || 'Untitle';
  const isActive = link.isActive ?? true;

  const handleCopy = async () => {
    if (!(await copyText(link.shortUrl))) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete “${name}”? This can’t be undone.`)) return;
    try {
      await deleteLink(link.id);
      onDeleted?.(link.id);
    } catch {
      window.alert('Could not delete this link. Please try again.');
    }
  };

  // Toggle selection when the row background is clicked, but let links and the
  // options menu handle their own clicks.
  const handleRowClick = (event: MouseEvent<HTMLDivElement>) => {
    if (!onSelect) return;
    if ((event.target as HTMLElement).closest('a, button')) return;
    onSelect(link.id);
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
    { key: 'delete', label: 'Delete link', onSelect: handleDelete, danger: true },
  ];

  return (
    <div
      className={`link-row${onSelect ? ' is-selectable' : ''}${selected ? ' is-selected' : ''}`}
      onClick={handleRowClick}
      aria-selected={onSelect ? selected : undefined}
    >
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
