import { api } from '../lib/axios';

// Raw QRCode document from the server (same shape the other /qr endpoints return).
export interface LinkQr {
  _id: string;
  linkId: string | null;
  title: string;
  targetUrl: string;
  previewUrl: string; // data:image/png;base64,... (256px)
  config: {
    fgColor: string;
    bgColor: string;
    logoUrl: string | null;
    eyeType: 'square' | 'rounded' | 'dot';
    dotType: 'square' | 'rounded' | 'dots';
    size: number;
    errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  };
  createdAt: string;
}

// The QR for a link, created on the server on first request.
export const getOrCreateLinkQr = async (linkId: string): Promise<LinkQr> => {
  const res = await api.get(`/qr/link/${linkId}`);
  return res.data.data.qr;
};

// The download route needs the bearer header, so it can't be a plain <a href>.
export const downloadQrPng = async (qrId: string, filenameHint: string): Promise<void> => {
  const res = await api.get(`/qr/${qrId}/download`, {
    params: { format: 'png' },
    responseType: 'blob',
  });
  const url = URL.createObjectURL(res.data as Blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filenameHint || 'qr'}.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};
