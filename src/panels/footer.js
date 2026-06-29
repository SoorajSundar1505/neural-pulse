/**
 * Status footer — shortcuts only, no duplicated metrics.
 */

import { formatStatusBar } from '../utils/align.js';
import { stripAnsi } from '../utils/format.js';
import { CYAN, GREEN, MUTED } from '../dashboard/theme.js';

/** @typedef {import('../cli/terminal.js').Terminal} Terminal */
/** @typedef {import('../dashboard/layout.js').FixedLayout} FixedLayout */

export class FooterPanel {
  constructor() {
    this.lastKey = '';
  }

  /**
   * @param {object} state
   * @param {boolean} state.completed
   * @param {boolean} state.streaming
   * @returns {string}
   */
  stateKey(state) {
    return `${state.completed}|${state.streaming}`;
  }

  /**
   * @param {Terminal} term
   * @param {FixedLayout} layout
   * @param {import('../metrics/tracker.js').MetricsTracker} _metrics
   * @param {object} state
   * @param {boolean} state.completed
   * @param {boolean} state.streaming
   * @param {boolean} [force]
   */
  render(term, layout, _metrics, state, force = false) {
    const plain = formatStatusBar({
      completed: state.completed,
      streaming: state.streaming,
    });

    let styled;
    if (state.completed) styled = GREEN(plain);
    else if (state.streaming) styled = CYAN(plain);
    else styled = MUTED(plain);

    const w = layout.statusBar.width;
    const vis = stripAnsi(styled).length;
    const pad = Math.max(0, Math.floor((w - vis) / 2));
    const line = ' '.repeat(pad) + styled + ' '.repeat(Math.max(0, w - pad - vis));

    if (!force && line === this.lastKey) return;
    this.lastKey = line;

    term.writeAt(layout.statusBar.col, layout.statusBar.row, line, w);
  }
}
