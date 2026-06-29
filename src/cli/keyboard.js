/**
 * Raw keyboard input for full-screen dashboard (no readline prompts).
 */

import readline from 'readline';

/**
 * @param {string} str
 * @param {readline.Key | undefined} key
 * @returns {boolean}
 */
export function isQuitKey(str, key) {
  const name = key?.name ?? '';
  if (key?.ctrl && name === 'c') return true;
  return name === 'q' || str === 'q' || str === 'Q';
}

/**
 * @param {string} str
 * @param {readline.Key | undefined} key
 * @returns {boolean}
 */
export function isPromptKey(str, key) {
  const name = key?.name ?? '';
  if (key?.ctrl && name === 'p') return true;
  return name === 'p' || str === 'p' || str === 'P';
}

export class Keyboard {
  constructor() {
    /** @type {Set<(str: string, key: readline.Key) => void>} */
    this.handlers = new Set();
    this.enabled = false;
    /** @type {((str: string, key: readline.Key) => void) | null} */
    this._onKeypress = null;
  }

  /** Enable raw keypress capture on stdin. */
  enable() {
    if (this.enabled || !process.stdin.isTTY) return;
    readline.emitKeypressEvents(process.stdin);
    if (typeof process.stdin.setRawMode === 'function') {
      process.stdin.setRawMode(true);
    }
    process.stdin.resume();
    this.enabled = true;
    this._onKeypress = (str, key) => {
      for (const handler of this.handlers) handler(str, key);
    };
    process.stdin.on('keypress', this._onKeypress);
  }

  /** Disable raw keypress capture and release stdin. */
  disable() {
    if (!this.enabled) return;
    if (this._onKeypress) {
      process.stdin.removeListener('keypress', this._onKeypress);
      this._onKeypress = null;
    }
    if (process.stdin.isTTY && typeof process.stdin.setRawMode === 'function') {
      process.stdin.setRawMode(false);
    }
    process.stdin.pause();
    this.enabled = false;
  }

  /**
   * @param {(str: string, key: readline.Key) => void} handler
   * @returns {() => void} unsubscribe
   */
  onKey(handler) {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }
}

/**
 * @param {Keyboard} keyboard
 * @param {AbortSignal} signal
 * @returns {Promise<'prompt' | 'quit'>}
 */
export function waitForIdleAction(keyboard, signal) {
  return new Promise((resolve) => {
    const finish = (action) => {
      off();
      signal.removeEventListener('abort', onAbort);
      resolve(action);
    };

    const onAbort = () => finish('quit');
    const off = keyboard.onKey((str, key) => {
      if (isQuitKey(str, key)) {
        finish('quit');
        return;
      }
      if (isPromptKey(str, key)) {
        finish('prompt');
      }
    });

    signal.addEventListener('abort', onAbort, { once: true });
  });
}
