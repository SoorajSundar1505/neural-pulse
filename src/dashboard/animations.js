/**
 * Professional startup sequence — minimal, 800–1200 ms.
 */

import ansiEscapes from 'ansi-escapes';
import { config } from '../utils/config.js';
import { sleep } from '../utils/util.js';
import { MUTED, WHITE, holo } from './theme.js';

const STEP_MS = 200;

/**
 * @param {object} [options]
 * @param {AbortSignal} [options.signal]
 */
export async function runBootSequence({ signal } = {}) {
  process.stdout.write(ansiEscapes.clearScreen);
  process.stdout.write(`\n  ${holo(config.appName)}\n\n`);

  for (const step of config.bootSteps) {
    if (signal?.aborted) return;
    process.stdout.write(MUTED(`  ${step}\n`));
    await sleep(STEP_MS, signal).catch(() => {});
  }

  await sleep(120, signal).catch(() => {});
  process.stdout.write(WHITE(`\n  ${config.bootSteps[config.bootSteps.length - 1]}\n`));
  await sleep(80, signal).catch(() => {});
}
