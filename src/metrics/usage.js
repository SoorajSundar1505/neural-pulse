/**
 * OpenAI usage object parsing and reconciliation.
 */

/**
 * @param {object | null | undefined} usage
 * @returns {{ inputTokens: number | null, outputTokens: number | null }}
 */
export function parseUsage(usage) {
  if (!usage) {
    return { inputTokens: null, outputTokens: null };
  }

  const input =
    usage.input_tokens ??
    usage.prompt_tokens ??
    null;
  const output =
    usage.output_tokens ??
    usage.completion_tokens ??
    null;

  return {
    inputTokens: Number.isFinite(input) ? input : null,
    outputTokens: Number.isFinite(output) ? output : null,
  };
}

/**
 * @param {import('./tracker.js').MetricsTracker} metrics
 * @param {object | null | undefined} usage
 * @returns {boolean} true if any field was reconciled
 */
export function reconcileUsage(metrics, usage) {
  const { inputTokens, outputTokens } = parseUsage(usage);
  if (inputTokens == null && outputTokens == null) return false;

  metrics.applyUsageCounts(inputTokens, outputTokens);
  return true;
}
