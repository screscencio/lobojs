/**
 * Merge multiple performance result files into a single dataset.
 */
const io = require('../io');

module.exports = async function merge(inputs, output) {
  console.log('Merging files:', inputs, '->', output);
  // TODO: load with io.read, merge data, and write with io.write
};