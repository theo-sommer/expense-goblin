import fs from 'node:fs';
import { parse } from 'csv-parse/sync';

export function parseCSV({ filePath, encoding }) {
  const csvData = fs.readFileSync(filePath, encoding);

  const records = parse(csvData, {
    delimiter: ';',
    relax_column_count: true,
  });

  return records;
}
