#!/usr/bin/env node

/**
 * Neural Pulse — live transformer inference monitor.
 */

import '../utils/env.js';
import ansiEscapes from 'ansi-escapes';
import { config } from '../utils/config.js';
import { hasApiKey } from '../utils/env.js';
import { isInteractiveTerminal } from '../utils/capabilities.js';
import { formatUserError } from '../utils/errors.js';
import { MetricsTracker } from '../metrics/tracker.js';
import { runBootSequence } from '../dashboard/animations.js';
import { Renderer } from '../dashboard/renderer.js';
import { createClient, streamCompletion } from '../services/openai.js';
import { terminal } from './terminal.js';
import { Keyboard, waitForIdleAction, isQuitKey } from './keyboard.js';
import { parseArgv, registerShutdown, CliError } from './cli.js';
import { printHelp, printVersion, printMissingApiKey } from './help.js';
import { RED } from '../dashboard/theme.js';

const MIN_COLUMNS = 76;

let cleanedUp = false;

function cleanup() {
  if (cleanedUp) return;
  cleanedUp = true;
  terminal.leave();
}

/**
 * @param {Renderer} renderer
 * @param {import('openai').OpenAI} client
 * @param {string} prompt
 * @param {string} model
 * @param {AbortSignal} signal
 */
async function runInference(renderer, client, prompt, model, signal) {
  const metrics = new MetricsTracker({ model, prompt });
  renderer.prepareRun(metrics);
  metrics.start();
  renderer.logRequestStarted();

  let lastUsage = null;
  let started = false;

  for await (const event of streamCompletion(client, prompt, { model, signal })) {
    if (event.type === 'connected') {
      renderer.onStreamConnected();
      continue;
    }

    if (event.type === 'usage') {
      lastUsage = event.usage;
      renderer.reconcileUsage(event.usage);
      continue;
    }

    if (event.type === 'finish') {
      renderer.setFinishReason(event.reason);
      continue;
    }

    if (!started) {
      renderer.beginStreaming();
      started = true;
    }
    renderer.enqueueToken(event.text);
  }

  if (lastUsage) {
    renderer.reconcileUsage(lastUsage);
  }

  renderer.beginCompletion();
}

/**
 * @returns {number}
 */
function exitCodeForError() {
  return 1;
}

async function main() {
  const argv = process.argv;

  let parsed;
  try {
    parsed = parseArgv(argv);
  } catch (error) {
    if (error instanceof CliError) {
      printHelp(error.message);
      process.exit(1);
      return;
    }
    throw error;
  }

  if (parsed.action === 'help') {
    printHelp();
    return;
  }

  if (parsed.action === 'version') {
    printVersion();
    return;
  }

  if (!hasApiKey()) {
    printMissingApiKey();
    process.exit(1);
    return;
  }

  if (!isInteractiveTerminal()) {
    process.stderr.write('Neural Pulse requires an interactive terminal (TTY).\n');
    process.exit(1);
    return;
  }

  const columns = process.stdout.columns ?? MIN_COLUMNS;
  if (columns < MIN_COLUMNS) {
    process.stderr.write(
      `Terminal too narrow (${columns} columns). Minimum width is ${MIN_COLUMNS} columns.\n`,
    );
    process.exit(1);
    return;
  }

  const model = parsed.model ?? config.model;
  const abort = new AbortController();
  const keyboard = new Keyboard();
  let renderer = null;

  registerShutdown({
    abort,
    keyboard,
    onShutdown: () => {
      renderer?.stopLoop();
      renderer?.modal.hide();
    },
  });

  try {
    terminal.enter();
    process.stdout.write(ansiEscapes.clearScreen);
    await runBootSequence({ signal: abort.signal });
    process.stdout.write(ansiEscapes.clearScreen);

    const client = createClient();
    let pendingPrompt = parsed.prompt;

    renderer = new Renderer(new MetricsTracker({ model, prompt: '—' }), keyboard);
    renderer.init();
    keyboard.enable();

    keyboard.onKey((str, key) => {
      if (isQuitKey(str, key) && !abort.signal.aborted) {
        abort.abort();
      }
    });

    if (!pendingPrompt) {
      renderer.setIdleAwaitingInput();
    }

    while (!abort.signal.aborted) {
      if (!pendingPrompt) {
        const action = await waitForIdleAction(keyboard, abort.signal);
        if (action === 'quit' || abort.signal.aborted) break;

        const prompt = await renderer.promptModal(abort.signal);
        if (!prompt) {
          if (abort.signal.aborted) break;
          renderer.setIdleAwaitingInput();
          continue;
        }
        pendingPrompt = prompt;
      }

      const prompt = pendingPrompt;
      pendingPrompt = null;

      try {
        await runInference(renderer, client, prompt, model, abort.signal);
      } catch (error) {
        if (error?.name === 'AbortError') break;
        renderer.showError(formatUserError(error, { model }));
      }
    }
  } catch (error) {
    if (error?.name === 'AbortError') return;
    cleanup();
    process.stderr.write(
      RED(`${formatUserError(error, { model: parsed.model ?? config.model })}\n`),
    );
    process.exit(exitCodeForError());
  } finally {
    keyboard.disable();
    renderer?.dispose();
  }
}

main().catch((error) => {
  cleanup();
  process.stderr.write(RED(`${formatUserError(error)}\n`));
  process.exit(1);
});
