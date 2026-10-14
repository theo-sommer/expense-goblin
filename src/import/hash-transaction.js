import { createHash } from 'node:crypto';

// clean up functions
const clean = (s) => (s ?? '').replace(/\s+/g, ' ');
const cleanIban = (s) => clean(s).replaceAll(' ', '');

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
      clean(row.transactionType),
      clean(row.rawSenderRecipient),
      clean(row.rawPurpose),
      cleanIban(row.accountNoIban),
      clean(row.customerRef),
      clean(row.mandateRef),
      clean(row.creditorId),
      row.amount.toFixed(2),
    ]);

    // set the occurrence counter
    const occurrence = (seen.get(raw) ?? 0) + 1;
    seen.set(raw, occurrence);

    row.hash = createHash('sha256')
      .update(`${raw}#${occurrence}`)
      .digest('hex');
  }
}
