import { PictureFrame } from '../../PictureFrame/PictureFrame';
import scatteredTools from '../../../assets/problem-scattered-tools.svg';
import './Problem.css';

const paragraphs = [
  {
    label: 'Vấn đề',
    text: 'Rút gọn một liên kết, xây dựng một trang bio, và tạo mã QR thường có nghĩa là ba công cụ khác nhau, ba lần đăng nhập, và không có cái nhìn chung về những gì thực sự xảy ra sau khi bạn chia sẻ nó.',
  },
  {
    label: 'Ví dụ',
    text: 'Một người bán đăng một liên kết sản phẩm đã rút gọn lên mạng xã hội, giữ một liên kết riêng trong trang bio cho hồ sơ của họ, và in một mã QR được tạo từ một ứng dụng thứ ba để đóng gói, không có nơi nào để xem lượt nhấp, lượt quét, hay cập nhật bất cứ thứ gì một khi đã phát hành.',
  },
  {
    label: 'Giải pháp',
    text: 'OptiLink gom rút gọn liên kết, trang bio và mã QR vào chung một không gian làm việc. Mỗi liên kết mang theo quyền kiểm soát truy cập riêng, và mọi lượt nhấp, dù từ liên kết rút gọn, trang bio, hay mã QR được quét, đều hiển thị trong cùng một hệ thống thống kê.',
  },
];

export function Problem() {
  return (
    <section className="home-section">
      <div className="home-container">
        <div className="problem-grid">
          <div className="problem-text">
            <h2 className="home-heading">
              Liên kết, trang bio và mã QR của bạn không nên nằm rải rác ở ba công cụ khác nhau.
            </h2>

            <div className="problem-copy">
              {paragraphs.map(({ label, text }) => (
                <div key={label}>
                  <span className="home-eyebrow">{label}</span>
                  <p>{text}</p>
                </div>
              ))}
            </div>
          </div>

          <PictureFrame
            src={scatteredTools}
            alt="Một liên kết rút gọn, một trang bio và một mã QR trên ba thẻ rời rạc, không liên kết với nhau"
          />
        </div>
      </div>
    </section>
  );
}
