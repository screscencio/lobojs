/**
 * Generate human-readable reports from performance data.
 */
module.exports = async function report(input, outDir) {
  const fs = require('fs').promises;
  const path = require('path');
  const io = require('../io');
  let chalk;
  try {
    chalk = require('chalk');
  } catch {
    try {
      chalk = (await import('chalk')).default;
    } catch {
      chalk = { green: (x) => x };
    }
  }

  const data = await io.read(input);
  await fs.mkdir(outDir, { recursive: true });
  const summary = {
    reportedAt: new Date().toISOString(),
    source: input,
    metrics: (data.metrics || []).map((m) => ({
      name: m.name,
      duration: m.duration ?? null,
      stats: m.stats ?? null,
      durations: m.durations ?? null,
    })),
  };

  const summaryFile = path.join(outDir, 'summary.json');
  await io.write(summaryFile, summary);
  console.log(chalk.green(`Summary written to ${summaryFile}`));
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
  console.table(table);
};