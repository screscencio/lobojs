const Telemetry = require('../src/core/telemetry');

describe('Telemetry', () => {
  test('startMetric and endMetric stub', async () => {
    Telemetry.startMetric('test');
    await Telemetry.endMetric('test');
    // TODO: implement assertions for recorded metrics
  });
});