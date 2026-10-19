/**
 * Runs performance profiles with the project's own vitest.
 * Profiles can then be TypeScript or ESM test files and use the project's vitest config,
 * aliases and setup files. Metrics recorded in vitest workers reach LoboJS through
 * the LOBOJS_METRICS_DIR folder written by Telemetry.
 */
const fs = require('fs').promises;
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');

/**
 * Locate the vitest CLI installed in the project being profiled.
 * @param {string} cwd - Project directory.
 * @returns {string} Path to the vitest executable script.
 */
function resolveVitest(cwd) {
  let pkgPath;
  try {
    pkgPath = require.resolve('vitest/package.json', { paths: [cwd] });
  } catch {
    throw new Error('vitest not found. Install it in your project to use --runner vitest: npm install --save-dev vitest');
  }
  const { bin } = require(pkgPath);
  return path.join(path.dirname(pkgPath), typeof bin === 'string' ? bin : bin.vitest);
}

/**
 * Run the given files or directories with `vitest run` and collect their metrics.
 * @param {string[]} targets - Files or directories passed to vitest as filters.
 * @returns {Promise<Array<{name: string, duration: number}>>}
 */
module.exports = async function runVitest(targets) {
  const cwd = process.cwd();
  const vitest = resolveVitest(cwd);
  const metricsDir = await fs.mkdtemp(path.join(os.tmpdir(), 'lobojs-metrics-'));
  try {
    // one file at a time, so profiles do not compete with each other for the CPU
    const args = [vitest, 'run', ...targets, '--no-file-parallelism'];
    const code = await new Promise((resolve, reject) => {
      const child = spawn(process.execPath, args, {
        cwd,
        stdio: 'inherit',
        env: { ...process.env, LOBOJS_METRICS_DIR: metricsDir },
      });
      child.on('error', reject);
      child.on('close', resolve);
    });
    if (code !== 0) {
      throw new Error(`vitest exited with code ${code}`);
    }

    const metrics = [];
    const files = (await fs.readdir(metricsDir)).sort();
    for (const file of files) {
      const content = await fs.readFile(path.join(metricsDir, file), 'utf8');
      content.split('\n').filter(Boolean).forEach((line) => metrics.push(JSON.parse(line)));
    }
    return metrics;
  } finally {
    await fs.rm(metricsDir, { recursive: true, force: true });
  }
};
