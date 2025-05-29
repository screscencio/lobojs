const profile = require('../src/core/profile');

describe('profile', () => {
  test('should execute function and return its result', async () => {
    const result = await profile('example', () => 42);
    expect(result).toBe(42);
    // TODO: assert metric recorded properly
  });
});