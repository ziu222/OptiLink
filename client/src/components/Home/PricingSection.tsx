import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './home.css';

const tiers = [
  {
    id: 'FREE',
    name: 'Free',
    price: '$0',
    perks: [
      'Shorten and manage your links',
      'One bio page with unlimited blocks',
      'Downloadable QR codes',
      'Basic click analytics',
    ],
  },
  {
    id: 'PREMIUM',
    name: 'Premium',
    price: '$9',
    featured: true,
    perks: [
      'Everything in Free',
      'Custom aliases and password-protected links',
      'Advanced analytics by country, device, and browser',
      'Priority support',
    ],
  },
];

export function PricingSection() {
  const { status } = useAuth();

  return (
    <section id="pricing" className="home-section">
      <div className="home-container">
        <h2 className="home-heading home-heading--center">Simple, transparent pricing.</h2>
        <p className="home-subheading home-subheading--center">
          Start for free. Upgrade to Premium whenever you need more from your links.
        </p>

        <div className="tier-grid">
          {tiers.map((tier) => (
            <div key={tier.id} className={`tier-card${tier.featured ? ' tier-card--featured' : ''}`}>
              <div>
                <h3 className="tier-name">{tier.name}</h3>
                <p className="tier-price">
                  {tier.price}
                  <span>/month</span>
                </p>
              </div>

              <ul className="tier-perks">
                {tier.perks.map((perk) => (
                  <li key={perk}>
                    <span className="tier-check">✓</span>
                    {perk}
                  </li>
                ))}
              </ul>

              <Link
                to={status === 'authenticated' ? '/dashboard' : '/register'}
                className={`tier-cta${tier.featured ? ' tier-cta--primary' : ''}`}
              >
                {status === 'authenticated' ? 'Go to dashboard' : 'Get started'}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
