/**
 * Fixed dashboard geometry — row constants shared with paint().
 */

/** @typedef {import('../cli/terminal.js').Region} Region */

/**
 * @typedef {object} FixedLayout
 * @property {number} width
 * @property {number} height
 * @property {boolean} compact
 * @property {number} midCol
 * @property {number} leftInner
 * @property {number} rightInner
 * @property {number} mainSplitCol
 * @property {number} perfInner
 * @property {number} outInner
 * @property {number} perfContentRows
 * @property {number} streamContentRows
 * @property {number} mainContentRows
 * @property {Region} sessionLabels
 * @property {Region} sessionValues
 * @property {Region} pipeline
 * @property {Region} performanceLines
 * @property {Region} tokenLines
 * @property {Region} eventLog
 * @property {Region} statusBar
 */

/** Switch to compact splits below this terminal width. */
export const COMPACT_WIDTH_THRESHOLD = 140;

export const FIXED = {
  topContentRows: 9,
  /** Max rows for Performance + Output Stream body (not expanded to fill terminal). */
  mainContentRows: 12,
  eventContentRows: 5,
  sessionFields: 3,
  sessionLabelWidth: 8,
  pipelineLines: 7,
  performanceRows: 6,
  maxStreamChunks: 12,
  maxEvents: 5,
  panelPad: 1,
  /** Performance column share (stream gets ~70%). */
  performanceWidthRatio: 0.30,
  compactPerformanceWidthRatio: 0.24,
};

/** Rows 0–2: header (border, title, subtitle) */
export const HEADER_ROWS = 3;
/** Row 3: Session | Pipeline title bar */
export const SESSION_TITLE_ROW = HEADER_ROWS;
/** Rows 4–12: session panel body */
export const SESSION_CONTENT_START = SESSION_TITLE_ROW + 1;
/** Row 13: divider above Performance section */
export const MAIN_DIVIDER_ROW = SESSION_CONTENT_START + FIXED.topContentRows;
/** Row 14: Performance | Output Stream title bar */
export const MAIN_TITLE_ROW = MAIN_DIVIDER_ROW + 1;
/** Row 15+: main panel body */
export const MAIN_CONTENT_START = MAIN_TITLE_ROW + 1;

/** @deprecated alias — first row of Performance / Output body */
export const ROWS_BEFORE_MAIN = MAIN_CONTENT_START;

/** mid border + event title + event body + bottom border */
export const ROWS_AFTER_MAIN =
  1 + 1 + FIXED.eventContentRows + 1;

const STATUS_ROWS = 1;

/**
 * Split inner width between two panels (│ left │ right │ = W).
 * @param {number} W
 * @param {number} leftRatio
 * @param {number} [minLeft]
 */
function splitInner(W, leftRatio, minLeft = 18) {
  const inner = W - 3;
  const left = Math.max(minLeft, Math.floor(inner * leftRatio));
  const right = inner - left;
  return { left, right, splitCol: 1 + left };
}

/**
 * @param {number} cols
 * @param {number} rows
 * @returns {FixedLayout}
 */
export function computeLayout(cols, rows) {
  const compact = cols < COMPACT_WIDTH_THRESHOLD;
  const W = Math.max(76, cols);
  const H = Math.max(28, rows);

  const perfContentRows = FIXED.performanceRows;
  const bodyCapacity = Math.max(FIXED.performanceRows, FIXED.maxStreamChunks);
  const maxMainBody = H - MAIN_CONTENT_START - ROWS_AFTER_MAIN - STATUS_ROWS;
  const streamContentRows = Math.max(
    perfContentRows,
    Math.min(bodyCapacity, maxMainBody),
  );

  const pad = FIXED.panelPad;
  const eventMidRow = MAIN_CONTENT_START + streamContentRows;
  const eventContentStart = eventMidRow + 2;
  const dashboardBottomRow = eventMidRow + 2 + FIXED.eventContentRows;
  const statusRow = Math.min(H - 1, dashboardBottomRow + 1);

  const perfRatio = compact
    ? FIXED.compactPerformanceWidthRatio
    : FIXED.performanceWidthRatio;
  const minPerfInner = compact ? 14 : 16;

  // Top: 50 / 50
  const top = splitInner(W, 0.5, compact ? 14 : 18);
  const midCol = top.splitCol;
  const leftInner = top.left;
  const rightInner = top.right;

  // Bottom: perf / stream (stream is the primary panel)
  const bottom = splitInner(W, perfRatio, minPerfInner);
  const perfInner = bottom.left;
  const outInner = bottom.right;
  const mainSplitCol = bottom.splitCol;

  const labelW = compact ? 6 : FIXED.sessionLabelWidth;
  const sessionValueCol = 2 + labelW + 1;

  return {
    width: W,
    height: H,
    compact,
    midCol,
    leftInner,
    rightInner,
    mainSplitCol,
    perfInner,
    outInner,
    perfContentRows,
    streamContentRows,
    mainContentRows: streamContentRows,
    sessionLabels: {
      row: SESSION_CONTENT_START,
      col: 2,
      width: labelW,
      height: FIXED.sessionFields,
    },
    sessionValues: {
      row: SESSION_CONTENT_START,
      col: sessionValueCol,
      width: Math.max(8, leftInner - labelW - 2),
      height: FIXED.sessionFields,
    },
    pipeline: {
      row: SESSION_CONTENT_START,
      col: midCol + 1 + pad,
      width: Math.max(8, rightInner - pad * 2),
      height: FIXED.pipelineLines,
    },
    performanceLines: {
      row: MAIN_CONTENT_START,
      col: 2,
      width: Math.max(8, perfInner - 2),
      height: perfContentRows,
    },
    tokenLines: {
      row: MAIN_CONTENT_START,
      col: mainSplitCol + 1 + pad,
      width: Math.max(12, outInner - pad * 2),
      height: streamContentRows,
    },
    eventLog: {
      row: eventContentStart,
      col: 2,
      width: W - 4,
      height: FIXED.eventContentRows,
    },
    statusBar: {
      row: statusRow,
      col: 0,
      width: W,
      height: 1,
    },
  };
}
