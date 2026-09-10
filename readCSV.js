const fs = require('fs');
const path = require('path');

async function readCSV(inputFilePath, options) {
  const data = await fs.promises.readFile(path.resolve(inputFilePath), 'utf8');

  return data
    .split(/\n/)
    .slice(8, -2)
    .map((elem) => (elem = elem.split(';')));

  return data;
}

module.exports = readCSV;
