import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Activity, Bell, Bot, BriefcaseBusiness, ChartNoAxesCombined, ChevronDown, ClipboardCheck, FileCheck2, FileText, LayoutDashboard, Menu, Search, Settings, ShieldCheck, WalletCards, X } from 'lucide-react';
import { useApp } from '../services/AppContext.jsx';
import { Toast } from '../components/UI.jsx';

const nav = [
  { label: 'Workspace', items: [
    ['Dashboard', '/dashboard', LayoutDashboard], ['Engagements', '/engagements', BriefcaseBusiness], ['Trial balance', '/trial-balance', WalletCards], ['Schedules', '/schedules', ClipboardCheck],
  ] },
  { label: 'Review', items: [
    ['GST review', '/gst-review', ShieldCheck], ['Standards review', '/standards-review', FileCheck2], ['AI assistant', '/ai-assistant', Bot],
  ] },
  { label: 'Deliver', items: [
    ['Compilation report', '/compilation-report', FileText], ['Reports & exports', '/reports', ChartNoAxesCombined],
  ] },
];

export default function AppLayout() {
  const { state, update, toast, setToast, notify } = useApp();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const location = useLocation();
  const engagement = state.engagements.find((item) => item.id === state.activeEngagementId) || state.engagements[0];
  const client = state.clients.find((item) => item.id === engagement?.clientId);
  const label = location.pathname === '/' ? 'Dashboard' : location.pathname.split('/').filter(Boolean).at(-1).replaceAll('-', ' ');
  return <div className="app-shell">
    <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
      <div className="brand"><div className="brand-mark">Z</div><div><strong>zephyr</strong><span>ACCOUNTING STUDIO</span></div><button className="mobile-close icon-button" onClick={() => setMobileOpen(false)} aria-label="Close navigation"><X size={18} /></button></div>
      <div className="workspace-card"><span className="workspace-avatar">{(client?.name || 'A').charAt(0)}</span><div><strong>{client?.name || 'Select client'}</strong><span>{engagement?.period || 'No active period'}</span></div><ChevronDown size={15} /></div>
      <nav aria-label="Main navigation">{nav.map((group) => <div className="nav-group" key={group.label}><div className="nav-group-label">{group.label}</div>{group.items.map(([title, to, Icon]) => <NavLink key={to} to={to} onClick={() => setMobileOpen(false)} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}><Icon size={17} /><span>{title}</span></NavLink>)}</div>)}</nav>
      <div className="sidebar-bottom"><NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/settings"><Settings size={17} /><span>Settings</span></NavLink><div className="sidebar-user"><span className="profile-avatar">ML</span><div><strong>Morgan Lee</strong><span>Demo preparer</span></div><Activity size={16} /></div></div>
    </aside>
    {mobileOpen && <button className="sidebar-scrim" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}
    <main className="main-shell">
      <header className="topbar"><button className="mobile-menu icon-button" aria-label="Open navigation" onClick={() => setMobileOpen(true)}><Menu size={20} /></button><div className="crumb"><span>Workspace</span><span>/</span><strong>{label.charAt(0).toUpperCase() + label.slice(1)}</strong></div><div className="topbar-tools"><label className="global-search"><Search size={16} /><input aria-label="Search workspace" placeholder="Search anything..." onKeyDown={(event) => { if (event.key === 'Enter' && event.currentTarget.value) window.location.href = `/engagements?search=${encodeURIComponent(event.currentTarget.value)}`; }} /><kbd>⌘ K</kbd></label><select className="period-select" aria-label="Active engagement and reporting period" value={engagement?.id || ''} onChange={(event) => update({ activeEngagementId: event.target.value })}>{state.engagements.map((item) => <option key={item.id} value={item.id}>{item.period}</option>)}</select><button className="icon-button notification-button" aria-label="Show review notifications" onClick={() => notify(`${state.reviewFindings.filter((item) => !['Complete', 'Not applicable'].includes(item.status)).length} open review points need attention.`, 'info')}><Bell size={17} /><i /></button><span className="demo-pill">DEMO MODE · FICTIONAL DATA · NOT FOR FILING</span><span className="profile-avatar top-profile" title="Demo preparer profile">ML</span></div></header>
      <div className="content-area"><Outlet /></div>
    </main>
    <Toast toast={toast} onClose={() => setToast(null)} />
  </div>;
}
