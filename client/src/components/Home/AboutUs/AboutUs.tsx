import { PictureFrame } from '../../PictureFrame/PictureFrame';
import unifiedWorkspace from '../../../assets/about-unified-workspace.svg';
import './AboutUs.css';

export function AboutUs() {
  return (
    <section id="about" className="home-section">
      <div className="home-container about-grid">
        <PictureFrame
          src={unifiedWorkspace}
          alt="Một cửa sổ không gian làm việc OptiLink duy nhất liệt kê một liên kết rút gọn, một trang bio, và một mã QR cùng với số lượt nhấp, lượt xem và lượt quét của chúng"
        />

        <div className="about-text">
          <h2 className="home-heading">Về chúng tôi</h2>

          <div className="about-copy">
            <p>
              Chúng tôi là một đội ngũ nhỏ từng phải xoay xở với nhiều công cụ riêng lẻ để rút gọn một liên
              kết, xây dựng trang bio cho hồ sơ, và tạo mã QR để in ấn. Điều đó có nghĩa là ba lần đăng nhập,
              ba bảng điều khiển, và không có cái nhìn chung về những gì đang diễn ra.
            </p>
            <p>
              Vì vậy chúng tôi đã xây dựng OptiLink: một không gian làm việc nơi một liên kết có thể được rút
              gọn, biến thành trang bio, và in ra thành mã QR, tất cả được theo dõi cùng nhau ngay từ khoảnh
              khắc nó được chia sẻ.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
