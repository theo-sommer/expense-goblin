import { createHash } from 'node:crypto';

export function hashTransaction({ csvData }) {
  // for each entry row
  csvData.entryRows.forEach((row) => {
    // create hash
    const raw = [
      row.date.toISOString().slice(0, 10),
      row.transactionType,
      row.rawSenderRecipient,
      row.rawPurpose,
      row.accountNoIban,
      row.customerRef,
      row.mandateRef,
      row.creditorId,
      row.amount.toFixed(2),
    ].join('|');

    row.hash = createHash('sha256').update(raw).digest('hex');
  });
}
