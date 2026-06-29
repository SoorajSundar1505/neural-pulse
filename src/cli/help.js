/**
 * CLI help and usage text.
 */

import { version } from '../utils/version.js';

export function printVersion() {
  process.stdout.write(`${version}\n`);
}

export function printMissingApiKey() {
  process.stderr.write(`No OPENAI_API_KEY found.

Create a .env file:

OPENAI_API_KEY=sk-...

Or export the variable in your shell:

export OPENAI_API_KEY=sk-...
`);
}

/**
 * @param {string} [message]
 */
export function printHelp(message) {
  if (message) {
    process.stderr.write(`${message}\n\n`);
  }

  process.stdout.write(`Neural Pulse v${version}
Real-time LLM observability dashboard for OpenAI models.

USAGE
  neural-pulse [prompt] [options]
  npx neural-pulse [prompt] [options]

ARGUMENTS
  prompt                Optional prompt to run immediately (quote multi-word prompts)

OPTIONS
  --model <name>        OpenAI model (default: gpt-4o-mini, or OPENAI_MODEL)
  -h, --help            Show this help message
  -v, --version         Show package version

EXAMPLES
  neural-pulse
  neural-pulse "Explain transformers"
  neural-pulse --model gpt-4o-mini "Write a haiku about GPUs"
  npx neural-pulse "Summarize quantum computing"

KEYBOARD SHORTCUTS (in dashboard)
  P / Ctrl+P            New prompt
  Q / Ctrl+C            Exit

ENVIRONMENT
  OPENAI_API_KEY        Required. Your OpenAI API key
  OPENAI_MODEL          Default model (gpt-4o-mini)
  NEURAL_PULSE_FPS      Dashboard render FPS (default: 30)
  NEURAL_PULSE_ASCII=1  Force ASCII mode (no Unicode spinner)

DOCUMENTATION
  https://github.com/suraj/neural-pulse#readme
`);
}
