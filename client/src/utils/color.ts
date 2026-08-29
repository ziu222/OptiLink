export function extractGradientColors(gradient: string): { c1: string; c2: string } {
  const match = gradient.match(/linear-gradient\([^,]+,\s*(#[a-f0-9]+|\w+),\s*(#[a-f0-9]+|\w+)\)/i);
  return match ? { c1: match[1], c2: match[2] } : { c1: '#0f1115', c2: '#16181d' };
}
