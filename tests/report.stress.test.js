const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const io = require('../src/io');
const report = require('../src/report');

describe('report stress with synthetic large dataset', () => {
  let tmpDir;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'lobo-report-stress-'));
  });


  test('handles large number of runs and multiple metrics', async () => {
    const runCount = 30;
    const durations1 = Array.from({ length: runCount }, (_, j) => 10 + (40 * (j / (runCount - 1))));
    const durations2 = Array.from({ length: runCount }, (_, j) => 100 + (100 * (j / (runCount - 1))));
    const stats1 = {
      count: runCount,
      min: Math.min(...durations1),
      max: Math.max(...durations1),
      avg: durations1.reduce((a, b) => a + b, 0) / runCount,
    };
    const stats2 = {
      count: runCount,
      min: Math.min(...durations2),
      max: Math.max(...durations2),
      avg: durations2.reduce((a, b) => a + b, 0) / runCount,
    };
    // Generate realistic per-run timestamps for each metric
    const base = Date.now();
    const timestamps1 = durations1.map((_, i) => new Date(base + i * 1000).toISOString());
    const timestamps2 = durations2.map((_, i) => new Date(base + i * 1000).toISOString());
    const metrics = [
      { name: 'benchmark1', duration: null, stats: stats1, durations: durations1, timestamps: timestamps1 },
      { name: 'benchmark2', duration: null, stats: stats2, durations: durations2, timestamps: timestamps2 },
    ];
    const input = { timestamp: new Date().toISOString(), metrics };
    const inputFile = path.join(tmpDir, 'merged.json');
    await io.write(inputFile, input);
    await report(inputFile, tmpDir);

    // Verify summary.json has correct durations and timestamps arrays
    const summary = await io.read(path.join(tmpDir, 'summary.json'));
    expect(summary.metrics).toHaveLength(2);
    expect(summary.metrics[0].durations).toEqual(durations1);
    expect(summary.metrics[0].timestamps).toEqual(timestamps1);
    expect(summary.metrics[1].durations).toEqual(durations2);
    expect(summary.metrics[1].timestamps).toEqual(timestamps2);

    const html = await fs.readFile(path.join(tmpDir, 'index.html'), 'utf8');
    // Summary JSON injection and Vega-Lite chart spec should be present
    expect(html).toContain('"benchmark1"');
    expect(html).toContain('"benchmark2"');
    expect(html).toContain('"durations":[');
    expect(html).toContain('"timestamps":[');
    expect(html).toMatch(/\$schema.*vega-lite/);
    expect(html).toContain('vega-embed');
    expect(html).toMatch(/aggregate:\s*'min'/);
    expect(html).toMatch(/aggregate:\s*'max'/);
    expect(html).toMatch(/aggregate:\s*'mean'/);
  }, 10000);
});