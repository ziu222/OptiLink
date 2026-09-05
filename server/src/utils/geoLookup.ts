import axios from 'axios';

export interface GeoResult {
  country: string;
  city: string;
}

const UNKNOWN: GeoResult = { country: 'unknown', city: 'unknown' };

/**
 * ip-api.com can't resolve private/loopback ranges anyway (returns a
 * "private range" failure) — skip the network round-trip for exactly the
 * traffic that would fail, which is also what local dev/testing looks like.
 */
const isPrivateOrLoopback = (ip: string): boolean => {
  const addr = ip.replace(/^::ffff:/, '');
  return (
    addr === '::1' ||
    /^127\./.test(addr) ||
    /^10\./.test(addr) ||
    /^192\.168\./.test(addr) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(addr) ||
    /^169\.254\./.test(addr) ||
    /^f[cd][0-9a-f]{2}:/i.test(addr) ||
    /^fe80:/i.test(addr)
  );
};

/**
 * Resolves an IP to a country/city via ip-api.com (free tier, HTTP-only, no
 * key). Never throws — any failure (private IP, timeout, bad response) falls
 * back to 'unknown' so this stays safe to call unawaited from the redirect
 * hot path (see redirect.service.ts's recordHit).
 */
export async function lookupGeo(ip: string): Promise<GeoResult> {
  if (!ip || ip === 'unknown' || isPrivateOrLoopback(ip)) {
    return UNKNOWN;
  }

  try {
    const { data } = await axios.get(`http://ip-api.com/json/${ip}`, {
      params: { fields: 'status,countryCode,city' },
      timeout: 3000,
    });
    if (data?.status === 'success' && data.countryCode) {
      return { country: data.countryCode, city: data.city || 'unknown' };
    }
  } catch (err) {
    console.error('Geo lookup failed:', err instanceof Error ? err.message : err);
  }
  return UNKNOWN;
}
