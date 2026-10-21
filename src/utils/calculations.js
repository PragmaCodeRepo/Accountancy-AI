export const money = (value, currency = 'AUD') => new Intl.NumberFormat('en', {
  style: 'currency', currency, maximumFractionDigits: 0,
}).format(Number(value) || 0);

export function getTrialBalanceTotals(accounts) {
  const debit = accounts.reduce((sum, account) => sum + Number(account.debit || 0), 0);
  const credit = accounts.reduce((sum, account) => sum + Number(account.credit || 0), 0);
  return { debit, credit, difference: debit - credit, balanced: Math.abs(debit - credit) < 0.005 };
}

export function getScheduleBalance(schedule, accounts) {
  const rows = accounts.filter((account) => schedule.accountIds.includes(account.id));
  const movements = rows.reduce((sum, account) => sum + Number(account.debit || 0) - Number(account.credit || 0), 0);
  const opening = Number(schedule.openingBalance || 0);
  return { rows, opening, movements, closing: opening + movements };
}

export function getScheduleCompletion(schedules) {
  const completed = schedules.filter((schedule) => ['Prepared', 'Reviewed'].includes(schedule.status)).length;
  return { completed, total: schedules.length, percent: schedules.length ? Math.round(completed / schedules.length * 100) : 0 };
}

export function getOpenFindings(findings) {
  return findings.filter((finding) => !['Complete', 'Not applicable'].includes(finding.status));
}

export function getTransactionGSTTotal(transactions) {
  return transactions.reduce((sum, transaction) => sum + Number(transaction.gstAmount || 0), 0);
}

export function getGstControlDifference(accounts, transactions) {
  const controlAccount = accounts.find((account) => account.id === 'acct-2100');
  if (!controlAccount) return null;
  const ledgerBalance = Number(controlAccount.debit || 0) - Number(controlAccount.credit || 0);
  const registerTotal = getTransactionGSTTotal(transactions);
  return { ledgerBalance, registerTotal, difference: ledgerBalance - registerTotal, accountId: controlAccount.id };
}

export function validateTrialBalance(accounts) {
  const issues = accounts.flatMap((account) => {
    const rows = [];
    if (!String(account.name || '').trim()) rows.push({ type: 'Missing account name', source: account.code || account.id, accountId: account.id });
    const invalidAmount = ['debit', 'credit'].some((key) => account[key] === '' || account[key] == null || !Number.isFinite(Number(account[key])) || Number(account[key]) < 0);
    if (invalidAmount) rows.push({ type: 'Invalid debit / credit amount', source: account.code || account.id, accountId: account.id });
    if (!account.scheduleId) rows.push({ type: 'Unmapped account', source: account.code || account.id, accountId: account.id });
    return rows;
  });
  const totals = getTrialBalanceTotals(accounts);
  if (!totals.balanced) issues.push({ type: 'Trial balance is unbalanced', source: 'Trial balance totals', difference: totals.difference });
  return issues;
}

export function toCsv(rows, columns) {
  const escape = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
  return [columns.map((column) => escape(column.label)).join(','), ...rows.map((row) => columns.map((column) => escape(row[column.key])).join(','))].join('\r\n');
}

export function downloadCsv(filename, rows, columns) {
  const blob = new Blob([toCsv(rows, columns)], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
