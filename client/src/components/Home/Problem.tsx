import { PictureFrame } from './PictureFrame';
import './home.css';

const paragraphs = [
  {
    label: 'The problem',
    text: 'Shortening a link, building a bio page, and generating a QR code usually means three different tools, three logins, and no shared view of what actually happened after you shared it.',
  },
  {
    label: 'For example',
    text: "A seller posts a shortened product link on social media, keeps a separate link-in-bio page for their profile, and prints a QR code they generated in a third app for packaging — with no single place to see clicks, scans, or update any of it once it's out.",
  },
  {
    label: 'The fix',
    text: 'OptiLink brings link shortening, bio pages, and QR codes into one workspace. Every link carries its own access control, and every click, whether from a short link, a bio page, or a scanned QR code, shows up in the same analytics.',
  },
];

export function Problem() {
  return (
    <section className="home-section">
      <div className="home-container">
        <h2 className="home-heading">
          Your links, your bio page, and your QR codes shouldn&apos;t live in three different tools.
        </h2>

        <div className="problem-grid">
          <div className="problem-copy">
            {paragraphs.map(({ label, text }) => (
              <div key={label}>
                <span className="home-eyebrow">{label}</span>
                <p>{text}</p>
              </div>
            ))}
          </div>

          <PictureFrame />
        </div>
      </div>
    </section>
  );
}
