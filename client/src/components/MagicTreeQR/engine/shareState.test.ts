import { describe, expect, it } from 'vitest';
import { decodeShareState, encodeShareState } from './shareState';
import { DEFAULT_CONFIG } from '../types/magicTree';

describe('shareState', () => {
  it('round-trips a config through encode/decode', () => {
    const config = { targetUrl: 'https://optilink.app/u/demo', season: 'autumn' as const, palette: 'gold' as const };
    const decoded = decodeShareState(encodeShareState(config));
    expect(decoded).toEqual(config);
  });

  it('round-trips URLs with unicode characters', () => {
    const config = { targetUrl: 'https://optilink.app/?tên=xin-chào', season: 'winter' as const, palette: 'silver' as const };
    const decoded = decodeShareState(encodeShareState(config));
    expect(decoded).toEqual(config);
  });

  it('falls back to defaults when q is null', () => {
    expect(decodeShareState(null)).toEqual(DEFAULT_CONFIG);
  });

  it('falls back to defaults when q is malformed', () => {
    expect(decodeShareState('!!!')).toEqual(DEFAULT_CONFIG);
  });
});
