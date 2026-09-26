import fs from 'node:fs';
import { parse } from 'csv-parse/sync';

function main() {
  if (!process.argv[2]) {
    console.error('Add the file path');
    return;
  }
  const csvData = fs.readFileSync(process.argv[2], 'utf8');

  const records = parse(csvData, {
    delimiter: ';',
    relax_column_count: true,
  });

  console.log(records[0]);
}
main();
