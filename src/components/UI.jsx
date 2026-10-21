import React from 'react';
import { AlertCircle, Check, X } from 'lucide-react';

export function Badge({ children, tone = 'neutral' }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

export function Card({ children, className = '', ...props }) {
  return <section className={`card ${className}`} {...props}>{children}</section>;
}

export function PageHeading({ eyebrow, title, description, actions }) {
  return <div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1>{description && <p>{description}</p>}</div>{actions && <div className="heading-actions">{actions}</div>}</div>;
}

export function KPI({ label, value, helper, icon: Icon, tone = 'teal' }) {
  return <Card className="kpi"><div className={`kpi-icon ${tone}`}>{Icon && <Icon size={19} />}</div><div className="kpi-label">{label}</div><div className="kpi-value">{value}</div>{helper && <div className="kpi-helper">{helper}</div>}</Card>;
}

export function EmptyState({ title, text }) {
  return <div className="empty-state"><AlertCircle size={22} /><strong>{title}</strong><span>{text}</span></div>;
}

export function Toast({ toast, onClose }) {
  if (!toast) return null;
  return <div className={`toast toast-${toast.tone}`} role="status"><Check size={17} />{toast.message}<button aria-label="Dismiss notification" onClick={onClose}><X size={16} /></button></div>;
}

export function Field({ label, children, ...props }) {
  return <label className="field"><span>{label}</span>{children || <input {...props} />}</label>;
}

export function StatusBadge({ status }) {
  const tone = ['Reviewed', 'Complete', 'Ready for review'].includes(status) ? 'green' : ['Open', 'High'].includes(status) ? 'red' : ['In progress', 'Prepared', 'Medium'].includes(status) ? 'amber' : 'neutral';
  return <Badge tone={tone}>{status}</Badge>;
}

export function Modal({ title, children, onClose, footer }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-head"><h2 id="modal-title">{title}</h2><button className="icon-button" aria-label="Close dialog" onClick={onClose}><X size={18} /></button></div>
      <div className="modal-body">{children}</div>{footer && <div className="modal-foot">{footer}</div>}
    </section>
  </div>;
}

export function Table({ columns, rows, onRowClick, empty = 'No records match your filters.' }) {
  if (!rows.length) return <EmptyState title="Nothing here yet" text={empty} />;
  return <div className="table-wrap"><table><thead><tr>{columns.map((column) => <th key={column.key}>{column.label}</th>)}</tr></thead><tbody>{rows.map((row) => <tr key={row.id} onClick={onRowClick ? () => onRowClick(row) : undefined} className={onRowClick ? 'clickable-row' : ''}>{columns.map((column) => <td key={column.key}>{column.render ? column.render(row) : row[column.key]}</td>)}</tr>)}</tbody></table></div>;
}
