/**
 * Performance panel — sole source of runtime metrics.
 */

import { buildPerformanceDisplay } from '../metrics/performance.js';
import { rightAlignedMetricLine } from '../utils/align.js';
import { CYAN, GREEN } from '../dashboard/theme.js';

/** @typedef {import('../metrics/tracker.js').MetricsTracker} MetricsTracker */
/** @typedef {import('../cli/terminal.js').Region} Region */

export const PERFORMANCE_ROWS = 6;

const LABEL_WIDTH = 14;

/** @type {[string, keyof ReturnType<typeof buildPerformanceDisplay>][]} */
const ROWS = [
  ['Input Token', 'inputTokens'],
  ['Output Token', 'outputTokens'],
  ['Total', 'totalTokens'],
  ['TPS', 'tps'],
  ['Latency', 'latency'],
];

/**
 * @param {string} label
 * @param {string} value
 * @param {number} lineWidth
 * @returns {string}
 */
function metricRow(label, value, lineWidth) {
  return rightAlignedMetricLine(GREEN(label), CYAN(value), LABEL_WIDTH, lineWidth);
}

export class PerformancePanel {
  /**
   * @param {MetricsTracker} metrics
   * @param {Region} region
   * @returns {string[]}
   */
  buildLines(metrics, region) {
    const d = buildPerformanceDisplay(metrics);
    const lineWidth = Math.max(LABEL_WIDTH + 4, region.width);
    const lines = ROWS.map(([label, key]) => metricRow(label, d[key], lineWidth));
    lines.push(metricRow(d.costLabel, d.cost, lineWidth));
    return lines;
  }

  /**
   * @param {MetricsTracker} metrics
   * @param {Region} region
   * @returns {string}
   */
  stateKey(metrics, region) {
    const d = buildPerformanceDisplay(metrics);
    return `${this.buildLines(metrics, region).join('|')}|${d.costLabel}`;
  }

  /**
   * @param {MetricsTracker} metrics
   * @param {Region} region
   * @returns {string[]}
   */
  render(metrics, region) {
    return this.buildLines(metrics, region);
  }
}
