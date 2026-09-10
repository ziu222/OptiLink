import { Link } from 'react-router-dom';
import './PricingCard.css';

export interface PricingTier {
  id: string;
  name: string;
  price: string;
  featured?: boolean;
  perks: string[];
}

interface PricingCardProps {
  tier: PricingTier;
  /** Where the card's action button links (resolved by the section, which knows auth state). */
  ctaTo: string;
  ctaLabel: string;
}

export function PricingCard({ tier, ctaTo, ctaLabel }: PricingCardProps) {
  return (
    <div className={`tier-card${tier.featured ? ' tier-card--featured' : ''}`}>
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

      <Link to={ctaTo} className={`tier-cta${tier.featured ? ' tier-cta--primary' : ''}`}>
        {ctaLabel}
      </Link>
    </div>
  );
}
