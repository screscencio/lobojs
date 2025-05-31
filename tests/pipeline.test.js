const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');

describe('integration: pipeline (run → merge → report)', () => {
  let tmpDir;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'lobo-pipeline-'));
  });


  test('runs two scenarios, merges and reports aggregated metrics', async () => {
    // create two profile scenarios with overlapping and distinct metrics
    const profilesDir = path.join(tmpDir, 'profiles');
    await fs.mkdir(profilesDir, { recursive: true });

    const scenario1 = `
const path = require('path');
const profile = require(path.resolve(process.cwd(), 'src/core/profile'));
profile('taskA', () => {
  for (let i = 0; i < 10000; i++) Math.sqrt(i);
});
profile('taskB', () => {
  for (let i = 0; i < 5000; i++) Math.sqrt(i);
});
`;
    await fs.writeFile(path.join(profilesDir, 'scenario1.js'), scenario1);

    const scenario2 = `
const path = require('path');
const profile = require(path.resolve(process.cwd(), 'src/core/profile'));
profile('taskA', () => {
  for (let i = 0; i < 20000; i++) Math.sqrt(i);
});
profile('taskC', () => {
  for (let i = 0; i < 15000; i++) Math.sqrt(i);
});
`;
    await fs.writeFile(path.join(profilesDir, 'scenario2.js'), scenario2);

    const run1 = path.join(tmpDir, 'run1.json');
    const run2 = path.join(tmpDir, 'run2.json');
    const merged = path.join(tmpDir, 'merged.json');
    const reportDir = path.join(tmpDir, 'report');

    // execute two runs using the CLI runner (isolates require cache)
    const cli = path.resolve(__dirname, '../bin/lobo');
    execFileSync('node', [cli, 'run', profilesDir, '-o', run1], { stdio: 'ignore' });
    execFileSync('node', [cli, 'run', profilesDir, '-o', run2], { stdio: 'ignore' });

    // merge and report via CLI
    execFileSync('node', [cli, 'merge', run1, run2, '-o', merged], { stdio: 'ignore' });
    execFileSync('node', [cli, 'report', merged, '-o', reportDir], { stdio: 'ignore' });

    // inspect the summary.json for aggregated stats
    const summaryPath = path.join(reportDir, 'summary.json');
    const summary = JSON.parse(await fs.readFile(summaryPath, 'utf8'));

    expect(summary).toHaveProperty('reportedAt');
    expect(summary.source).toBe(merged);

    // Expect three distinct metrics: taskA (twice per run), taskB, taskC
    const byName = summary.metrics.reduce((acc, m) => {
      acc[m.name] = m;
      return acc;
    }, {});
    expect(Object.keys(byName).sort()).toEqual(['taskA', 'taskB', 'taskC']);

    // taskA is profiled in both scenarios per run → 2 runs × 2 recordings = 4 data points
    expect(byName.taskA.durations).toHaveLength(4);
    expect(byName.taskA.stats.count).toBe(4);
    expect(byName.taskA.stats.min).toBeLessThanOrEqual(byName.taskA.stats.avg);
    expect(byName.taskA.stats.avg).toBeLessThanOrEqual(byName.taskA.stats.max);

    // taskB and taskC each appear once per run (each in its scenario), across 2 runs
    ['taskB', 'taskC'].forEach((name) => {
      expect(byName[name].durations).toHaveLength(2);
      expect(byName[name].stats.count).toBe(2);
    });

    // ensure the HTML report embeds our metrics names
    const html = await fs.readFile(path.join(reportDir, 'index.html'), 'utf8');
    ['taskA', 'taskB', 'taskC'].forEach((name) => {
      expect(html).toContain(`"${name}"`);
    });
  }, 20000);
});