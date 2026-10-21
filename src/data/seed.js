const now = '2026-10-21T09:00:00.000Z';

const accounts = [
  ['1000', 'Operating bank', 'Asset', 'cash-bank'], ['1010', 'Savings account', 'Asset', 'cash-bank'],
  ['1100', 'Trade receivables', 'Asset', 'receivables'], ['1110', 'Allowance for doubtful debts', 'Asset', 'receivables'],
  ['1200', 'Inventory on hand', 'Asset', 'receivables'], ['1500', 'Computer equipment', 'Asset', 'fixed-assets'],
  ['1510', 'Accumulated depreciation', 'Asset', 'fixed-assets'], ['2000', 'Trade payables', 'Liability', 'payables'],
  ['2100', 'GST control', 'Liability', 'gst-control'], ['2200', 'Accrued expenses', 'Liability', 'loans-accruals'],
  ['2300', 'Business loan', 'Liability', 'loans-accruals'], ['3000', 'Owner equity', 'Equity', 'equity-other'],
  ['3100', 'Retained earnings', 'Equity', 'equity-other'], ['4000', 'Product revenue', 'Revenue', 'revenue-expenses'],
  ['4100', 'Service revenue', 'Revenue', 'revenue-expenses'], ['5000', 'Materials expense', 'Expense', 'revenue-expenses'],
  ['5100', 'Contractor expense', 'Expense', 'revenue-expenses'], ['5200', 'Utilities expense', 'Expense', 'revenue-expenses'],
  ['5300', 'Depreciation expense', 'Expense', 'fixed-assets'], ['5400', 'Unallocated clearing', 'Asset', ''],
].map(([code, name, category, scheduleId], index) => ({
  id: `acct-${code}`, code, name, category, scheduleId,
  debit: [42000, 8000, 31500, 1500, 22000, 28000, 7000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3000][index],
  credit: [0, 0, 0, 0, 0, 0, 0, 16500, 4800, 3100, 18000, 40000, 12500, 0, 0, 0, 0, 0, 0, 0][index],
}));

const transactions = [
  ['txn-01', '2026-07-02', 'INV-1001', 'Northstar Office Co.', 2400, 'GST-A', 0, 'acct-4000', 'Present', 'Sales'],
  ['txn-02', '2026-07-05', 'PUR-204', 'Harbor Supplies', 880, 'GST-B', 0, 'acct-5000', 'Present', 'Purchase'],
  ['txn-03', '2026-07-12', 'INV-1008', 'Willow Studio', 1650, 'GST-A', 0, 'acct-4100', 'Present', 'Sales'],
  ['txn-04', '2026-07-16', '', 'Metro Utilities', 310, 'GST-B', 0, 'acct-5200', 'Missing', 'Purchase'],
  ['txn-05', '2026-07-18', 'INV-1011', 'Northstar Office Co.', 2400, 'GST-A', 0, 'acct-4000', 'Present', 'Sales'],
  ['txn-06', '2026-07-18', 'INV-1011', 'Northstar Office Co.', 2400, 'GST-A', 0, 'acct-4000', 'Present', 'Sales'],
  ['txn-07', '2026-07-20', 'PUR-219', 'Paper Kite Design', 1250, '', 0, 'acct-5100', 'Present', 'Purchase'],
  ['txn-08', '2026-08-01', 'INV-1020', 'Willow Studio', 3150, 'GST-A', 0, 'acct-4100', 'Present', 'Sales'],
  ['txn-09', '2026-08-04', 'PUR-230', 'Harbor Supplies', 1720, 'GST-B', 0, 'acct-5000', 'Present', 'Purchase'],
  ['txn-10', '2026-08-10', 'INV-1026', 'Juniper Labs', 4800, 'GST-A', 0, 'acct-4000', 'Present', 'Sales'],
  ['txn-11', '2026-08-13', 'PUR-244', 'Clearview Hosting', 420, 'GST-B', 0, 'acct-5200', 'Present', 'Purchase'],
  ['txn-12', '2026-08-18', 'INV-1032', 'Northstar Office Co.', 1275, 'GST-A', 0, 'acct-4000', 'Present', 'Sales'],
  ['txn-13', '2026-08-22', 'PUR-251', 'Harbor Supplies', 920, 'GST-B', 0, 'acct-5000', 'Present', 'Purchase'],
  ['txn-14', '2026-09-02', 'INV-1040', 'Willow Studio', 2300, 'GST-A', 0, 'acct-4100', 'Present', 'Sales'],
  ['txn-15', '2026-09-05', 'PUR-260', 'Metro Utilities', 285, 'GST-B', 0, 'acct-5200', 'Present', 'Purchase'],
  ['txn-16', '2026-09-09', 'INV-1047', 'Juniper Labs', 3650, '', 0, 'acct-4000', 'Present', 'Sales'],
  ['txn-17', '2026-09-11', 'PUR-269', 'Paper Kite Design', 1460, 'GST-B', 0, 'acct-5100', 'Present', 'Purchase'],
  ['txn-18', '2026-09-15', 'INV-1053', 'Northstar Office Co.', 1900, 'GST-A', 125, 'acct-4000', 'Present', 'Sales'],
  ['txn-19', '2026-09-19', 'PUR-277', 'Clearview Hosting', 540, 'GST-B', 0, 'acct-5200', 'Present', 'Purchase'],
  ['txn-20', '2026-09-23', 'INV-1061', 'Willow Studio', 2800, 'GST-A', 0, 'acct-4100', 'Present', 'Sales'],
  ['txn-21', '2026-09-25', 'PUR-281', 'Harbor Supplies', 1180, 'GST-B', 0, 'acct-5000', 'Present', 'Purchase'],
  ['txn-22', '2026-09-27', 'INV-1066', 'Juniper Labs', 2120, 'GST-A', 0, 'acct-4000', 'Present', 'Sales'],
  ['txn-23', '2026-09-28', 'PUR-289', 'Paper Kite Design', 690, 'GST-B', 0, 'acct-5100', 'Present', 'Purchase'],
  ['txn-24', '2026-09-30', 'INV-1070', 'Northstar Office Co.', 3400, 'GST-A', 0, 'acct-4000', 'Present', 'Sales'],
].map(([id, date, reference, counterparty, net, taxCode, gstAmount, accountId, invoiceReferenceStatus, kind], i) => ({
  id, date, reference, counterparty, net, taxCode, gstAmount, gross: net + gstAmount,
  accountId, invoiceReferenceStatus, kind, sourceRow: i + 2,
}));

