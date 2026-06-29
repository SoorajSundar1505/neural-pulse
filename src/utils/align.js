/**
 * Aligned label/value rows for metric panels.
 */

import { stripAnsi } from './format.js';

/**
 * @param {string} label styled
 * @param {string} value styled
 * @param {number} labelWidth visible label width target
 * @returns {string}
 */
export function alignedMetricLine(label, value, labelWidth) {
  const labelVis = stripAnsi(label);
  const gap = Math.max(1, labelWidth - labelVis.length);
  return label + ' '.repeat(gap) + value;
}

/**
 * Label column + right-aligned values within a fixed line width.
 * @param {string} label styled
 * @param {string} value styled
 * @param {number} labelWidth
 * @param {number} lineWidth
 * @returns {string}
 */
export function rightAlignedMetricLine(label, value, labelWidth, lineWidth) {
  const labelVis = stripAnsi(label);
  const valueVis = stripAnsi(value);
  const labelGap = Math.max(1, labelWidth - labelVis.length);
  const labelPart = label + ' '.repeat(labelGap);
  const used = labelWidth;
  const valuePad = Math.max(0, lineWidth - used - valueVis.length);
  return labelPart + ' '.repeat(valuePad) + value;
}

/**
 * @param {string} text
 * @param {number} width
 * @returns {string}
 */
export function centerInWidth(text, width) {
  const vis = stripAnsi(text).length;
  const pad = Math.max(0, Math.floor((width - vis) / 2));
  return ' '.repeat(pad) + text + ' '.repeat(Math.max(0, width - vis - pad));
}

/**
 * Simple status bar text — no metrics (shown in Performance panel).
 * @param {object} options
 * @param {boolean} options.completed
 * @param {boolean} options.streaming
 * @returns {string}
 */
export function formatStatusBar({ completed, streaming }) {
  const hints = 'Press Ctrl+P for New Prompt │ Ctrl+C Exit';
  if (completed) return `✓ Complete │ ${hints}`;
  if (streaming) return `● Streaming │ ${hints}`;
  return `○ Idle │ ${hints}`;
}
