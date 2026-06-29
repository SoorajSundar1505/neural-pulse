/**
 * Pipeline — animates stages while streaming; centered summary when complete.
 */

import { FIXED } from '../dashboard/layout.js';
import { centerInWidth } from '../utils/align.js';
import { CYAN, GREEN, MUTED } from '../dashboard/theme.js';

/** @typedef {import('../services/inference.js').InferencePhase} InferencePhase */
/** @typedef {import('../cli/terminal.js').Region} Region */

const STAGES = [
  { id: 'input', label: 'Input' },
  { id: 'tokenizer', label: 'Tokenizer' },
  { id: 'embedding', label: 'Embedding' },
  { id: 'layer', label: 'Layer Stack' },
  { id: 'logits', label: 'Logits' },
  { id: 'sampling', label: 'Sampling' },
  { id: 'output', label: 'Output' },
];

export class PipelinePanel {
  constructor() {
    /** @type {InferencePhase} */
    this.phase = 'idle';
    this.layerIndex = -1;
    this.allComplete = false;
  }

  /** Reset to idle state. */
  reset() {
    this.phase = 'idle';
    this.layerIndex = -1;
    this.allComplete = false;
  }

  /**
   * @param {InferencePhase} phase
   * @param {number} [layerIndex]
   */
  setFrame(phase, layerIndex = -1) {
    this.allComplete = false;
    this.phase = phase;
    this.layerIndex = layerIndex;
  }

  /** Mark inference finished — collapse to centered completed message. */
  setAllComplete() {
    this.allComplete = true;
    this.phase = 'idle';
    this.layerIndex = -1;
  }

  /**
   * @returns {string}
   */
  stateKey() {
    if (this.allComplete) return 'complete';
    if (this.phase === 'layer') return `layer:${this.layerIndex}`;
    return this.phase;
  }

  /**
   * @param {Region} region
   * @returns {string[]}
   */
  render(region) {
    const lines = new Array(FIXED.pipelineLines).fill('');
    const w = region.width;

    if (this.allComplete) {
      const top = Math.floor((FIXED.pipelineLines - 2) / 2);
      lines[top] = centerInWidth(GREEN('✓ Completed'), w);
      lines[top + 1] = centerInWidth(MUTED('Model finished successfully'), w);
      return lines;
    }

    if (this.phase === 'idle') {
      lines[Math.floor(FIXED.pipelineLines / 2)] = centerInWidth(
        MUTED('Awaiting inference'),
        w,
      );
      return lines;
    }

    const activeId = this.phase === 'layer' ? 'layer' : this.phase;
    const activeIdx = STAGES.findIndex((s) => s.id === activeId);
    const blockStart = Math.max(0, Math.floor((FIXED.pipelineLines - STAGES.length) / 2));

    for (let i = 0; i < STAGES.length; i += 1) {
      const stage = STAGES[i];
      const isActive = i === activeIdx;
      const isDone = i < activeIdx;

      let prefix = MUTED('·');
      if (isDone) prefix = GREEN('✓');
      else if (isActive) prefix = CYAN.bold('▶');

      let label = stage.label;
      if (isActive) label = CYAN.bold(label);
      else if (isDone) label = GREEN(label);
      else label = MUTED(label);

      const row = blockStart + i;
      if (row < FIXED.pipelineLines) {
        lines[row] = centerInWidth(`${prefix} ${label}`, w);
      }
    }
    return lines;
  }
}
