/**
 * OpenAI streaming client.
 */

import OpenAI from 'openai';
import { config } from '../utils/config.js';

/**
 * @typedef {{ type: 'content', text: string }} ContentEvent
 * @typedef {{ type: 'usage', usage: object }} UsageEvent
 * @typedef {{ type: 'finish', reason: string }} FinishEvent
 * @typedef {{ type: 'connected' }} ConnectedEvent
 * @typedef {ContentEvent | UsageEvent | FinishEvent | ConnectedEvent} StreamEvent
 */

/**
 * @returns {OpenAI}
 */
export function createClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set.');
  }
  return new OpenAI({ apiKey });
}

/**
 * @param {OpenAI} client
 * @param {string} prompt
 * @param {object} [options]
 * @yields {StreamEvent}
 */
export async function* streamCompletion(client, prompt, options = {}) {
  const {
    model = config.model,
    maxTokens = config.maxTokens,
    signal,
  } = options;

  const body = {
    model,
    messages: [{ role: 'user', content: prompt }],
    stream: true,
    stream_options: { include_usage: true },
  };
  if (maxTokens != null) {
    body.max_tokens = maxTokens;
  }

  const stream = await client.chat.completions.create(body, { signal });

  yield { type: 'connected' };

  for await (const chunk of stream) {
    if (chunk.usage) {
      yield { type: 'usage', usage: chunk.usage };
    }

    const choice = chunk.choices?.[0];
    if (!choice) continue;

    if (choice.finish_reason) {
      yield { type: 'finish', reason: choice.finish_reason };
    }

    const text = choice.delta?.content;
    if (text) {
      yield { type: 'content', text };
    }
  }
}
