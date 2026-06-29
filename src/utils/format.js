/**
 * Shared display formatters for metrics and timing.
 */

/**
 * @param {number} ms
 * @returns {string}
 */
export function formatLatency(ms) {
  if (ms <= 0) return '—';
  if (ms < 1000) return `${Math.round(ms)} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

/**
 * @param {number} ms
 * @returns {string}
 */
export function formatElapsed(ms) {
  if (ms <= 0) return '—';
  return `${(ms / 1000).toFixed(1)} s`;
}

/**
 * @param {number} ms elapsed since request start
 * @returns {string} e.g. [00:00.82]
 */
export function formatEventTimestamp(ms) {
  if (ms < 0) ms = 0;
  const totalSec = ms / 1000;
  const minutes = Math.floor(totalSec / 60);
  const seconds = totalSec % 60;
  const sec = seconds.toFixed(2).padStart(5, '0');
  return `[${String(minutes).padStart(2, '0')}:${sec}]`;
}

/**
 * @param {number} ms elapsed since stream start
 * @returns {string} e.g. 00:03.1
 */
export function formatStreamTimestamp(ms) {
  if (ms < 0) ms = 0;
  const totalSec = ms / 1000;
  const minutes = Math.floor(totalSec / 60);
  const seconds = totalSec % 60;
  return `${String(minutes).padStart(2, '0')}:${seconds.toFixed(1).padStart(4, '0')}`;
}

/**
 * @param {string} model
 * @returns {string}
 */
export function formatModelName(model) {
  if (!model) return 'Unknown';
  const parts = model.split('-');
  const first = parts[0].toUpperCase();
  const rest = parts.slice(1).map((part) => {
    if (part === 'mini' || part === 'turbo' || part === 'nano') return part;
    if (/^\d/.test(part)) return part;
    if (part.length <= 2) return part;
    return part.charAt(0).toUpperCase() + part.slice(1);
  });
  return [first, ...rest].join('-');
}

/**
 * @param {object} options
 * @param {boolean} options.completed
 * @param {boolean} options.streaming
 * @returns {string}
 */
export function formatFooterStatus({ completed, streaming }) {
  const hints = 'Press Ctrl+P for New Prompt │ Ctrl+C Exit';
  if (completed) return `✓ Complete │ ${hints}`;
  if (streaming) return `● Streaming │ ${hints}`;
  return `○ Idle │ ${hints}`;
}

/**
 * Truncate a string while preserving ANSI escape sequences.
 * @param {string} str
 * @param {number} maxVisible
 * @returns {string}
 */
export function truncateVisibleAnsi(str, maxVisible) {
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

/**
 * Strip ANSI codes to measure visible length.
 * @param {string} str
 * @returns {string}
 */
export function stripAnsi(str) {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\u001b\[[0-9;]*m/g, '');
}
