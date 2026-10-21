const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const { execFileSync, spawnSync } = require('child_process');

describe('integration: vitest runner (run → merge → report → evaluate)', () => {
  const cli = path.resolve(__dirname, '../bin/lobo');
  const project = path.resolve(__dirname, 'fixtures/vitest-project');
  let tmpDir;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'lobo-vitest-'));
  });

  test('runs TypeScript vitest profiles and writes a run file the other commands accept', async () => {
    const run = path.join(tmpDir, 'run.json');
    const merged = path.join(tmpDir, 'merged.json');
    const reportDir = path.join(tmpDir, 'report');
    const thresholds = path.join(tmpDir, 'thresholds.json');

    // run from inside the project, the way `npx lobo` would
    execFileSync('node', [cli, 'run', 'profiles', '--runner', 'vitest', '-o', run], { cwd: project, stdio: 'ignore' });

    const result = JSON.parse(await fs.readFile(run, 'utf8'));
    expect(result).toHaveProperty('timestamp');
    expect(result.metrics.map((m) => m.name).sort()).toEqual(['board_read', 'card_close', 'card_save']);
    result.metrics.forEach((m) => {
      expect(Object.keys(m).sort()).toEqual(['duration', 'name']);
      expect(m.duration).toBeGreaterThanOrEqual(0);
    });

    execFileSync('node', [cli, 'merge', run, '-o', merged], { stdio: 'ignore' });
    execFileSync('node', [cli, 'report', merged, '-o', reportDir], { stdio: 'ignore' });
    const summary = JSON.parse(await fs.readFile(path.join(reportDir, 'summary.json'), 'utf8'));
    expect(summary.metrics.map((m) => m.name).sort()).toEqual(['board_read', 'card_close', 'card_save']);

    await fs.writeFile(thresholds, JSON.stringify({ card_save: 60000, card_close: 0 }));
    const res = spawnSync('node', [cli, 'evaluate', run, '-t', thresholds], { encoding: 'utf8' });
    expect(res.status).toBe(1);
    expect(res.stderr).toMatch(/Some metrics exceeded thresholds/);
  }, 30000);

  test('ci accepts --runner vitest and writes runs and reports', async () => {
    const runsDir = path.join(tmpDir, 'runs');
    const reportDir = path.join(tmpDir, 'report');
    const thresholds = path.join(tmpDir, 'thresholds.json');
    await fs.writeFile(thresholds, '{}');

    const res = spawnSync('node', [
      cli, 'ci', '--runner', 'vitest', '-p', 'profiles', '-w', runsDir, '-r', reportDir, '-t', thresholds,
    ], { cwd: project, encoding: 'utf8' });
    expect(res.status).toBe(0);

    const runs = await fs.readdir(runsDir);
    expect(runs).toHaveLength(1);
    expect(runs[0]).toMatch(/^lobojs-run-.*\.json$/);
    const summary = JSON.parse(await fs.readFile(path.join(reportDir, 'summary.json'), 'utf8'));
    expect(summary.metrics).toHaveLength(3);
  }, 30000);

  test('fails when vitest finds no profiles', () => {
    const run = path.join(tmpDir, 'run.json');
    const res = spawnSync('node', [cli, 'run', 'no-such-profiles', '--runner', 'vitest', '-o', run], {
      cwd: project,
      encoding: 'utf8',
    });
    expect(res.status).toBe(1);
    expect(res.stderr).toMatch(/vitest exited with code 1/);
  }, 30000);

  test('rejects an unknown runner', () => {
    const res = spawnSync('node', [cli, 'run', 'profiles', '--runner', 'mocha'], { cwd: project, encoding: 'utf8' });
    expect(res.status).toBe(1);
    expect(res.stderr).toMatch(/Unknown runner 'mocha'/);
  });
});
