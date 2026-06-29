/**
 * Session panel — model, prompt, and status only.
 */

import { SESSION_LABELS, buildSessionDisplay } from '../metrics/session.js';
import { formatModelName } from '../utils/format.js';
import { GREEN, CYAN, MUTED, WHITE } from '../dashboard/theme.js';
import { FIXED } from '../dashboard/layout.js';

/** @typedef {import('../cli/terminal.js').Terminal} Terminal */
/** @typedef {import('../dashboard/layout.js').FixedLayout} FixedLayout */
/** @typedef {import('../metrics/tracker.js').MetricsTracker} MetricsTracker */

export class SessionPanel {
  constructor() {
    this.lastKey = '';
  }

  /**
   * @param {MetricsTracker} metrics
   * @param {object} state
   * @param {boolean} state.completed
   * @param {boolean} state.streaming
   * @returns {string}
   */
  stateKey(metrics, state) {
    const display = buildSessionDisplay(metrics);
    return `${display.model}|${display.prompt}|${state.completed}|${state.streaming}`;
  }

  /**
   * @param {Terminal} term
   * @param {FixedLayout} layout
   * @param {MetricsTracker} metrics
   * @param {object} state
   * @param {boolean} state.completed
   * @param {boolean} state.streaming
   * @param {boolean} [force]
   */
  render(term, layout, metrics, state, force = false) {
    const display = buildSessionDisplay(metrics);
    const w = layout.sessionValues.width;
    const prompt =
      display.prompt.length > w - 2
        ? `${display.prompt.slice(0, w - 5)}...`
        : display.prompt;

    const values = [
      WHITE(formatModelName(display.model)),
      WHITE(prompt),
      formatStatus(state),
    ];

    const key = values.join('|');
    if (!force && key === this.lastKey) return;
    this.lastKey = key;

    values.forEach((v, i) => {
      term.writeAt(
        layout.sessionValues.col,
        layout.sessionValues.row + i,
        v,
        layout.sessionValues.width,
      );
    });

    for (let i = SESSION_LABELS.length; i < FIXED.topContentRows; i += 1) {
      term.writeAt(layout.sessionLabels.col, layout.sessionLabels.row + i, '', layout.sessionLabels.width);
      term.writeAt(layout.sessionValues.col, layout.sessionValues.row + i, '', layout.sessionValues.width);
    }
  }
}

/**
 * @param {object} state
 * @param {boolean} state.completed
 * @param {boolean} state.streaming
 * @returns {string}
 */
function formatStatus(state) {
  if (state.completed) return GREEN.bold('✓ COMPLETE');
  if (state.streaming) return CYAN('● STREAMING');
  return MUTED('IDLE');
}
