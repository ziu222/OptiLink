import { PictureFrame } from './PictureFrame';
import './home.css';

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

              <PictureFrame className="step-frame" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
