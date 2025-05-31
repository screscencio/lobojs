const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const io = require('../src/io');
const evaluate = require('../src/eval');

describe('evaluate', () => {
  let tmpDir;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'lobo-eval-'));
  });


  test('throws if threshold file not found', async () => {
    const input = path.join(tmpDir, 'res.json');
    await io.write(input, { metrics: [{ name: 'a', duration: 10 }] });
    const missing = path.join(tmpDir, 'thresholds.json');
    await expect(evaluate(input, missing)).rejects.toThrow(
      `Threshold file not found: ${missing}`
    );
  });

  test('evaluates metrics against thresholds and returns detailed results', async () => {
    const input = path.join(tmpDir, 'res.json');
    const thrFile = path.join(tmpDir, 'thresholds.json');
    const data = { metrics: [{ name: 'a', duration: 10 }, { name: 'b', duration: 30 }] };
    const thresholds = { a: 15, b: 25 };
    await io.write(input, data);
    await io.write(thrFile, thresholds);

    const { overallPass, results } = await evaluate(input, thrFile);
    expect(overallPass).toBe(false);
    const byName = results.reduce((acc, r) => { acc[r.name] = r; return acc; }, {});
    expect(byName.a).toEqual({ name: 'a', duration: 10, threshold: 15, pass: true });
    expect(byName.b).toEqual({ name: 'b', duration: 30, threshold: 25, pass: false });
  });
});