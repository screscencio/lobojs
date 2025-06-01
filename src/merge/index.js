/**
 * Merge multiple performance result files into a single dataset.
 */
const fs = require('fs').promises;
const path = require('path');
const io = require('../io');

/**
 * Merge multiple performance result files into a single dataset with aggregated statistics.
 * Supports incremental merges by only processing new input files and preserving previous data.
 * @param {string[]} inputs - List of JSON result file paths or a directory to merge.
 * @param {string} output - Path to write the merged JSON file.
 */
module.exports = async function merge(inputs, output) {
  // If a single input is a directory, glob all JSON files within it
  if (inputs.length === 1) {
    const stat = await fs.stat(inputs[0]).catch(() => null);
    if (stat && stat.isDirectory()) {
      const files = await fs.readdir(inputs[0]);
      inputs = files.filter((f) => f.endsWith('.json')).map((f) => path.join(inputs[0], f)).sort();
    }
  }

  // Read existing merged file (if any) to enable incremental merging
  let existingInputs = [];
  const durationsByName = new Map();
  const timestampsByName = new Map();
  const prev = await io.read(output).catch(() => null);
  if (prev && Array.isArray(prev.inputs) && Array.isArray(prev.metrics)) {
    existingInputs = prev.inputs;
    prev.metrics.forEach(({ name, durations, timestamps }) => {
      durationsByName.set(name, durations.slice());
      timestampsByName.set(name, timestamps.slice());
    });
  }

  // Determine which input files are new
  const newInputs = inputs.filter((file) => !existingInputs.includes(file));
  if (newInputs.length === 0) {
    console.log(`No new files to merge in ${output}`);
    return;
  }

  // Read and aggregate metrics from new input files
  const results = await Promise.all(
    newInputs.map((file) => io.read(file))
  );
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

  // Build aggregated metrics with statistics
  const mergedMetrics = [];
  durationsByName.forEach((durations, name) => {
    const timestamps = timestampsByName.get(name) || [];
    const count = durations.length;
    const min = Math.min(...durations);
    const max = Math.max(...durations);
    const sum = durations.reduce((acc, d) => acc + d, 0);
    const avg = sum / count;
    mergedMetrics.push({ name, durations, timestamps, stats: { count, min, max, avg } });
  });

  // Ensure output directory exists
  await fs.mkdir(path.dirname(output), { recursive: true });

  // Write merged result with updated inputs list
  const merged = {
    mergedAt: new Date().toISOString(),
    inputs: [...existingInputs, ...newInputs],
    metrics: mergedMetrics,
  };
  await io.write(output, merged);
  console.log(`Merged ${newInputs.length} new file(s) into ${output}`);
};