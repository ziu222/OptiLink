import type { ReactNode } from 'react';
import './FAQ.css';

const faqs: { question: string; answer: ReactNode }[] = [
  {
    question: 'OptiLink là gì?',
    answer:
      'Một nền tảng duy nhất để quản lý liên kết của bạn: rút gọn URL, xây dựng trang bio, và tạo mã QR, tất cả từ một không gian làm việc.',
  },
  {
    question: 'Chi phí là bao nhiêu?',
    answer: (
      <>
        Miễn phí để bắt đầu. Gói Premium mở khóa bí danh tùy chỉnh, bảo vệ bằng mật khẩu, và thống kê nâng
        cao. Xem <a href="/#pricing">Bảng giá</a> ở trên.
      </>
    ),
  },
  {
    question: 'Tôi có cần tài khoản để rút gọn liên kết không?',
    answer: 'Có. Tạo tài khoản cho phép bạn quản lý, bảo vệ và theo dõi mọi liên kết, trang bio và mã QR bạn tạo ra.',
  },
  {
    question: 'Tôi có thể tùy chỉnh trang bio của mình không?',
    answer:
      'Có. Chọn từ 5 giao diện bố cục, sau đó kéo thả các khối như thẻ sản phẩm, thẻ tab, tìm kiếm, và bộ lọc danh mục, với xem trước trực tiếp khi bạn chỉnh sửa.',
  },
  {
    question: 'Mã QR có hoạt động với mọi liên kết không?',
    answer: 'Có. Mỗi liên kết rút gọn và trang bio đều có một mã QR có thể tải xuống, với lượt quét được theo dõi riêng biệt với lượt nhấp.',
  },
  {
    question: 'Tôi có thể đặt mật khẩu cho liên kết hoặc cho nó hết hạn không?',
    answer: 'Có. Kiểm soát truy cập cho phép bạn yêu cầu mật khẩu trước khi chuyển hướng, đặt ngày hết hạn, hoặc giới hạn số lượt nhấp mà liên kết chấp nhận.',
  },
  {
    question: 'Điều gì xảy ra sau khi ai đó nhấp vào liên kết hoặc quét mã QR của tôi?',
    answer: 'Họ sẽ đến đích của bạn, và lượt truy cập được ghi lại trong thống kê của bạn, phân tích theo quốc gia, thiết bị và trình duyệt.',
  },
];

export function FAQ() {
  return (
    <section id="faq" className="home-section">
      <div className="home-container">
        <h2 className="home-heading home-heading--center">Câu hỏi thường gặp</h2>

        <div className="faq-list">
          {faqs.map(({ question, answer }) => (
            <details key={question} className="faq-item">
              <summary className="faq-question">
                {question}
                <span className="faq-plus">+</span>
              </summary>
              <p className="faq-answer">{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
