/**
 * Evaluate performance data against thresholds, detecting regressions or improvements.
 */
const path = require('path');
const io = require('../io');

/**
 * Evaluate performance data against thresholds, detecting regressions or improvements.
 * @param {string} input - Path to performance result JSON.
 * @param {string} [thresholdFile] - Optional path to thresholds JSON (defaults to ./thresholds.json).
 * @returns {Promise<{ overallPass: boolean, results: Array<{ name: string, duration: number, threshold: number|null, pass: boolean }> }>}
 */
module.exports = async function evaluate(input, thresholdFile) {
  const data = await io.read(input);
  const thresholdsPath = thresholdFile || path.join(process.cwd(), 'thresholds.json');
  let thresholds = {};
  try {
    thresholds = await io.read(thresholdsPath);
  } catch {
    throw new Error(`Threshold file not found: ${thresholdsPath}`);
  }

  const results = (data.metrics || []).map((m) => {
    const th = thresholds[m.name];
    const threshold = typeof th === 'number' ? th : null;
    const pass = threshold === null ? true : m.duration <= threshold;
    return { name: m.name, duration: m.duration, threshold, pass };
  });

  const overallPass = results.every((r) => r.pass);
  return { overallPass, results };
};