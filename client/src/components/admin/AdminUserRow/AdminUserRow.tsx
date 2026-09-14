import { KebabMenu } from '../../workspace/menu/KebabMenu/KebabMenu';
import type { MenuItem } from '../../workspace/menu/MenuPopup/MenuPopup';
import { InfoRow, Cell, Main, Sub, Extra, Status, Actions } from '../../workspace/InfoRow/InfoRow';
import * as adminApi from '../../../api/admin';
import type { AdminUser } from '../../../api/admin';
import './AdminUserRow.css';

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
  lock: (
    <svg {...menuIconProps}>
      <path d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  ),
  unlock: (
    <svg {...menuIconProps}>
      <path d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  ),
  delete: (
    <svg {...menuIconProps}>
      <path d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.02-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  ),
};

interface AdminUserRowProps {
  user: AdminUser;
  onChanged: (user: AdminUser) => void;
  onDeleted: (id: string) => void;
  selected?: boolean;
  onSelect?: (id: string) => void;
}

const formatDate = (iso: string): string => new Date(iso).toLocaleDateString('vi-VN');

export function AdminUserRow({
  user,
  onChanged,
  onDeleted,
  selected = false,
  onSelect,
}: AdminUserRowProps) {
  const name = user.fullName || user.username || 'Chưa đặt tên';
  const isAdmin = user.role === 'admin';
  const isPremium = user.tier === 'PREMIUM';

  const toggleBan = async () => {
    try {
      const updated = await adminApi.banUser(user.id, !user.isBanned);
      onChanged(updated);
    } catch {
      window.alert('Không thể khóa/mở khóa người dùng này.');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Xóa người dùng "${name}"? Không thể hoàn tác.`)) return;
    try {
      await adminApi.deleteUser(user.id);
      onDeleted(user.id);
    } catch {
      window.alert('Không thể xóa người dùng này. Vui lòng thử lại.');
    }
  };

  const menuItems: MenuItem[] = [
    {
      key: 'ban',
      label: user.isBanned ? 'Mở khóa người dùng' : 'Khóa người dùng',
      icon: user.isBanned ? menuIcons.unlock : menuIcons.lock,
      onSelect: toggleBan,
    },
    {
      key: 'delete',
      label: 'Xóa người dùng',
      icon: menuIcons.delete,
      onSelect: handleDelete,
      danger: true,
    },
  ];

  const identity = user.fullName ? `${user.username || 'chưa-đặt'} - ${user.fullName}` : user.username || name;

  return (
    <InfoRow
      className="admin-user-row"
      columns={4}
      selected={selected}
      onSelect={onSelect ? () => onSelect(user.id) : undefined}
      ariaLabel={`Người dùng ${name}`}
    >
      <Cell className="main-cell">
        <Main>{identity}</Main>
        <Sub>{user.email}</Sub>
        <Extra>
          <Status active={isAdmin}>{isAdmin ? 'Quản trị viên' : 'Người dùng'}</Status>
        </Extra>
      </Cell>

      <Cell className="tier-cell">
        <Main>{isPremium ? 'Cao cấp' : 'Miễn phí'}</Main>
        <Sub>{formatDate(user.createdAt)}</Sub>
      </Cell>

      <Cell className="verify-cell">
        <Main>{user.isVerified ? 'Đã xác minh' : 'Chưa xác minh'}</Main>
        <Sub>
          <span className={user.isBanned ? 'admin-user-banned' : undefined}>
            {user.isBanned ? 'Đã khóa' : 'Đang hoạt động'}
          </span>
        </Sub>
      </Cell>

      <Cell align="end" className="actions-cell">
        <Actions>
          <KebabMenu items={menuItems} ariaLabel={`Tùy chọn cho ${name}`} />
        </Actions>
      </Cell>
    </InfoRow>
  );
}
