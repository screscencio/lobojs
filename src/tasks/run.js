/**
 * Runs performance profiles found in specified files or directories.
 * Scans for profile declarations and executes them.
 * The `node` runner requires each JS file; the `vitest` runner hands the paths to the project's vitest.
 */
module.exports = async function run(files, outputDest = 'profile_runs', { runner = 'node' } = {}) {
  const fs = require('fs').promises;
  const path = require('path');
  const chalk = (() => {
    try { return require('chalk'); }
    catch { return { blue: (x) => x, green: (x) => x, yellow: (x) => x, red: (x) => x }; }
  })();
  const Telemetry = require('../core/telemetry');
  const io = require('../io');

  if (runner !== 'node' && runner !== 'vitest') {
    throw new Error(`Unknown runner '${runner}'. Use 'node' or 'vitest'.`);
  }

  const targets = Array.isArray(files) && files.length > 0 ? files : ['.'];

  async function writeResult(metrics) {
    const result = { timestamp: new Date().toISOString(), metrics };

    const ext = path.extname(outputDest);
    if (ext === '.json') {
      await io.write(outputDest, result);
      console.log(chalk.green(`Run results written to ${outputDest}`));
    } else {
      await fs.mkdir(outputDest, { recursive: true });
      const safeTs = result.timestamp.replace(/:/g, '-');
      const filename = `lobojs-run-${safeTs}.json`;
      const outPath = path.join(outputDest, filename);
      await io.write(outPath, result);
      console.log(chalk.green(`Run results written to ${outPath}`));
    }
  }

  if (runner === 'vitest') {
    console.log(chalk.blue(`Running vitest profiles in: ${targets.join(', ')}`));
    const runVitest = require('./vitest');
    await writeResult(await runVitest(targets));
    return;
  }

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
    const full = path.resolve(file);
    // clear module cache so profiles re-run on each invocation
    delete require.cache[full];
    try {
      delete require.cache[require.resolve(full)];
    } catch {
      // ignore if not in cache
    }
    {
      const ret = require(full);
      if (ret && typeof ret.then === 'function') {
        await ret;
      }
    }
  }

  await writeResult(Telemetry.getMetrics());
};