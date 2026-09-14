import { Link } from 'react-router-dom';
import './footer.css';

const footerLinks: Record<string, { label: string; to: string }[]> = {
  'Sản phẩm': [
    { label: 'Tính năng', to: '/#features' },
    { label: 'Bảng giá', to: '/#pricing' },
    { label: 'Nhật ký thay đổi', to: '#' },
  ],
  'Công ty': [
    { label: 'Hỏi đáp', to: '/#faq' },
    { label: 'Blog', to: '#' },
    { label: 'Tuyển dụng', to: '#' },
  ],
  'Pháp lý': [
    { label: 'Chính sách bảo mật', to: '#' },
    { label: 'Điều khoản dịch vụ', to: '#' },
  ],
};

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-top">
        <div className="site-footer-brand">
          <Link to="/" className="site-footer-logo">
            OptiLink
          </Link>
          <p className="site-footer-tagline">
            Rút gọn, chia sẻ và theo dõi mọi liên kết — tất cả trong một nơi.
          </p>
        </div>

        <div className="site-footer-columns">
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section} className="site-footer-column">
              <h3 className="site-footer-heading">{section}</h3>
              <ul className="site-footer-list">
                {links.map(({ label, to }) => (
                  <li key={label}>
                    {to.startsWith('/') ? (
                      <Link to={to} className="site-footer-link">
                        {label}
                      </Link>
                    ) : (
                      <a href={to} className="site-footer-link">
                        {label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="site-footer-bottom">© {new Date().getFullYear()} OptiLink. Đã đăng ký bản quyền.</div>
    </footer>
  );
}
