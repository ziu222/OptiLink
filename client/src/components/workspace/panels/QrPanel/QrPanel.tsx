import { useEffect, useState } from 'react';
import { ContentPanel } from '../ContentPanel/ContentPanel';
import { Button } from '../../Button/Button';
import { getOrCreateLinkQr, downloadQrPng } from '../../../../api/qr';
import type { ShortenedLink } from '../../../../api/links';
import './QrPanel.css';

interface QrPanelProps {
  link: ShortenedLink;
}

// The link's QR code, sitting beside the configuration panel on the detail page.
export function QrPanel({ link }: QrPanelProps) {
  const [previewUrl, setPreviewUrl] = useState('');
  const [qrId, setQrId] = useState('');
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setState('loading');
    getOrCreateLinkQr(link.id)
      .then((qr) => {
        if (cancelled) return;
        setPreviewUrl(qr.previewUrl);
        setQrId(qr._id);
        setState('ready');
      })
      .catch(() => {
        if (!cancelled) setState('error');
      });
    return () => {
      cancelled = true;
    };
  }, [link.id]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadQrPng(qrId, link.slug);
    } catch {
      /* swallow — the button just re-enables so the user can retry */
    } finally {
      setDownloading(false);
    }
  };

  return (
    <ContentPanel title="QR Code" className="qr-panel">
      <div className="qr-panel-preview">
        {state === 'loading' && <p className="qr-panel-status">Generating…</p>}
        {state === 'error' && <p className="qr-panel-status">Couldn’t load QR.</p>}
        {state === 'ready' && <img src={previewUrl} alt={`QR code for ${link.shortUrl}`} />}
      </div>

      <div className="profile-actions">
        <a
          className="button qr-panel-customize"
          href="/qr-demo.html"
          target="_blank"
          rel="noreferrer"
        >
          Customize
        </a>
        <Button onClick={handleDownload} disabled={state !== 'ready' || downloading}>
          {downloading ? 'Downloading…' : 'Download'}
        </Button>
      </div>
    </ContentPanel>
  );
}
