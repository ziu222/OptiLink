import type { ReactNode } from 'react';
import './FeatureGrid.css';

const iconProps = {
  fill: 'none',
  viewBox: '0 0 24 24',
  stroke: 'currentColor',
  strokeWidth: 2,
};

interface Feature {
  title: string;
  description: string;
  icon: ReactNode;
}

const features: Feature[] = [
  {
    title: 'Liên kết rút gọn tùy chỉnh',
    description: 'Gắn thương hiệu cho mỗi liên kết bằng một bí danh dễ nhớ thay vì một chuỗi ngẫu nhiên.',
    icon: (
      <svg {...iconProps}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"
        />
      </svg>
    ),
  },
  {
    title: 'Trình xây dựng trang Bio',
    description: 'Kéo thả các khối nội dung, chọn từ 5 giao diện bố cục, và xem trước thay đổi theo thời gian thực.',
    icon: (
      <svg {...iconProps}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25"
        />
      </svg>
    ),
  },
  {
    title: 'Mã QR',
    description: 'Mỗi liên kết đều có một mã QR có thể tải xuống, với lượt quét được theo dõi riêng biệt với lượt nhấp.',
    icon: (
      <svg {...iconProps}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6.75 6.75h.008v.008H6.75V6.75zM6.75 16.5h.008v.008H6.75V16.5zM16.5 6.75h.008v.008H16.5V6.75zM13.5 13.5h.008v.008H13.5V13.5zM13.5 19.5h.008v.008H13.5v-.008zM19.5 13.5h.008v.008H19.5V13.5zM19.5 19.5h.008v.008H19.5v-.008zM16.5 16.5h.008v.008H16.5V16.5z"
        />
      </svg>
    ),
  },
  {
    title: 'Kiểm soát truy cập',
    description: 'Yêu cầu mật khẩu, đặt thời hạn, hoặc giới hạn số lượt nhấp cho bất kỳ liên kết nào, không cần công cụ riêng.',
    icon: (
      <svg {...iconProps}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
        />
      </svg>
    ),
  },
  {
    title: 'Thống kê',
    description: 'Lượt nhấp theo thời gian, cùng phân tích theo quốc gia, thiết bị và trình duyệt cho mỗi liên kết.',
    icon: (
      <svg {...iconProps}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 13.125c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
        />
      </svg>
    ),
  },
  {
    title: 'Một không gian làm việc',
    description: 'Quản lý mọi liên kết, trang bio và mã QR bạn sở hữu từ một bảng điều khiển duy nhất.',
    icon: (
      <svg {...iconProps}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
        />
      </svg>
    ),
  },
];

export function FeatureGrid() {
  return (
    <section id="features" className="home-section home-section--muted">
      <div className="home-container">
        <h2 className="home-heading home-heading--center">Mọi thứ bạn cần, có sẵn ngay.</h2>
        <p className="home-subheading home-subheading--center">
          Không cần cài thêm, không cần công cụ riêng biệt. Rút gọn liên kết, trang bio và mã QR cùng chung
          một không gian làm việc.
        </p>

        <div className="feature-grid">
          {features.map(({ title, description, icon }) => (
            <div key={title} className="feature-card">
              <div className="feature-card-head">
                <span className="feature-icon">{icon}</span>
                <h3 className="feature-title">{title}</h3>
              </div>
              <p className="feature-description">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
