import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { ArrowUpRight, Check, Download, Flower2, Info, Leaf, Link2, Pause, Play, QrCode, Snowflake, Sprout, Sun, X } from 'lucide-react';
import { buildQRMatrix } from '../MagicTreeQR/engine/QRMatrixBuilder';
import { decodeShareState, encodeShareState } from '../MagicTreeQR/engine/shareState';
import type { MagicTreeConfig, SeasonId } from '../MagicTreeQR/types/magicTree';
import { DEFAULT_CONFIG } from '../MagicTreeQR/types/magicTree';
import { WebGPUTreeSceneManager } from './engine/WebGPUTreeSceneManager';
import { TREE_ART } from './engine/artDirection';
import './MagicTreeWebGPUContainer.css';

const SEASONS = [
  { id: 'spring', label: 'Xuân', title: 'Mùa hoa nở.', subtitle: 'Một chút dịu dàng, gửi qua một liên kết.', icon: Flower2, detail: 'Hoa anh đào · Gió nhẹ', number: '01' },
  { id: 'summer', label: 'Hạ', title: 'Một khoảng xanh.', subtitle: 'Giữ lại một chút bình yên giữa ngày dài.', icon: Sun, detail: 'Tán lá xanh · Nắng ấm', number: '02' },
  { id: 'autumn', label: 'Thu', title: 'Chạm vào mùa thu.', subtitle: 'Để những điều đẹp đẽ tìm đến nhau.', icon: Leaf, detail: 'Lá hổ phách · Gió thu', number: '03' },
  { id: 'winter', label: 'Đông', title: 'Bình yên ghé qua.', subtitle: 'Một khu vườn nhỏ, một điều muốn sẻ chia.', icon: Snowflake, detail: 'Tán phủ sương · Tuyết nhẹ', number: '04' },
] as const;

function qrPath(url: string) {
  const grid = buildQRMatrix(url);
  let path = '';
  for (let r = 0; r < grid.size; r++) for (let c = 0; c < grid.size; c++) {
    if (grid.matrix[r][c]) path += `M${c} ${r}h1v1h-1z`;
  }
  return { size: grid.size, path };
}

function StaticQR({ url, ink }: { url: string; ink: string }) {
  const qr = useMemo(() => qrPath(url), [url]);
  return <svg className="tree-static-qr" viewBox={`-4 -4 ${qr.size + 8} ${qr.size + 8}`} role="img" aria-label={`Mã QR cho ${url}`}>
    <rect x="-4" y="-4" width={qr.size + 8} height={qr.size + 8} fill="#faf8f0" />
    <path d={qr.path} fill={ink} shapeRendering="crispEdges" />
  </svg>;
}

