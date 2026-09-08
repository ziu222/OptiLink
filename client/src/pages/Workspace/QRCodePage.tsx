import { PageHeader } from '../../components/workspace/PageHeader/PageHeader';
import { ContentPanel } from '../../components/workspace/panels/ContentPanel/ContentPanel';
import './workspace.css';

export function QRCodePage() {
  return (
    <>
      <PageHeader title="QR Code" />
      <ContentPanel title="Mã QR Code">
        <div style={{ padding: '24px 0', color: '#64748b', fontSize: '15px' }}>
          <p style={{ marginBottom: '16px' }}>
            Tính năng quản lý và tạo mã QR tùy biến đã được thêm vào Sidebar.
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <a
              href="/qr-demo.html"
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                background: '#111827',
                color: '#ffffff',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '14px',
              }}
            >
              Mở QR Studio & Themes Demo ↗
            </a>
            <a
              href="http://localhost:5000/api-docs"
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                border: '1px solid #e2e8f0',
                color: '#1e293b',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '14px',
              }}
            >
              Xem Swagger API ↗
            </a>
          </div>
        </div>
      </ContentPanel>
    </>
  );
}
