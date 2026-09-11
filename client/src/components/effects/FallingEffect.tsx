import { memo, useEffect, useState, type CSSProperties } from 'react';
import type { IThemeConfig } from '../../types/bio';
import './FallingEffect.css';

export const FallingEffect = memo(function FallingEffect({ effect = 'none', paused = false, allowMotion = false }: {
  effect?: IThemeConfig['effect'];
  paused?: boolean;
  allowMotion?: boolean;
}) {
  const [hidden, setHidden] = useState(() => typeof document !== 'undefined' && document.hidden);
  useEffect(() => {
    const sync = () => setHidden(document.hidden);
    document.addEventListener('visibilitychange', sync);
    return () => document.removeEventListener('visibilitychange', sync);
  }, []);
  if (effect === 'none') return null;
  return (
    <div className="bg-effect-layer" data-paused={paused || hidden} data-allow-motion={allowMotion} aria-hidden="true">
      {Array.from({ length: 24 }, (_, i) => (
        <span key={i} className={`bio-particle bio-particle--${effect}`} style={{
          left: `${(i * 37 + 7) % 100}%`,
          '--duration': `${effect === 'rain' ? 1.6 + i % 3 * .3 : 12 + i % 9}s`,
          '--delay': `${-(i * 1.73)}s`,
          '--drift': `${(i % 2 ? 1 : -1) * (18 + i % 5 * 9)}px`,
          '--size': `${5 + i % 5 * 1.5}px`,
          '--turn': `${i % 2 ? 160 : -130}deg`,
        } as CSSProperties}><i /></span>
      ))}
    </div>
  );
});
