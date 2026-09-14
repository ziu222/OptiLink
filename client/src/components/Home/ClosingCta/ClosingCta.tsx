import { Link } from 'react-router-dom';
import './ClosingCta.css';

export function ClosingCta() {
  return (
    <section className="home-section home-section--muted">
      <div className="home-container closing-cta">
        <h2 className="closing-cta-title">Một không gian làm việc cho mọi liên kết bạn chia sẻ.</h2>
        <p className="closing-cta-lede">
          Rút gọn URL, xây dựng trang bio, và tạo mã QR, tất cả từ OptiLink.
        </p>
        <Link to="/register" className="closing-cta-button">
          Tạo tài khoản miễn phí
        </Link>
      </div>
    </section>
  );
}
