import { createHash } from 'node:crypto';

// clean up functions
const shortenWhiteSpaces = (s) => (s ?? '').replace(/\s+/g, ' ');
const removeSpaces = (s) => (s ?? '').replaceAll(' ', '');

export function hashTransaction({ bank, csvData }) {
  const accountId = cleanIban(csvData.singleCellInfo.iban);
  const seen = new Map(); // a fingerprint to keep track of how many times an identical transaction occurs

  // for each entry row
  for (const row of csvData.entryRows) {
    // create hash
    const raw = JSON.stringify([
      bank,
      accountId,
      row.date.toISOString().slice(0, 10),
      row.transactionType,
      row.rawSenderRecipient,
      row.rawPurpose,
      row.accountNoIban,
      row.customerRef,
      row.mandateRef,
      row.creditorId,
      row.amount.toFixed(2),
    ]);

    // set the occurrence counter
    const occurrence = (seen.get(base) ?? 0) + 1;
    seen.set(base, occurrence);

    row.hash = createHash('sha256')
      .update(`${raw}#${occurrence}`)
      .digest('hex');
  }
}
