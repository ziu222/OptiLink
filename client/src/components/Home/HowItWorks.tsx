import { PictureCarousel } from './PictureCarousel';
import shortenBasicScreenshot from '../../assets/how-it-works-shorten.png';
import shortenAccessScreenshot from '../../assets/how-it-works-access.png';
import shortenedLinksScreenshot from '../../assets/how-it-works-links.png';
import bioDesignScreenshot from '../../assets/how-it-works-bio-design.png';
import bioBlocksScreenshot from '../../assets/how-it-works-bio-blocks.png';
import bioPreviewScreenshot from '../../assets/how-it-works-bio-preview.png';
import statsScreenshot from '../../assets/how-it-works-stats.png';
import countriesScreenshot from '../../assets/how-it-works-countries.png';
import devicesScreenshot from '../../assets/how-it-works-devices.png';
import './home.css';

const shortenSlides = [
  { src: shortenBasicScreenshot, alt: 'Shortening a long URL with title, slug, redirect mode, and status options' },
  { src: shortenAccessScreenshot, alt: 'Access Control tab with password and expiry options' },
  { src: shortenedLinksScreenshot, alt: 'List of shortened links with click counts' },
];

const bioSlides = [
  { src: bioDesignScreenshot, alt: 'Bio page Design tab with the Minimal template selected' },
  { src: bioBlocksScreenshot, alt: 'Bio page profile and block editor' },
  { src: bioPreviewScreenshot, alt: 'Live preview of a bio page using the Minimal template' },
];

const analyticsSlides = [
  { src: statsScreenshot, alt: 'Dashboard stat tiles: total links, total clicks, and clicks today' },
  { src: countriesScreenshot, alt: 'Clicks by country on a world map' },
  { src: devicesScreenshot, alt: 'Clicks by device in a pie chart' },
];

const steps = [
  {
    number: '01',
    title: 'Shorten your link',
    description: 'Drop in any long URL and get a short, brandable OptiLink in return.',
  },
  {
    number: '02',
    title: 'Build your bio page',
    description: 'Pick a layout, drag and drop blocks, and add products, tabs, and categories with a live preview.',
  },
  {
    number: '03',
    title: 'Track every click',
    description: 'See link clicks and QR scans by country, device, and browser, all from your dashboard.',
  },
];

const stepSlides = [shortenSlides, bioSlides, analyticsSlides];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="home-section">
      <div className="home-container">
        <h2 className="home-heading home-heading--center">How it works</h2>

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
