import { useAuth } from '../../../contexts/AuthContext';
import { PricingCard } from '../PricingCard/PricingCard';
import type { PricingTier } from '../PricingCard/PricingCard';
import './PricingSection.css';

const tiers: PricingTier[] = [
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
      'Custom aliases and links you can lock with a password',
      'Advanced analytics by country, device, and browser',
      'Priority support',
    ],
  },
];

export function PricingSection() {
  const { status } = useAuth();
  const authed = status === 'authenticated';
  const ctaTo = authed ? '/dashboard' : '/register';
  const ctaLabel = authed ? 'Go to dashboard' : 'Get started';

  return (
    <section id="pricing" className="home-section">
      <div className="home-container">
        <h2 className="home-heading home-heading--center">Simple, transparent pricing.</h2>
        <p className="home-subheading home-subheading--center">
          Start for free. Upgrade to Premium whenever you need more from your links.
        </p>

        <div className="tier-grid">
          {tiers.map((tier) => (
            <PricingCard key={tier.id} tier={tier} ctaTo={ctaTo} ctaLabel={ctaLabel} />
          ))}
        </div>
      </div>
    </section>
  );
}
