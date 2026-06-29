/**
 * User-facing error formatting for API and runtime failures.
 */

/**
 * @param {unknown} error
 * @param {object} [context]
 * @param {string} [context.model]
 * @returns {string}
 */
export function formatUserError(error, context = {}) {
  if (!error) return 'An unknown error occurred.';

  if (error instanceof Error && error.name === 'AbortError') {
    return 'Request cancelled.';
  }

  const status = /** @type {{ status?: number }} */ (error).status;
  const code = /** @type {{ code?: string }} */ (error).code;
  const message = error instanceof Error ? error.message : String(error);

  if (status === 401) {
    return 'Invalid API key. Check OPENAI_API_KEY in your environment or .env file.';
  }
  if (status === 404) {
    const model = context.model ? ` "${context.model}"` : '';
    return `Model not found${model}. Check the model name or your API access.`;
  }
  if (status === 429) {
    return 'Rate limit exceeded. Wait a moment and try again.';
  }
  if (status === 500 || status === 502 || status === 503) {
    return 'OpenAI service is temporarily unavailable. Try again shortly.';
  }
  if (code === 'ENOTFOUND' || code === 'ECONNREFUSED' || code === 'ETIMEDOUT') {
    return 'Network error. Check your internet connection and try again.';
  }
  if (message.includes('OPENAI_API_KEY')) {
    return message;
  }

  return message;
}