export function MagicTreeWebGPUContainer({ embedded = false }: { embedded?: boolean }) {
  const initial = useMemo(() => {
    const candidate = decodeShareState(new URLSearchParams(window.location.search).get('q'));
    try {
      const url = new URL(candidate.targetUrl);
      if (!['http:', 'https:'].includes(url.protocol) || candidate.targetUrl.length > 1200) return DEFAULT_CONFIG;
      buildQRMatrix(candidate.targetUrl);
      return candidate;
    } catch { return DEFAULT_CONFIG; }
  }, []);
  const [urlInput, setUrlInput] = useState(initial.targetUrl);
  const [config, setConfig] = useState<MagicTreeConfig>(initial);
  const [season, setSeason] = useState<SeasonId>(initial.season);
  const [support, setSupport] = useState<'checking' | 'ready' | 'unsupported'>('checking');
  const [error, setError] = useState('');
  const [flat, setFlat] = useState(false);
  const [settled, setSettled] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [motionOverride, setMotionOverride] = useState(() => {
    try { return localStorage.getItem('optilink-tree-motion') === 'on'; } catch { return false; }
  });
  const [copied, setCopied] = useState(false);
  const [info, setInfo] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const managerRef = useRef<WebGPUTreeSceneManager | null>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const art = TREE_ART[season];
  const current = SEASONS.find(item => item.id === season)!;
  const pending = config.targetUrl !== urlInput.trim() || config.season !== season;
  const effectiveReduced = reduced && !motionOverride;

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => setReduced(media.matches);
    media.addEventListener('change', change);
    return () => media.removeEventListener('change', change);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;
    void WebGPUTreeSceneManager.create(canvas).then(manager => {
      if (cancelled) { manager?.dispose(); return; }
      if (!manager) { setSupport('unsupported'); return; }
      manager.onUnavailable = () => {
        managerRef.current = null;
        setSupport('unsupported');
        setSettled(true);
        setFlat(true);
        setTransitioning(false);
      };
      manager.onViewSettled = isFlat => { setSettled(isFlat); setTransitioning(false); };
      managerRef.current = manager;
      setSupport('ready');
    }).catch(() => { if (!cancelled) setSupport('unsupported'); });
    return () => {
      cancelled = true;
      managerRef.current?.dispose();
      managerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const value = urlInput.trim();
      if (!value) { setError('Nhập một liên kết để gieo cây của bạn.'); return; }
      try {
        const parsed = new URL(value);
        if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('protocol');
        buildQRMatrix(value);
        const next: MagicTreeConfig = { targetUrl: value, season, palette: 'rose' };
        setConfig(next);
        setError('');
        const location = new URL(window.location.href);
        location.searchParams.set('q', encodeShareState(next));
        window.history.replaceState(null, '', location.pathname + location.search);
      } catch { setError('Dùng liên kết đầy đủ bắt đầu bằng https:// hoặc http://.'); }
    }, 450);
    return () => window.clearTimeout(timer);
  }, [urlInput, season]);

  useEffect(() => {
    if (support !== 'ready') return;
    try { managerRef.current?.rebuild(config); }
    catch {
      // GPU allocation can fail independently of the already-validated URL.
      managerRef.current?.dispose();
      managerRef.current = null;
      queueMicrotask(() => setSupport('unsupported'));
    }
  }, [config, support]);

  useEffect(() => { managerRef.current?.setMotion(paused, effectiveReduced); }, [paused, effectiveReduced, support]);
  useEffect(() => () => { if (copyTimer.current) clearTimeout(copyTimer.current); }, []);
  useEffect(() => {
    if (info) dialogRef.current?.showModal();
    else dialogRef.current?.close();
  }, [info]);

  const toggle = (immediate = false) => {
    if (!managerRef.current) return;
    setSettled(false);
    setTransitioning(true);
    setFlat(managerRef.current.toggleView(immediate));
  };

  const toggleMotion = () => {
    if (effectiveReduced) {
      setMotionOverride(true);
      setPaused(false);
      try { localStorage.setItem('optilink-tree-motion', 'on'); } catch { /* Storage is optional. */ }
    } else {
      setPaused(value => !value);
    }
  };

  const share = async () => {
    const shareUrl = new URL('/magic-tree', window.location.origin);
    shareUrl.searchParams.set('q', encodeShareState(config));
    try {
      await navigator.clipboard.writeText(shareUrl.href);
      setCopied(true);
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 2200);
    } catch { window.prompt('Sao chép liên kết khu vườn:', shareUrl.href); }
  };

  const download = () => {
    const { path, size } = qrPath(config.targetUrl);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="-4 -4 ${size + 8} ${size + 8}"><rect x="-4" y="-4" width="${size + 8}" height="${size + 8}" fill="#faf8f0"/><path d="${path}" fill="${TREE_ART[config.season].ink}" shape-rendering="crispEdges"/></svg>`;
    const objectUrl = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
    const a = document.createElement('a');
    a.href = objectUrl; a.download = 'optilink-magic-tree-qr.svg'; a.click();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  };

  return <section className={`tree-world ${embedded ? 'tree-world--embedded' : ''}`} data-season={season}
    data-view={support === 'unsupported' ? 'fallback' : transitioning ? 'transition' : settled ? 'flat' : 'tree'}
    style={{ '--tree-bg': art.background, '--tree-ink': art.ink, '--tree-tint': art.canopy } as CSSProperties}>
    <header className="tree-header">
      <a className="tree-brand" href={embedded ? '/dashboard' : '/'} aria-label="Về OptiLink"><span className="tree-brand-mark"><Sprout size={23} strokeWidth={1.6} /></span><span>OptiLink <small>MAGIC TREE</small></span></a>
      <div className="tree-header-actions">
        {embedded && <a href={`/magic-tree?q=${encodeURIComponent(encodeShareState(config))}`} className="tree-icon-button" aria-label="Mở toàn màn hình"><ArrowUpRight size={19} /></a>}
        <button className="tree-icon-button" onClick={download} disabled={!!error || pending} aria-label="Tải mã QR" title="Tải mã QR"><Download size={18} /></button>
        <button className="tree-icon-button" onClick={() => setInfo(true)} aria-label="Giới thiệu Magic Tree"><Info size={18} /></button>
      </div>
    </header>

    <div className="tree-intro">
      <span className="tree-eyebrow">MỘT LIÊN KẾT · MỘT KHU VƯỜN</span>
      <h1>{flat || support === 'unsupported' ? 'Một chạm, kết nối.' : current.title}</h1>
      <p>{flat || support === 'unsupported' ? 'Mở camera và quét mã để ghé thăm liên kết.' : current.subtitle}</p>
    </div>

    <div className="tree-stage">
      {support === 'unsupported' ? <div className="tree-fallback"><StaticQR url={config.targetUrl} ink={TREE_ART[config.season].ink} /><p>Chế độ QR tĩnh · Sẵn sàng để quét</p></div> : <>
        <canvas ref={canvasRef} className="tree-canvas" role="button" tabIndex={0}
          aria-label={flat ? 'Quay lại cây 3D' : 'Xem mã QR'} aria-pressed={flat}
          onClick={() => toggle()} onKeyDown={event => {
            if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); toggle(true); }
          }} />
        {support === 'checking' && <div className="tree-loading" role="status"><Sprout size={28} /><span>Đang gieo mầm…</span></div>}
      </>}
    </div>

    <aside className="tree-specimen" aria-hidden="true"><span>GARDEN / {current.number}</span><span>{current.detail}</span></aside>
    <div className="tree-dock">
      <div className="tree-control-card">
        <div className="tree-view-toolbar">
          <div className="tree-view-switch" role="group" aria-label="Chế độ hiển thị">
            <button aria-pressed={!flat && support !== 'unsupported'} disabled={support !== 'ready'} onClick={event => { if (flat) toggle(event.detail === 0); }}><Sprout size={16} /> Cây 3D</button>
            <button aria-pressed={flat || support === 'unsupported'} disabled={support !== 'ready'} onClick={event => { if (!flat) toggle(event.detail === 0); }}><QrCode size={16} /> Mã QR 2D</button>
          </div>
          <button className="tree-motion-toggle" aria-pressed={!paused && !effectiveReduced}
            aria-label={effectiveReduced ? 'Bật hiệu ứng chuyển động' : paused ? 'Tiếp tục chuyển động' : 'Tạm dừng chuyển động'}
            onClick={toggleMotion} disabled={support !== 'ready'}>
            {paused || effectiveReduced ? <Play size={14} /> : <Pause size={14} />}
            <span>{effectiveReduced ? 'Bật hiệu ứng' : paused ? 'Tiếp tục' : 'Đang chuyển động'}</span>
          </button>
        </div>
        <div className="tree-link-row">
          <Link2 size={18} aria-hidden="true" />
          <input aria-label="Liên kết của bạn" aria-invalid={!!error} aria-describedby={error ? 'tree-error' : undefined}
            type="url" value={urlInput} onChange={event => setUrlInput(event.target.value)} placeholder="https://your-link.com" spellCheck={false} maxLength={1200} />
          <button className="tree-share" disabled={!!error || pending} onClick={share} aria-label={copied ? 'Đã sao chép' : 'Chia sẻ khu vườn'}>
            {copied ? <Check size={18} /> : <ArrowUpRight size={19} />}<span>{copied ? 'Đã chép' : 'Chia sẻ'}</span>
          </button>
        </div>
        <div className="tree-season-row">
          <div className="tree-seasons" role="group" aria-label="Chọn mùa">
            {SEASONS.map(item => <button key={item.id} aria-pressed={season === item.id} onClick={() => setSeason(item.id)}>
              <item.icon size={17} strokeWidth={1.6} /><span>{item.label}</span>
            </button>)}
          </div>
        </div>
      </div>
      <p className={`tree-footnote ${error ? 'tree-error' : ''}`} id="tree-error" role="status">
        {error || (copied ? 'Đã sao chép liên kết. Gửi khu vườn này đến một người bạn.' : support === 'unsupported' ? 'Trình duyệt đang dùng QR tĩnh · Sẵn sàng để quét' : transitioning ? (flat ? 'Khu vườn đang hạ xuống · Đang mở mã QR…' : 'Khu vườn đang trở lại…') : effectiveReduced ? 'Thiết bị đang giảm chuyển động. Chọn “Bật hiệu ứng” để xem animation.' : settled ? 'Mã QR đã sẵn sàng · Mở camera để quét' : `${current.detail} · Chọn Mã QR 2D để chuyển cảnh`)}
      </p>
    </div>
    <dialog ref={dialogRef} className="tree-dialog" onCancel={() => setInfo(false)} onClick={event => { if (event.target === event.currentTarget) setInfo(false); }}>
      <button className="tree-icon-button tree-dialog-close" onClick={() => setInfo(false)} aria-label="Đóng"><X size={18} /></button>
      <Sprout size={32} strokeWidth={1.3} /><h2>Một khu vườn để sẻ chia.</h2>
      <p>Dán liên kết, chọn một mùa và ngắm cây của bạn lớn lên. Chạm vào cây để mở mã QR, hoặc tải mã để dùng ở bất cứ đâu.</p>
      <p>Hình dáng cây được tạo từ chính liên kết. Cùng một liên kết sẽ luôn gặp lại cùng một cây.</p>
      <button className="tree-dialog-action" onClick={() => { setInfo(false); if (!flat) toggle(); }}><QrCode size={17} /> Khám phá mã QR</button>
    </dialog>
  </section>;
}
