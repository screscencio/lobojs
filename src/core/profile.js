const Telemetry = require('./telemetry');

/**
 * Profile a given function with the specified metric name.
 * @param {string} name - Metric name.
 * @param {Function} fn - Function to be profiled.
 * @returns {Promise<*>} The result of the function under profiling.
 */
async function profile(name, fn) {
  Telemetry.startMetric(name);
  const result = await fn();
  await Telemetry.endMetric(name);
  return result;
}

module.exports = profile;