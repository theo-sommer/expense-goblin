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
  switch (csvKey.cellTypes[cell].dataType) {
    case 'string':
      csvData[cellCoordY][cellCoordX] = cellValue.trim();
      break;
    case 'float':
      // if its empty
      if (cellValue === '') {
        csvData[cellCoordY][cellCoordX] = null;
        break;
      }
      csvData[cellCoordY][cellCoordX] = Number(
        cellValue
          .replaceAll(csvKey[bank].thousandsSeparator, '')
          .replace(csvKey[bank].decimalDelimiter, '.'),
      );
      break;

    case 'date':
      const dateArray = cellValue.split(csvKey[bank].dateDelimiter);
      let day, month, year;

      for (let i = 0; i < dateArray.length; i++) {
        if (csvKey[bank].dateFormat[i] == 'd') day = dateArray[i];
        if (csvKey[bank].dateFormat[i] == 'm') month = dateArray[i];
        if (csvKey[bank].dateFormat[i] == 'y') year = dateArray[i];
      }

      csvData[cellCoordY][cellCoordX] = new Date(
        Date.UTC(year, month - 1, day),
      );
      break;

    default:
      break;
  }
}
