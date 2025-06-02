![LoboJS Logo](./logo_lobo.png)

# Continuous Performance Tuning with LoboJS

## 1. Introduction: Continuous Improvement as a Business Imperative

In today’s fast-paced digital landscape, software performance is a critical differentiator. Slow APIs and inefficient microservices not only frustrate users—they directly impact revenue, customer satisfaction, and brand reputation. This guide tells the story of how Acme Retail, a fictitious e‑commerce company, employs LoboJS to measure, track, and optimize performance over time, setting the stage for future AI-driven insights.

### The Acme Retail Story

Acme Retail’s checkout microservice powers thousands of daily transactions. Even small regressions—an extra 50 ms of latency—can lead to cart abandonment and lost revenue. To prevent surprises in production, Acme’s engineering team adopted a continuous performance tuning workflow:

1. **Profile**: Automatically capture timing data for each build or deployment.
2. **Merge**: Consolidate raw, per-run metrics into a unified history.
3. **Report**: Generate visual trends and summary reports.
4. **Evaluate**: Enforce performance budgets to block regressions.

LoboJS delivers a streamlined, CLI‑driven toolkit for embedding this workflow in local development, CI/CD pipelines, and release processes.

## 2. Basic Concepts

| Term               | Definition                                                                              |
| ------------------ | --------------------------------------------------------------------------------------- |
| **Profile Script** | A JavaScript module (file) containing one or more scenarios to measure via LoboJS APIs. |
| **Scenario**       | A named operation or code path to be profiled (e.g. an HTTP request, CPU-bound task).   |
| **Metric**         | A single measured duration in milliseconds, identified by name.                         |
| **Raw Run File**   | A JSON snapshot (`lobojs-run-<timestamp>.json`) capturing one invocation’s metrics.     |
| **Merged History** | An aggregated JSON (`lobojs-merged.json`) combining multiple runs into a time series.   |

## 3. LoboJS Tuning Workflow

| Stage      | Command                                                              | Description                                                                         |
| :--------- | :------------------------------------------------------------------- | :---------------------------------------------------------------------------------- |
| **Run**    | `lobo run <paths> [-o <dir-or-file>]`                                | Execute profile scripts and emit timestamped JSON files under `profile_runs/`.      |
| **Merge**  | `lobo merge <dir-or-files> -o report/lobojs-merged.json`             | Incrementally consolidate raw run files into a single history JSON.                 |
| **Report** | `lobo report report/lobojs-merged.json -o report`                    | Generate an interactive HTML dashboard and summary JSON under `report/`.            |
| **Eval**   | `lobo evaluate report/lobojs-merged.json -t thresholds.json`         | Compare merged metrics against threshold budgets, exiting non-zero on failures.     |
| **CI**     | `lobo ci -p <profiles> -w profile_runs -r report -t thresholds.json` | Shorthand that runs Run → Merge → Report → Evaluate in one step (Eval always last). |

### 3.1 Run (Profiling)

```bash
# Default: profile scripts in ./profiles → profile_runs/lobojs-run-<timestamp>.json
npx lobo run profiles

# Custom output directory or single file:
npx lobo run services/api -o my_runs
npx lobo run services/api -o run-results.json
```

**What happens?**

- Recursively scans the given paths for `.js` modules.
- Executes each module; if it returns a Promise, LoboJS automatically awaits it.
- Collects metrics via the `profile()` API or direct Telemetry calls.
- Writes raw results:
  - To `<output>.json` if `-o` ends with `.json`.
  - Otherwise, creates the directory and writes `lobojs-run-<ISO-timestamp>.json`.

### 3.2 Merge (History Consolidation)

```bash
# Merge all JSON files under profile_runs/ into a unified history
npx lobo merge profile_runs/ -o report/lobojs-merged.json

# Or explicitly list files:
npx lobo merge profile_runs/run1.json run2.json -o report/lobojs-merged.json
```

**Key features:**

- **Incremental**: If `lobojs-merged.json` exists, only ingest new run files.
- **Idempotent**: Re-running does not duplicate existing metrics.
- **Clear branding**: Prefixed `lobojs-` so files are instantly recognizable.

### 3.3 Report (Visualization)

```bash
# Create charts and a summary JSON under report/
npx lobo report report/lobojs-merged.json -o report
```

**Outputs:**

- `report/summary.json`: high-level stats (min, max, avg) per metric.
- `report/index.html`: interactive dashboard (Vega‑Lite charts) showing metric trends over time.

