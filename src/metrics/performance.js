/**
 * Performance panel display data — single source for runtime metrics.
 */

import { calculateCost, formatCost } from './cost.js';
import { formatElapsed, formatLatency } from '../utils/format.js';

/**
 * @param {import('./tracker.js').MetricsTracker} tracker
 * @returns {object}
 */
export function buildPerformanceDisplay(tracker) {
  const inputTokens = tracker.inputTokens;
  const outputTokens = tracker.outputTokens;
  const totalTokens = inputTokens + outputTokens;
  const tps = tracker.getStreamingTPS();

  return {
    inputTokens: String(inputTokens),
    outputTokens: String(outputTokens),
    totalTokens: String(totalTokens),
    latency: formatLatency(tracker.getLatencyMs()),
    elapsed: formatElapsed(tracker.getStreamingDurationMs()),
    tps: tps > 0 ? tps.toFixed(1) : '—',
    peakTps: tracker.peakTps > 0 ? tracker.peakTps.toFixed(1) : '—',
    cost: formatCost(calculateCost(tracker.model, inputTokens, outputTokens)),
  };
}
