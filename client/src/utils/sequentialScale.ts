// Sequential blue ramp, light -> dark - used for magnitude encoding (share of
// the busiest country), not identity, so CountryMap and its matching list
// stay on a single hue rather than a categorical rainbow.
const STEPS = ['#cde2fb', '#9ec5f4', '#6da7ec', '#3987e5', '#1c5cab', '#0d366b'];
export const NO_DATA_COLOR = '#e1e0d9'; // gridline gray

/** Pick a step from the sequential ramp by value's share of max. */
export function shadeForShare(value: number, max: number): string {
  if (!value) return NO_DATA_COLOR;
  const share = Math.min(1, value / (max || 1));
  const idx = Math.min(STEPS.length - 1, Math.floor(share * (STEPS.length - 1)));
  return STEPS[idx];
}
