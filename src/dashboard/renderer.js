/**
 * Neural Pulse renderer — full-screen fixed dashboard (htop-style).
 */

import ansiEscapes from 'ansi-escapes';
import { config } from '../utils/config.js';
import { terminal } from '../cli/terminal.js';
import { PromptModal } from '../cli/modal.js';
import { reconcileUsage } from '../metrics/usage.js';
import { PulseAnimator } from '../services/inference.js';
import { Dashboard } from './dashboard.js';
import { renderHeaderTitle } from './borders.js';
import {
  EventLogPanel,
  FooterPanel,
  OutputStreamPanel,
  PerformancePanel,
  PipelinePanel,
  SessionPanel,
} from '../panels/index.js';

export class Renderer {
  /**
   * @param {import('../metrics/tracker.js').MetricsTracker} metrics
   * @param {import('../cli/keyboard.js').Keyboard} keyboard
   */
  constructor(metrics, keyboard) {
    this.metrics = metrics;
    this.keyboard = keyboard;
    this.term = terminal;
    this.dashboard = new Dashboard();
    this.modal = new PromptModal(this.term);
    this.session = new SessionPanel();
    this.performance = new PerformancePanel();
    this.pipeline = new PipelinePanel();
    this.footer = new FooterPanel();
    this.pulse = new PulseAnimator();
    this.layout = null;
    this.output = null;
    this.events = null;
    this.loop = null;
    this.initialized = false;
    this.lastPipelineKey = '';
    this.lastMetricsKey = '';
    this.lastPerformanceKey = '';
    this.streaming = false;
    this.completed = false;
    this.modalOpen = false;
    this.spinnerFrame = 0;
    this.lastHeaderKey = '';
  }

  /** Initialize dashboard frame and panels. */
  init() {
    if (!this.initialized) {
      if (!this.term.inAlt) {
        this.term.enter();
        process.stdout.write(ansiEscapes.clearScreen);
      }
      this.layout = this.dashboard.paint(this.term);
      this.output = new OutputStreamPanel(this.term, this.layout.tokenLines);
      this.events = new EventLogPanel(this.term, this.layout.eventLog);
      this.initialized = true;
    }
    this.resetPanels();
  }

  /**
   * @param {import('../metrics/tracker.js').MetricsTracker} metrics
   */
  prepareRun(metrics) {
    this.metrics = metrics;
    this.completed = false;
    this.streaming = false;
    this.lastPipelineKey = '';
    this.lastMetricsKey = '';
    this.lastPerformanceKey = '';
    this.pulse = new PulseAnimator();
    this.resetPanels();
  }

  /** Reset all dynamic panels for a new run. */
  resetPanels() {
    this.output.reset();
    this.events.reset();
    this.pipeline.reset();
    this.renderPerformancePanel(true);
    this.renderPipelinePanel(true);
    this.syncMetricsPanels(true);
    this.renderFooterPanel(true);
  }

  /** Begin a new request timeline (after metrics.start()). */
  logRequestStarted() {
    const startMs = this.metrics.startTime ?? Date.now();
    this.events.beginTimeline(startMs);
    this.events.logInfo('Request started', 0);
    this.events.redraw();
    this.renderHeaderTitle(true);
  }

  /** Log when the OpenAI stream is established. */
  onStreamConnected() {
    this.events.logInfo('Connected to OpenAI');
    this.events.redraw();
  }

  /** Show idle state awaiting user prompt. */
  setIdleAwaitingInput() {
    this.completed = false;
    this.streaming = false;
    this.spinnerFrame = 0;
    this.pipeline.reset();
    this.renderPipelinePanel(true);
    this.events.reset();
    this.syncMetricsPanels(true);
    this.renderHeaderTitle(true);
  }

  /** Repaint all panels after modal interaction. */
  refreshAllPanels() {
    this.renderPerformancePanel(true);
    this.renderPipelinePanel(true);
    this.output.render(true);
    this.events.redraw();
    this.syncMetricsPanels(true);
  }

  /**
   * @param {AbortSignal} [signal]
   * @returns {Promise<string | null>}
   */
  promptModal(signal) {
    return new Promise((resolve) => {
      this.modalOpen = true;
      this.modal.show();

      const finish = (value) => {
        off();
        signal?.removeEventListener('abort', onAbort);
        this.modal.hide();
        this.modalOpen = false;
        this.refreshAllPanels();
        resolve(value);
      };

      const onAbort = () => finish(null);

      const off = this.keyboard.onKey((str, key) => {
        const action = this.modal.handleKey(str, key);
        if (action === 'submit') {
          finish(this.modal.value.trim() || null);
        } else if (action === 'cancel') {
          finish(null);
        } else {
          this.modal.render();
        }
      });

      signal?.addEventListener('abort', onAbort, { once: true });
    });
  }

  /** Start render loop. */
  startLoop() {
    if (this.loop) return;
    this.loop = setInterval(() => this.frame(), 1000 / config.targetFps);
  }

  /** Stop render loop. */
  stopLoop() {
    if (this.loop) {
      clearInterval(this.loop);
      this.loop = null;
    }
  }