### 3.4 Evaluate (Threshold Budgets)

Define your performance budgets in `thresholds.json`:

```json
{
  "checkout_latency": 200,
  "db_query_time": 500,
  "cache_lookup": 50
}
```

Run the evaluation:

```bash
npx lobo evaluate report/lobojs-merged.json -t thresholds.json
```

- Exits with code 0 if all metrics are within budget.
- Exits non-zero if any metric exceeds its threshold—ideal for CI gating.

### 3.5 CI/CD Integration

Run the entire pipeline in a single command:

```bash
npx lobo ci -p ./profiles -t thresholds.json

# (Custom directories)
npx lobo ci -p ./profiles -w profile_runs -r report -t thresholds.json
```

**Example Git workflow:**

```bash
# Execute CI pipeline
npx lobo ci -p ./profiles -t thresholds.json

# Commit the merged report for historical tracking
git add report/lobojs-merged.json report/index.html
git commit -m "ci: update performance report"
```

> **Note:** Committing raw run snapshots (`profile_runs/`) is optional—archive them if you need a full audit trail, but watch their growth.

## 4. Writing Profile Scripts

Profile scripts declare the specific operations (scenarios) to measure. Place them under a `profiles/` folder or alongside your code. Each script may:

- Export a synchronous function.
- Export an asynchronous function (returns a Promise).
- Invoke itself immediately (IIFE) for side-effectful scenarios.

### 4.1 Core Profiling API

```js
// src/core/profile.js (internal)
// module.exports = function profile(name, fn) { ... }
```

### 4.2 Basic Example: HTTP Endpoints

```js
// profiles/fetch_apis.js
const profile = require("lobojs/src/core/profile");
const fetch = require("node-fetch");

(async () => {
  await profile("get_products", () =>
    fetch("https://api.acme-retail.com/products").then((r) => r.json())
  );

  await profile("get_checkout", () =>
    fetch("https://api.acme-retail.com/checkout").then((r) => r.json())
  );
})();
```

### 4.3 Advanced Example: Custom Metrics via Telemetry

```js
// profiles/database_metrics.js
const Telemetry = require("lobojs/src/core/telemetry");

module.exports = () => {
  Telemetry.startMetric("db_query");
  // perform your database call here...
  Telemetry.endMetric("db_query");

  Telemetry.startMetric("cache_lookup");
  // perform cache lookup...
  Telemetry.endMetric("cache_lookup");
};
```

## 5. The Acme Retail Microservice Journey

Acme Retail teams use LoboJS to ensure that critical business metrics—such as average checkout latency—never regress. Over a six-month pilot:

- A 30 ms increase in average checkout latency (version 1.3.2) triggered an automatic CI failure, prompting an investigation that uncovered an inefficient Redis call.
- A 50 ms improvement in version 1.4.0 validated database indexing optimizations and improved user satisfaction.
- A sudden spike in version 1.5.0 caused by a third‑party library upgrade was caught early, preventing a major production incident.

Lessons learned:

1. **Automate measurement** on every build.
2. **Track history** to spot subtle performance trends.
3. **Enforce budgets** to prevent regressions from slipping through.

## 6. Directory Layout

```text
.
├── profiles/                  # Profile scripts (scenarios to measure)
├── profile_runs/              # Raw JSON metrics per invocation
├── report/                    # Merged history + reports (summary.json, index.html)
├── thresholds.json            # Performance budget definitions
└── docs/continuous_tuning.md  # This comprehensive guide
```

## 7. Advanced Roadmap

- **Adaptive Thresholds**: ML-driven baselines that adjust budgets based on historical noise.
- **AI-Powered Insights**: Automated root-cause analysis and natural-language performance explanations.
- **Plugin Ecosystem**: Custom collectors (memory, CPU), exporters (InfluxDB, Datadog), notifiers (Slack, Teams).
- **CI/CD Dashboards**: Live performance trends embedded into pipeline dashboards or chatops.

## 8. References & Acknowledgements

- Original Lobo Continuous Tuning (Java) by Samuel Crescêncio & OnCast (2005): https://sourceforge.net/p/lobo-ct/code/HEAD/tree/oncast-lobo-1.0.alpha.zip
- LoboJS GitHub Repository: https://github.com/screscencio/lobojs
- Demo Project: https://github.com/screscencio/lobojs-demo
- **Have questions or feedback? Drop me a line:** [screscencio@leanit101.com](mailto:screscencio@leanit101.com)

_End of guide._
