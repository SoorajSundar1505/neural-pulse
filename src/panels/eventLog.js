/**
 * Event log — timestamped runtime events from the current request.
 */

import { FIXED } from '../dashboard/layout.js';
import { formatEventTimestamp } from '../utils/format.js';
import { CYAN, GREEN, RED, WHITE } from '../dashboard/theme.js';

/** @typedef {import('../cli/terminal.js').Region} Region */
/** @typedef {import('../cli/terminal.js').Terminal} Terminal */

/** @typedef {'info' | 'success' | 'error'} EventKind */

/**
 * @typedef {object} LogEvent
 * @property {string} message
 * @property {EventKind} kind
 * @property {number} [atMs]
 * @property {boolean} [noTimestamp]
 */

export class EventLogPanel {
  /**
   * @param {Terminal} term
   * @param {Region} region
   */
  constructor(term, region) {
    this.term = term;
    this.region = region;
    this.maxEvents = FIXED.maxEvents;
    /** @type {number | null} */
    this.timelineStart = null;
    /** @type {LogEvent[]} */
    this.events = [];
    this.frozen = false;
    this.lastKey = '';
  }

  /** Clear the timeline and redraw. */
  reset() {
    this.timelineStart = null;
    this.events = [];
    this.frozen = false;
    this.lastKey = '';
    this.redraw();
  }

  /**
   * Start a new request timeline.
   * @param {number} startMs
   */
  beginTimeline(startMs) {
    this.timelineStart = startMs;
    this.events = [];
    this.frozen = false;
    this.lastKey = '';
  }

  /**
   * @returns {number}
   */
  elapsedMs() {
    if (!this.timelineStart) return 0;
    return Date.now() - this.timelineStart;
  }

  /**
   * @param {LogEvent} event
   */
  push(event) {
    if (this.frozen) return;
    this.events.push(event);
    while (this.events.length > this.maxEvents) {
      this.events.shift();
    }
  }

  /**
   * @param {string} message
   * @param {number} [atMs]
   */
  logInfo(message, atMs) {
    this.push({
      message,
      kind: 'info',
      atMs: atMs ?? this.elapsedMs(),
    });
  }

  /**
   * @param {string} message
   * @param {number} elapsedSec
   */
  logStreamCompleted(elapsedSec) {
    this.push({
      message: `✓ Request completed (${elapsedSec.toFixed(2)} s)`,
      kind: 'success',
      noTimestamp: true,
    });
    this.frozen = true;
  }

  /**
   * @param {string} message
   * @param {number} [atMs]
   */
  logError(message, atMs) {
    this.push({
      message,
      kind: 'error',
      atMs: atMs ?? this.elapsedMs(),
    });
    this.frozen = true;
  }

  /**
   * @param {LogEvent} event
   * @returns {string}
   */
  formatEvent(event) {
    if (event.noTimestamp) {
      if (event.kind === 'success') return GREEN(event.message);
      if (event.kind === 'error') return RED(event.message);
      return WHITE(event.message);
    }

    const ts = CYAN.bold(formatEventTimestamp(event.atMs ?? 0));
    const gap = ' ';

    if (event.kind === 'success') {
      return `${ts}${gap}${GREEN(event.message)}`;
    }
    if (event.kind === 'error') {
      return `${ts}${gap}${RED(event.message)}`;
    }
    return `${ts}${gap}${WHITE(event.message)}`;
  }

  /**
   * @returns {boolean}
   */
  redraw() {
    const key = this.events.map((e) => `${e.kind}:${e.atMs}:${e.message}`).join('|');
    if (key === this.lastKey) return false;
    this.lastKey = key;

    for (let i = 0; i < this.maxEvents; i += 1) {
      const event = this.events[i];
      const line = event ? this.formatEvent(event) : '';
      this.term.writeAt(
        this.region.col,
        this.region.row + i,
        line,
        this.region.width,
      );
    }
    return true;
  }
}
