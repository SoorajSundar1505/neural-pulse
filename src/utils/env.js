/**
 * Load environment variables from .env (cwd first, then package root).
 */

import dotenv from 'dotenv';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

dotenv.config({ quiet: true });
dotenv.config({ path: resolve(packageRoot, '.env'), quiet: true });

/**
 * @returns {boolean}
 */
export function hasApiKey() {
  const key = process.env.OPENAI_API_KEY;
  return typeof key === 'string' && key.trim().length > 0;
}
