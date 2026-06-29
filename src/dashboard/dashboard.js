/**
 * Neural Pulse dashboard — layout coordinator (static frame paint).
 */

import { SESSION_LABELS } from '../metrics/session.js';
import { GREEN } from './theme.js';
import { computeLayout } from './layout.js';
import {
  renderEventLogPanelFrame,
  renderFooterSlot,
  renderHeader,
  renderPerformancePanelFrame,
  renderSessionPanelFrame,
} from './borders.js';

/** @typedef {import('../cli/terminal.js').Terminal} Terminal */
/** @typedef {import('./layout.js').FixedLayout} FixedLayout */

export class Dashboard {
  constructor() {
    /** @type {FixedLayout | null} */
    this.layout = null;
  }

  /**
   * Paint the static dashboard frame once.
   * @param {Terminal} term
   * @returns {FixedLayout}
   */
  paint(term) {
    term.refreshSize();
    const layout = computeLayout(term.cols, term.rows);

    renderHeader(term, layout);
    renderSessionPanelFrame(term, layout);
    renderPerformancePanelFrame(term, layout);
    renderEventLogPanelFrame(term, layout);
    renderFooterSlot(term, layout);
    renderSessionLabels(term, layout);

    this.layout = layout;
    return layout;
  }
}

/**
 * Paint static session label column (values updated by SessionPanel).
 * @param {Terminal} term
 * @param {FixedLayout} layout
 */
export function renderSessionLabels(term, layout) {
  SESSION_LABELS.forEach((l, i) => {
    term.writeAt(
      layout.sessionLabels.col,
      layout.sessionLabels.row + i,
      GREEN(l.padEnd(layout.sessionLabels.width)),
      layout.sessionLabels.width,
    );
  });
}
