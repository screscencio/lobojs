/**
 * IO module for reading and writing JSON-based performance data.
 */
const fs = require('fs').promises;

module.exports = {
  /**
   * Read JSON data from a file.
   * @param {string} filePath - Path to the JSON file.
   * @returns {Promise<any>} Parsed JSON data.
   */
  async read(filePath) {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  },

  /**
   * Write JSON data to a file.
   * @param {string} filePath - Path to write the JSON file.
   * @param {any} data - Data to stringify and write.
   */
  async write(filePath, data) {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  }
};