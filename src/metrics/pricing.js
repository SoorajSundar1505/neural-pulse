/**
 * Model pricing — USD per 1M tokens. Single source of truth.
 */

/** @typedef {{ inputPerMillion: number, outputPerMillion: number }} ModelRates */

/** @type {Record<string, number>} */
export const MODEL_CONTEXT = {
  'gpt-4o': 128_000,
  'gpt-4o-mini': 128_000,
  'gpt-4.1': 1_047_576,
  'gpt-4.1-mini': 1_047_576,
  'gpt-4-turbo': 128_000,
  'gpt-3.5-turbo': 16_385,
};

/** @type {Record<string, ModelRates>} */
export const MODEL_PRICING = {
  'gpt-4o': { inputPerMillion: 2.5, outputPerMillion: 10.0 },
  'gpt-4o-mini': { inputPerMillion: 0.15, outputPerMillion: 0.6 },
  'gpt-4.1': { inputPerMillion: 2.0, outputPerMillion: 8.0 },
  'gpt-4.1-mini': { inputPerMillion: 0.4, outputPerMillion: 1.6 },
  'gpt-4-turbo': { inputPerMillion: 10.0, outputPerMillion: 30.0 },
  'gpt-3.5-turbo': { inputPerMillion: 0.5, outputPerMillion: 1.5 },
};

const DEFAULT_MODEL = 'gpt-4o-mini';

/**
 * @param {string} model
 * @returns {ModelRates}
 */
export function getModelPricing(model) {
  if (MODEL_PRICING[model]) return MODEL_PRICING[model];

  const prefix = Object.keys(MODEL_PRICING)
    .sort((a, b) => b.length - a.length)
    .find((key) => model.startsWith(key));

  if (prefix) return MODEL_PRICING[prefix];
  return MODEL_PRICING[DEFAULT_MODEL];
}

/**
 * @param {string} model
 * @returns {number}
 */
export function getModelContextWindow(model) {
  if (MODEL_CONTEXT[model]) return MODEL_CONTEXT[model];

  const prefix = Object.keys(MODEL_CONTEXT)
    .sort((a, b) => b.length - a.length)
    .find((key) => model.startsWith(key));

  if (prefix) return MODEL_CONTEXT[prefix];
  return MODEL_CONTEXT[DEFAULT_MODEL] ?? 128_000;
}

/**
 * @param {number} tokens
 * @returns {string}
 */
export function formatContextLimit(tokens) {
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(1)}M`;
  if (tokens >= 1_000) return `${Math.round(tokens / 1_000)}K`;
  return String(tokens);
}
