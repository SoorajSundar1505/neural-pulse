/**
 * Terminal capability detection — Unicode and interactive TTY checks.
 */

const UNICODE_SPINNER = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
const ASCII_SPINNER = ['|', '/', '-', '\\'];

/**
 * @returns {boolean}
 */
export function supportsUnicode() {
  if (process.env.NEURAL_PULSE_ASCII === '1') return false;
  if (process.env.TERM === 'dumb') return false;
  if (process.platform === 'win32') {
    return Boolean(
      process.env.WT_SESSION ||
        process.env.TERMINAL_EMULATOR ||
        process.env.ConEmuANSI === 'ON' ||
        process.env.ANSICON,
    );
  }
  return true;
}

/**
 * @returns {string[]}
 */
export function spinnerFrames() {
  return supportsUnicode() ? UNICODE_SPINNER : ASCII_SPINNER;
}

/**
 * @returns {string}
 */
export function successMark() {
  return supportsUnicode() ? '✓' : 'OK';
}

/**
 * @returns {boolean}
 */
export function isInteractiveTerminal() {
  return Boolean(process.stdin.isTTY && process.stdout.isTTY);
}
