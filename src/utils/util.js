/**
 * Small shared utilities.
 */

/**
 * Promise-based delay with optional abort signal.
 * @param {number} ms
 * @param {AbortSignal} [signal]
 * @returns {Promise<void>}
 */
export function sleep(ms, signal) {
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

/**
 * Linear interpolation between two numbers.
 * @param {number} current
 * @param {number} target
 * @param {number} factor 0–1 blend factor
 * @returns {number}
 */
export function lerp(current, target, factor) {
  return current + (target - current) * factor;
}
