const fs = require('fs');
const path = require('path');

/**
 * Read JSON data from a file.  If the file does not exist, return an empty object.
 * @param {string} filePath
 */
function readData(filePath) {
  try {
    const full = path.resolve(__dirname, '..', filePath);
    if (!fs.existsSync(full)) return {};
    const raw = fs.readFileSync(full, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read data', filePath, e);
    return {};
  }
}

/**
 * Write JSON data to a file.  Creates directories as needed.
 * @param {string} filePath
 * @param {any} data
 */
function writeData(filePath, data) {
  try {
    const full = path.resolve(__dirname, '..', filePath);
    const dir = path.dirname(full);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(full, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to write data', filePath, e);
  }
}

module.exports = { readData, writeData };