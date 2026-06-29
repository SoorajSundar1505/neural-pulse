/**
 * ASCII sparklines from real numeric samples — no simulation.
 */

const BARS = '▁▂▃▄▅▆▇█';

/**
 * @param {number[]} samples
 * @param {number} width
 * @returns {string}
 */
export function sparkline(samples, width) {
  if (!samples.length || width <= 0) {
    return BARS[0].repeat(Math.max(1, width));
  }

  const slice = samples.slice(-width);
  const min = Math.min(...slice);
  const max = Math.max(...slice);
  const range = max - min;

  return slice
    .map((v) => {
      if (range <= 0) return BARS[4];
      const t = (v - min) / range;
      const idx = Math.min(BARS.length - 1, Math.max(0, Math.round(t * (BARS.length - 1))));
      return BARS[idx];
    })
    .join('');
}
