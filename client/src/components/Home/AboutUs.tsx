import { PictureFrame } from './PictureFrame';
import './home.css';

export function AboutUs() {
  return (
    <section id="about" className="home-section">
      <div className="home-container about-grid">
        <PictureFrame />

        <div className="about-copy">
          <h2 className="home-heading">About us</h2>
          <p>
            We&apos;re a small team that kept juggling separate tools to shorten a link, build a bio page for
            a profile, and generate a QR code for print — three logins, three dashboards, and no shared view
            of what any of it was doing.
          </p>
          <p>
            So we built OptiLink: one workspace where a link can be shortened, turned into a bio page, and
            printed as a QR code, all tracked together from the moment it&apos;s shared.
          </p>
        </div>
      </div>
    </section>
  );
}
