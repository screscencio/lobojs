import { defineConfig } from 'vitest/config';

// A small vitest project whose profiles are TypeScript test files.
// The *.perf.ts suffix keeps them out of LoboJS's own Jest suite.
export default defineConfig({
  test: {
    include: ['profiles/**/*.perf.ts'],
  },
});
