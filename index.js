const readCSV = require('./readCSV');

readCSV(
  '/Users/theo/Desktop/Kontoumsaetze_414_1290790_00_20260909_154544.csv',
  {},
).then((rows) => {
  console.log(rows[0][0]);
});
