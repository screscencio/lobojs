/**
 * Runs performance profiles found in specified files or directories.
 * Scans for profile declarations and executes them.
 */
module.exports = async function run(files, outputFile = 'results.json') {
  const fs = require('fs').promises;
  const path = require('path');
  let chalk;
  try {
    chalk = require('chalk');
  } catch {
    try {
      chalk = (await import('chalk')).default;
    } catch {
      chalk = { green: (x) => x, blue: (x) => x, yellow: (x) => x, red: (x) => x };
    }
  }
  const Telemetry = require('../core/telemetry');
  const io = require('../io');

  const targets = Array.isArray(files) && files.length > 0 ? files : ['.'];
  console.log(chalk.blue(`Scanning for JS files in: ${targets.join(', ')}`));

  async function collectFiles(paths) {
    const jsFiles = [];
    for (const p of paths) {
      try {
        const stats = await fs.stat(p);
        if (stats.isDirectory()) {
          if (path.basename(p) === 'node_modules') continue;
          const entries = await fs.readdir(p);
          const fullPaths = entries.map((e) => path.join(p, e));
          jsFiles.push(...(await collectFiles(fullPaths)));
        } else if (stats.isFile() && p.endsWith('.js')) {
          jsFiles.push(p);
        }
      } catch {
        console.warn(chalk.yellow(`Path not found, skipping: ${p}`));
      }
    }
    return jsFiles;
  }

  Telemetry.clear();
  const jsFiles = await collectFiles(targets);
  if (jsFiles.length === 0) {
    console.log(chalk.red('No JS files found. Exiting.'));
    return;
  }

  console.log(chalk.green(`Found ${jsFiles.length} JS files. Running profiles...`));
  for (const file of jsFiles) {
    console.log(chalk.blue(`Executing: ${file}`));
    require(path.resolve(file));
  }

  const metrics = Telemetry.getMetrics();
  const result = {
    timestamp: new Date().toISOString(),
    metrics,
  };

  await io.write(outputFile, result);
  console.log(chalk.green(`Results written to ${outputFile}`));
};