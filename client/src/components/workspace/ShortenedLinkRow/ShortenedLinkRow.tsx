import { useNavigate } from 'react-router-dom';
import { KebabMenu } from '../menu/KebabMenu/KebabMenu';
import type { MenuItem } from '../menu/MenuPopup/MenuPopup';
import { InfoRow, Cell, Main, Sub, Extra, Status, Actions, Separator } from '../InfoRow/InfoRow';
import { copyText } from '../../../lib/clipboard';
import { deleteLink } from '../../../api/links';
import type { ShortenedLink } from '../../../api/links';

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
  const name = link.title || 'Untitle';
  const isActive = link.isActive ?? true;

  const handleCopy = () => {
    void copyText(link.shortUrl);
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
    <InfoRow
      mobileLayout="stack"
      selected={selected}
      onSelect={onSelect ? () => onSelect(link.id) : undefined}
      ariaLabel={`Link ${name}`}
    >
      <Cell>
        <Main>{name}</Main>
        <Sub href={link.originalUrl}>{link.originalUrl}</Sub>
        <Extra>
          <Status active={isActive}>{isActive ? 'Active' : 'Inactive'}</Status>
          <Separator />
          <span>{link.clicks.toLocaleString()} clicks</span>
        </Extra>
      </Cell>

      <Cell mobileSpan>
        <Main href={link.shortUrl}>{link.shortUrl}</Main>
      </Cell>

      <Cell align="end">
        <Actions>
          <KebabMenu items={menuItems} ariaLabel={`Options for ${name}`} />
        </Actions>
      </Cell>
    </InfoRow>
  );
}
