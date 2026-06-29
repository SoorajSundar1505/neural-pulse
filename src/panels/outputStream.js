/**
 * Output stream panel — buffered live chunks for the dashboard.
 */

import { formatStreamTimestamp, stripAnsi } from '../utils/format.js';
import { FIXED } from '../dashboard/layout.js';
import { config } from '../utils/config.js';
import { StreamBuffer } from '../services/stream.js';
import { CYAN, GREEN, MUTED, WHITE } from '../dashboard/theme.js';
/** @typedef {import('../cli/terminal.js').Terminal} Terminal */

export class OutputStreamPanel {
  /**
   * @param {Terminal} term
   * @param {Region} region
   */
  constructor(term, region) {
    this.term = term;
    this.region = region;
    this.maxLines = region.height;
    this.maxChunks = FIXED.maxStreamChunks;
    this.buffer = new StreamBuffer();
    this.streamStart = 0;
    this.streaming = false;
    this.frozen = false;
    this.lastKey = '';
    /** @type {{ id: number, atMs: number, text: string, highlightUntil: number }[]} */
    this.entries = [];
  }

  /** Reset panel state. */
  reset() {
    this.buffer.reset();
    this.entries = [];
    this.streamStart = 0;
    this.streaming = false;
    this.frozen = false;
    this.lastKey = '';
    this.clearRows();
    this.renderPlaceholder();
  }

  /** Mark stream start time. */
  beginStream() {
    this.streamStart = Date.now();
  }

  /** Freeze display after completion. */
  freeze() {
    this.flushBuffer();
    this.frozen = true;
    this.render(true);
  }

  clearRows() {
    for (let i = 0; i < this.maxLines; i += 1) {
      this.term.writeAt(this.region.col, this.region.row + i, '', this.region.width);
    }
  }

  /**
   * @param {boolean} on
   */
  setStreaming(on) {
    this.streaming = on;
    if (on && !this.streamStart) this.streamStart = Date.now();
    if (this.entries.length === 0) this.renderPlaceholder();
  }

  renderPlaceholder() {
    const msg = this.streaming ? MUTED('Streaming...') : MUTED('Awaiting stream...');
    this.term.writeAt(this.region.col, this.region.row, msg, this.region.width);
    for (let i = 1; i < this.maxLines; i += 1) {
      this.term.writeAt(this.region.col, this.region.row + i, '', this.region.width);
    }
  }

  /**
   * @param {string} piece
   */
  ingest(piece) {
    const atMs = this.streamStart ? Date.now() - this.streamStart : 0;
    const emitted = this.buffer.ingest(piece, atMs);
    for (const entry of emitted) {
      this.entries.push({
        ...entry,
        highlightUntil: Date.now() + config.tokenHighlightMs,
      });
    }
    if (this.entries.length > this.maxChunks) {
      this.entries = this.entries.slice(-this.maxChunks);
    }
  }

  flushBuffer() {
    const atMs = this.streamStart ? Date.now() - this.streamStart : 0;
    const emitted = this.buffer.flush(atMs);
    for (const entry of emitted) {
      this.entries.push({
        ...entry,
        highlightUntil: Date.now() + config.tokenHighlightMs,
      });
    }
  }

  /**
   * @param {boolean} [force]
   */
  render(force = false) {
    if (this.frozen && !force) return;
    if (this.entries.length === 0) {
      if (this.streaming) this.renderPlaceholder();
      return;
    }

    const visible = this.entries.slice(-this.maxLines);
    const key = visible.map((e) => `${e.id}:${e.text}:${e.highlightUntil > Date.now()}`).join('|');
    if (!force && key === this.lastKey) return;
    this.lastKey = key;

    for (let i = 0; i < this.maxLines; i += 1) {
      const entry = visible[i];
      if (!entry) {
        this.term.writeAt(this.region.col, this.region.row + i, '', this.region.width);
        continue;
      }

      const ts = formatStreamTimestamp(entry.atMs);
      const prefix = `${CYAN(`[${ts}]`)} `;
      const prefixLen = stripAnsi(prefix).length;
      const maxText = Math.max(8, this.region.width - prefixLen);
      let text = entry.text;
      if (text.length > maxText) {
        text = `${text.slice(0, Math.max(0, maxText - 3))}...`;
      }

      const hi = entry.highlightUntil > Date.now() && this.streaming && !this.frozen;
      const line = prefix + (hi ? GREEN.bold(text) : WHITE(text));
      this.term.writeAt(this.region.col, this.region.row + i, line, this.region.width);
    }
  }
}
