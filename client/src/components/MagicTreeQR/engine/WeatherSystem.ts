import * as THREE from 'three';
import type { SeasonId } from '../types/magicTree';

export interface WeatherResult {
  points: THREE.Points;
  update: (deltaSeconds: number) => void;
  dispose: () => void;
}

interface WeatherParams {
  count: number;
  color: string;
  size: number;
  fallSpeed: [number, number];
  spread: number;
  height: number;
}

const WEATHER_PARAMS: Record<SeasonId, WeatherParams> = {
  spring: { count: 120, color: '#FFB7C5', size: 0.12, fallSpeed: [1.2, 2.2], spread: 15, height: 18 },
  summer: { count: 60, color: '#FEF3C7', size: 0.08, fallSpeed: [0.2, 0.5], spread: 15, height: 18 },
  autumn: { count: 140, color: '#DC2626', size: 0.14, fallSpeed: [2.5, 4.0], spread: 15, height: 18 },
  winter: { count: 100, color: '#F8FAFC', size: 0.1, fallSpeed: [0.8, 1.6], spread: 15, height: 18 },
};

export function buildWeather(season: SeasonId): WeatherResult {
  const params = WEATHER_PARAMS[season];
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(params.count * 3);
  const speeds = new Float32Array(params.count);
  const phases = new Float32Array(params.count);

  for (let i = 0; i < params.count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * params.spread * 2;
    positions[i * 3 + 1] = Math.random() * params.height;
    positions[i * 3 + 2] = (Math.random() - 0.5) * params.spread * 2;
    speeds[i] = params.fallSpeed[0] + Math.random() * (params.fallSpeed[1] - params.fallSpeed[0]);
    phases[i] = Math.random() * Math.PI * 2;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: params.color,
    size: params.size,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
  });

  const points = new THREE.Points(geometry, material);

  const update = (deltaSeconds: number) => {
    const posAttr = geometry.getAttribute('position') as THREE.BufferAttribute;
    for (let i = 0; i < params.count; i++) {
      let y = posAttr.getY(i) - speeds[i] * deltaSeconds;
      let x = posAttr.getX(i) + Math.sin(phases[i] + y * 0.5) * 0.02;
      if (y < 0) {
        y = params.height;
        x = (Math.random() - 0.5) * params.spread * 2;
      }
      posAttr.setX(i, x);
      posAttr.setY(i, y);
    }
    posAttr.needsUpdate = true;
  };

  return {
    points,
    update,
    dispose: () => {
      geometry.dispose();
      material.dispose();
    },
  };
}
