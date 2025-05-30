const { spawnSync } = require('child_process');
const path = require('path');

describe('lobo ci command', () => {
  it('exposes ci in help output', () => {
    const bin = path.resolve(__dirname, '../bin/lobo');
    const res = spawnSync('node', [bin, 'ci', '--help'], { encoding: 'utf8' });
    expect(res.status).toBe(0);
    expect(res.stdout).toMatch(/Usage: lobo ci/);
    expect(res.stdout).toMatch(/Run, merge, report and evaluate in one step \(for CI\/CD\)/);
    expect(res.stdout).toMatch(/-p, --paths/);
    expect(res.stdout).toMatch(/-t, --thresholds/);
  });
});