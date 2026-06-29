/**
 * Neural Pulse — public API.
 */

export { MetricsTracker } from './metrics/tracker.js';
export { SESSION_LABELS, buildSessionDisplay } from './metrics/session.js';
export { buildPerformanceDisplay } from './metrics/performance.js';
export {
  calculateCost,
  calculateCostBreakdown,
  formatCost,
  getModelPricing,
  getModelContextWindow,
  parseUsage,
  reconcileUsage,
  sparkline,
} from './metrics/index.js';

export { Renderer } from './dashboard/renderer.js';
export { Dashboard } from './dashboard/dashboard.js';
export { runBootSequence } from './dashboard/animations.js';
export { computeLayout, FIXED } from './dashboard/layout.js';

export {
  SessionPanel,
  PipelinePanel,
  PerformancePanel,
  OutputStreamPanel,
  OutputStreamPanel as OutputStream,
  EventLogPanel,
  EventLogPanel as EventLog,
  FooterPanel,
} from './panels/index.js';

export { createClient, streamCompletion, PulseAnimator, StreamBuffer } from './services/index.js';

export { version } from './utils/version.js';
export { config, estimateTokens } from './utils/config.js';
export {
  formatElapsed,
  formatFooterStatus,
  formatLatency,
  formatModelName,
  formatStreamTimestamp,
} from './utils/format.js';

export { terminal, Keyboard, PromptModal, lerp } from './cli/index.js';
