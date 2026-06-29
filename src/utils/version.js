/**
 * Package version — read from package.json (single source of truth).
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const pkgPath = join(dirname(fileURLToPath(import.meta.url)), '../../package.json');
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));

export const version = pkg.version;
