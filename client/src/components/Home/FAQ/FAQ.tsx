import type { ReactNode } from 'react';
import './FAQ.css';

const faqs: { question: string; answer: ReactNode }[] = [
  {
    question: 'What is OptiLink?',
    answer:
      'One platform for managing your links: shorten URLs, build a bio page, and generate QR codes, all from one workspace.',
  },
  {
    question: 'How much does it cost?',
    answer: (
      <>
        Free to get started. The Premium plan unlocks custom aliases, password protection, and advanced
        analytics. See <a href="/#pricing">Pricing</a> above.
      </>
    ),
  },
  {
    question: 'Do I need an account to shorten a link?',
    answer: 'Yes. Creating an account lets you manage, protect, and track every link, bio page, and QR code you make.',
  },
  {
    question: 'Can I customize my bio page?',
    answer:
      'Yes. Pick from 5 layout themes, then drag and drop blocks such as product cards, tabs, search, and category filters, with a live preview as you edit.',
  },
  {
    question: 'Do QR codes work for any link?',
    answer: 'Yes. Every short link and bio page gets a downloadable QR code, with scans tracked separately from clicks.',
  },
  {
    question: 'Can I put a password on a link or make it expire?',
    answer: 'Yes. Access Control lets you require a password before redirect, set an expiration date, or cap the number of clicks a link accepts.',
  },
  {
    question: 'What happens after someone clicks my link or scans my QR code?',
    answer: 'They land on your destination, and the visit is recorded in your analytics, broken down by country, device, and browser.',
  },
];

export function FAQ() {
  return (
    <section id="faq" className="home-section">
      <div className="home-container">
        <h2 className="home-heading home-heading--center">Frequently asked questions</h2>

        <div className="faq-list">
          {faqs.map(({ question, answer }) => (
            <details key={question} className="faq-item">
              <summary className="faq-question">
                {question}
                <span className="faq-plus">+</span>
              </summary>
              <p className="faq-answer">{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
