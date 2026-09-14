import { PictureCarousel } from '../../PictureCarousel/PictureCarousel';
import shortenBasicScreenshot from '../../../assets/how-it-works-shorten.png';
import shortenAccessScreenshot from '../../../assets/how-it-works-access.png';
import shortenedLinksScreenshot from '../../../assets/how-it-works-links.png';
import bioDesignScreenshot from '../../../assets/how-it-works-bio-design.png';
import bioBlocksScreenshot from '../../../assets/how-it-works-bio-blocks.png';
import bioPreviewScreenshot from '../../../assets/how-it-works-bio-preview.png';
import statsScreenshot from '../../../assets/how-it-works-stats.png';
import countriesScreenshot from '../../../assets/how-it-works-countries.png';
import devicesScreenshot from '../../../assets/how-it-works-devices.png';
import './HowItWorks.css';

const shortenSlides = [
  { src: shortenBasicScreenshot, alt: 'Rút gọn một URL dài với tiêu đề, bí danh, chế độ chuyển hướng và tùy chọn trạng thái' },
  { src: shortenAccessScreenshot, alt: 'Thẻ Kiểm soát truy cập với tùy chọn mật khẩu và thời hạn' },
  { src: shortenedLinksScreenshot, alt: 'Danh sách các liên kết rút gọn cùng số lượt nhấp' },
];

const bioSlides = [
  { src: bioDesignScreenshot, alt: 'Thẻ Thiết kế trang bio với mẫu Minimal đang được chọn' },
  { src: bioBlocksScreenshot, alt: 'Trình chỉnh sửa hồ sơ và khối nội dung của trang bio' },
  { src: bioPreviewScreenshot, alt: 'Xem trước trực tiếp một trang bio dùng mẫu Minimal' },
];

const analyticsSlides = [
  { src: statsScreenshot, alt: 'Các ô thống kê trên bảng điều khiển: tổng liên kết, tổng lượt nhấp, và lượt nhấp hôm nay' },
  { src: countriesScreenshot, alt: 'Lượt nhấp theo quốc gia trên bản đồ thế giới' },
  { src: devicesScreenshot, alt: 'Lượt nhấp theo thiết bị trong biểu đồ tròn' },
];

const steps = [
  {
    number: '01',
    title: 'Rút gọn liên kết của bạn',
    description: 'Dán vào bất kỳ URL dài nào và nhận về một OptiLink ngắn gọn, mang thương hiệu riêng.',
  },
  {
    number: '02',
    title: 'Xây dựng trang bio của bạn',
    description: 'Chọn một bố cục, kéo thả các khối nội dung, và thêm sản phẩm, thẻ và danh mục với xem trước trực tiếp.',
  },
  {
    number: '03',
    title: 'Theo dõi mọi lượt nhấp',
    description: 'Xem lượt nhấp liên kết và lượt quét QR theo quốc gia, thiết bị và trình duyệt, tất cả từ bảng điều khiển của bạn.',
  },
];

const stepSlides = [shortenSlides, bioSlides, analyticsSlides];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="home-section">
      <div className="home-container">
        <h2 className="home-heading home-heading--center">Cách hoạt động</h2>

        <div className="steps">
          {steps.map(({ number, title, description }, index) => (
            <div key={number} className={`step${index % 2 === 1 ? ' step--reverse' : ''}`}>
              <div className="step-copy">
                <span className="step-number">{number}</span>
                <h3 className="step-title">{title}</h3>
                <p className="step-description">{description}</p>
              </div>

              <PictureCarousel className="step-frame" slides={stepSlides[index]} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
