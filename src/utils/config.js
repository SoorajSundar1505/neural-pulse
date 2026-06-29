/**
 * Neural Pulse — configuration.
 */

import './env.js';
import { version } from './version.js';

export const config = {
  appName: 'NEURAL PULSE',
  subtitle: 'Real-time LLM Observability Dashboard',

  model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
  defaultPrompt:
    process.env.NEURAL_PULSE_PROMPT ??
    'Explain how transformer models work in one sentence.',

  layerCount: Number(process.env.NEURAL_PULSE_LAYERS ?? 32),
  barWidth: 10,

  tokenAnimationMs: Number(process.env.NEURAL_PULSE_ANIM_MS ?? 100),
  targetFps: Number(process.env.NEURAL_PULSE_FPS ?? 30),
  visibleTokens: Number(process.env.NEURAL_PULSE_VISIBLE_TOKENS ?? 18),
  tokenHighlightMs: Number(process.env.NEURAL_PULSE_HIGHLIGHT_MS ?? 300),
  /** API limit only — omit from requests unless NEURAL_PULSE_MAX_TOKENS is set. */
  maxTokens: process.env.NEURAL_PULSE_MAX_TOKENS
    ? Number(process.env.NEURAL_PULSE_MAX_TOKENS)
    : undefined,

  gradient: ['#00e5ff', '#00ff88', '#00e5ff'],

  version,

  bootSteps: [
    'Initializing terminal...',
    'Loading model configuration...',
    'Connecting to OpenAI...',
    'Preparing dashboard...',
    'Ready.',
  ],
};

/**
 * Rough token estimate from character count.
 * @param {string} text
 * @returns {number}
 */
export function estimateTokens(text) {
  return Math.max(1, Math.ceil(text.length / 4));
}
