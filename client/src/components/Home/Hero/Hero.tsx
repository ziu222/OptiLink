import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { createAnonymousLink, createLink } from '../../../api/links';
import { useAuth } from '../../../contexts/AuthContext';
import { getErrorMessage } from '../../../lib/formError';
import shortenIllustration from '../../../assets/hero-shorten-illustration.png';
import './Hero.css';

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
      setError('Vui lòng nhập một URL để rút gọn.');
      return;
    }

    setLoading(true);
    try {
      const link = user ? await createLink(url.trim()) : await createAnonymousLink(url.trim());
      setResult({ shortUrl: link.shortUrl, slug: link.slug });
      setUrl('');
    } catch (err) {
      setError(getErrorMessage(err, 'Đã có lỗi xảy ra. Vui lòng thử lại.'));
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
        /* clipboard access denied, nothing more we can do here */
      });
  };

  return (
    <section className="hero-section">
      <div className="home-container hero-grid">
        <img
          className="hero-image"
          src={shortenIllustration}
          alt="Một URL dài được rút gọn thành URL opti.link ngắn gọn"
        />

        <div className="hero-copy">
          <div>
            <h1 className="hero-title">Một liên kết. Mọi cách kết nối.</h1>
            <p className="hero-lede">
              OptiLink gom rút gọn liên kết, trang bio và mã QR vào chung một không gian làm việc. Rút gọn
              liên kết, xây dựng trang của bạn, và xem chính xác ai đang nhấp vào.
            </p>
          </div>

          <div>
            <form onSubmit={handleShorten}>
              <div className="hero-panel">
                <div>
                  <label className="hero-field-label">Dán URL dài của bạn vào đây</label>
                  <div className="hero-field-frame">
                    <input
                      type="url"
                      required
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://example.com/really/long/link/to/shorten"
                      className="hero-input"
                    />
                    <button type="submit" disabled={loading} className="hero-button">
                      {loading ? 'Đang rút gọn…' : 'Rút gọn'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="hero-field-label">Liên kết rút gọn của bạn</label>
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
                      <span className="hero-result">Liên kết rút gọn của bạn sẽ hiện ở đây</span>
                    )}
                    <button
                      type="button"
                      onClick={copyToClipboard}
                      disabled={!result}
                      className="hero-button"
                    >
                      {copied ? '✓ Đã sao chép' : 'Sao chép'}
                    </button>
                  </div>
                </div>
              </div>
            </form>

            {error && <div className="hero-error">⚠️ {error}</div>}

            {result && !user && (
              <p className="hero-upsell">
                Muốn có thống kê, bí danh tùy chỉnh &amp; quản lý liên kết?{' '}
                <Link to="/register">Tạo tài khoản miễn phí</Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
