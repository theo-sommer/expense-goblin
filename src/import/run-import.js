import { prisma } from '../db.js';
import { Prisma } from '../../generated/prisma/client.ts';
import csvKey from './csv-cell-key.json' with { type: 'json' };
import { parseCSV } from './parse-csv.js';
import { normalizeCSV } from './normalize-csv.js';
import { mapEntryRowsToTransactions } from './map-entry-rows.js';
import { hashTransaction } from './hash-transaction.js';

export async function runImport({ filePath, bank }) {
  // Run import steps
  let importData = parseCSV({
    filePath,
    encoding: csvKey[bank].encoding,
  });
  importData = normalizeCSV({ bank, csvData: importData });
  importData = mapEntryRowsToTransactions({ bank, csvData: importData });
  hashTransaction({ bank, csvData: importData });

  const { entryRows, singleCellInfo } = importData;

  // filter out duplicate transactions
  const existing = await prisma.transaction.findMany({
    where: { hash: { in: entryRows.map((r) => r.hash) } },
    select: { hash: true },
  });
  const existingHashes = new Set(existing.map((r) => r.hash));
  const newRows = entryRows.filter((r) => !existingHashes.has(r.hash));

  // add entries to database
  if (newRows.length > 0) {
    await prisma.transaction.createMany({
      data: newRows.map((e) => ({
        hash: e.hash,
        date: e.date,
        valueDate: e.valueDate,
        transactionType: e.transactionType,
        rawSenderRecipient: e.rawSenderRecipient,
        rawPurpose: e.rawPurpose,
        accountNoIban: e.accountNoIban,
        bic: e.bic,
        customerRef: e.customerRef,
        mandateRef: e.mandateRef,
        creditorId: e.creditorId,
        foreignFees: e.foreignFees,
        bank,
        account: singleCellInfo.iban,
        amount: e.amount,
        currency: e.currency,
      })),
    });
  }

  return {
    total: entryRows.length,
    inserted: newRows.length,
    duplicates: entryRows.length - newRows.length,
  };
}
