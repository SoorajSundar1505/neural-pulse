/**
 * Session panel display data — model, prompt, and status only.
 */

/** Session panel row labels (fixed count — matches layout). */
export const SESSION_LABELS = ['Model', 'Prompt', 'Status'];

/**
 * @param {import('./tracker.js').MetricsTracker} tracker
 * @param {object} [_options]
 * @param {boolean} [_options.completed]
 * @returns {{ model: string, prompt: string, status: string }}
 */
export function buildSessionDisplay(tracker, _options = {}) {
  return {
    model: tracker.model,
    prompt: tracker.prompt,
    status: tracker.status,
  };
}
