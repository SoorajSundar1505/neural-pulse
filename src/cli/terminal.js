/**
 * Low-level terminal I/O — cursor movement, regions, no full-screen clears.
 */

import ansiEscapes from 'ansi-escapes';
import { stripAnsi } from '../utils/format.js';

/** @typedef {{ row: number, col: number, width: number, height: number }} Region */

export class Terminal {
  constructor() {
    this.cols = process.stdout.columns ?? 80;
    this.rows = process.stdout.rows ?? 24;
    this.inAlt = false;
  }

  /** Refresh terminal dimensions (e.g. after resize). */
  refreshSize() {
    this.cols = process.stdout.columns ?? 80;
    this.rows = process.stdout.rows ?? 24;
  }

  /**
   * Move cursor to absolute position.
   * @param {number} col 0-based column
   * @param {number} row 0-based row
   */
  moveTo(col, row) {
    process.stdout.write(ansiEscapes.cursorTo(col, row));
  }

  /**
   * Write text at position, padded/truncated to width.
   * @param {number} col
   * @param {number} row
   * @param {string} text
   * @param {number} [width]
   */
  writeAt(col, row, text, width) {
    if (row < 0 || row >= this.rows) return;
    const w = width ?? this.cols - col;
    const visible = stripAnsi(text);
    const truncated =
      visible.length > w ? truncateVisible(text, w) : text;
    const pad = Math.max(0, w - stripAnsi(truncated).length);
    this.moveTo(col, row);
    process.stdout.write(truncated + ' '.repeat(pad));
  }

  /**
   * Write multiple lines into a region without clearing the whole screen.
   * @param {Region} region
   * @param {string[]} lines
   * @param {number} [startRow] offset inside region
   */
  writeLines(region, lines, startRow = 0) {
    const slots = region.height - startRow;
    for (let i = 0; i < slots; i += 1) {
      this.writeAt(region.col, region.row + startRow + i, lines[i] ?? '', region.width);
    }
  }

  /** Enter alternate screen — fixed viewport, no scroll. */
  enter() {
    if (this.inAlt) return;
    this.inAlt = true;
    process.stdout.write(ansiEscapes.enterAlternativeScreen);
    process.stdout.write(ansiEscapes.cursorHide);
  }

  /** Leave alternate screen. */
  leave() {
    if (!this.inAlt) return;
    this.inAlt = false;
    process.stdout.write(ansiEscapes.cursorShow);
    process.stdout.write(ansiEscapes.exitAlternativeScreen);
  }

  /**
   * Promise delay for animation frames.
   * @param {number} ms
   * @param {AbortSignal} [signal]
   * @returns {Promise<void>}
   */
  static delay(ms, signal) {
    return new Promise((resolve, reject) => {
      if (signal?.aborted) {
        reject(new DOMException('Aborted', 'AbortError'));
        return;
      }
      const id = setTimeout(resolve, ms);
      signal?.addEventListener(
        'abort',
        () => {
          clearTimeout(id);
          reject(new DOMException('Aborted', 'AbortError'));
        },
        { once: true },
      );
    });
  }
}

/**
 * Truncate string with ANSI codes preserved (rough).
 * @param {string} str
 * @param {number} maxVisible
 * @returns {string}
 */
function truncateVisible(str, maxVisible) {
  let visible = 0;
  let out = '';
  for (let i = 0; i < str.length; i += 1) {
    if (str[i] === '\u001b') {
      const end = str.indexOf('m', i);
      if (end !== -1) {
        out += str.slice(i, end + 1);
        i = end;
        continue;
      }
    }
    if (visible >= maxVisible) break;
    out += str[i];
    visible += 1;
  }
  return out;
}

/** Shared terminal instance for consistent alt-screen state. */
export const terminal = new Terminal();

export { stripAnsi };
