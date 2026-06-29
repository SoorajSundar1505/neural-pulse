/**
 * Basic usage — run Neural Pulse programmatically.
 *
 * For the interactive CLI, use: npm start
 */

import { config, MetricsTracker, buildSessionDisplay } from '../src/index.js';

const metrics = new MetricsTracker({
  model: config.model,
  prompt: 'Hello, world!',
});

metrics.start();
metrics.addChunk('Neural Pulse streams live OpenAI responses to your terminal.');
metrics.complete();

console.log(buildSessionDisplay(metrics, { completed: true }));
