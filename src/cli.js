#!/usr/bin/env node
/**
 * LoboJS CLI.
 * Defines commands for running performance tests, merging results, reporting, and evaluation.
 */

const { Command } = require('commander');
const pkg = require('../package.json');
const run = require('./tasks/run');
const merge = require('./merge');
const report = require('./report');
const evaluate = require('./eval');

const program = new Command();

program
  .name('lobo')
  .description('Continuous, adaptive, and intelligent performance testing tool')
  .version(pkg.version);

program
  .command('run')
  .description('Run performance profiles')
  .argument('[files...]', 'Files or directories to scan for profiles')
  .action((files) => {
    run(files);
  });

program
  .command('merge')
  .description('Merge multiple performance result files')
  .argument('<inputs...>', 'List of result files to merge')
  .option('-o, --output <file>', 'Output file', 'merged.json')
  .action((inputs, options) => {
    merge(inputs, options.output);
  });

program
  .command('report')
  .description('Generate reports from result files')
  .argument('<file>', 'Result file to report on')
  .option('-o, --output <dir>', 'Output directory', 'report')
  .action((file, options) => {
    report(file, options.output);
  });

program
  .command('evaluate')
  .alias('eval')
  .description('Evaluate performance against thresholds')
  .argument('<file>', 'Result file to evaluate')
  .action((file) => {
    evaluate(file);
  });

program.parse(process.argv);