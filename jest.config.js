// Enforce CI mode and single worker to prevent interactive watch crashes
// This ensures that `npx jest` runs tests once (no watch) and sequentially.
process.env.CI = 'true';

module.exports = {
  maxWorkers: 1,
};