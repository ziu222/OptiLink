import { Link } from 'react-router-dom';
import './footer.css';

const footerLinks: Record<string, { label: string; to: string }[]> = {
  Product: [
    { label: 'Features', to: '/#features' },
    { label: 'Pricing', to: '/#pricing' },
    { label: 'Changelog', to: '#' },
  ],
  Company: [
    { label: 'FAQ', to: '/#faq' },
    { label: 'Blog', to: '#' },
    { label: 'Careers', to: '#' },
  ],
  Legal: [
    { label: 'Privacy Policy', to: '#' },
    { label: 'Terms of Service', to: '#' },
  ],
};

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__top">
        <div className="site-footer__brand">
          <Link to="/" className="site-footer__logo">
            OptiLink
          </Link>
          <p className="site-footer__tagline">
            Shorten, share, and track every link — all in one place.
          </p>
        </div>

        <div className="site-footer__columns">
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section} className="site-footer__column">
              <h3 className="site-footer__heading">{section}</h3>
              <ul className="site-footer__list">
                {links.map(({ label, to }) => (
                  <li key={label}>
                    {to.startsWith('/') ? (
                      <Link to={to} className="site-footer__link">
                        {label}
                      </Link>
                    ) : (
                      <a href={to} className="site-footer__link">
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

      <div className="site-footer__bottom">© {new Date().getFullYear()} OptiLink. All rights reserved.</div>
    </footer>
  );
}
