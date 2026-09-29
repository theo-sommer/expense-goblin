import csvKey from './csv-cell-key.json' with { type: 'json' };

export function mapEntryRowsToTransactions({ bank, csvData }) {
  let formattedData = { entryRows: [], singleCellInfo: [] };

  const numberOfRows = csvData.length; // number of rows in the csv as a whole
  let numberOfCols = csvData[0].length;
  for (let i = 1; i < numberOfRows; i++) {
    numberOfCols =
      csvData[i].length > csvData[i - 1].length
        ? csvData[i].length
        : csvData[i - 1].length;
  }
  const numberOfEntryRows =
    ((numberOfRows + csvKey[bank].entryRows.end) % numberOfRows) -
    ((numberOfRows + csvKey[bank].entryRows.start) % numberOfRows) +
    1;

  // handle not entry row cells
  Object.keys(csvKey.cellTypes).forEach((cell) => {
    // filter out entry row cells
    if (!csvKey.cellTypes[cell].isInEntryRow) {
      // add to the formatted data object
      formattedData.singleCellInfo[cell] = csvData
        .at(csvKey[bank].coordinates[cell][0])
        .at(csvKey[bank].coordinates[cell][1]);
    }
  });

  // handle entry row cells
  for (let i = 0; i < numberOfEntryRows; i++) {
    let transactionObject = {};

    // for each cell in a transaction
    Object.keys(csvKey.cellTypes).forEach((cell) => {
      // filter out not entry row cells
      if (csvKey.cellTypes[cell].isInEntryRow) {
        // add to the transaction object
        transactionObject[cell] = csvData
          .at(csvKey[bank].coordinates[cell][0] + i)
          .at(csvKey[bank].coordinates[cell][1]);
      }
    });

    // push the transaction object to the entry row array
    formattedData.entryRows.push(transactionObject);
  }

  return formattedData;
}
