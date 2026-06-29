/**
 * Centered prompt input modal — drawn in-place on the alt screen.
 */

import { stripAnsi } from '../utils/format.js';
import { isQuitKey } from './keyboard.js';
import { CYAN, WHITE } from '../dashboard/theme.js';

/** @typedef {import('./terminal.js').Terminal} Terminal */

export class PromptModal {
  /**
   * @param {Terminal} term
   */
  constructor(term) {
    this.term = term;
    this.visible = false;
    this.value = '';
    this.box = { row: 0, col: 0, width: 0, height: 0 };
  }

  /** Show the modal and reset input. */
  show() {
    this.visible = true;
    this.value = '';
    this.layout();
    this.render();
  }

  /** Hide and clear the modal region. */
  hide() {
    if (!this.visible) return;
    this.visible = false;
    for (let r = 0; r < this.box.height; r += 1) {
      this.term.writeAt(0, this.box.row + r, '', this.term.cols);
    }
  }

  /** Recompute centered box geometry. */
  layout() {
    this.term.refreshSize();
    const W = this.term.cols;
    const H = this.term.rows;
    const width = Math.min(52, Math.max(36, W - 8));
    const height = 5;
    this.box = {
      row: Math.floor((H - height) / 2),
      col: Math.floor((W - width) / 2),
      width,
      height,
    };
  }

  /**
   * @param {string} str
   * @param {import('readline').Key} key
   * @returns {'continue' | 'submit' | 'cancel'}
   */
  handleKey(str, key) {
    if (isQuitKey(str, key)) return 'continue';

    const name = key?.name ?? '';
    if (name === 'return') return 'submit';
    if (name === 'escape') return 'cancel';
    if (key?.ctrl && name === 'c') return 'cancel';

    if (name === 'backspace') {
      this.value = this.value.slice(0, -1);
      return 'continue';
    }

    if (str && !key?.ctrl && !key?.meta && str >= ' ') {
      this.value += str;
      return 'continue';
    }

    return 'continue';
  }

  /** Draw the modal box and input line. */
  render() {
    if (!this.visible) return;
    this.layout();

    const { row, col, width, height } = this.box;
    const inner = width - 2;
    const title = ' Enter Prompt ';

    const top = `${CYAN('┌')}${CYAN('─'.repeat(inner))}${CYAN('┐')}`;
    const titleLine =
      `${CYAN('│')}${WHITE.bold(title)}${' '.repeat(Math.max(0, inner - title.length))}${CYAN('│')}`;
    const blank = `${CYAN('│')}${' '.repeat(inner)}${CYAN('│')}`;

    const inputPad = 1;
    const inputMax = inner - inputPad * 2;
    let input = this.value;
    if (input.length > inputMax) {
      input = `${input.slice(0, inputMax - 3)}...`;
    }
    const inputVis = ` ${input}_`;
    const inputLine =
      `${CYAN('│')}${WHITE(inputVis)}${' '.repeat(Math.max(0, inner - stripAnsi(inputVis).length))}${CYAN('│')}`;

    const bottom = `${CYAN('└')}${CYAN('─'.repeat(inner))}${CYAN('┘')}`;

    const lines = [top, titleLine, blank, inputLine, bottom];
    lines.forEach((line, i) => {
      this.term.writeAt(col, row + i, line, width);
    });

    for (let i = lines.length; i < height; i += 1) {
      this.term.writeAt(col, row + i, '', width);
    }
  }
}
