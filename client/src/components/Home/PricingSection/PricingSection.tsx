import { useAuth } from '../../../contexts/AuthContext';
import { PricingCard } from '../PricingCard/PricingCard';
import type { PricingTier } from '../PricingCard/PricingCard';
import './PricingSection.css';

const tiers: PricingTier[] = [
  {
    id: 'FREE',
    name: 'Miễn phí',
    price: '$0',
    perks: [
      'Rút gọn và quản lý liên kết của bạn',
      'Một trang bio với số khối nội dung không giới hạn',
      'Mã QR có thể tải xuống',
      'Thống kê lượt nhấp cơ bản',
    ],
  },
  {
    id: 'PREMIUM',
    name: 'Cao cấp',
    price: '$9',
    featured: true,
    perks: [
      'Mọi thứ trong gói Miễn phí',
      'Bí danh tùy chỉnh và liên kết có thể khóa bằng mật khẩu',
      'Thống kê nâng cao theo quốc gia, thiết bị và trình duyệt',
      'Hỗ trợ ưu tiên',
    ],
  },
];

export function PricingSection() {
  const { status } = useAuth();
  const authed = status === 'authenticated';
  const ctaTo = authed ? '/dashboard' : '/register';
  const ctaLabel = authed ? 'Đến bảng điều khiển' : 'Bắt đầu ngay';

  return (
    <section id="pricing" className="home-section">
      <div className="home-container">
        <h2 className="home-heading home-heading--center">Giá cả đơn giản, minh bạch.</h2>
        <p className="home-subheading home-subheading--center">
          Bắt đầu miễn phí. Nâng cấp lên gói Cao cấp bất cứ khi nào bạn cần nhiều hơn từ liên kết của mình.
        </p>

        <div className="tier-grid">
          {tiers.map((tier) => (
            <PricingCard key={tier.id} tier={tier} ctaTo={ctaTo} ctaLabel={ctaLabel} />
          ))}
        </div>
      </div>
    </section>
  );
}
