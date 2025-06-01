/**
 * Merge multiple performance result files into a single dataset.
 */
const fs = require('fs').promises;
const path = require('path');
const io = require('../io');

/**
 * Merge multiple performance result files into a single dataset with aggregated statistics.
 * @param {string[]} inputs - List of JSON result file paths to merge.
 * @param {string} output - Path to write the merged JSON file.
 */
module.exports = async function merge(inputs, output) {
  if (inputs.length === 1) {
    const stat = await fs.stat(inputs[0]).catch(() => null);
    if (stat && stat.isDirectory()) {
      const files = await fs.readdir(inputs[0]);
      inputs = files
        .filter((f) => f.endsWith('.json'))
        .map((f) => path.join(inputs[0], f))
        .sort();
    }
  }
  const results = await Promise.all(
    inputs.map(async (file) => {
      try {
        return await io.read(file);
      } catch (err) {
        console.error(`Failed to read result file ${file}: ${err.message}`);
        process.exit(1);
      }
    })
  );

  const durationsByName = new Map();
  const timestampsByName = new Map();
  results.forEach(({ timestamp, metrics }) => {
    (metrics || []).forEach(({ name, duration }) => {
      if (!durationsByName.has(name)) {
        durationsByName.set(name, []);
        timestampsByName.set(name, []);
      }
      durationsByName.get(name).push(duration);
      timestampsByName.get(name).push(timestamp);
    });
  });

  const mergedMetrics = [];
  durationsByName.forEach((durations, name) => {
    const timestamps = timestampsByName.get(name) || [];
    const count = durations.length;
    const min = Math.min(...durations);
    const max = Math.max(...durations);
    const sum = durations.reduce((sum, d) => sum + d, 0);
    const avg = sum / count;
    mergedMetrics.push({ name, durations, timestamps, stats: { count, min, max, avg } });
  });

  const merged = {
    mergedAt: new Date().toISOString(),
    inputs,
    metrics: mergedMetrics,
  };

  await io.write(output, merged);
  if (process.env.LOBOJS_KEEP_TEST_ARTIFACTS) {
    console.log(`Merged ${inputs.length} files into ${output}`);
  }
};