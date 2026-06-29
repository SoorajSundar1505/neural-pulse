/**
 * Live inference metrics — token counts, timing, sampling.
 */

import { estimateTokens } from '../utils/config.js';
import { calculateCost } from './cost.js';

const MAX_SAMPLES = 24;
const MIN_SAMPLE_INTERVAL_MS = 100;

export class MetricsTracker {
  /**
   * @param {object} options
   * @param {string} options.model
   * @param {string} options.prompt
   */
  constructor({ model, prompt }) {
    this.model = model;
    this.prompt = prompt;
    this.inputTokens = estimateTokens(prompt);
    this.outputTokens = 0;
    this.liveOutputTokens = 0;
    this.streamChunks = 0;
    this.usageReconciled = false;
    this.outputText = '';
    this.characters = 0;
    this.startTime = null;
    this.endTime = null;
    this.firstTokenTime = null;
    this.lastTokenTime = null;
    this.status = 'idle';
    this.lastInterTokenMs = 0;
    this.peakTps = 0;
    this.tpsSamples = [];
    this.latencySamples = [];
    this.finishReason = null;
    this._sampleAt = null;
    this._sampleTokens = 0;
    this._costCache = null;
    this._costCacheKey = '';
  }

  /** Reset per-run sample buffers. */
  resetSamples() {
    this.peakTps = 0;
    this.tpsSamples = [];
    this.latencySamples = [];
    this.finishReason = null;
    this._sampleAt = null;
    this._sampleTokens = 0;
  }

  /** Mark stream start. */
  start() {
    this.startTime = Date.now();
    this.status = 'streaming';
    this.resetSamples();
  }

  /**
   * @param {string} chunk streamed text fragment
   */
  addChunk(chunk) {
    const now = Date.now();
    if (!this.firstTokenTime) this.firstTokenTime = now;

    if (this.lastTokenTime) {
      this.lastInterTokenMs = now - this.lastTokenTime;
      this.latencySamples.push(this.lastInterTokenMs);
      if (this.latencySamples.length > MAX_SAMPLES) {
        this.latencySamples.shift();
      }
    }

    this.streamChunks += 1;
    this.outputText += chunk;
    this.characters += chunk.length;
    this.lastTokenTime = now;

    if (!this.usageReconciled) {
      this.liveOutputTokens += estimateTokens(chunk);
      this.outputTokens = this.liveOutputTokens;
      this.invalidateCostCache();
    }
  }

  /**
   * @param {number | null} inputTokens
   * @param {number | null} outputTokens
   */
  applyUsageCounts(inputTokens, outputTokens) {
    if (inputTokens != null) {
      this.inputTokens = inputTokens;
      this.invalidateCostCache();
    }
    if (outputTokens != null && outputTokens > 0) {
      this.outputTokens = outputTokens;
      this.usageReconciled = true;
      this.invalidateCostCache();
    }
  }

  invalidateCostCache() {
    this._costCache = null;
    this._costCacheKey = '';
  }

  /**
   * @returns {number}
   */
  getCost() {
    const key = `${this.inputTokens}:${this.outputTokens}`;
    if (this._costCache !== null && this._costCacheKey === key) {
      return this._costCache;
    }
    this._costCache = calculateCost(this.model, this.inputTokens, this.outputTokens);
    this._costCacheKey = key;
    return this._costCache;
  }

  /**
   * @param {string | null} reason
   */
  setFinishReason(reason) {
    if (reason) this.finishReason = reason;
  }

  /**
   * Record instantaneous TPS from real token deltas (called each render frame).
   * @param {number} [now]
   */
  recordStreamSample(now = Date.now()) {
    if (!this.firstTokenTime || this.status !== 'streaming') return;

    const tokens = this.outputTokens;
    if (this._sampleAt == null) {
      this._sampleAt = now;
      this._sampleTokens = tokens;
      return;
    }

    const dtMs = now - this._sampleAt;
    if (dtMs < MIN_SAMPLE_INTERVAL_MS) return;

    const delta = tokens - this._sampleTokens;
    if (delta > 0) {
      const instTps = delta / (dtMs / 1000);
      this.tpsSamples.push(instTps);
      if (this.tpsSamples.length > MAX_SAMPLES) this.tpsSamples.shift();
      if (instTps > this.peakTps) this.peakTps = instTps;
    }

    this._sampleAt = now;
    this._sampleTokens = tokens;
  }

  /**
   * @returns {number}
   */
  getTotalWallMs() {
    if (!this.startTime) return 0;
    const end = this.endTime ?? Date.now();
    return Math.max(0, end - this.startTime);
  }

  /** Mark stream complete. */
  complete() {
    this.recordStreamSample();
    this.endTime = Date.now();
    this.status = 'complete';
    if (!this.usageReconciled && this.liveOutputTokens > 0) {
      this.outputTokens = this.liveOutputTokens;
      this.invalidateCostCache();
    }
  }

  /**
   * @param {string} [reason]
   */
  abort(reason = 'aborted') {
    this.endTime = Date.now();
    this.status = reason;
  }

  /**
   * @returns {number}
   */
  getStreamingDurationMs() {
    if (!this.firstTokenTime) return 0;
    const end = this.endTime ?? Date.now();
    return Math.max(0, end - this.firstTokenTime);
  }

  /**
   * @returns {number}
   */
  getLatencyMs() {
    if (!this.startTime || !this.firstTokenTime) return 0;
    return this.firstTokenTime - this.startTime;
  }

  /**
   * @returns {number}
   */
  getStreamingTPS() {
    const ms = this.getStreamingDurationMs();
    if (ms <= 0 || this.outputTokens <= 0) return 0;
    return this.outputTokens / (ms / 1000);
  }

  /**
   * @returns {string}
   */
  getUpdateKey() {
    const streamSec = Math.floor(this.getStreamingDurationMs() / 1000);
    const samples = this.tpsSamples.length + this.latencySamples.length;
    return `${this.inputTokens}:${this.outputTokens}:${this.usageReconciled}:${this.status}:${streamSec}:${this.peakTps.toFixed(1)}:${samples}:${this.finishReason ?? ''}`;
  }
}
