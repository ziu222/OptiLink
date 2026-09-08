import { useEffect, useMemo, useRef, useState } from 'react';
import { TreeSceneManager } from './engine/TreeSceneManager';
import { decodeShareState, encodeShareState } from './engine/shareState';
import {
  SEASON_THEMES,
  PALETTE_PRESETS,
  type SeasonId,
  type PaletteId,
  type MagicTreeConfig,
} from './types/magicTree';
import './MagicTreeContainer.css';

const DEBOUNCE_MS = 500;

export function MagicTreeContainer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const managerRef = useRef<TreeSceneManager | null>(null);
  const debounceRef = useRef<number | null>(null);

  const initial = useMemo(
    () => decodeShareState(new URLSearchParams(window.location.search).get('q')),
    []
  );
  const [urlInput, setUrlInput] = useState(initial.targetUrl);
  const [season, setSeason] = useState<SeasonId>(initial.season);
  const [palette, setPalette] = useState<PaletteId>(initial.palette);
  const [muted, setMuted] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const manager = new TreeSceneManager(canvasRef.current);
    managerRef.current = manager;
    return () => {
      manager.dispose();
      managerRef.current = null;
    };
  }, []);

  useEffect(() => {
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
        window.history.replaceState(null, '', `?q=${q}`);
      } catch {
        setError('URL không hợp lệ để tạo mã QR');
      }
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [urlInput, season, palette]);

  useEffect(() => {
    managerRef.current?.audio.setMuted(muted);
  }, [muted]);

  const handleTap = () => managerRef.current?.toggleView();

  const handleShare = async () => {
    const config: MagicTreeConfig = {
      targetUrl: urlInput.trim() || 'https://optilink.app',
      season,
      palette,
    };
    const q = encodeShareState(config);
    const shareUrl = `${window.location.origin}${window.location.pathname}?q=${q}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      window.prompt('Sao chép link chia sẻ:', shareUrl);
    }
  };

  return (
    <div className="magic-tree">
      <canvas ref={canvasRef} className="magic-tree-canvas" onClick={handleTap} />
      <p className="magic-tree-hint">Chạm vào cây để xem mã QR</p>

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
        <button type="button" onClick={() => setMuted((m) => !m)} className="magic-tree-mute">
          {muted ? 'Bật âm thanh' : 'Tắt âm thanh'}
        </button>
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
