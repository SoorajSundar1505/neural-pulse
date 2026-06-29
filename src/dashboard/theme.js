/**
 * Shared terminal color palette.
 */

import chalk from 'chalk';
import gradient from 'gradient-string';
import { config } from '../utils/config.js';

export const CYAN = chalk.cyan;
export const GREEN = chalk.green;
export const WHITE = chalk.white;
export const RED = chalk.red;
export const MUTED = chalk.hex('#4a7070');
export const DIM = chalk.hex('#1a3a32');
export const FADE = chalk.hex('#0d5544');
export const BRIGHT = chalk.greenBright;
export const DIM_GREEN = chalk.hex('#3a5548');
export const IDLE_CHECK = chalk.hex('#5a6b62');
export const VERSION = chalk.hex('#3d4f4f');

export const holo = gradient(config.gradient);
