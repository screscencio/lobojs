![LoboJS Logo](./docs/logo_lobo.png)

# LoboJS

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

This project is licensed under the MIT License — see the [LICENSE](./LICENSE) file for details.

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
2. Run performance profiles (scan files or directories; writes timestamped JSON files prefixed with `lobojs-run-` into `profile_runs/` by default, or specify a custom directory):

```bash
# Default: create profile_runs/lobojs-run-<ISO-timestamp>.json
npx lobo run path/to/tests

# Custom output directory:
npx lobo run path/to/tests -o my_run_folder
```

3. Merge runs (incremental merge; processes only new files).

```bash
# Merge all runs under profile_runs/ into report/lobojs-merged.json
npx lobo merge profile_runs/ -o report/lobojs-merged.json

# Or merge specific files:
npx lobo merge run1.json run2.json -o report/lobojs-merged.json
```

4. Generate report (reads merged JSON and outputs HTML + summary under `report/`):

```bash
npx lobo report report/lobojs-merged.json -o report
```

5. Evaluate thresholds (defaults to `./thresholds.json`, or pass custom file):

```bash
npx lobo evaluate report/lobojs-merged.json
npx lobo evaluate report/lobojs-merged.json -t thresholds.json
```

6. One-step CI/CD integration (runs profile discovery, merge, report, and evaluation with thresholds; `eval` is executed last).

```bash
# Using defaults (profile_runs & report directories):
npx lobo ci -p ./profiles -t thresholds.json

# Or specify custom directories:
npx lobo ci -p ./profiles -w profile_runs -r report -t thresholds.json
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

LoboJS prints the summary and HTML report paths as well as the test directory locations, e.g.:

```text
Summary written to /tmp/lobo-report-XXX/summary.json
HTML report written to /tmp/lobo-report-XXX/index.html
Preserving test directory at /tmp/lobo-report-XXX
```

---

## Key Concepts

- **Profiles**: Wrap performance-critical code with `profile(name, fn)` blocks.
- **Telemetry**: Capture and store named duration metrics.
- **Merge**: Aggregate runs and compute statistical summaries (min, max, avg).
- **Report**: Generate interactive HTML/Vega‑Lite reports with line/area charts.
- **Thresholds**: Define expected maximum durations to flag regressions.
- **Evaluate**: Compare metrics against thresholds; exit non-zero on failures.
- **CI Integration**: Orchestrate run, merge, report, and evaluation in one step via `lobo ci`.

---

## Project Structure

```
lobojs/
├── bin/lobo                 CLI executable
├── src/                     Source code
│   ├── cli.js               CLI definitions
│   ├── core/                Telemetry & Profile primitives
│   ├── tasks/               `lobo run` implementation
│   ├── io/                  JSON read/write
│   ├── merge/               `lobo merge` implementation
│   ├── report/              `lobo report` & Vega‑Lite template
│   └── eval/                `lobo evaluate` implementation
└── tests/                   Test suites (unit, integration, stress)
```

---

## Core API

### `profile(name, fn)`

Wrap an async or sync function and record its duration:

```js
const result = await profile('fetchData', async () => fetch(...));
```

### `Telemetry`

- `Telemetry.startMetric(name)`
- `Telemetry.endMetric(name)` (throws if no matching start)
- `Telemetry.getMetrics()`, `Telemetry.clear()`

---

## Workflow Examples

### Basic sequence

```bash
npx lobo run ./profiles           -o run.json
npx lobo merge run.json           -o merged.json
npx lobo report merged.json       -o report/
npx lobo evaluate merged.json -t thresholds.json
```

### One-line CI

```bash
npx lobo ci -p ./profiles -t thresholds.json
# or via npm script:
npm run perf:ci
```

---

## Output Format

### `run.json` (raw results)

```json
{
  "timestamp": "2025-05-30T20:40:00.000Z",
  "metrics": [{ "name": "login", "duration": 32.5 }]
}
```

### `merged.json` (aggregated results)

```json
{
  "mergedAt": "2025-05-30T20:41:00.000Z",
  "inputs": ["run1.json", "run2.json"],
  "metrics": [
    {
      "name": "login",
      "durations": [30.2, 35.7],
      "timestamps": ["2025-05-30T20:40:00.000Z", "2025-05-30T20:40:01.000Z"],
      "stats": { "count": 2, "min": 30.2, "max": 35.7, "avg": 32.95 }
    }
  ]
}
```

### `summary.json` & `index.html`

Generates a summary JSON and an interactive Vega‑Lite HTML report with:

- X-axis: run timestamps
- Y-axis: durations
- Area under curve, trend line, and min/max/avg rules
- Zoom, pan, and tooltips

---

## Thresholds

Create a `thresholds.json` mapping metric names to numeric limits:

```json
{
  "login": 50,
  "search": 100
}
```

Evaluate against thresholds:

```bash
npx lobo evaluate merged.json -t thresholds.json
```

Exits non-zero if any metric exceeds its threshold.

---

## Roadmap

- ✅ Core profiling, merging, reporting, and evaluation
- 🔜 Adaptive baseline thresholds (historical trend analysis)
- 🔜 Plugin system & AI-agent integration
- 🔜 CI/CD dashboards and notifications

---

## Contributing

LoboJS is open source under the MIT license. Contributions are welcome:

- Fork the repo & submit pull requests
- File issues for bugs and feature requests
- Propose extensions, integrations, or plugin ideas

---

## Legacy & Acknowledgements

LoboJS is the successor to the original **Lobo Continuous Tuning** (OnCast, 2005) built in Java by Samuel Crescêncio and team. This JS rewrite honors its spirit while embracing modern development workflows.

## Demo Project

A live demo project showcasing LoboJS in action (profiling public APIs, generating reports, CI integration) is available at:

https://github.com/screscencio/lobojs-demo

## Extended Documentation

For a comprehensive guide on Continuous Performance Tuning with LoboJS (workflow, examples, and roadmap), see [docs/continuous_tuning.md](docs/continuous_tuning.md).

---
