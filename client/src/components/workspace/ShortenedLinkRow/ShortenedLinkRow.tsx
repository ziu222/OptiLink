import { useNavigate } from 'react-router-dom';
import { KebabMenu } from '../menu/KebabMenu/KebabMenu';
import type { MenuItem } from '../menu/MenuPopup/MenuPopup';
import { InfoRow, Cell, Main, Sub, Extra, Status, Actions, Separator } from '../InfoRow/InfoRow';
import { ClicksSparkline } from '../ClicksSparkline/ClicksSparkline';
import { copyText } from '../../../lib/clipboard';
import './ShortenedLinkRow.css';
import { useAuth } from '../../../contexts/AuthContext';
import { deleteLink } from '../../../api/links';
import type { ShortenedLink } from '../../../api/links';

const menuIconProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

// Heroicons (outline) — one per kebab-menu action.
const menuIcons = {
  access: (
    <svg {...menuIconProps}>
      <path d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
    </svg>
  ),
  detail: (
    <svg {...menuIconProps}>
      <path d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  analytics: (
    <svg {...menuIconProps}>
      <path d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  ),
  copy: (
    <svg {...menuIconProps}>
      <path d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
    </svg>
  ),
  delete: (
    <svg {...menuIconProps}>
      <path d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.02-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  ),
};

interface ShortenedLinkRowProps {
  link: ShortenedLink;
  showViewDetail?: boolean;
  onDeleted?: (id: string) => void;
  selected?: boolean;
  onSelect?: (id: string) => void;
}

// One row of the Shortened Links list, composed over the generic InfoRow frame:
// a 3-column grid of name+URL / short link / actions.
export function ShortenedLinkRow({
  link,
  showViewDetail = true,
  onDeleted,
  selected = false,
  onSelect,
}: ShortenedLinkRowProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const name = link.title || 'Untitle';
  const isActive = link.isActive ?? true;
  const hourly = link.hourlyClicks;
  const lastHour = hourly?.at(-1) ?? 0;

  const handleCopy = () => {
    void copyText(link.shortUrl);
  };

  const handleAccess = () => {
    window.open(link.shortUrl, '_blank', 'noopener,noreferrer');
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

  const menuItems: MenuItem[] = [
    { key: 'access', label: 'Access link', icon: menuIcons.access, onSelect: handleAccess },
    ...(showViewDetail
      ? [
          {
            key: 'detail',
            label: 'View detail',
            icon: menuIcons.detail,
            onSelect: () => navigate(`/dashboard/links/${link.id}`),
          },
        ]
      : []),
    {
      key: 'analytics',
      label: 'View analytics',
      icon: menuIcons.analytics,
      onSelect: () => navigate(`/dashboard/analytics/${link.id}`),
    },
    { key: 'copy', label: 'Copy link', icon: menuIcons.copy, onSelect: handleCopy },
    {
      key: 'delete',
      label: 'Delete link',
      icon: menuIcons.delete,
      onSelect: handleDelete,
      danger: true,
    },
  ];

  return (
    <InfoRow
      className="shortened-link-row"
      columns={hourly ? 4 : 3}
      mobileLayout="stack"
      selected={selected}
      onSelect={onSelect ? () => onSelect(link.id) : undefined}
      ariaLabel={`Link ${name}`}
    >
      <Cell>
        <Main>{name}</Main>
        <Sub>Created by {user?.fullName ?? 'Unknown'}</Sub>
        <Extra>
          <Status active={isActive}>{isActive ? 'Active' : 'Inactive'}</Status>
          <Separator />
          <span>{link.clicks.toLocaleString()} clicks</span>
        </Extra>
      </Cell>

      <Cell mobileSpan>
        <Main href={link.shortUrl}>{link.shortUrl}</Main>
        <Sub href={link.originalUrl}>{link.originalUrl}</Sub>
      </Cell>

      {hourly && (
        <Cell mobileSpan className="clicks-cell">
          <div className="clicks-cell-row">
            <ClicksSparkline data={hourly} />
            <span className="clicks-cell-total">
              +{lastHour} click{lastHour === 1 ? '' : 's'}
            </span>
          </div>
        </Cell>
      )}

      <Cell align="end">
        <Actions>
          <KebabMenu items={menuItems} ariaLabel={`Options for ${name}`} />
        </Actions>
      </Cell>
    </InfoRow>
  );
}
