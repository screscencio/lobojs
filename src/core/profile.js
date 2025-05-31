const Telemetry = require('./telemetry');

/**
 * Profile a given function with the specified metric name.
 * @param {string} name - Metric name.
 * @param {Function} fn - Function to be profiled.
 * @returns {Promise<*>} The result of the function under profiling.
 */
function profile(name, fn) {
  Telemetry.startMetric(name);
  const result = fn();
  if (result && typeof result.then === 'function') {
    return result.then(res => {
      Telemetry.endMetric(name);
      return res;
    });
  }
  Telemetry.endMetric(name);
  return result;
}

module.exports = profile;