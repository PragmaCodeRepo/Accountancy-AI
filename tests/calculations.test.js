import test from 'node:test';
import assert from 'node:assert/strict';
import { createSeedState } from '../src/data/seed.js';
import { getGstControlDifference, getOpenFindings, getScheduleBalance, getScheduleCompletion, getTrialBalanceTotals, toCsv, validateTrialBalance } from '../src/utils/calculations.js';

test('trial balance totals are derived from source account records', () => {
  const accounts = [{ debit: 10, credit: 2 }, { debit: 4, credit: 9 }];
  assert.deepEqual(getTrialBalanceTotals(accounts), { debit: 14, credit: 11, difference: 3, balanced: false });
});

test('schedule closing balance uses linked net movements and opening balance', () => {
  const schedule = { accountIds: ['a', 'b'], openingBalance: 100 };
  const accounts = [{ id: 'a', debit: 50, credit: 10 }, { id: 'b', debit: 0, credit: 25 }, { id: 'c', debit: 999, credit: 0 }];
  assert.deepEqual(getScheduleBalance(schedule, accounts), {
    rows: accounts.slice(0, 2), opening: 100, movements: 15, closing: 115,
  });
});

test('seed data exposes unbalanced source data and open review prompts', () => {
  const state = createSeedState();
  assert.equal(getTrialBalanceTotals(state.accounts).balanced, false);
  assert.equal(getScheduleCompletion(state.schedules).total, 8);
  assert.equal(state.engagements.filter((engagement) => engagement.status === 'In progress').length, 1);
  assert.ok(getOpenFindings(state.reviewFindings).length > 0);
});

test('CSV output escapes quotes and preserves headers', () => {
  assert.equal(toCsv([{ name: 'A "quoted" client', value: 12 }], [{ key: 'name', label: 'Client' }, { key: 'value', label: 'Value' }]), '"Client","Value"\r\n"A ""quoted"" client","12"');
});

test('trial balance validation identifies missing names, invalid amounts, unmapped rows and imbalance', () => {
  const issues = validateTrialBalance([
    { id: 'one', code: '100', name: '', debit: -1, credit: 0, scheduleId: '' },
    { id: 'two', code: '200', name: 'Receivables', debit: 'bad', credit: 0, scheduleId: 'receivables' },
  ]);
  assert.deepEqual(issues.map((issue) => issue.type), [
    'Missing account name', 'Invalid debit / credit amount', 'Unmapped account',
    'Invalid debit / credit amount', 'Trial balance is unbalanced',
  ]);
});

test('GST-control difference is traceable to ledger and register amounts', () => {
  const difference = getGstControlDifference(
    [{ id: 'acct-2100', debit: 0, credit: 4800 }],
    [{ gstAmount: 125 }, { gstAmount: 25 }],
  );
  assert.deepEqual(difference, { ledgerBalance: -4800, registerTotal: 150, difference: -4950, accountId: 'acct-2100' });
});
