const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const io = require('../src/io');
const report = require('../src/report');

describe('report', () => {
  let tmpDir;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'lobo-report-'));
  });


  test('writes summary.json with mapped metrics for single-run input', async () => {
    const inputFile = path.join(tmpDir, 'input.json');
    const data = {
      timestamp: '2020-01-01T00:00:00Z',
      metrics: [
        { name: 'x', duration: 123 }
      ]
    };
    await io.write(inputFile, data);
    await report(inputFile, tmpDir);
    const summary = await io.read(path.join(tmpDir, 'summary.json'));
    expect(summary).toHaveProperty('reportedAt');
    expect(summary.source).toBe(inputFile);
    expect(summary.metrics).toEqual([
      {
        name: 'x',
        duration: 123,
        stats: null,
        durations: [123],
        timestamps: ['2020-01-01T00:00:00Z'],
      }
    ]);
  });

  test('also generates interactive HTML report with D3.js and branding', async () => {
    const inputFile = path.join(tmpDir, 'input.json');
    const data = {
      timestamp: '2020-01-01T00:00:00Z',
      metrics: [{ name: 'x', duration: 123 }]
    };
    await io.write(inputFile, data);
    await report(inputFile, tmpDir);
    const htmlPath = path.join(tmpDir, 'index.html');
    const html = await fs.readFile(htmlPath, 'utf8');
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('vega-embed');
    expect(html).toContain('vega-lite');
    expect(html).toMatch(/<h1>Performance Report<\/h1>/);
    expect(html).toMatch(/"name":"x"/);
    expect(html).toContain('"timestamps":["2020-01-01T00:00:00Z"]');
    expect(html).toMatch(/aggregate:\s*'min'/);
    expect(html).toMatch(/aggregate:\s*'max'/);
    expect(html).toMatch(/aggregate:\s*'mean'/);
  });
});