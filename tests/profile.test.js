const profile = require('../src/core/profile');
const Telemetry = require('../src/core/telemetry');

describe('profile', () => {
  beforeEach(() => {
    Telemetry.clear();
  });

  test('executes function, returns its result and records metric', async () => {
    const result = await profile('example', () => 123);
    expect(result).toBe(123);
    const metrics = Telemetry.getMetrics();
    expect(metrics).toHaveLength(1);
    expect(metrics[0].name).toBe('example');
    expect(metrics[0].duration).toBeGreaterThanOrEqual(0);
  });
});