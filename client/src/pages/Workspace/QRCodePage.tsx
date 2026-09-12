import { useEffect, useMemo, useState } from 'react';
import { Download, Link2, QrCode, Sparkles } from 'lucide-react';
import { PageHeader } from '../../components/workspace/PageHeader/PageHeader';
import { downloadQrPng, getOrCreateLinkQr, type LinkQr } from '../../api/qr';
import { listLinks, type ShortenedLink } from '../../api/links';
import './QRCodePage.css';
import { LoadingCircle } from '../../components/workspace/LoadingCircle/LoadingCircle';

export function QRCodePage() {
  const [links, setLinks] = useState<ShortenedLink[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [qr, setQr] = useState<LinkQr | null>(null);
  const [loading, setLoading] = useState(true);
  const [building, setBuilding] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    listLinks({ limit: 100, status: 'active', sort: 'newest' })
      .then((result) => {
        if (cancelled) return;
        setLinks(result.links);
        if (result.links[0]) setSelectedId(result.links[0].id);
      })
      .catch(() => !cancelled && setError('Không thể tải thư viện liên kết.'))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, []);

  const selectedLink = useMemo(
    () => links.find((link) => link.id === selectedId) ?? null,
    [links, selectedId],
  );

  const buildQr = async () => {
    if (!selectedLink) return;
    setBuilding(true);
    setError('');
    try {
      setQr(await getOrCreateLinkQr(selectedLink.id));
    } catch {
      setError('Không thể tạo QR cho liên kết này. Hãy thử lại.');
    } finally {
      setBuilding(false);
    }
  };

  return (
    <>
      <PageHeader title="QR Studio" />
      <div className="qr-studio page-content">
        <section className="qr-studio-hero">
          <span className="qr-studio-kicker"><Sparkles size={15} /> Link library · QR library</span>
          <h2>Một link, mọi điểm chạm.</h2>
          <p>Chọn bất kỳ link ngắn nào — kể cả link được tạo từ Bio Page — để tạo QR, tải xuống và theo dõi trong cùng một workspace.</p>
        </section>

        <section className="qr-studio-grid" aria-busy={loading}>
          <div className="qr-studio-library">
            <div className="qr-studio-section-head"><div><span>THƯ VIỆN LIÊN KẾT</span><h3>Link đã rút gọn</h3></div><span className="qr-count">{links.length}</span></div>
            {loading && <LoadingCircle label="Đang tải thư viện liên kết…" />}
            {!loading && !links.length && <p className="qr-empty">Chưa có link nào. Tạo link ở Shorten Link hoặc thêm block link trên Bio Page.</p>}
            <div className="qr-link-list" role="listbox" aria-label="Chọn link để tạo QR">
              {links.map((link) => (
                <button key={link.id} type="button" disabled={building} className={`qr-link-choice${selectedId === link.id ? ' is-selected' : ''}`} onClick={() => { setSelectedId(link.id); setQr(null); }} role="option" aria-selected={selectedId === link.id}>
                  <span className="qr-link-choice-icon"><Link2 size={17} /></span>
                  <span><strong>{link.title || 'Liên kết chưa đặt tên'}</strong><small>{link.shortUrl}</small></span>
                  <span className="qr-link-clicks">{link.clicks} clicks</span>
                </button>
              ))}
            </div>
          </div>

          <div className="qr-studio-canvas">
            <div className="qr-studio-section-head"><div><span>QR SẴN SÀNG QUÉT</span><h3>{selectedLink?.title || 'Chọn một link'}</h3></div><QrCode size={22} /></div>
            {qr ? <img className="qr-studio-image" src={qr.previewUrl} alt={`Mã QR cho ${selectedLink?.shortUrl ?? ''}`} /> : <div className="qr-studio-placeholder"><QrCode size={48} /><p>{selectedLink ? 'Tạo QR cho link đã chọn' : 'Chọn link từ thư viện'}</p></div>}
            {error && <p className="qr-studio-error" role="alert">{error}</p>}
            <div className="qr-studio-actions">
              <button type="button" className="qr-primary-action" onClick={buildQr} disabled={!selectedLink || building}>{building ? <LoadingCircle inline label="Đang tạo…" /> : qr ? 'Làm mới QR' : 'Tạo QR Code'}</button>
              {qr && <button type="button" className="qr-secondary-action" onClick={() => downloadQrPng(qr._id, selectedLink?.slug || 'optilink-qr')}><Download size={16} /> Tải PNG</button>}
            </div>
            {selectedLink && <p className="qr-studio-target">QR này dẫn tới <strong>{selectedLink.shortUrl}</strong> và tự ghi nhận lượt quét.</p>}
          </div>
        </section>
      </div>
    </>
  );
}
