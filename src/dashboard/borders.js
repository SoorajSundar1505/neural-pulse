/**
 * Dashboard border and frame drawing helpers.
 */

import { stripAnsi } from '../utils/format.js';
import { config } from '../utils/config.js';
import { spinnerFrames, successMark } from '../utils/capabilities.js';
import { CYAN, GREEN, MUTED, VERSION, WHITE, holo } from './theme.js';
import {
  FIXED,
  MAIN_CONTENT_START,
  MAIN_DIVIDER_ROW,
  MAIN_TITLE_ROW,
  SESSION_CONTENT_START,
  SESSION_TITLE_ROW,
} from './layout.js';

/** @typedef {import('../cli/terminal.js').Terminal} Terminal */
/** @typedef {import('./layout.js').FixedLayout} FixedLayout */

/**
 * @param {number} w
 * @returns {string}
 */
export function topBorder(w) {
  return CYAN(`┌${'─'.repeat(w - 2)}┐`);
}

/**
 * @param {number} w
 * @returns {string}
 */
export function bottomBorder(w) {
  return CYAN(`└${'─'.repeat(w - 2)}┘`);
}

/**
 * @param {number} w
 * @returns {string}
 */
export function midBorder(w) {
  return CYAN(`├${'─'.repeat(w - 2)}┤`);
}

/**
 * @param {number} w
 * @param {string} inner
 * @returns {string}
 */
export function sideBorder(w, inner) {
  const pad = Math.max(0, w - 2 - stripAnsi(inner).length);
  return `${CYAN('│')}${inner}${' '.repeat(pad)}${CYAN('│')}`;
}

/**
 * @param {string} text
 * @param {number} innerW
 * @returns {string}
 */
export function centerText(text, innerW) {
  const vis = stripAnsi(text).length;
  const pad = Math.max(0, Math.floor((innerW - vis) / 2));
  return `${' '.repeat(pad)}${text}${' '.repeat(Math.max(0, innerW - vis - pad))}`;
}

/**
 * @param {number} w
 * @param {string} title
 * @returns {string}
 */
export function titledFull(w, title) {
  const inner = w - 2;
  const t = ` ${title} `;
  const side = Math.max(0, Math.floor((inner - t.length) / 2));
  return `${CYAN('├')}${CYAN('─'.repeat(side))}${WHITE.bold(t)}${CYAN('─'.repeat(Math.max(0, inner - side - t.length)))}${CYAN('┤')}`;
}

/**
 * @param {number} w
 * @param {number} lInner
 * @param {number} rInner
 * @param {string} leftTitle
 * @param {string} rightTitle
 * @returns {string}
 */
export function titledSplit(w, lInner, rInner, leftTitle, rightTitle) {
  const lt = ` ${leftTitle} `;
  const rt = ` ${rightTitle} `;
  const lSide = Math.max(0, Math.floor((lInner - lt.length) / 2));
  const rSide = Math.max(0, Math.floor((rInner - rt.length) / 2));
  const left =
    `${CYAN('├')}${CYAN('─'.repeat(lSide))}${WHITE.bold(lt)}${CYAN('─'.repeat(Math.max(0, lInner - lSide - lt.length)))}`;
  const right =
    `${CYAN('─'.repeat(rSide))}${WHITE.bold(rt)}${CYAN('─'.repeat(Math.max(0, rInner - rSide - rt.length)))}${CYAN('┤')}`;
  return `${left}${CYAN('┼')}${right}`;
}

/**
 * @param {number} lInner
 * @param {number} rInner
 * @returns {string}
 */
export function plainSplit(lInner, rInner) {
  return `${CYAN('├')}${CYAN('─'.repeat(lInner))}${CYAN('┼')}${CYAN('─'.repeat(rInner))}${CYAN('┤')}`;
}

/**
 * @param {number} lInner
 * @param {number} rInner
 * @returns {string}
 */
export function splitSides(lInner, rInner) {
  return `${CYAN('│')}${' '.repeat(lInner)}${CYAN('│')}${' '.repeat(rInner)}${CYAN('│')}`;
}

export function buildHeaderTitle(state = {}) {
  const { streaming = false, completed = false, spinnerFrame = 0 } = state;
  const base = holo('  NEURAL PULSE  ');
  const mark = successMark();
  if (completed) return `${base}${GREEN(` ${mark}`)}`;
  if (streaming) {
    const frames = spinnerFrames();
    const frame = frames[spinnerFrame % frames.length];
    return `${base}${CYAN(` ${frame}`)}`;
  }
  return base;
}

/**
 * @param {number} w
 * @param {string} inner
 * @returns {string}
 */
