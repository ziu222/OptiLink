export function extractGradientColors(gradient: string): { c1: string; c2: string } {
  const match = gradient.match(/linear-gradient\([^,]+,\s*(#[a-f0-9]+|\w+),\s*(#[a-f0-9]+|\w+)\)/i);
  if (match) return { c1: match[1], c2: match[2] };
  // A plain hex value (used by the solid 'color' background type) — use it for both.
  if (/^#[0-9a-f]{3,8}$/i.test(gradient)) return { c1: gradient, c2: gradient };
  return { c1: '#0f1115', c2: '#16181d' };
}
