import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AlertTriangle, ArrowDownRight, ArrowRight, ArrowUpRight, Bot, Check, CheckCircle2, CircleHelp, Download, FileDown, FilePlus2, Filter, Info, MessageSquare, Printer, RefreshCw, Search, Send, Settings2, Sparkles, Wallet } from 'lucide-react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useApp } from '../services/AppContext.jsx';
import { downloadCsv, getGstControlDifference, getOpenFindings, getScheduleBalance, getScheduleCompletion, getTransactionGSTTotal, getTrialBalanceTotals, money, validateTrialBalance } from '../utils/calculations.js';
import { Badge, Card, EmptyState, Field, KPI, Modal, PageHeading, StatusBadge, Table } from '../components/UI.jsx';

const heading = (eyebrow, title, description, actions) => <PageHeading eyebrow={eyebrow} title={title} description={description} actions={actions} />;
const scheduleName = (state, id) => state.schedules.find((schedule) => schedule.id === id)?.name || 'Unmapped';
const clientName = (state, id) => state.clients.find((client) => client.id === id)?.name || 'Unknown client';
const getActiveEngagement = (state) => state.engagements.find((engagement) => engagement.id === state.activeEngagementId) || state.engagements[0];

function engagementProgress(state) {
  const schedule = getScheduleCompletion(state.schedules);
  const resolved = state.reviewFindings.filter((item) => ['Complete', 'Not applicable'].includes(item.status)).length;
  return Math.round((schedule.percent + (state.reviewFindings.length ? resolved / state.reviewFindings.length * 100 : 0)) / 2);
}

export function Dashboard() {
  const { state } = useApp();
  const completion = getScheduleCompletion(state.schedules);
  const open = getOpenFindings(state.reviewFindings);
  const openGstChecks = state.gstChecks.filter((check) => check.status !== 'Reviewed');
  const severity = ['High', 'Medium', 'Low'].map((name) => ({ name, count: openGstChecks.filter((check) => check.severity === name).length }));
  const chart = state.schedules.map((schedule) => ({ name: schedule.name.replace(' & depreciation', ''), completion: ['Prepared', 'Reviewed'].includes(schedule.status) ? 100 : schedule.status === 'In review' ? 55 : 0 }));
  return <>
    {heading('Tuesday, 21 October 2026', 'Good morning, Morgan', 'Here’s the latest across your demo workspace.', <Link className="button button-primary" to="/engagements"><FilePlus2 size={16} /> New engagement</Link>)}
    <div className="kpi-grid">
      <KPI label="Active engagements" value={state.engagements.filter((item) => item.status === 'In progress').length} helper="Across all demo clients" icon={Wallet} />
      <KPI label="Schedules prepared" value={`${completion.completed} / ${completion.total}`} helper={`${completion.percent}% complete`} icon={CheckCircle2} tone="blue" />
      <KPI label="Open review points" value={open.length} helper="Across the active checklist" icon={CircleHelp} tone="amber" />
      <KPI label="GST checks needing attention" value={openGstChecks.filter((item) => item.severity !== 'Low').length} helper="Illustrative checks only" icon={AlertTriangle} tone="rose" />
      <KPI label="Checklist completion" value={`${engagementProgress(state)}%`} helper="Schedules + review prompts" icon={Check} tone="green" />
      <KPI label="Compilation report" value="Draft" helper="Not signed or filed" icon={FileDown} tone="purple" />
    </div>
    <div className="dashboard-grid">
      <Card className="chart-card"><div className="card-heading"><div><h2>Schedule completion</h2><p>Preparation progress by schedule</p></div><Link to="/schedules" className="text-link">View schedules <ArrowRight size={14} /></Link></div><div className="chart-box"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chart}><defs><linearGradient id="tealFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0d9f91" stopOpacity={0.2} /><stop offset="95%" stopColor="#0d9f91" stopOpacity={0} /></linearGradient></defs><CartesianGrid stroke="#edf0f4" vertical={false} /><XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} /><YAxis domain={[0, 100]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} /><Tooltip /><Area type="monotone" dataKey="completion" stroke="#0d9f91" fill="url(#tealFill)" strokeWidth={2.5} /></AreaChart></ResponsiveContainer></div></Card>
      <Card className="chart-card"><div className="card-heading"><div><h2>GST exceptions by severity</h2><p>Illustrative, not a tax conclusion</p></div><Link to="/gst-review" className="text-link">Review checks <ArrowRight size={14} /></Link></div><div className="chart-box"><ResponsiveContainer width="100%" height="100%"><BarChart data={severity} layout="vertical"><CartesianGrid stroke="#edf0f4" horizontal={false} /><XAxis type="number" hide /><YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} /><Tooltip /><Bar dataKey="count" fill="#16a394" radius={[0, 5, 5, 0]} barSize={18} /></BarChart></ResponsiveContainer></div></Card>
    </div>
    <div className="dashboard-grid lower-grid">
      <Card><div className="card-heading"><div><h2>Engagements</h2><p>Recent activity in your workspace</p></div><Link to="/engagements" className="text-link">All engagements <ArrowRight size={14} /></Link></div><Table columns={[
        { key: 'client', label: 'Client', render: (r) => <Link className="table-main-link" to={`/engagements/${r.id}`}>{clientName(state, r.clientId)}</Link> },
        { key: 'period', label: 'Reporting period' }, { key: 'progress', label: 'Progress', render: () => <span className="progress-inline"><span><i style={{ width: `${engagementProgress(state)}%` }} /></span>{engagementProgress(state)}%</span> },
        { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
      ]} rows={state.engagements} /></Card>
      <Card><div className="card-heading"><div><h2>Needs attention</h2><p>Items to review next</p></div><span className="count-dot">{open.length}</span></div><div className="attention-list">{open.slice(0, 4).map((item) => <Link className="attention-item" to="/standards-review" key={item.id}><span className="attention-icon"><AlertTriangle size={16} /></span><span><strong>{item.topic}</strong><small>{item.priority} priority · {item.owner}</small></span><ArrowRight size={15} /></Link>)}</div></Card>
    </div>
    <Card className="activity-card"><div className="card-heading"><div><h2>Recent activity</h2><p>Local demo audit trail</p></div><Badge tone="teal">DEMO USERS</Badge></div><ActivityList activities={state.activity.slice(0, 4)} /></Card>
  </>;
}

