const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const merge = require('../src/merge');
const io = require('../src/io');

describe('merge', () => {
  let tmpDir;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'lobo-merge-'));
  });


  test('merges multiple result files into aggregated stats', async () => {
    const file1 = path.join(tmpDir, 'res1.json');
    const file2 = path.join(tmpDir, 'res2.json');
    const output = path.join(tmpDir, 'merged.json');

    const data1 = {
      timestamp: '2020-01-01T00:00:00Z',
      metrics: [
        { name: 'a', duration: 10 },
        { name: 'b', duration: 20 }
      ]
    };
    const data2 = {
      timestamp: '2020-01-02T00:00:00Z',
      metrics: [
        { name: 'a', duration: 30 },
        { name: 'c', duration: 50 }
      ]
    };

    await io.write(file1, data1);
    await io.write(file2, data2);

    await merge([file1, file2], output);

    const merged = await io.read(output);
    expect(merged).toHaveProperty('mergedAt');
    expect(merged.inputs).toEqual([file1, file2]);

    const byName = merged.metrics.reduce((map, m) => {
      map[m.name] = m;
      return map;
    }, {});

    expect(byName.a.durations).toEqual([10, 30]);
    expect(byName.a.stats).toEqual({ count: 2, min: 10, max: 30, avg: 20 });
    expect(byName.b.durations).toEqual([20]);
    expect(byName.b.stats).toEqual({ count: 1, min: 20, max: 20, avg: 20 });
    expect(byName.c.durations).toEqual([50]);
    expect(byName.c.stats).toEqual({ count: 1, min: 50, max: 50, avg: 50 });
  });
});