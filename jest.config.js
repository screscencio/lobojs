// Enforce CI mode and single worker to prevent interactive watch crashes
// This ensures that `npx jest` runs tests once (no watch) and sequentially.

const path = require('path');

// Redirect system temp directory to project tmp/ for Jest cache to avoid EPERM errors on macOS temp
process.env.TMPDIR = path.join(__dirname, 'tmp');

// Disable HasteMap persistence to avoid permission issues
try {
  const { default: HasteMap } = require('jest-haste-map');
  HasteMap.prototype._persist = function() {};
} catch {}
// Enforce CI mode to prevent interactive watch crashes
process.env.CI = 'true';

module.exports = {
  maxWorkers: 1,
  watchman: false,
  cache: false,
  cacheDirectory: '<rootDir>/tmp/jest-cache',
};