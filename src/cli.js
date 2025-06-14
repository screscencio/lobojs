#!/usr/bin/env node
/**
 * LoboJS CLI.
 * Defines commands for running performance tests, merging results, reporting, and evaluation.
 */

const { Command } = require("commander");
const pkg = require("../package.json");
const run = require("./tasks/run");
const merge = require("./merge");
const report = require("./report");
const evaluate = require("./eval");

const program = new Command();

program
  .name("lobo")
  .description("Continuous, adaptive, and intelligent performance testing tool")
  .version(pkg.version);

program;
program
  .command("run")
  .description("Run performance profiles")
  .argument("[files...]", "Files or directories to scan for profiles")
  .option("-o, --output <dest>", "Output directory or file for profile run(s)", "profile_runs")
  .action(async (files, options) => {
    try {
      await run(files, options.output);
      process.exit(0);
    } catch (err) {
      console.error(err.message || err);
      process.exit(1);
    }
  });

program
  .command("merge")
  .description("Merge multiple performance result files into a unified history (incremental if re-run)")
  .argument("<inputs...>", "List of result files or a directory to merge")
  .option("-o, --output <file>", "Output merged JSON file", "report/lobojs-merged.json")
  .action(async (inputs, options) => {
    try {
      await merge(inputs, options.output);
      process.exit(0);
    } catch (err) {
      console.error(err.message || err);
      process.exit(1);
    }
  });

program
  .command("report")
  .description("Generate reports from result files")
  .argument("<file>", "Result file to report on")
  .option("-o, --output <dir>", "Output directory", "report")
  .action(async (file, options) => {
    try {
      await report(file, options.output);
      process.exit(0);
    } catch (err) {
      console.error(err.message || err);
      process.exit(1);
    }
  });

program
  .command("evaluate")
  .alias("eval")
  .description("Evaluate performance against thresholds")
  .argument("<file>", "Result file to evaluate")
  .option("-t, --thresholds <file>", "Thresholds JSON file")
  .action(async (file, options) => {
    try {
      const { overallPass, results } = await evaluate(file, options.thresholds);
      if (overallPass) {
        console.log("All metrics are within thresholds.");
      } else {
        console.error("Some metrics exceeded thresholds.");
      }
      process.exit(overallPass ? 0 : 1);
    } catch (err) {
      console.error(err.message || err);
      process.exit(1);
    }
  });

program
  .command("ci")
  .description("Run, merge, report and evaluate in one step (for CI/CD)")
  .option("-p, --paths <paths...>", "paths to scan for profiles", ["."])
  .option("-w, --runs-dir <dir>", "Directory for raw profile run JSON files", "profile_runs")
  .option("-r, --report-dir <dir>", "Directory for merged results and final reports", "report")
  .option("-t, --thresholds <file>", "Thresholds JSON file", "thresholds.json")
  .action(async (opts) => {
    const path = require("path");
    try {
      await run(opts.paths, opts.runsDir);
      const mergedOut = path.join(opts.reportDir, "lobojs-merged.json");
      await merge([opts.runsDir], mergedOut);
      await report(mergedOut, opts.reportDir);
      const { overallPass } = await evaluate(mergedOut, opts.thresholds);
      process.exit(overallPass ? 0 : 1);
    } catch (err) {
      console.error(err.message || err);
      process.exit(1);
    }
  });

program.parse(process.argv);
