# 🐺 LoboJS

**Continuous, adaptive, and intelligent performance testing for developers.**

_Reborn from legacy. Powered by simplicity and insight._

---

## What is LoboJS?

LoboJS is a modern reimagination of the original **Lobo Continuous Tuning** — an open-source performance testing framework that reached over 80 countries nearly two decades ago.

Today, LoboJS is being rebuilt from the ground up, designed for:

- **Developers who want instant, code-level performance feedback**
- **Teams who need historical insights and intelligent thresholds**
- **Pipelines that demand performance as a first-class citizen**

Whether you're building an API, a complex algorithm, or a real-time system, LoboJS helps you stay fast — and stay smart.

---

## Why LoboJS?

✅ Familiar API (inspired by Jest and modern JS testing frameworks)  
✅ CLI integration for CI/CD pipelines  
✅ JSON export for historical tracking  
✅ Smart threshold logic (auto-adjusting performance baselines)  
🚧 Future: AI agents that detect regressions, suggest optimizations, and explain results.

---

## Status

> ⚠️ In early development — core architecture and first modules being defined.  
> Follow along and contribute to shape the future of performance testing.

---

## License

MIT (TBD)

---

## Author

Created and maintained by [@screscencio](https://github.com/screscencio)  
Original member of the team that put Lobo Continuous Tuning together (OnCast, c. 2005)

---

## Architecture

LoboJS is organized into modular packages:

- **src/core**: Core telemetry and profiling primitives.
- **src/tasks**: Profile discovery and execution engine.
- **src/io**: JSON-based persistence of performance data.
- **src/merge**: Logic to merge multiple run results.
- **src/report**: Reporting and visualization (JSON summary + interactive HTML/Vega-Lite line and area charts with dynamic shading per data point, min, max, avg & trend lines, tooltips, and zoom/pan).
- **src/eval**: Threshold evaluation and regression detection.
- **src/cli.js**: Command-line interface entry point.
- **bin/lobo**: Executable CLI script.

## Getting Started

1. Install dependencies (requires Node.js LTS; recommended `nvm use` will auto‑select version):
   ```bash
   npm install
   ```
2. Run performance profiles (scan files or directories; specify output JSON if desired):
   ```bash
   npx lobo run path/to/tests
   ```

# → ./results.json

npx lobo run path/to/tests -o my-results.json

````
3. Merge runs:
```bash
npx lobo merge run1.json run2.json -o merged.json
````

4. Generate report (JSON summary + interactive HTML/Vega-Lite charts with dynamic shading per data point, min, max, avg & trend lines, tooltips, and zoom/pan):
   ```bash
   npx lobo report merged.json -o report
   ```
   → Writes `report/summary.json` and `report/index.html` (open in browser for visualization).

   The HTML chart displays each run’s timestamp on the x‑axis, the duration curve as an area and trend line (orange), with horizontal rules for the minimum (blue), maximum (dark blue) and average (dashed gray) values.

   > *Note*: If a summary JSON metric lacks explicit `timestamps` data (e.g. single-run or manually authored inputs), the report generator will synthesize timestamps at 1-second intervals from the report’s `reportedAt` time, ensuring all data points are shown in the chart.
5. Evaluate thresholds (defaults to `./thresholds.json`, or pass custom file):

   ```bash
   npx lobo evaluate merged.json
   npx lobo evaluate merged.json -t path/to/thresholds.json
   ```

6. One‑step CI/CD integration:

   ```bash
   npx lobo ci -p ./profiles -t thresholds.json
   ```

You can also add an NPM script in your `package.json`:

```json
"scripts": {
  "perf:ci": "lobo ci -p ./profiles -t thresholds.json"
}
```

Then simply run:

```bash
npm run perf:ci
```

Alternatively, you can chain the commands yourself to achieve the same effect:

```bash
npx lobo run ./profiles -o run.json && \
npx lobo merge run.json -o merged.json && \
npx lobo report merged.json -o report && \
npx lobo evaluate merged.json -t thresholds.json
```

### Test-generated artifacts and segmentation fault avoidance

LoboJS test suites now preserve temporary directories after each run by default, making it easy to inspect actual files (e.g. generated HTML reports or JSON summaries). To also enable internal console logging (summary paths and JSON table dumps), set the environment variable `LOBOJS_KEEP_TEST_ARTIFACTS=1`.

⚠️ **Segmentation fault workaround**: Jest’s default interactive watch mode can trigger crashes on some systems. LoboJS enforces CI mode and single-worker execution via `jest.config.js`, so you can safely run:

```bash
npx jest
```
If you still encounter segmentation faults (particularly on macOS with Node ≥20), please use the latest LTS Node (18.x) with `nvm use 18`, as some newer Node versions have known issues with Jest and dynamic imports.

If you prefer explicit flags, you can also run:

```bash
npx jest --runInBand
```

Or combined with artifact logging:

```bash
LOBOJS_KEEP_TEST_ARTIFACTS=1 CI=1 npx jest --runInBand
```
- LoboJS prints the summary and HTML report paths as well as the test directory locations, e.g.:

```text
Summary written to /tmp/lobo-report-XXX/summary.json
HTML report written to /tmp/lobo-report-XXX/index.html
Preserving test directory at /tmp/lobo-report-XXX
```

---

---