const scheduleSeed = [
  ['cash-bank', 'Cash & bank', 'Verify cash balances and reconciliation evidence.', ['acct-1000', 'acct-1010']],
  ['receivables', 'Receivables & inventory', 'Review receivable ageing and recoverability; confirm inventory applicability and supporting records.', ['acct-1100', 'acct-1110', 'acct-1200']],
  ['payables', 'Payables', 'Review supplier balances and completeness.', ['acct-2000']],
  ['fixed-assets', 'Fixed assets & depreciation', 'Reconcile asset movements and depreciation.', ['acct-1500', 'acct-1510', 'acct-5300']],
  ['loans-accruals', 'Loans, accruals & prepayments', 'Reconcile loan balances and review accruals, prepayments, period cut-off and supporting evidence.', ['acct-2300', 'acct-2200']],
  ['equity-other', 'Equity & configurable other / tax', 'Reconcile equity balances and confirm any other or tax schedule scope with the accounting lead.', ['acct-3000', 'acct-3100']],
  ['revenue-expenses', 'Revenue & expenses', 'Review classification and period cut-off.', ['acct-4000', 'acct-4100', 'acct-5000', 'acct-5100', 'acct-5200']],
  ['gst-control', 'GST control', 'Reconcile ledger control to transaction register.', ['acct-2100']],
].map(([id, name, purpose, accountIds]) => ({
  id, name, purpose, accountIds, status: id === 'cash-bank' ? 'In review' : 'Not started',
  openingBalance: 0, note: '', reviewerComment: '',
}));

const topics = [
  'Presentation and classification', 'Period cut-off', 'Bank reconciliation', 'Receivables recoverability',
  'Payables completeness', 'Fixed assets and depreciation', 'Accruals and prepayments', 'Inventory, if applicable',
  'Related-party disclosures', 'Significant estimates', 'Going concern considerations', 'Accounting-policy consistency',
];

