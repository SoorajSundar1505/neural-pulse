/**
 * Per-token pulse animation — time-based, non-blocking tick.
 */

import { config } from '../utils/config.js';

/** @typedef {'idle'|'input'|'tokenizer'|'embedding'|'layer'|'logits'|'sampling'|'output'} InferencePhase */

const PHASES = [
  { phase: 'input', weight: 0.05 },
  { phase: 'tokenizer', weight: 0.1 },
  { phase: 'embedding', weight: 0.1 },
  { phase: 'layer', weight: 0.5 },
  { phase: 'logits', weight: 0.1 },
  { phase: 'sampling', weight: 0.08 },
  { phase: 'output', weight: 0.07 },
];

/**
 * Map normalized progress to an inference phase.
 * @param {number} t
 * @returns {{ phase: InferencePhase, layerIndex: number, progress: number }}
 */
export function mapProgress(t) {
  let acc = 0;
  for (const step of PHASES) {
    const next = acc + step.weight;
    if (t <= next || step === PHASES[PHASES.length - 1]) {
      const localT = step.weight > 0 ? (t - acc) / step.weight : 0;
      const layerIndex =
        step.phase === 'layer'
          ? Math.min(
              config.layerCount - 1,
              Math.floor(Math.max(0, localT) * config.layerCount),
            )
          : -1;
      return {
        phase: /** @type {InferencePhase} */ (step.phase),
        layerIndex,
        progress: Math.max(0, Math.min(1, t)),
      };
    }
    acc = next;
  }
  return { phase: 'output', layerIndex: -1, progress: 1 };
}

/**
 * @param {InferencePhase} phase
 * @param {number} layerIndex
 * @returns {string}
 */
export function phaseEventMessage(phase, layerIndex) {
  switch (phase) {
    case 'input':
      return 'Prompt received';
    case 'tokenizer':
      return 'Tokenized input';
    case 'embedding':
      return 'Embedding complete';
    case 'layer':
      return layerIndex >= 0
        ? `Layer ${layerIndex + 1} active`
        : 'Layer stack active';
    case 'logits':
      return 'Logits computed';
    case 'sampling':
      return 'Sampled next token';
    case 'output':
      return 'Token emitted';
    default:
      return 'Processing';
  }
}

export class PulseAnimator {
  constructor() {
    this.duration = config.tokenAnimationMs;
    /** @type {number | null} */
    this.startTime = null;
    this.lastEventKey = '';
    this.lastLayerLogged = -1;
  }

  /** Fire a new pulse (does not block). */
  trigger(now = performance.now()) {
    this.startTime = now;
    this.lastEventKey = '';
    this.lastLayerLogged = -1;
  }

  /** @returns {boolean} */
  get isActive() {
    if (this.startTime === null) return false;
    return performance.now() - this.startTime < this.duration;
  }

  /**
   * @param {number} now
   * @returns {{ phase: InferencePhase, layerIndex: number, progress: number, active: boolean, eventKey: string | null }}
   */
  tick(now = performance.now()) {
    if (this.startTime === null) {
      return { phase: 'idle', layerIndex: -1, progress: 0, active: false, eventKey: null };
    }

    const elapsed = now - this.startTime;
    const progress = Math.min(1, elapsed / this.duration);
    const { phase, layerIndex } = mapProgress(progress);
    const active = progress < 1;

    if (!active) {
      this.startTime = null;
    }

    let eventKey = null;
    const key = phase === 'layer' ? `layer:${layerIndex}` : phase;
    if (key !== this.lastEventKey) {
      if (phase === 'layer') {
        const step = Math.max(4, Math.floor(config.layerCount / 8));
        if (
          layerIndex === 0 ||
          layerIndex >= config.layerCount - 1 ||
          layerIndex - this.lastLayerLogged >= step
        ) {
          eventKey = key;
          this.lastLayerLogged = layerIndex;
          this.lastEventKey = key;
        }
      } else {
        eventKey = key;
        this.lastEventKey = key;
      }
    }

    return { phase, layerIndex, progress, active, eventKey };
  }
}
