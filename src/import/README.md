# Step 1: Import

This step handles the import of generic CSV bank exports to structured data in out db

## Directory Structure

```
|- import/
|  |- csv-cell-key.json
|  |- parse-csv.js
|  |- normalize-csv.js
|  |- map-entry-rows.js
|  |- hash-transaction.js
|  |- run-import.js
```

## Files

How the files work / are structured

### File: `csv-cell-key.json`

This has information on:

- How to treat the contents of different cells (data type, optional)
- Where the info is in the csv depending on the bank export format
- Other bank specific info to properly read the csv

### File: `map-entry-rows.js`

This maps the messy parsed data into a structured object that's easy to work with. The object looks like this:

```ts
interface formattedData = {
  interface FormattedData {
  singleCellInfo: {
    accountName: string;
    accountNumber: string;
    iban: string;
    csvExportDates?: string;
    balanceDate?: Date | string;
    balanceValue?: number;
  };
  entryRows: Array<{
    date: Date | string;
    valueDate: Date | string;
    transactionType: string;
    rawSenderRecipient: string;
    rawPurpose: string;
    accountNoIban: string;
    bic?: string;
    customerRef?: string;
    mandateRef?: string;
    creditorId?: string;
    foreignFees?: number;
    amount: number;
    currency: string;
    hash: string;
  }>;
}
```
