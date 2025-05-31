/**
 * Telemetry module for starting and ending metrics.
 * Stores metric data for analysis and reporting.
 */
const { performance } = require('perf_hooks');

/**
 * Telemetry module for recording named metrics with durations.
 */
class Telemetry {
  /**
   * Begin recording a metric.
   * @param {string} name - Name of the metric.
   */
  static startMetric(name) {
    this._startTimes.set(name, performance.now());
  }

  /**
   * End recording a metric and compute its duration in milliseconds.
   * @param {string} name - Name of the metric.
   * @throws {Error} If startMetric was not called for the given name.
   */
static endMetric(name) {
  const start = this._startTimes.get(name);
  if (start === undefined) {
    throw new Error(`No start time for metric '${name}'`);
  }
  const duration = performance.now() - start;
  this._metrics.push({ name, duration });
  this._startTimes.delete(name);
}

  /**
   * Retrieve all recorded metrics.
   * @returns {Array<{name: string, duration: number}>}
   */
  static getMetrics() {
    return this._metrics.slice();
  }

  /**
   * Clear all recorded metrics and start times.
   */
  static clear() {
    this._startTimes.clear();
    this._metrics = [];
  }
}

// internal state
Telemetry._startTimes = new Map();
Telemetry._metrics = [];

module.exports = Telemetry;