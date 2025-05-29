# 🐺 LoboJS

**Continuous, adaptive, and intelligent performance testing for developers.**

_Reborn from legacy. Powered by simplicity and insight._

---

## What is LoboJS?

LoboJS is a modern reimagination of the original **Lobo Continuous Tuning** — an open-source performance testing framework that reached over 40 countries nearly two decades ago.

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
Original author of Lobo Continuous Tuning (OnCast, c. 2005)

---

## Architecture

LoboJS is organized into modular packages:

- **src/core**: Core telemetry and profiling primitives.
- **src/tasks**: Profile discovery and execution engine.
- **src/io**: JSON-based persistence of performance data.
- **src/merge**: Logic to merge multiple run results.
- **src/report**: Reporting and visualization generators.
- **src/eval**: Threshold evaluation and regression detection.
- **src/cli.js**: Command-line interface entry point.
- **bin/lobo**: Executable CLI script.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Run performance profiles:
   ```bash
   npx lobo run path/to/tests
   ```
3. Merge runs:
   ```bash
   npx lobo merge run1.json run2.json -o merged.json
   ```
4. Generate report:
   ```bash
   npx lobo report merged.json -o report
   ```
5. Evaluate thresholds:
   ```bash
   npx lobo evaluate merged.json
   ```

---

---
