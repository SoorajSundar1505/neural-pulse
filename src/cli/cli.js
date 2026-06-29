/**
 * CLI argument parsing and process lifecycle.
 */

import { terminal } from './terminal.js';

export class CliError extends Error {
  /**
   * @param {string} message
   */
  constructor(message) {
    super(message);
    this.name = 'CliError';
  }
}

/**
 * @typedef {{ action: 'run', prompt: string | null, model?: string } | { action: 'help' } | { action: 'version' }} ParsedArgv
 */

/**
 * @param {string[]} argv
 * @returns {ParsedArgv}
 */
export function parseArgv(argv) {
  const args = argv.slice(2);

  for (const arg of args) {
    if (arg === '--help' || arg === '-h') return { action: 'help' };
    if (arg === '--version' || arg === '-v') return { action: 'version' };
  }

  /** @type {string | undefined} */
  let model;
  const promptParts = [];

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === '--model' || arg === '-m') {
      model = args[i + 1];
      if (!model || model.startsWith('-')) {
        throw new CliError('--model requires a model name');
      }
      i += 1;
      continue;
    }
    if (arg.startsWith('-')) {
      throw new CliError(`Unknown option: ${arg}`);
    }
    promptParts.push(arg);
  }

  return {
    action: 'run',
    prompt: promptParts.length > 0 ? promptParts.join(' ') : null,
    model,
  };
}

/** @deprecated Use parseArgv */
export function hasPromptArg(argv) {
  const parsed = parseArgv(argv);
  return parsed.action === 'run' && parsed.prompt != null;
}

/** @deprecated Use parseArgv */
export function parsePrompt(argv) {
  const parsed = parseArgv(argv);
  return parsed.action === 'run' ? parsed.prompt : null;
}

/** @deprecated Use parseArgv */
export function parseModel(argv) {
  const parsed = parseArgv(argv);
  return parsed.action === 'run' ? parsed.model : undefined;
}

/**
 * @param {object} options
 * @param {AbortController} options.abort
 * @param {import('./keyboard.js').Keyboard} options.keyboard
 * @param {() => void} [options.onShutdown]
 */
export function registerShutdown({ abort, keyboard, onShutdown }) {
  const stop = () => {
    if (abort.signal.aborted) {
      onShutdown?.();
      keyboard?.disable();
      terminal.leave();
      process.exit(0);
      return;
    }
    abort.abort();
    onShutdown?.();
    keyboard?.disable();
    terminal.leave();
    process.exit(0);
  };
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
  if (process.platform === 'win32') process.on('SIGBREAK', stop);
}
