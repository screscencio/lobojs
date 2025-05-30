const Telemetry = require('../src/core/telemetry');

describe('Telemetry', () => {
  beforeEach(() => {
    Telemetry.clear();
  });

  test('startMetric and endMetric record a duration', async () => {
    Telemetry.startMetric('test');
    await Telemetry.endMetric('test');
    const metrics = Telemetry.getMetrics();
    expect(metrics).toHaveLength(1);
    expect(metrics[0].name).toBe('test');
    expect(metrics[0].duration).toBeGreaterThanOrEqual(0);
  });

  test('endMetric without startMetric throws an error', async () => {
    await expect(Telemetry.endMetric('missing')).rejects.toThrow(
      "No start time for metric 'missing'"
    );
  });
});