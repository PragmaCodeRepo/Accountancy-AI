# Zephyr AI Accounting Assistant

A frontend-only proof of concept for preparing accounting schedules, reviewing illustrative GST records and financial-reporting prompts, and editing a draft compilation report. Every client and transaction is fictional. The assistant uses deterministic mock responses; there is no backend, real AI provider, accounting integration, tax authority connection, email service or document storage.

## Run locally

```bash
npm install
npm run dev
```

Create a production bundle with `npm run build`. Run calculation unit tests with `npm test`.

## Routes

- `/dashboard` — derived workspace KPIs, schedule chart, review items and activity.
- `/engagements` and `/engagements/:id` — fictional client engagements and local create/edit.
- `/trial-balance` — source-account balances, mapping, traceable sample transactions and simulated import validation.
- `/schedules` — schedule calculations and preparation/review workflow.
- `/gst-review` — fictional register and illustrative exception checks; no return generation.
- `/standards-review` — configurable framework prompt checklist and reviewer notes.
- `/ai-assistant` — deterministic, source-linked mock summaries and questions.
- `/compilation-report` — editable draft, browser print/Save as PDF, and schedule CSV.
- `/reports` — status, schedule, GST, review and trial-balance views.
- `/settings` — browser-local preferences and reset to seed demo records.

## Demo walkthrough

1. Open Dashboard and select an engagement from the Engagements list.
2. Visit Trial balance and inspect the unbalanced demo source values. Change an account's schedule mapping and open an account to see linked transactions.
3. Open Schedules to review calculated balances, add notes, and mark schedules prepared or reviewed. Values are recalculated from mapped account records.
4. Use GST review and Financial reporting review to inspect and update prompts. The GST jurisdiction and financial-reporting framework remain unconfigured until explicitly supplied.
5. Ask one of the mock AI prompts. Responses cite the relevant screens and do not update records.
6. Edit and save the Compilation report draft or export report rows as CSV. The draft is never signed or filed.
7. Change Settings, reload the browser, and use Reset demo data to restore the fictional seed state.

## Data model and implementation

Seed data lives in `src/data/seed.js`. `src/services/AppContext.jsx` owns the shared state and persists it to browser `localStorage`; malformed or incomplete stored state falls back to the fictional seed. `src/utils/calculations.js` holds reusable trial-balance, schedule and completion selectors plus CSV export helpers. Components and routed screens are in `src/components`, `src/layout` and `src/pages`.

Financial totals are calculated from source account debit/credit values. Schedule movements use debit less credit for linked accounts, plus the schedule opening balance. Transaction source-row numbers are retained for traceability. Mapping changes do not alter financial figures. The seeded trial balance is intentionally unbalanced for review demonstration.

## Assumptions and limitations

- No GST jurisdiction, tax rate, return name, deadline, statutory obligation, accounting standard or compilation-report template is assumed.
- GST checks are illustrative prompts. The explicitly labelled demo comparison is not a legal rate rule.
- Financial reporting checklist topics are prompts; they do not assert applicability or compliance. No standard paragraph references are supplied.
- The report is a draft-only demonstration, not an approved, signed, filed, statutory or compliant report.
- Preparer and reviewer names are demo UI values, not authenticated roles or electronic sign-off.
- The sample CSV/XLSX import interaction previews simulated validation only; it does not parse or import files.
- Browser localStorage is the only persistence mechanism. There is no server-side storage, access control or multi-user synchronization.

## Future integration path

Any production implementation would require stakeholder confirmation of target jurisdiction, reporting framework and version, compilation engagement scope and format, source systems, evidence-retention and privacy requirements, user roles, review controls, data residency, and governance. Integration work should be separately designed, authorized, tested and security-reviewed; this proof of concept does not make those connections.
