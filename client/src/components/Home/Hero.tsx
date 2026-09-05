import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { createLink } from '../../api/links';
import { useAuth } from '../../contexts/AuthContext';
import shortenIllustration from '../../assets/hero-shorten-illustration.png';
import './home.css';

export function Hero() {
  const { user } = useAuth();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ shortUrl: string; slug: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleShorten = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!url.trim()) {
      setError('Please enter a URL to shorten.');
      return;
    }

    setLoading(true);
    try {
      const link = await createLink(url.trim());
      setResult({ shortUrl: link.shortUrl, slug: link.slug });
      setUrl('');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!result) return;
    navigator.clipboard
      .writeText(result.shortUrl)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        /* clipboard access denied — nothing more we can do here */
      });
  };

  return (
    <section className="hero-section">
      <div className="home-container hero-grid">
        <img
          className="hero-image"
          src={shortenIllustration}
          alt="A long URL shortened to a short opti.link URL"
        />

        <div className="hero-copy">
          <div>
            <h1 className="hero-title">One Link. Every Way to Connect.</h1>
            <p className="hero-lede">
              OptiLink brings URL shortening, bio pages, and QR codes together in one workspace. Shorten a
              link, build your page, and see exactly who&apos;s clicking.
            </p>
          </div>

          <div>
            <form onSubmit={handleShorten}>
              <div className="hero-panel">
                <div>
                  <label className="hero-field-label">Paste your long URL</label>
                  <div className="hero-field-frame">
                    <input
                      type="url"
                      required
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://example.com/very-long-link-to-shorten"
                      className="hero-input"
                    />
                    <button type="submit" disabled={loading} className="hero-button">
                      {loading ? 'Shortening…' : 'Shorten'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="hero-field-label">Your shortened link</label>
                  <div className="hero-field-frame">
                    {result ? (
                      <a
                        href={result.shortUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="hero-result hero-result--link"
                      >
                        {result.shortUrl}
                      </a>
                    ) : (
                      <span className="hero-result">Your shortened link will appear here</span>
                    )}
                    <button
                      type="button"
                      onClick={copyToClipboard}
                      disabled={!result}
                      className="hero-button"
                    >
                      {copied ? '✓ Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
              </div>
            </form>

            {error && <div className="hero-error">⚠️ {error}</div>}

            {result && !user && (
              <p className="hero-upsell">
                Want analytics, custom aliases &amp; link management?{' '}
                <Link to="/register">Create a free account</Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
