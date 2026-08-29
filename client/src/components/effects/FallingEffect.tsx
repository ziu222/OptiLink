import React, { useEffect, useState } from 'react';
import type { IThemeConfig } from '../../types/bio';
import './FallingEffect.css';

type EffectType = IThemeConfig['effect'];

interface Particle {
  id: number;
  left: string;
  duration: string;
  delay: string;
}

export const FallingEffect: React.FC<{ effect?: EffectType }> = ({ effect = 'none' }) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (effect === 'none') {
      setParticles([]);
      return;
    }

    let spawnRate = 300;
    if (['sakura', 'leaf', 'bubble'].includes(effect)) spawnRate = 600;
    else if (effect === 'rain') spawnRate = 100;
    else if (effect === 'confetti') spawnRate = 500;
    else if (effect === 'hearts') spawnRate = 700;
    else if (effect === 'firefly') spawnRate = 800;
    else if (effect === 'glitter') spawnRate = 250;

    const interval = setInterval(() => {
      let duration = Math.random() * 5 + 5;
      if (effect === 'star') duration = Math.random() * 3 + 2;
      else if (effect === 'snow') duration = Math.random() * 4 + 4;
      else if (effect === 'rain') duration = Math.random() * 1 + 0.5;
      else if (effect === 'bubble') duration = Math.random() * 4 + 4;
      else if (effect === 'confetti') duration = Math.random() * 4 + 3;
      else if (effect === 'hearts') duration = Math.random() * 5 + 5;
      else if (effect === 'firefly') duration = Math.random() * 6 + 6;
      else if (effect === 'glitter') duration = Math.random() * 2 + 1.5;

      setParticles((prev) => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          left: Math.random() * 100 + '%',
          duration: duration + 's',
          delay: Math.random() * 2 + 's',
        },
      ].slice(-50)); // Keep max 50 particles
    }, spawnRate);

    return () => clearInterval(interval);
  }, [effect]);

  if (effect === 'none') return null;

  return (
    <div className="bg-effect-layer">
      {particles.map((p) => (
        <div
          key={p.id}
          className={`particle ${effect}`}
          style={{ left: p.left, animationDuration: p.duration, animationDelay: p.delay }}
        ></div>
      ))}
    </div>
  );
};
