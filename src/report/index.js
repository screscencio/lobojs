/**
 * Generate human-readable reports from performance data.
 */
const chalk = (() => {
  try {
    return require('chalk');
  } catch {
    return { green: (x) => x };
  }
})();

module.exports = async function report(input, outDir) {
  const fs = require('fs').promises;
  const path = require('path');
  const io = require('../io');

  const data = await io.read(input);
  await fs.mkdir(outDir, { recursive: true });
  const summary = {
    reportedAt: new Date().toISOString(),
    source: input,
    metrics: (data.metrics || []).map((m) => {
      const durations = m.durations ?? (m.duration != null ? [m.duration] : null);
      const timestamps = m.timestamps ?? (
        durations != null && durations.length === 1
          ? [data.timestamp]
          : null
      );
      return {
        name: m.name,
        duration: m.duration ?? null,
        stats: m.stats ?? null,
        durations,
        timestamps,
      };
    }),
  };

  const summaryFile = path.join(outDir, 'summary.json');
  await io.write(summaryFile, summary);
  if (process.env.LOBOJS_KEEP_TEST_ARTIFACTS) {
    console.log(chalk.green(`Summary written to ${summaryFile}`));
  }
  const table = summary.metrics.map((m) => {
    if (m.stats) {
      return {
        Name: m.name,
        Count: m.stats.count,
        Min: m.stats.min,
        Max: m.stats.max,
        Avg: m.stats.avg.toFixed(2),
      };
    }
    return { Name: m.name, Duration: m.duration.toFixed(2) };
  });
  if (process.env.LOBOJS_KEEP_TEST_ARTIFACTS) {
    // Print table data as JSON to avoid native console.table issues during test runs
    console.log(JSON.stringify(table, null, 2));
  }

  const templatePath = path.join(__dirname, 'template.html');
  let template = await fs.readFile(templatePath, 'utf8');
  template = template.replace('/*__SUMMARY_JSON__*/', JSON.stringify(summary));
  const htmlFile = path.join(outDir, 'index.html');
  await fs.writeFile(htmlFile, template, 'utf8');
  if (process.env.LOBOJS_KEEP_TEST_ARTIFACTS) {
    console.log(chalk.green(`HTML report written to ${htmlFile}`));
  }
};