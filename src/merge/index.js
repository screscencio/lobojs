/**
 * Merge multiple performance result files into a single dataset.
 */
const io = require('../io');

/**
 * Merge multiple performance result files into a single dataset with aggregated statistics.
 * @param {string[]} inputs - List of JSON result file paths to merge.
 * @param {string} output - Path to write the merged JSON file.
 */
module.exports = async function merge(inputs, output) {
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
  results.forEach(({ metrics }) => {
    (metrics || []).forEach(({ name, duration }) => {
      if (!durationsByName.has(name)) durationsByName.set(name, []);
      durationsByName.get(name).push(duration);
    });
  });

  const mergedMetrics = [];
  durationsByName.forEach((durations, name) => {
    const count = durations.length;
    const min = Math.min(...durations);
    const max = Math.max(...durations);
    const sum = durations.reduce((sum, d) => sum + d, 0);
    const avg = sum / count;
    mergedMetrics.push({ name, durations, stats: { count, min, max, avg } });
  });

  const merged = {
    mergedAt: new Date().toISOString(),
    inputs,
    metrics: mergedMetrics,
  };

  await io.write(output, merged);
  console.log(`Merged ${inputs.length} files into ${output}`);
};