export function titleRowWithVersion(w, inner) {
  const pad = Math.max(0, w - 2 - stripAnsi(inner).length);
  return `${CYAN('│')}${inner}${' '.repeat(pad)}${CYAN('│')}`;
}

/**
 * @param {Terminal} term
 * @param {FixedLayout} layout
 * @param {object} [state]
 * @param {boolean} [state.streaming]
 * @param {boolean} [state.completed]
 * @param {number} [state.spinnerFrame]
 */
export function renderHeaderTitle(term, layout, state = {}) {
  const W = layout.width;
  const inner = W - 2;
  const title = buildHeaderTitle(state);
  const ver = VERSION(`v${config.version}`);
  const titleVis = stripAnsi(title).length;
  const verVis = stripAnsi(ver).length;
  const mainW = inner - verVis - 1;
  const padLeft = Math.max(0, Math.floor((mainW - titleVis) / 2));
  const gap = Math.max(1, mainW - padLeft - titleVis);
  const innerContent =
    ' '.repeat(padLeft) + title + ' '.repeat(gap) + ver;

  term.writeAt(0, 1, titleRowWithVersion(W, innerContent), W);
}

/**
 * @param {Terminal} term
 * @param {FixedLayout} layout
 * @param {object} [headerState]
 */
export function renderHeader(term, layout, headerState = {}) {
  const W = layout.width;

  term.writeAt(0, 0, topBorder(W), W);
  renderHeaderTitle(term, layout, headerState);
  term.writeAt(0, 2, sideBorder(W, centerText(MUTED(`  ${config.subtitle}  `), W - 2)), W);
}

/**
 * @param {Terminal} term
 * @param {FixedLayout} layout
 */
export function renderSessionPanelFrame(term, layout) {
  const W = layout.width;

  term.writeAt(
    0,
    SESSION_TITLE_ROW,
    titledSplit(W, layout.leftInner, layout.rightInner, 'Session', 'Pipeline'),
    W,
  );

  for (let i = 0; i < FIXED.topContentRows; i += 1) {
    term.writeAt(
      0,
      SESSION_CONTENT_START + i,
      splitSides(layout.leftInner, layout.rightInner),
      W,
    );
  }

  term.writeAt(0, MAIN_DIVIDER_ROW, plainSplit(layout.leftInner, layout.rightInner), W);
}

/**
 * @param {number} perfInner
 * @param {number} outInner
 * @returns {string}
 */
export function perfBottomSplit(perfInner, outInner) {
  return `${CYAN('├')}${CYAN('─'.repeat(perfInner))}${CYAN('┼')}${' '.repeat(outInner)}${CYAN('│')}`;
}

/**
 * @param {Terminal} term
 * @param {FixedLayout} layout
 */
export function renderPerformancePanelFrame(term, layout) {
  const W = layout.width;
  const perfRows = layout.perfContentRows;
  const streamRows = layout.streamContentRows;

  term.writeAt(
    0,
    MAIN_TITLE_ROW,
    titledSplit(W, layout.perfInner, layout.outInner, 'Performance', 'Output Stream'),
    W,
  );

  for (let i = 0; i < streamRows; i += 1) {
    const row = MAIN_CONTENT_START + i;
    if (i === perfRows && perfRows < streamRows) {
      term.writeAt(0, row, perfBottomSplit(layout.perfInner, layout.outInner), W);
    } else {
      term.writeAt(0, row, splitSides(layout.perfInner, layout.outInner), W);
    }
  }
}

/**
 * @param {Terminal} term
 * @param {FixedLayout} layout
 */
export function renderEventLogPanelFrame(term, layout) {
  const W = layout.width;
  const eventMidRow = MAIN_CONTENT_START + layout.streamContentRows;

  term.writeAt(0, eventMidRow, midBorder(W), W);
  term.writeAt(0, eventMidRow + 1, titledFull(W, 'Event Log'), W);

  for (let i = 0; i < FIXED.eventContentRows; i += 1) {
    term.writeAt(0, eventMidRow + 2 + i, sideBorder(W, ' '.repeat(W - 2)), W);
  }

  term.writeAt(0, eventMidRow + 2 + FIXED.eventContentRows, bottomBorder(W), W);
}

/**
 * @param {Terminal} term
 * @param {FixedLayout} layout
 */
export function renderFooterSlot(term, layout) {
  term.writeAt(0, layout.statusBar.row, ' '.repeat(layout.width), layout.width);
  for (let r = layout.statusBar.row + 1; r < layout.height; r += 1) {
    term.writeAt(0, r, ' '.repeat(layout.width), layout.width);
  }
}