export function createSeedState() {
  return {
    clients: [
      { id: 'client-1', name: 'Aster & Finch Studio', entityType: 'Private company', fictional: true },
      { id: 'client-2', name: 'Cedarfield Works', entityType: 'Sole proprietor', fictional: true },
      { id: 'client-3', name: 'Blue Heron Digital', entityType: 'Private company', fictional: true },
    ],
    engagements: [
      { id: 'eng-2026-01', clientId: 'client-1', entityType: 'Private company', period: '01 Jul 2026 – 30 Sep 2026', currency: 'AUD', gstRegistration: 'Registered (demo)', gstJurisdiction: 'Not configured', framework: 'Not configured', preparer: 'Morgan Lee', reviewer: 'Riley Chen', status: 'In progress' },
      { id: 'eng-2026-02', clientId: 'client-2', entityType: 'Sole proprietor', period: '01 Jan 2026 – 30 Jun 2026', currency: 'NZD', gstRegistration: 'Not configured', gstJurisdiction: 'Not configured', framework: 'Not configured', preparer: 'Morgan Lee', reviewer: 'Unassigned', status: 'Planning' },
      { id: 'eng-2026-03', clientId: 'client-3', entityType: 'Private company', period: '01 Apr 2026 – 30 Jun 2026', currency: 'USD', gstRegistration: 'Not configured', gstJurisdiction: 'Not configured', framework: 'Not configured', preparer: 'Jordan Park', reviewer: 'Riley Chen', status: 'Complete' },
    ],
    accounts,
    transactions,
    schedules: scheduleSeed,
    reviewFindings: topics.map((topic, i) => ({
      id: `finding-${i + 1}`, topic, status: ['In progress', 'Open', 'Open', 'Complete', 'Open', 'Open', 'In progress', 'Not applicable', 'Open', 'Open', 'Open', 'In progress'][i],
      priority: ['Medium', 'High', 'High', 'Medium', 'Medium', 'Medium', 'Low', 'Low', 'Low', 'Medium', 'High', 'Medium'][i],
      reviewer: 'Riley Chen', evidence: i === 2 ? 'Schedule: Cash & bank' : '', suggestion: 'Mock AI response — professional review required. Confirm applicability, evidence and treatment with the accounting lead.', note: '', owner: i < 4 ? 'Morgan Lee' : 'Unassigned', dueDate: '2026-11-05', scheduleId: i === 2 ? 'cash-bank' : '',
    })),
    gstChecks: [
      { id: 'gst-1', title: 'Missing tax code', severity: 'High', explanation: 'Transaction has no tax code; classification requires review.', transactionIds: ['txn-07', 'txn-16'] },
      { id: 'gst-2', title: 'Missing invoice reference', severity: 'Medium', explanation: 'Source record does not contain an invoice reference.', transactionIds: ['txn-04'] },
      { id: 'gst-3', title: 'Possible duplicate', severity: 'Medium', explanation: 'Same reference, counterparty and amount appear on two source rows.', transactionIds: ['txn-05', 'txn-06'] },
      { id: 'gst-4', title: 'Demo rule: inconsistent tax amount', severity: 'High', explanation: 'Illustrative demo comparison only: non-zero tax amount is unusual compared with other rows. No jurisdictional rate is assumed.', transactionIds: ['txn-18'] },
      { id: 'gst-5', title: 'Uncertain classification', severity: 'Low', explanation: 'Purchase tax code is present but treatment is not confirmed.', transactionIds: ['txn-09', 'txn-13'] },
      { id: 'gst-6', title: 'GST-control reconciliation difference', severity: 'High', explanation: 'Illustrative ledger-to-register reconciliation difference requires investigation; figures are not adjusted.', transactionIds: ['txn-18'] },
      { id: 'gst-7', title: 'Source evidence follow-up', severity: 'Low', explanation: 'Confirm invoice and supporting evidence for selected sample records.', transactionIds: ['txn-10', 'txn-17'] },
      { id: 'gst-8', title: 'Jurisdiction not configured', severity: 'Medium', explanation: 'Confirm GST jurisdiction and applicable rules before any conclusion.', transactionIds: [] },
      { id: 'gst-9', title: 'Reporting scope confirmation', severity: 'Low', explanation: 'Confirm reporting period and transaction population with the engagement lead.', transactionIds: [] },
    ],
    draft: {
      id: 'draft-1', sections: {
        scope: 'Compilation engagement — scope to be confirmed with the engagement lead.',
        statements: 'Included schedules: Cash & bank, Receivables, Payables, Fixed assets & depreciation, Inventory, Loans, Accruals & prepayments, Equity, Revenue & expenses, GST control.',
        unresolved: 'Unresolved matters: GST control reconciliation difference, missing tax codes and invoice reference, possible duplicate transaction, and open review checklist items. No adjustments have been posted.',
        management: 'Management-provided information: source records and balances are fictional demo data and have not been independently verified.',
        reviewNotes: 'Professional review required. Confirm framework, jurisdiction, scope, wording, evidence and applicable compilation-report format before use.',
      },
      revisionHistory: [{ at: now, by: 'System', action: 'Draft created' }],
    },
    activity: [
      { id: 'act-1', at: '2026-10-21T08:35:00.000Z', by: 'Morgan Lee', action: 'Imported sample trial balance preview', record: 'eng-2026-01' },
      { id: 'act-2', at: '2026-10-21T08:50:00.000Z', by: 'Riley Chen', action: 'Added review checklist prompts', record: 'standards-review' },
      { id: 'act-3', at: now, by: 'Morgan Lee', action: 'Prepared demo workspace', record: 'eng-2026-01' },
    ],
    settings: { companyName: 'Zephyr Advisory', currency: 'AUD', dateFormat: 'DD MMM YYYY', gstJurisdiction: 'Not configured', framework: 'Not configured', notifications: true },
    activeEngagementId: 'eng-2026-01',
    lastUpdated: now,
  };
}
