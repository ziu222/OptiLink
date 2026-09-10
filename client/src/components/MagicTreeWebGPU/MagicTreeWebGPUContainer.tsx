import { useEffect, useMemo, useRef, useState } from 'react';
import { buildQRMatrix } from '../MagicTreeQR/engine/QRMatrixBuilder';
import { decodeShareState, encodeShareState } from '../MagicTreeQR/engine/shareState';
import {
  PALETTE_PRESETS,
  SEASON_THEMES,
  type MagicTreeConfig,
  type PaletteId,
  type SeasonId,
} from '../MagicTreeQR/types/magicTree';
import { WebGPUTreeSceneManager } from './engine/WebGPUTreeSceneManager';
import '../MagicTreeQR/MagicTreeContainer.css';
import './MagicTreeWebGPUContainer.css';

const DEBOUNCE_MS = 500;

type SupportState = 'checking' | 'ready' | 'unsupported';

/**
 * Static QR for browsers without WebGPU — spec §7. Same matrix the tree's
 * ground layer is built from, so the link stays scannable everywhere.
 */
function FallbackQR({ url }: { url: string }) {
  const grid = useMemo(() => {
    try {
      return buildQRMatrix(url);
    } catch {
      return null;
    }
  }, [url]);

  if (!grid) return null;

  const modules = [];
  for (let row = 0; row < grid.size; row++) {
    for (let col = 0; col < grid.size; col++) {
      if (grid.matrix[row][col]) {
        modules.push(<rect key={`${row}-${col}`} x={col} y={row} width={1} height={1} />);
      }
    }
  }

  return (
    <svg
      className="magic-tree-fallback-qr"
      viewBox={`-2 -2 ${grid.size + 4} ${grid.size + 4}`}
      role="img"
      aria-label={`Mã QR cho ${url}`}
    >
      <rect x={-2} y={-2} width={grid.size + 4} height={grid.size + 4} fill="#ffffff" />
      <g fill="#111827" shapeRendering="crispEdges">
        {modules}
      </g>
    </svg>
  );
}

export function MagicTreeWebGPUContainer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const managerRef = useRef<WebGPUTreeSceneManager | null>(null);
  const debounceRef = useRef<number | null>(null);

  const initial = useMemo(
    () => decodeShareState(new URLSearchParams(window.location.search).get('q')),
    []
  );
  const [urlInput, setUrlInput] = useState(initial.targetUrl);
  const [season, setSeason] = useState<SeasonId>(initial.season);
  const [palette, setPalette] = useState<PaletteId>(initial.palette);
  const [error, setError] = useState<string | null>(null);
  const [support, setSupport] = useState<SupportState>('checking');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let cancelled = false;
    void WebGPUTreeSceneManager.create(canvas).then((manager) => {
      if (!manager) {
        if (!cancelled) setSupport('unsupported');
        return;
      }
      // The canvas may already be gone by the time the device resolves.
      if (cancelled) {
        manager.dispose();
        return;
      }
      managerRef.current = manager;
      setSupport('ready');
    });

    return () => {
      cancelled = true;
      managerRef.current?.dispose();
      managerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (support !== 'ready') return;
    const manager = managerRef.current;
    if (!manager) return;

    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      const trimmed = urlInput.trim();
      if (!trimmed) {
        setError('Nhập một URL để tạo cây QR');
        return;
      }
      try {
        manager.rebuild({ targetUrl: trimmed, season, palette });
        setError(null);
        const q = encodeShareState({ targetUrl: trimmed, season, palette });
        window.history.replaceState(null, '', `?q=${encodeURIComponent(q)}`);
      } catch {
        setError('URL không hợp lệ để tạo mã QR');
      }
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [urlInput, season, palette, support]);

  const handleTap = () => managerRef.current?.toggleView();

  const handleShare = async () => {
    const config: MagicTreeConfig = {
      targetUrl: urlInput.trim() || 'https://optilink.app',
      season,
      palette,
    };
    const q = encodeShareState(config);
    const shareUrl = `${window.location.origin}${window.location.pathname}?q=${encodeURIComponent(q)}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      window.prompt('Sao chép link chia sẻ:', shareUrl);
    }
  };

  return (
    <div className="magic-tree">
      {support === 'unsupported' ? (
        <div className="magic-tree-fallback">
          <p className="magic-tree-fallback-note">
            Trình duyệt của bạn chưa hỗ trợ WebGPU — đây là mã QR tĩnh thay thế.
          </p>
          <FallbackQR url={urlInput.trim() || 'https://optilink.app'} />
          <a className="magic-tree-fallback-link" href="/dashboard/qr">
            Mở QR Studio
          </a>
        </div>
      ) : (
        <>
          <canvas
            ref={canvasRef}
            className="magic-tree-canvas"
            onClick={handleTap}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleTap();
              }
            }}
            tabIndex={0}
            role="button"
            aria-label="Chạm hoặc nhấn Enter để xem mã QR"
          />
          <p className="magic-tree-hint">Chạm vào cây để xem mã QR</p>
        </>
      )}

      <div className="magic-tree-controls">
        <input
          type="url"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="https://optilink.app"
          className="magic-tree-input"
        />
        <button type="button" onClick={handleShare} className="magic-tree-share">
          Chia sẻ
        </button>
      </div>

      {error && <p className="magic-tree-error">{error}</p>}

      <div className="magic-tree-seasons">
        {(Object.keys(SEASON_THEMES) as SeasonId[]).map((id) => (
          <button
            key={id}
            type="button"
            className={`magic-tree-season${season === id ? ' is-active' : ''}`}
            onClick={() => setSeason(id)}
          >
            {SEASON_THEMES[id].label}
          </button>
        ))}
      </div>

      <div className="magic-tree-palettes">
        {PALETTE_PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            className={`magic-tree-palette${palette === p.id ? ' is-active' : ''}`}
            style={{ backgroundColor: p.color }}
            aria-label={p.label}
            onClick={() => setPalette(p.id)}
          />
        ))}
      </div>
    </div>
  );
}