  /**
   * @param {string} chunk
   */
  enqueueToken(chunk) {
    if (this.completed) return;
    this.metrics.addChunk(chunk);
    this.output.ingest(chunk);
    this.output.render();
    this.pulse.trigger();
    this.syncMetricsPanels();
  }

  /**
   * @param {string} reason
   */
  setFinishReason(reason) {
    this.metrics.setFinishReason(reason);
    this.renderPerformancePanel(true);
  }

  /**
   * @param {object} usage
   */
  reconcileUsage(usage) {
    if (reconcileUsage(this.metrics, usage)) {
      this.syncMetricsPanels(true);
    }
  }

  /** Begin streaming state (first content token). */
  beginStreaming() {
    this.streaming = true;
    this.completed = false;
    this.spinnerFrame = 0;
    this.output.beginStream();
    this.output.setStreaming(true);
    this.pipeline.setFrame('input');
    this.events.logInfo('First token received');
    this.events.redraw();
    this.renderHeaderTitle(true);
    this.startLoop();
  }

  /** Mark inference complete. */
  beginCompletion() {
    this.metrics.complete();
    this.completed = true;
    this.streaming = false;
    this.pipeline.setAllComplete();
    this.renderPipelinePanel(true);
    this.output.freeze();
    const elapsedSec = this.metrics.getTotalWallMs() / 1000;
    this.events.logStreamCompleted(elapsedSec);
    this.events.redraw();
    this.syncMetricsPanels(true);
    this.renderFooterPanel(true);
    this.renderHeaderTitle(true);
    this.stopLoop();
  }

  /** Single animation frame. */
  frame() {
    if (this.completed || this.modalOpen) return;

    const now = performance.now();
    const pf = this.pulse.tick(now);
    if (pf.active) {
      this.pipeline.setFrame(pf.phase, pf.layerIndex);
    } else if (this.streaming) {
      this.pipeline.setFrame('layer', -1);
    }

    if (this.streaming) {
      this.metrics.recordStreamSample();
    }

    this.renderPipelinePanel();
    this.renderPerformancePanel();
    this.output.render();
    this.syncMetricsPanels();
    this.events.redraw();

    if (this.streaming) {
      this.spinnerFrame += 1;
      this.renderHeaderTitle();
    }
  }

  /**
   * @param {boolean} [force]
   */
  renderHeaderTitle(force = false) {
    if (!this.layout) return;

    const state = {
      streaming: this.streaming,
      completed: this.completed,
      spinnerFrame: this.spinnerFrame,
    };
    const key = `${state.streaming}|${state.completed}|${state.spinnerFrame}`;
    if (!force && key === this.lastHeaderKey) return;
    this.lastHeaderKey = key;

    renderHeaderTitle(this.term, this.layout, state);
  }

  /**
   * @param {boolean} [force]
   */
  syncMetricsPanels(force = false) {
    const key = this.metrics.getUpdateKey();
    if (!force && key === this.lastMetricsKey) return;
    this.lastMetricsKey = key;
    this.renderSessionPanel(force);
    this.renderPerformancePanel(force);
    this.renderFooterPanel(force);
  }

  /**
   * @param {boolean} [force]
   */
  renderPerformancePanel(force = false) {
    if (!this.layout) return;

    const region = this.layout.performanceLines;
    const key = this.performance.stateKey(this.metrics, region);
    if (!force && key === this.lastPerformanceKey) return;
    this.lastPerformanceKey = key;

    const lines = this.performance.render(this.metrics, region);
    for (let i = 0; i < region.height; i += 1) {
      this.term.writeAt(
        region.col,
        region.row + i,
        lines[i] ?? '',
        region.width,
      );
    }
  }

  /**
   * @param {boolean} [force]
   */
  renderPipelinePanel(force = false) {
    if (!this.layout) return;
    const key = this.pipeline.stateKey();
    if (!force && key === this.lastPipelineKey) return;
    this.lastPipelineKey = key;
    this.term.writeLines(this.layout.pipeline, this.pipeline.render(this.layout.pipeline));
  }

  /**
   * @param {boolean} [force]
   */
  renderSessionPanel(force = false) {
    if (!this.layout) return;
    this.session.render(
      this.term,
      this.layout,
      this.metrics,
      { completed: this.completed, streaming: this.streaming },
      force,
    );
  }

  /**
   * @param {boolean} [force]
   */
  renderFooterPanel(force = false) {
    if (!this.layout) return;
    this.footer.render(
      this.term,
      this.layout,
      this.metrics,
      { completed: this.completed, streaming: this.streaming },
      force,
    );
  }

  /**
   * @param {string} message
   */
  showError(message) {
    this.stopLoop();
    this.completed = true;
    this.streaming = false;
    if (!this.events.timelineStart) {
      this.events.beginTimeline(Date.now());
    }
    this.events.logError(message);
    this.events.redraw();
    this.syncMetricsPanels(true);
    this.renderHeaderTitle(true);
  }

  /** Tear down renderer and leave alt screen. */
  dispose() {
    this.stopLoop();
    this.modal.hide();
    this.term.leave();
  }
}
