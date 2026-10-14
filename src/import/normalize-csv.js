import csvKey from './csv-cell-key.json' with { type: 'json' };

export function normalizeCSV({ bank, csvData }) {
  const coords = csvKey[bank].coordinates;

  const numberOfRows = csvData.length; // number of rows in the csv as a whole
  let numberOfCols = csvData[0].length;
  for (let i = 1; i < numberOfRows; i++) {
    numberOfCols =
      csvData[i].length > csvData[i - 1].length
        ? csvData[i].length
        : csvData[i - 1].length;
  }

  // normalize from string to correct data type
  Object.keys(csvKey.cellTypes).forEach((cell) => {
    let cellCoordY = (numberOfRows + coords[cell][0]) % numberOfRows;
    // find the longest row for row length / number of columns
    let cellCoordX = (numberOfCols + coords[cell][1]) % numberOfCols;

    let cellValue = csvData[cellCoordY][cellCoordX];

    // convert for all entry rows
    const numberOfEntryRows =
      ((numberOfRows + csvKey[bank].entryRows.end) % numberOfRows) -
      ((numberOfRows + csvKey[bank].entryRows.start) % numberOfRows) +
      1;
    if (csvKey.cellTypes[cell].isInEntryRow) {
      for (let i = 0; i < numberOfEntryRows; i++) {
        cellValue = csvData[cellCoordY][cellCoordX];
        handleCSVTypeConversion({
          bank,
          csvData,
          cell,
          cellCoordX,
          cellCoordY,
          cellValue,
        });
        cellCoordY += 1;
      }
    } else {
      handleCSVTypeConversion({
        bank,
        csvData,
        cell,
        cellCoordX,
        cellCoordY,
        cellValue,
      });
    }
  });

  return csvData;
}

function handleCSVTypeConversion({
  bank,
  csvData,
  cell,
  cellCoordX,
  cellCoordY,
  cellValue,
}) {
  // destructure some of the variables in the csv key
  const { dataType, optional } = csvKey.cellTypes[cell];
  const { thousandsSeparator, decimalDelimiter, dateDelimiter, dateFormat } =
    csvKey[bank];

  // useful for the errors
  const where = `CSV row ${cellCoordY + 1}, column ${cellCoordX + 1} (${cell})`;

  const raw = (cellValue ?? '').trim();
  let result;

  // handle empty cells
  if (raw === '') {
    if (dataType !== 'string' && !optional)
      throw new Error(`Missing value at ${where}`); // cell shouldn't be empty
    result = optional ? null : '';
  } else {
    // handle not empty cells
    switch (dataType) {
      case 'float':
        result = Number(
          cellValue
            .replaceAll(thousandsSeparator, '')
            .replace(decimalDelimiter, '.'),
        );
        if (!Number.isFinite(result))
          throw new Error(`Invalid number "${raw}" at ${where}`);
        break;

      case 'date':
        const dateArray = cellValue.split(dateDelimiter);
        let day, month, year;

        for (let i = 0; i < dateArray.length; i++) {
          if (dateFormat[i] == 'd') day = dateArray[i];
          if (dateFormat[i] == 'm') month = dateArray[i];
          if (dateFormat[i] == 'y') year = dateArray[i];
        }

        result = new Date(Date.UTC(year, month - 1, day));

        // check if the day is correct- sometimes there is a day rollover bcs of timezones
        if (
          Number.isNaN(result.getTime()) ||
          result.getUTCDate() !== Number(day)
        ) {
          throw new Error(`Invalid date "${raw}" at ${where}`);
        }
        break;

      default:
        result = raw;
    }
  }

  csvData[cellCoordY][cellCoordX] = result;
}
