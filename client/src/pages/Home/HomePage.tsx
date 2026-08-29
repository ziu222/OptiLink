import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from '../../components/Header/Header';
import { Footer } from '../../components/Footer/Footer';
import { Hero } from '../../components/Home/Hero';
import { Problem } from '../../components/Home/Problem';
import { HowItWorks } from '../../components/Home/HowItWorks';
import { FeatureGrid } from '../../components/Home/FeatureGrid';
import { PricingSection } from '../../components/Home/PricingSection';
import { AboutUs } from '../../components/Home/AboutUs';
import { FAQ } from '../../components/Home/FAQ';
import { ClosingCta } from '../../components/Home/ClosingCta';
import '../../components/Home/home.css';

export function HomePage() {
  // React Router doesn't scroll to #hash targets on its own; do it here so
  // Header/Footer "Features"/"Pricing"/"FAQ" links land on the right section.
  const { hash } = useLocation();
  useEffect(() => {
    if (!hash) return;
    document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' });
  }, [hash]);

  return (
    <div className="home-page">
      <Header />

      <main className="home-main">
        <Hero />
        <Problem />
        <HowItWorks />
        <FeatureGrid />
        <PricingSection />
        <AboutUs />
        <FAQ />
        <ClosingCta />
      </main>

      <Footer />
    </div>
  );
}