function ActivityList({ activities }) {
  return <div className="activity-list">{activities.map((item) => <div className="activity-row" key={item.id}><div className="activity-dot" /><div><strong>{item.action}</strong><span>{item.by} · {item.record}</span></div><time>{new Date(item.at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</time></div>)}</div>;
}

export function Engagements() {
  const { state, update, notify } = useApp();
  const [query, setQuery] = useState(new URLSearchParams(location.search).get('search') || '');
  const [status, setStatus] = useState('All statuses');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const filtered = state.engagements.filter((item) => `${clientName(state, item.clientId)} ${item.period} ${item.status}`.toLowerCase().includes(query.toLowerCase()) && (status === 'All statuses' || item.status === status));
  const openForm = (engagement = null) => { setEditing(engagement); setShowForm(true); };
  const save = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    const record = { ...payload, id: editing?.id || `eng-${Date.now()}`, currency: payload.currency || 'AUD' };
    update((current) => ({ ...current, engagements: editing ? current.engagements.map((item) => item.id === editing.id ? record : item) : [record, ...current.engagements] }), { action: editing ? 'Updated engagement details' : 'Created engagement', record: record.id });
    setShowForm(false); notify(editing ? 'Engagement updated.' : 'Engagement created locally.');
  };
  return <>
    {heading('Client workspace', 'Engagements', 'Manage fictional client workspaces and reporting periods.', <button className="button button-primary" onClick={() => openForm()}><FilePlus2 size={16} /> Create engagement</button>)}
    <Card><div className="toolbar"><label className="search-input"><Search size={16} /><input placeholder="Search clients or periods..." value={query} onChange={(e) => setQuery(e.target.value)} /></label><select aria-label="Filter by status" value={status} onChange={(e) => setStatus(e.target.value)}><option>All statuses</option>{['Planning', 'In progress', 'Ready for review', 'Complete'].map((x) => <option key={x}>{x}</option>)}</select><span className="toolbar-count">{filtered.length} engagements</span></div>
      <Table columns={[
        { key: 'client', label: 'Client', render: (r) => <div className="table-identity"><span className="client-icon">{clientName(state, r.clientId).slice(0, 1)}</span><span><Link className="table-main-link" to={`/engagements/${r.id}`}>{clientName(state, r.clientId)}</Link><small>{r.entityType}</small></span></div> },
        { key: 'period', label: 'Reporting period' }, { key: 'currency', label: 'Currency' },
        { key: 'framework', label: 'Framework', render: (r) => <span className="muted">{r.framework || 'Not configured'}</span> },
        { key: 'gstJurisdiction', label: 'GST jurisdiction', render: (r) => <span className="muted">{r.gstJurisdiction || 'Not configured'}</span> },
        { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
        { key: 'edit', label: '', render: (r) => <button className="button button-small" onClick={(e) => { e.stopPropagation(); openForm(r); }}>Edit</button> },
      ]} rows={filtered} /></Card>
    {showForm && <Modal title={editing ? 'Edit engagement' : 'Create engagement'} onClose={() => setShowForm(false)} footer={<><button className="button" onClick={() => setShowForm(false)}>Cancel</button><button className="button button-primary" form="engagement-form" type="submit">Save engagement</button></>}>
      <form id="engagement-form" className="form-grid" onSubmit={save}>
        <Field label="Client"><select name="clientId" defaultValue={editing?.clientId || state.clients[0].id}>{state.clients.map((client) => <option key={client.id} value={client.id}>{client.name} — fictional</option>)}</select></Field>
        <Field label="Entity type"><select name="entityType" defaultValue={editing?.entityType || 'Private company'}>{['Private company', 'Sole proprietor', 'Partnership', 'Other'].map((v) => <option key={v}>{v}</option>)}</select></Field>
        <Field label="Reporting period"><input name="period" required defaultValue={editing?.period || ''} placeholder="e.g. 01 Jul 2026 – 30 Sep 2026" /></Field>
        <Field label="Currency"><select name="currency" defaultValue={editing?.currency || 'AUD'}>{['AUD', 'NZD', 'USD', 'GBP', 'CAD', 'Other'].map((v) => <option key={v}>{v}</option>)}</select></Field>
        <Field label="GST registration"><input name="gstRegistration" defaultValue={editing?.gstRegistration || 'Not configured'} /></Field>
        <Field label="GST jurisdiction"><input name="gstJurisdiction" defaultValue={editing?.gstJurisdiction || 'Not configured'} /></Field>
        <Field label="Reporting framework / version"><input name="framework" defaultValue={editing?.framework || 'Not configured'} /></Field>
        <Field label="Preparer"><input name="preparer" defaultValue={editing?.preparer || 'Morgan Lee'} /></Field>
        <Field label="Reviewer"><input name="reviewer" defaultValue={editing?.reviewer || 'Unassigned'} /></Field>
        <Field label="Status"><select name="status" defaultValue={editing?.status || 'Planning'}>{['Planning', 'In progress', 'Ready for review', 'Complete'].map((v) => <option key={v}>{v}</option>)}</select></Field>
      </form>
    </Modal>}
  </>;
}

export function EngagementDetail() {
  const { id } = useParams(); const { state } = useApp();
  const item = state.engagements.find((e) => e.id === id);
  if (!item) return <EmptyState title="Engagement not found" text="Choose an engagement from the workspace list." />;
  const scheduleCompletion = getScheduleCompletion(state.schedules);
  return <>
    <div className="back-link"><Link to="/engagements">← All engagements</Link></div>
    {heading('Fictional client · engagement overview', clientName(state, item.clientId), `${item.entityType} · ${item.period}`, <Link className="button" to="/trial-balance">View trial balance <ArrowRight size={15} /></Link>)}
    <div className="detail-meta"><span>Currency <b>{item.currency}</b></span><span>GST jurisdiction <b>{item.gstJurisdiction || 'Not configured'}</b></span><span>Framework <b>{item.framework || 'Not configured'}</b></span><span>Preparer <b>{item.preparer}</b></span><span>Reviewer <b>{item.reviewer}</b></span><StatusBadge status={item.status} /></div>
    <div className="two-column"><Card><div className="card-heading"><div><h2>Workflow progress</h2><p>Engagement completion derived from current schedules and checklist.</p></div><strong className="completion-value">{engagementProgress(state)}%</strong></div><div className="progress-bar"><span style={{ width: `${engagementProgress(state)}%` }} /></div><div className="workflow-stats"><span>{scheduleCompletion.completed}/{scheduleCompletion.total} schedules prepared</span><span>{getOpenFindings(state.reviewFindings).length} review points open</span></div><div className="workflow-links"><Link to="/schedules">Prepare schedules <ArrowRight size={15} /></Link><Link to="/standards-review">Review checklist <ArrowRight size={15} /></Link><Link to="/compilation-report">Open draft report <ArrowRight size={15} /></Link></div></Card><Card><div className="card-heading"><div><h2>Engagement activity</h2><p>Latest local actions</p></div></div><ActivityList activities={state.activity.slice(0, 5)} /></Card></div>
    <Card><div className="card-heading"><div><h2>Schedules</h2><p>Linked to shared trial-balance lines</p></div><Link className="text-link" to="/schedules">All schedules <ArrowRight size={15} /></Link></div><ScheduleTable schedules={state.schedules.slice(0, 6)} /></Card>
  </>;
}

function ScheduleTable({ schedules }) {
  const { state } = useApp();
  return <Table columns={[
    { key: 'name', label: 'Schedule', render: (r) => <Link className="table-main-link" to="/schedules">{r.name}</Link> },
    { key: 'accounts', label: 'Linked accounts', render: (r) => r.accountIds.length },
    { key: 'balance', label: 'Closing balance', render: (r) => money(getScheduleBalance(r, state.accounts).closing, getActiveEngagement(state)?.currency) },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ]} rows={schedules} />;
}

export function TrialBalance() {
  const { state, update, notify } = useApp();
  const [query, setQuery] = useState(''); const [category, setCategory] = useState('All categories'); const [sortBy, setSortBy] = useState('code'); const [selected, setSelected] = useState(null); const [importFormat, setImportFormat] = useState('CSV'); const [showImportPreview, setShowImportPreview] = useState(false);
  const rows = state.accounts.filter((r) => `${r.code} ${r.name}`.toLowerCase().includes(query.toLowerCase()) && (category === 'All categories' || r.category === category)).sort((a, b) => {
    const left = sortBy === 'net' ? Number(a.debit) - Number(a.credit) : a[sortBy];
    const right = sortBy === 'net' ? Number(b.debit) - Number(b.credit) : b[sortBy];
    return typeof left === 'string' ? left.localeCompare(right) : left - right;
  });
  const totals = getTrialBalanceTotals(state.accounts); const currency = getActiveEngagement(state)?.currency || 'AUD';
  const updateMapping = (accountId, scheduleId) => {
    update((current) => ({ ...current, accounts: current.accounts.map((account) => account.id === accountId ? { ...account, scheduleId } : account) }), { action: 'Changed account-to-schedule mapping', record: accountId });
    setSelected((account) => account ? { ...account, scheduleId } : account); notify('Account mapping updated; related schedule totals recalculated.');
  };
  return <>
    {heading('Source data · fictional sample', 'Trial balance', 'Review source rows, account mappings and balance integrity.', <button className="button" onClick={() => setShowImportPreview(true)}><FileDown size={16} /> Sample import preview</button>)}
    <div className="kpi-grid four-kpi"><KPI label="Total debits" value={money(totals.debit, currency)} helper="Calculated from source rows" icon={ArrowUpRight} /><KPI label="Total credits" value={money(totals.credit, currency)} helper="Calculated from source rows" icon={ArrowDownRight} tone="blue" /><KPI label="Difference" value={money(totals.difference, currency)} helper={totals.balanced ? 'Balanced' : 'Unbalanced — investigate source'} icon={AlertTriangle} tone={totals.balanced ? 'green' : 'rose'} /><KPI label="Unmapped accounts" value={state.accounts.filter((a) => !a.scheduleId).length} helper="Mapping review required" icon={Settings2} tone="amber" /></div>
    <Card><div className="toolbar"><label className="search-input"><Search size={16} /><input placeholder="Search account code or name..." value={query} onChange={(e) => setQuery(e.target.value)} /></label><select value={category} aria-label="Filter category" onChange={(e) => setCategory(e.target.value)}><option>All categories</option>{[...new Set(state.accounts.map((a) => a.category))].map((v) => <option key={v}>{v}</option>)}</select><select value={sortBy} aria-label="Sort trial balance" onChange={(e) => setSortBy(e.target.value)}><option value="code">Sort: Account code</option><option value="name">Sort: Account name</option><option value="debit">Sort: Debit</option><option value="credit">Sort: Credit</option><option value="net">Sort: Net balance</option></select><button className="button button-small" onClick={() => setShowImportPreview(true)}>Preview validation</button><button className="button button-small" onClick={() => downloadCsv('zephyr-trial-balance.csv', rows.map((a) => ({ ...a, schedule: scheduleName(state, a.scheduleId), net: a.debit - a.credit })), [{ key: 'code', label: 'Account code' }, { key: 'name', label: 'Account name' }, { key: 'category', label: 'Category' }, { key: 'debit', label: 'Debit' }, { key: 'credit', label: 'Credit' }, { key: 'net', label: 'Net balance' }, { key: 'schedule', label: 'Mapped schedule' }])}><Download size={14} /> CSV</button><span className="toolbar-count">{rows.length} source rows</span></div>
      <Table columns={[
        { key: 'code', label: 'Account code', render: (r) => <button className="table-main-link link-button" onClick={() => setSelected(r)}>{r.code}</button> }, { key: 'name', label: 'Account name', render: (r) => <button className="table-main-link link-button" onClick={() => setSelected(r)}>{r.name || 'Missing account name'}</button> },
        { key: 'category', label: 'Category' }, { key: 'debit', label: 'Debit', render: (r) => money(r.debit, currency) }, { key: 'credit', label: 'Credit', render: (r) => money(r.credit, currency) },
        { key: 'net', label: 'Net balance', render: (r) => money(r.debit - r.credit, currency) },
        { key: 'schedule', label: 'Mapped schedule', render: (r) => <select aria-label={`Map ${r.code} to schedule`} value={r.scheduleId} onChange={(e) => updateMapping(r.id, e.target.value)}><option value="">Unmapped</option>{state.schedules.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select> },
        { key: 'review', label: 'Review status', render: (r) => <StatusBadge status={!r.scheduleId ? 'Open' : 'In progress'} /> },
      ]} rows={rows} />
      <div className="table-footnote"><Info size={15} /> Source row references are stable demo IDs; figures are not silently adjusted.</div>
    </Card>
    {showImportPreview && <Modal title={`${importFormat} import validation preview`} onClose={() => setShowImportPreview(false)} footer={<button className="button button-primary" onClick={() => setShowImportPreview(false)}>Close preview</button>}><div className="import-preview"><div className="format-toggle" role="group" aria-label="Sample file format">{['CSV', 'XLSX'].map((format) => <button key={format} className={format === importFormat ? 'selected' : ''} onClick={() => setImportFormat(format)}>{format} sample</button>)}</div><div className="notice notice-info"><Info size={16} /><span>Preview only. File selection, parsing and import are not implemented; no source data will be changed.</span></div><Table columns={[{ key: 'code', label: 'Account code' }, { key: 'name', label: 'Account name' }, { key: 'debit', label: 'Debit' }, { key: 'credit', label: 'Credit' }, { key: 'schedule', label: 'Schedule mapping' }]} rows={state.accounts.slice(0, 5).map((a) => ({ ...a, schedule: scheduleName(state, a.scheduleId) }))} /><h3>Simulated validation findings</h3>{validateTrialBalance(state.accounts).length ? <ul className="validation-list">{validateTrialBalance(state.accounts).map((issue, index) => <li key={`${issue.type}-${issue.source}-${index}`}><Badge tone={issue.type.includes('unbalanced') ? 'red' : 'amber'}>{issue.type}</Badge><span>Source: {issue.source}{issue.difference !== undefined ? ` · Difference ${money(issue.difference, currency)}` : ''}</span></li>)}</ul> : <p className="muted">No validation issues detected in current rows.</p>}</div></Modal>}
    {selected && <Modal title={`${selected.code} · ${selected.name}`} onClose={() => setSelected(null)} footer={<button className="button button-primary" onClick={() => setSelected(null)}>Done</button>}><div className="drawer-detail"><div className="detail-meta"><span>Category <b>{selected.category}</b></span><span>Source record <b>{selected.id}</b></span><span>Net balance <b>{money(selected.debit - selected.credit, currency)}</b></span></div><h3>Transactions</h3><Table columns={[{ key: 'date', label: 'Date' }, { key: 'reference', label: 'Reference' }, { key: 'counterparty', label: 'Counterparty' }, { key: 'sourceRow', label: 'Source row' }, { key: 'net', label: 'Net', render: (r) => money(r.net, currency) }]} rows={state.transactions.filter((t) => t.accountId === selected.id)} empty="No transaction rows are linked to this account." /><h3>Mapping history</h3><p className="muted">Current mapping: {scheduleName(state, selected.scheduleId)}</p>{state.activity.filter((entry) => entry.record === selected.id && entry.action.toLowerCase().includes('mapping')).length ? <ActivityList activities={state.activity.filter((entry) => entry.record === selected.id && entry.action.toLowerCase().includes('mapping'))} /> : <p className="muted">No mapping changes recorded since the sample data was prepared.</p>}</div></Modal>}
  </>;
}

export function Schedules() {
  const { state, update, notify } = useApp();
  const [selectedId, setSelectedId] = useState('');
  const currency = getActiveEngagement(state)?.currency || 'AUD';
  const markStatus = (schedule, status) => {
    if (!window.confirm(`Mark “${schedule.name}” as ${status.toLowerCase()}? Professional review remains required.`)) return;
    update((current) => ({ ...current, schedules: current.schedules.map((s) => s.id === schedule.id ? { ...s, status } : s) }), { action: `Marked schedule ${status.toLowerCase()}`, record: schedule.id, by: status === 'Reviewed' ? 'Riley Chen' : 'Morgan Lee' });
    notify(`Schedule marked ${status.toLowerCase()}.`);
  };
  return <>
    {heading('Working papers', 'Accounting schedules', 'Derived from linked trial-balance accounts. Review all assumptions and evidence.', <Link className="button" to="/trial-balance">Manage source data <ArrowRight size={15} /></Link>)}
    <div className="schedule-grid">{state.schedules.map((schedule) => {
      const balance = getScheduleBalance(schedule, state.accounts);
      return <Card className="schedule-card" key={schedule.id}><div className="schedule-card-top"><span className="schedule-symbol">{schedule.name.slice(0, 1)}</span><StatusBadge status={schedule.status} /></div><button className="schedule-title link-button" onClick={() => setSelectedId(schedule.id)}>{schedule.name}</button><p>{schedule.purpose}</p><div className="schedule-card-foot"><span>{balance.rows.length} linked accounts</span><strong>{money(balance.closing, currency)}</strong></div><button className="text-link" onClick={() => setSelectedId(schedule.id)}>Open schedule <ArrowRight size={14} /></button></Card>;
    })}</div>
    {selectedId && <ScheduleDetail schedule={state.schedules.find((s) => s.id === selectedId)} onClose={() => setSelectedId('')} onStatus={markStatus} />}
  </>;
}

function ScheduleDetail({ schedule, onClose, onStatus }) {
  const { state, update, notify } = useApp();
  const balance = getScheduleBalance(schedule, state.accounts);
  const [note, setNote] = useState(schedule.note || '');
  const [comment, setComment] = useState(schedule.reviewerComment || '');
  if (!schedule) return null;
  const saveNotes = () => { update((current) => ({ ...current, schedules: current.schedules.map((s) => s.id === schedule.id ? { ...s, note, reviewerComment: comment } : s) }), { action: 'Updated schedule notes and reviewer comments', record: schedule.id }); notify('Schedule notes saved locally.'); };
  return <Modal title={schedule.name} onClose={onClose} footer={<><button className="button" onClick={saveNotes}>Save notes</button>{schedule.status !== 'Prepared' && schedule.status !== 'Reviewed' && <button className="button button-primary" onClick={() => onStatus(schedule, 'Prepared')}>Mark prepared</button>}{schedule.status === 'Prepared' && <button className="button button-primary" onClick={() => onStatus(schedule, 'Reviewed')}>Mark reviewed</button>}</>}>
    <div className="schedule-detail"><p className="muted">{schedule.purpose} · Period: {getActiveEngagement(state)?.period} · <StatusBadge status={schedule.status} /></p><div className="mini-metrics"><div><small>Opening balance</small><strong>{money(balance.opening, getActiveEngagement(state)?.currency)}</strong></div><div><small>Movements (debit less credit)</small><strong>{money(balance.movements, getActiveEngagement(state)?.currency)}</strong></div><div><small>Closing balance</small><strong>{money(balance.closing, getActiveEngagement(state)?.currency)}</strong></div></div><h3>Linked source accounts</h3><Table columns={[{ key: 'code', label: 'Code' }, { key: 'name', label: 'Account' }, { key: 'debit', label: 'Debit', render: (r) => money(r.debit, getActiveEngagement(state)?.currency) }, { key: 'credit', label: 'Credit', render: (r) => money(r.credit, getActiveEngagement(state)?.currency) }, { key: 'source', label: 'Source row', render: (r) => r.code }]} rows={balance.rows} empty="No source accounts mapped yet." /><div className="form-grid"><Field label="Notes / assumptions"><textarea value={note} onChange={(e) => setNote(e.target.value)} rows="3" placeholder="Document evidence and assumptions for review." /></Field><Field label="Reviewer comments"><textarea value={comment} onChange={(e) => setComment(e.target.value)} rows="3" placeholder="Reviewer comments or follow-up." /></Field></div><div className="table-footnote"><Info size={15} /> Figures are a direct calculation of linked account debit less credit plus opening balance. No source values are changed.</div></div>
  </Modal>;
}

export function GSTReview() {
  const { state, update, notify } = useApp();
  const [query, setQuery] = useState(''); const [severity, setSeverity] = useState('All severities'); const [kind, setKind] = useState('All transactions');
  const gstDifference = getGstControlDifference(state.accounts, state.transactions);
  const transactions = state.transactions.filter((t) => `${t.reference} ${t.counterparty} ${t.taxCode}`.toLowerCase().includes(query.toLowerCase()) && (kind === 'All transactions' || t.kind === kind));
  const checks = state.gstChecks.filter((c) => (severity === 'All severities' || c.severity === severity) && `${c.title} ${c.explanation}`.toLowerCase().includes(query.toLowerCase()));
  const rerun = () => {
    const generated = state.transactions.reduce((items, t) => {
      if (!t.taxCode) items.push({ id: `rerun-missing-${t.id}`, title: 'Missing tax code', severity: 'High', explanation: 'Transaction has no tax code; classification requires review.', transactionIds: [t.id] });
      if (t.invoiceReferenceStatus === 'Missing') items.push({ id: `rerun-ref-${t.id}`, title: 'Missing invoice reference', severity: 'Medium', explanation: 'Source record does not contain an invoice reference.', transactionIds: [t.id] });
      return items;
    }, []);
    update((current) => ({ ...current, gstChecks: [...current.gstChecks.filter((c) => !c.id.startsWith('rerun-')), ...generated] }), { action: 'Reran illustrative GST checks', record: 'gst-review' });
    notify('Illustrative checks rerun. No rates, legal rules or filing outputs were applied.');
  };
  const markCheckReviewed = (check) => {
    update((current) => ({ ...current, gstChecks: current.gstChecks.map((item) => item.id === check.id ? { ...item, status: 'Reviewed' } : item) }), { action: 'Marked illustrative GST check reviewed', record: check.id, by: 'Riley Chen' });
    notify('Check marked reviewed. This does not confirm a tax treatment.');
  };
  return <>
    {heading('Review workspace · illustrative only', 'GST review', 'Jurisdiction and tax rules are not configured. No tax return preparation or filing.', <button className="button button-primary" onClick={rerun}><RefreshCw size={15} /> Re-run checks</button>)}
    <div className="notice notice-info"><Info size={17} /><span><strong>Confirm before relying on any result.</strong> This demo does not assume a country, rate, return name or legal obligation. All checks require professional review.</span></div>
    <div className="kpi-grid four-kpi"><KPI label="Transactions in register" value={state.transactions.length} helper="Fictional source rows" icon={Wallet} /><KPI label="GST amount recorded" value={money(getTransactionGSTTotal(state.transactions), getActiveEngagement(state)?.currency)} helper="Illustrative total only" icon={ArrowDownRight} tone="blue" /><KPI label="Open illustrative checks" value={state.gstChecks.filter((item) => item.status !== 'Reviewed').length} helper="Not compliance findings" icon={AlertTriangle} tone="amber" /><KPI label="Jurisdiction" value="Not configured" helper="Confirm with accounting lead" icon={Info} tone="purple" /></div>
    <Card><div className="section-tabs"><button className="tab-active">Exceptions <span>{state.gstChecks.filter((item) => item.status !== 'Reviewed').length}</span></button><button onClick={() => document.getElementById('gst-transactions')?.scrollIntoView({ behavior: 'smooth' })}>Transactions <span>{state.transactions.length}</span></button></div><div className="toolbar"><label className="search-input"><Search size={16} /><input placeholder="Search checks or transactions..." value={query} onChange={(e) => setQuery(e.target.value)} /></label><select value={severity} onChange={(e) => setSeverity(e.target.value)}><option>All severities</option>{['High', 'Medium', 'Low'].map((v) => <option key={v}>{v}</option>)}</select><span className="toolbar-count">{checks.length} checks</span></div>
      <div className="exception-list">{checks.map((check) => <details className="exception-item" key={check.id}><summary><span className={`severity-mark severity-${check.severity.toLowerCase()}`} /><span className="exception-main"><strong>{check.title}</strong><small>{check.explanation}</small></span>{check.status === 'Reviewed' && <StatusBadge status="Reviewed" />}<Badge tone={check.severity === 'High' ? 'red' : check.severity === 'Medium' ? 'amber' : 'neutral'}>{check.severity}</Badge><ArrowRight className="exception-chevron" size={16} /></summary><div className="exception-detail"><strong>Evidence / records</strong><p>{check.transactionIds.length ? check.transactionIds.map((id) => state.transactions.find((t) => t.id === id)?.reference || id).join(', ') : 'No transaction rows linked.'}</p>{check.id === 'gst-6' && gstDifference && <p className="derived-evidence">Illustrative arithmetic only: source account {gstDifference.accountId} ledger net {money(gstDifference.ledgerBalance, getActiveEngagement(state)?.currency)} less recorded GST amounts across {state.transactions.length} register rows ({money(gstDifference.registerTotal, getActiveEngagement(state)?.currency)}) = {money(gstDifference.difference, getActiveEngagement(state)?.currency)}. This is not a tax reconciliation conclusion.</p>}<span>Suggested follow-up: Confirm source evidence and applicable treatment with the reviewer.</span><div className="exception-actions"><button className="button button-small" onClick={() => markCheckReviewed(check)} disabled={check.status === 'Reviewed'}>{check.status === 'Reviewed' ? 'Reviewed' : 'Mark reviewed'}</button><span>Review status is not a tax conclusion.</span></div></div></details>)}</div>
    </Card>
    <Card id="gst-transactions"><div className="card-heading"><div><h2>Transaction register</h2><p>Fictional register data. Amounts are source values.</p></div><button className="button button-small" onClick={() => downloadCsv('zephyr-gst-register.csv', transactions, [{ key: 'date', label: 'Date' }, { key: 'reference', label: 'Reference' }, { key: 'counterparty', label: 'Counterparty' }, { key: 'net', label: 'Net' }, { key: 'taxCode', label: 'Tax code' }, { key: 'gstAmount', label: 'GST amount' }, { key: 'gross', label: 'Gross' }, { key: 'sourceRow', label: 'Source row' }])}><Download size={14} /> Export CSV</button></div><div className="toolbar"><label className="search-input"><Search size={16} /><input placeholder="Filter register..." value={query} onChange={(e) => setQuery(e.target.value)} /></label><select value={kind} onChange={(e) => setKind(e.target.value)}><option>All transactions</option><option>Sales</option><option>Purchase</option></select><span className="toolbar-count">{transactions.length} records</span></div><Table columns={[
      { key: 'date', label: 'Date' }, { key: 'reference', label: 'Reference', render: (r) => r.reference || <Badge tone="red">Missing</Badge> }, { key: 'counterparty', label: 'Counterparty' }, { key: 'net', label: 'Net', render: (r) => money(r.net, getActiveEngagement(state)?.currency) }, { key: 'taxCode', label: 'Tax code', render: (r) => r.taxCode || <Badge tone="amber">Missing</Badge> }, { key: 'gstAmount', label: 'GST amount', render: (r) => money(r.gstAmount, getActiveEngagement(state)?.currency) }, { key: 'gross', label: 'Gross', render: (r) => money(r.gross, getActiveEngagement(state)?.currency) }, { key: 'account', label: 'Source account', render: (r) => state.accounts.find((a) => a.id === r.accountId)?.code || '—' }, { key: 'sourceRow', label: 'Source row' },
    ]} rows={transactions} /></Card>
  </>;
}

export function StandardsReview() {
  const { state, update, notify } = useApp();
  const [query, setQuery] = useState(''); const [filter, setFilter] = useState('All statuses'); const [editId, setEditId] = useState('');
  const findings = state.reviewFindings.filter((f) => `${f.topic} ${f.owner} ${f.status}`.toLowerCase().includes(query.toLowerCase()) && (filter === 'All statuses' || f.status === filter));
  const save = (id, values) => {
    update((current) => ({ ...current, reviewFindings: current.reviewFindings.map((finding) => finding.id === id ? { ...finding, ...values } : finding) }), { action: 'Updated reporting review finding', record: id, by: 'Riley Chen' });
    setEditId(''); notify('Review item updated locally.');
  };
  return <>
    {heading('Human-led review', 'Financial reporting review', 'Checklist prompts only — confirm the applicable framework, version and relevance with the accounting lead.', <Link className="button" to="/settings"><Settings2 size={15} /> Configure framework</Link>)}
    <div className="notice notice-warning"><AlertTriangle size={17} /><span><strong>Framework: {getActiveEngagement(state)?.framework || 'Not configured — confirm with accounting lead.'}</strong><br />Topics are prompts, not conclusions that every item applies. No paragraph references are generated.</span></div>
    <Card><div className="toolbar"><label className="search-input"><Search size={16} /><input placeholder="Search review topics..." value={query} onChange={(e) => setQuery(e.target.value)} /></label><select value={filter} onChange={(e) => setFilter(e.target.value)}><option>All statuses</option>{['Open', 'In progress', 'Complete', 'Not applicable'].map((s) => <option key={s}>{s}</option>)}</select><span className="toolbar-count">{findings.length} prompts</span></div>
      <div className="review-list">{findings.map((finding) => <div className="review-card" key={finding.id}><div className="review-card-head"><div><StatusBadge status={finding.status} /> <Badge tone={finding.priority === 'High' ? 'red' : finding.priority === 'Medium' ? 'amber' : 'neutral'}>{finding.priority} priority</Badge></div><button className="button button-small" onClick={() => setEditId(editId === finding.id ? '' : finding.id)}>{editId === finding.id ? 'Close' : 'Review item'}</button></div><h3>{finding.topic}</h3><p className="review-evidence">{finding.evidence || 'Evidence not yet linked'}{finding.scheduleId && <> · <Link to="/schedules">{scheduleName(state, finding.scheduleId)}</Link></>}</p><div className="ai-suggestion"><Sparkles size={15} /><span><strong>Mock AI suggestion — review required.</strong> {finding.suggestion.replace('Mock AI response — professional review required. ', '')}</span></div>{finding.note && <p className="review-note"><MessageSquare size={14} /> {finding.note}</p>}
        {editId === finding.id && <FindingEditor finding={finding} onSave={(values) => save(finding.id, values)} />}
      </div>)}</div>
    </Card>
  </>;
}

function FindingEditor({ finding, onSave }) {
  const [status, setStatus] = useState(finding.status); const [comment, setComment] = useState(finding.note); const [owner, setOwner] = useState(finding.owner); const [due, setDue] = useState(finding.dueDate); const [evidence, setEvidence] = useState(finding.evidence); const [decision, setDecision] = useState(finding.suggestionDecision || 'Unreviewed');
  return <div className="finding-editor"><div className="form-grid"><Field label="Status"><select value={status} onChange={(e) => setStatus(e.target.value)}>{['Open', 'In progress', 'Complete', 'Not applicable'].map((x) => <option key={x}>{x}</option>)}</select></Field><Field label="Suggestion review"><select value={decision} onChange={(e) => setDecision(e.target.value)}>{['Unreviewed', 'Accepted', 'Rejected', 'Edit required', 'Evidence requested'].map((x) => <option key={x}>{x}</option>)}</select></Field><Field label="Owner"><input value={owner} onChange={(e) => setOwner(e.target.value)} /></Field><Field label="Due date"><input type="date" value={due} onChange={(e) => setDue(e.target.value)} /></Field><Field label="Evidence / source"><input value={evidence} onChange={(e) => setEvidence(e.target.value)} placeholder="Link schedule, account or record" /></Field><Field label="Reviewer note"><textarea rows="2" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Reviewer comment" /></Field></div><div className="editor-actions"><button className="button button-primary button-small" onClick={() => onSave({ status, note: comment, owner, dueDate: due, evidence, suggestionDecision: decision })}>Save reviewer update</button><span className="muted">Suggestions do not change accounting records and require professional judgement.</span></div></div>;
}

const prompts = ['Summarize open review points', 'Explain bank reconciliation variance', 'Draft a schedule note', 'Generate reviewer questions for GST exceptions', 'Summarize engagement for report'];
function makeMockAnswer(prompt, state) {
  const open = getOpenFindings(state.reviewFindings);
  const balance = getTrialBalanceTotals(state.accounts);
  const cash = state.schedules.find((s) => s.id === 'cash-bank');
  if (prompt.toLowerCase().includes('review point')) return `There are ${open.length} open checklist prompts. Highest-priority items include ${open.filter((f) => f.priority === 'High').map((f) => f.topic.toLowerCase()).slice(0, 3).join(', ') || 'none currently flagged high'}. Confirm applicability and evidence with the reviewer; no finding is a conclusion.`;
  if (prompt.toLowerCase().includes('bank')) return `The cash & bank schedule currently derives ${money(getScheduleBalance(cash, state.accounts).closing, getActiveEngagement(state)?.currency)} from linked trial-balance rows, with a ${cash.status.toLowerCase()} status. Bank reconciliation evidence is not included in this demo. The trial balance difference is ${money(balance.difference, getActiveEngagement(state)?.currency)}.`;
  if (prompt.toLowerCase().includes('gst')) return `Reviewer questions: Is the jurisdiction configured? Can the missing tax codes and invoice reference be substantiated? Are the two INV-1011 records distinct? What evidence supports the recorded GST amount? Reconcile the GST control. These are questions only; no rate or return rule is assumed.`;
  if (prompt.toLowerCase().includes('report')) return `The active engagement has ${state.schedules.length} schedules, ${open.length} open review prompts and ${state.gstChecks.length} illustrative GST checks. The compilation report remains draft-only; confirm scope, framework, jurisdiction, unresolved matters and report wording before any professional use.`;
  return `Draft note: The schedule balance is derived from linked source account rows. Document the source evidence, assumptions, period movement and outstanding reviewer questions. Verify the figures against original records before use.`;
}

export function AIAssistant() {
  const { state } = useApp();
  const [input, setInput] = useState(''); const [messages, setMessages] = useState([]);
  const ask = (prompt) => {
    if (!prompt.trim()) return;
    const answer = makeMockAnswer(prompt, state);
    const sourceLinks = prompt.toLowerCase().includes('gst') ? ['/gst-review', '/trial-balance'] : prompt.toLowerCase().includes('review') ? ['/standards-review'] : ['/schedules', '/trial-balance'];
    setMessages((current) => [...current, { id: Date.now(), prompt, answer, sourceLinks }]); setInput('');
  };
  return <>
    {heading('Deterministic demo · no model connection', 'AI assistant', 'Explore current demo records with deterministic mock responses. Nothing is changed automatically.', <Badge tone="teal"><Bot size={14} /> MOCK AI ONLY</Badge>)}
    <div className="assistant-layout"><Card className="assistant-chat"><div className="chat-header"><div className="bot-avatar"><Bot size={19} /></div><div><strong>Zephyr assistant</strong><span>Grounded in current fictional records</span></div><span className="online-status">MOCK</span></div>
      <div className="chat-messages">{messages.length === 0 ? <div className="chat-welcome"><div className="welcome-spark"><Sparkles size={21} /></div><h2>What would you like to review?</h2><p>Choose a prompt or ask about the current engagement. Responses are deterministic demo text.</p><div className="prompt-grid">{prompts.map((prompt) => <button key={prompt} onClick={() => ask(prompt)}>{prompt}<ArrowRight size={14} /></button>)}</div></div> : messages.map((message) => <div className="message-pair" key={message.id}><div className="user-message">{message.prompt}</div><div className="mock-response"><div className="response-label"><Sparkles size={14} /> Mock AI response — professional review required.</div><p>{message.answer}</p><div className="source-links">Sources: {message.sourceLinks.map((to) => <Link key={to} to={to}>{to.slice(1).replaceAll('-', ' ')}</Link>)}</div></div></div>)}</div>
      <form className="chat-input" onSubmit={(e) => { e.preventDefault(); ask(input); }}><input aria-label="Ask the mock assistant" placeholder="Ask about your current engagement..." value={input} onChange={(e) => setInput(e.target.value)} /><button className="button button-primary" type="submit" disabled={!input.trim()}><Send size={15} /> Ask</button></form>
    </Card><aside className="assistant-side"><Card><h3>What this assistant can do</h3><p>Generate deterministic summaries and review prompts from the active fictional records.</p><ul><li>No real AI provider is called</li><li>Does not modify accounting records</li><li>Every response requires professional review</li></ul></Card><Card><h3>Active sources</h3><div className="source-card"><Wallet size={16} /> Trial balance <span>{state.accounts.length}</span></div><div className="source-card"><ClipboardMark /> Schedules <span>{state.schedules.length}</span></div><div className="source-card"><AlertTriangle size={16} /> Review prompts <span>{getOpenFindings(state.reviewFindings).length}</span></div></Card></aside></div>
  </>;
}
function ClipboardMark() { return <CheckCircle2 size={16} />; }

const reportLabels = { scope: 'Engagement scope and source', statements: 'Included statements / schedules', unresolved: 'Unresolved matters', management: 'Management-provided information', reviewNotes: 'Professional review notes and limitations' };
export function CompilationReport() {
  const { state, update, notify } = useApp();
  const [sections, setSections] = useState(state.draft.sections);
  const [saved, setSaved] = useState(true);
  const saveDraft = () => {
    update((current) => ({ ...current, draft: { ...current.draft, sections, revisionHistory: [{ at: new Date().toISOString(), by: 'Morgan Lee', action: 'Draft sections saved' }, ...current.draft.revisionHistory] } }), { action: 'Saved compilation report draft', record: state.draft.id });
    setSaved(true); notify('Draft saved locally. It remains unsigned and unfiled.');
  };
  const change = (key, value) => { setSections((current) => ({ ...current, [key]: value })); setSaved(false); };
  return <>
    {heading('Draft document', 'Compilation report', 'Editable working draft only. Confirm applicable format and all wording with the responsible professional.', <div className="button-row"><button className="button" onClick={() => window.print()}><Printer size={15} /> Print / Save PDF</button><button className="button button-primary" onClick={saveDraft}><Check size={15} /> Save draft</button></div>)}
    <div className="notice notice-warning"><AlertTriangle size={17} /><span><strong>DRAFT — DEMO ONLY — NOT SIGNED OR FILED.</strong> This is not a statutory report format and does not indicate approval, filing or legal compliance.</span></div>
    <div className="report-layout"><Card className="report-paper"><div className="report-watermark">DEMO DRAFT</div><div className="report-brand">{state.settings.companyName}</div><div className="report-overline">COMPILATION REPORT · DRAFT ONLY</div><h2>{clientName(state, getActiveEngagement(state)?.clientId)}</h2><p className="report-period">{getActiveEngagement(state)?.entityType} · {getActiveEngagement(state)?.period}</p><div className="report-rule" />
      {Object.entries(reportLabels).map(([key, label]) => <section className="report-section" key={key}><h3>{label}</h3><textarea aria-label={label} value={sections[key] || ''} onChange={(e) => change(key, e.target.value)} rows={key === 'statements' || key === 'unresolved' ? 3 : 4} /></section>)}
      <div className="report-meta"><div><small>Preparer</small><strong>{getActiveEngagement(state)?.preparer}</strong></div><div><small>Reviewer</small><strong>{getActiveEngagement(state)?.reviewer}</strong></div><div><small>Framework / version</small><strong>{getActiveEngagement(state)?.framework || 'Not configured'}</strong></div><div><small>Jurisdiction</small><strong>{getActiveEngagement(state)?.gstJurisdiction || 'Not configured'}</strong></div></div><div className="report-footer">DRAFT — DEMO ONLY — NOT SIGNED OR FILED</div>
    </Card><aside className="report-sidebar"><Card><h3>Approval checklist</h3>{['Scope confirmed', 'Source information reviewed', 'Framework and format confirmed', 'Unresolved matters addressed', 'Reviewer approval recorded'].map((label, i) => <label className="checklist-row" key={label}><input type="checkbox" defaultChecked={false} />{label}{i === 2 && <Badge tone="amber">Required</Badge>}</label>)}<p className="muted small">Checklist selections are not approval or sign-off.</p></Card><Card><div className="card-heading"><h3>Revision history</h3>{!saved && <Badge tone="amber">Unsaved</Badge>}</div><div className="revision-list">{state.draft.revisionHistory.slice(0, 5).map((entry, index) => <div key={`${entry.at}-${index}`}><i /><span><strong>{entry.action}</strong><small>{entry.by} · {new Date(entry.at).toLocaleString()}</small></span></div>)}</div></Card><Card><h3>CSV schedule summary</h3><p>Export derived schedule balances for review. Values link to source trial-balance accounts.</p><button className="button button-full" onClick={() => downloadCsv('zephyr-schedule-summary.csv', state.schedules.map((s) => ({ schedule: s.name, opening: getScheduleBalance(s, state.accounts).opening, movements: getScheduleBalance(s, state.accounts).movements, closing: getScheduleBalance(s, state.accounts).closing, status: s.status })), [{ key: 'schedule', label: 'Schedule' }, { key: 'opening', label: 'Opening balance' }, { key: 'movements', label: 'Movements' }, { key: 'closing', label: 'Closing balance' }, { key: 'status', label: 'Status' }])}><Download size={15} /> Export schedule CSV</button></Card></aside></div>
  </>;
}

export function Reports() {
  const { state } = useApp();
  const [filter, setFilter] = useState('All');
  const [tab, setTab] = useState('Engagement status');
  const rows = tab === 'Engagement status' ? state.engagements.map((e) => ({ id: e.id, client: clientName(state, e.clientId), period: e.period, status: e.status, completion: `${engagementProgress(state)}%` })) : tab === 'Schedule completion' ? state.schedules.map((s) => ({ id: s.id, client: s.name, period: getActiveEngagement(state)?.period, status: s.status, completion: ['Prepared', 'Reviewed'].includes(s.status) ? '100%' : s.status === 'In review' ? '55%' : '0%' })) : tab === 'GST exceptions' ? state.gstChecks.map((c) => ({ id: c.id, client: c.title, period: c.explanation, status: c.severity, completion: `${c.transactionIds.length} records` })) : tab === 'Reporting review' ? state.reviewFindings.map((f) => ({ id: f.id, client: f.topic, period: `${f.priority} priority · ${f.owner}`, status: f.status, completion: f.evidence || 'Evidence not linked' })) : state.schedules.map((s) => { const calc = getScheduleBalance(s, state.accounts); return { id: s.id, client: s.name, period: money(calc.movements, getActiveEngagement(state)?.currency), status: s.status, completion: money(calc.closing, getActiveEngagement(state)?.currency) }; });
  const currentRows = rows.filter((row) => filter === 'All' || row.status === filter);
  const exportCurrent = () => downloadCsv(`zephyr-${tab.toLowerCase().replaceAll(' ', '-')}.csv`, currentRows, [{ key: 'client', label: tab === 'Engagement status' ? 'Client' : 'Record' }, { key: 'period', label: tab === 'Engagement status' ? 'Reporting period' : 'Details' }, { key: 'status', label: 'Status / severity' }, { key: 'completion', label: 'Progress / balance' }]);
  return <>
    {heading('Workspace analytics', 'Reports & exports', 'Print-friendly views and CSV exports from current demo state.', <button className="button button-primary" onClick={() => window.print()}><Printer size={15} /> Print report view</button>)}
    <Card><div className="section-tabs">{['Engagement status', 'Schedule completion', 'GST exceptions', 'Reporting review', 'Trial balance summary'].map((t) => <button key={t} className={tab === t ? 'tab-active' : ''} onClick={() => setTab(t)}>{t}</button>)}</div><div className="toolbar"><label className="toolbar-filter"><Filter size={15} /> Filter report <select aria-label="Filter report status" value={filter} onChange={(e) => setFilter(e.target.value)}><option>All</option>{[...new Set(rows.map((row) => row.status))].map((s) => <option key={s}>{s}</option>)}</select></label><button className="button button-small" onClick={exportCurrent}><Download size={14} /> Export current view</button><span className="toolbar-count">{currentRows.length} rows</span></div><Table columns={[{ key: 'client', label: tab === 'Engagement status' ? 'Client' : 'Record' }, { key: 'period', label: tab === 'Engagement status' ? 'Reporting period' : 'Details' }, { key: 'status', label: 'Status / severity' }, { key: 'completion', label: 'Progress / balance' }]} rows={currentRows} /></Card>
    <div className="notice notice-info"><Info size={17} /><span>Exports contain fictional demo records. No report implies compliance, approval or filing.</span></div>
  </>;
}

export function Settings() {
  const { state, update, notify, reset } = useApp();
  const [form, setForm] = useState(state.settings);
  const save = (event) => {
    event.preventDefault();
    update((current) => ({ ...current, settings: form, engagements: current.engagements.map((e) => e.id === current.activeEngagementId ? { ...e, currency: form.currency, gstJurisdiction: form.gstJurisdiction, framework: form.framework } : e) }), { action: 'Updated demo settings', record: 'settings' });
    notify('Settings saved to this browser.');
  };
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const resetData = () => { if (window.confirm('Reset all local demo changes and restore the fictional seed data? This cannot be undone.')) reset(); };
  return <>
    {heading('Workspace configuration', 'Settings', 'Local demo preferences and configurable accounting context. No external services are connected.')}
    <div className="settings-grid"><Card><div className="card-heading"><div><h2>Company & reporting defaults</h2><p>Saved locally in this browser</p></div></div><form onSubmit={save} className="settings-form"><Field label="Company display name"><input value={form.companyName} onChange={(e) => set('companyName', e.target.value)} /></Field><Field label="Default currency"><select value={form.currency} onChange={(e) => set('currency', e.target.value)}>{['AUD', 'NZD', 'USD', 'GBP', 'CAD', 'Other'].map((v) => <option key={v}>{v}</option>)}</select></Field><Field label="Date format"><select value={form.dateFormat} onChange={(e) => set('dateFormat', e.target.value)}>{['DD MMM YYYY', 'YYYY-MM-DD', 'MM/DD/YYYY'].map((v) => <option key={v}>{v}</option>)}</select></Field><Field label="GST jurisdiction placeholder"><input value={form.gstJurisdiction} onChange={(e) => set('gstJurisdiction', e.target.value)} placeholder="Not configured" /></Field><Field label="Financial reporting framework / version"><input value={form.framework} onChange={(e) => set('framework', e.target.value)} placeholder="Not configured" /></Field><label className="toggle-row"><span><strong>Review notifications</strong><small>Show in-app reminders for open review items.</small></span><input type="checkbox" checked={form.notifications} onChange={(e) => set('notifications', e.target.checked)} /></label><div className="form-actions"><button className="button button-primary" type="submit">Save settings</button></div></form></Card>
      <aside><Card><h3>Demo data management</h3><p>All records are fictional and stored only in this browser’s local storage.</p><div className="settings-stat"><span>Last updated</span><strong>{new Date(state.lastUpdated || Date.now()).toLocaleString()}</strong></div><div className="settings-stat"><span>Storage</span><strong>Browser localStorage</strong></div><button className="button button-danger button-full" onClick={resetData}><RefreshCw size={15} /> Reset demo data</button></Card><Card><h3>Not connected</h3><p>This proof of concept does not connect to an accounting package, AI provider, tax authority, email or document storage.</p><Badge tone="teal">FRONTEND ONLY</Badge></Card></aside>
    </div>
  </>;
}
