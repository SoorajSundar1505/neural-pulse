/**
 * Cost calculation and formatting.
 */

import { getModelPricing } from './pricing.js';

const MILLION = 1_000_000;

/**
 * @param {string} model
 * @param {number} inputTokens
 * @param {number} outputTokens
 * @returns {number} USD, rounded to 6 decimal places
 */
export function calculateCost(model, inputTokens, outputTokens) {
  return calculateCostBreakdown(model, inputTokens, outputTokens).total;
}

/**
 * @param {string} model
 * @param {number} inputTokens
 * @param {number} outputTokens
 * @returns {{ input: number, output: number, total: number }}
 */
export function calculateCostBreakdown(model, inputTokens, outputTokens) {
  const rates = getModelPricing(model);
  const input =
    Math.round(((inputTokens / MILLION) * rates.inputPerMillion) * 1_000_000) / 1_000_000;
  const output =
    Math.round(((outputTokens / MILLION) * rates.outputPerMillion) * 1_000_000) / 1_000_000;
  const total = Math.round((input + output) * 1_000_000) / 1_000_000;
  return { input, output, total };
}

/**
 * @param {number} dollars
 * @returns {string}
 */
export function formatCost(dollars) {
  if (!Number.isFinite(dollars) || dollars < 0) {
    return '$0.000000';
  }
  return `$${dollars.toFixed(6)}`;
}
