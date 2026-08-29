import { Link } from 'react-router-dom';
import './home.css';

export function ClosingCta() {
  return (
    <section className="home-section home-section--muted">
      <div className="home-container closing-cta">
        <h2 className="closing-cta-title">One workspace for every link you share.</h2>
        <p className="closing-cta-lede">
          Shorten URLs, build a bio page, and generate QR codes — all from OptiLink.
        </p>
        <Link to="/register" className="closing-cta-button">
          Create a free account
        </Link>
      </div>
    </section>
  );
}
