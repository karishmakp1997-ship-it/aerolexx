import { useCallback, useEffect, useMemo, useState } from 'react';
import { Download, Eye, Inbox, Mail, Pencil, Phone, Plus, Search, Trash2 } from 'lucide-react';
import { api } from '../api.js';
import { ConfirmDialog, Dialog, Drawer, Field, Loading, STATUS_OPTIONS, StatusChip, formatDateTime, useToast } from './ui.jsx';

const EMPTY = { full_name: '', company: '', email: '', phone: '', service: '', message: '', status: 'new', admin_notes: '' };

function toCsv(rows) {
  const cols = ['id', 'created_at', 'status', 'full_name', 'company', 'email', 'phone', 'service', 'message', 'admin_notes'];
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  return [cols.join(','), ...rows.map((r) => cols.map((c) => esc(r[c])).join(','))].join('\r\n');
}

export default function EnquiriesPage({ onChange }) {
  const toast = useToast();
  const [rows, setRows] = useState(null);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('all');
  const [viewing, setViewing] = useState(null);
  const [editing, setEditing] = useState(null);
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [deleting, setDeleting] = useState(null);
  const [saving, setSaving] = useState(false);
  const [services, setServices] = useState([]);

  const load = useCallback(async () => {
    try {
      const data = await api('/api/admin/enquiries');
      setRows(data);
      onChange?.(data.filter((r) => r.status === 'new').length);
    } catch (e) { toast(e.message, 'error'); setRows([]); }
  }, [toast, onChange]);

  useEffect(() => { load(); api('/api/admin/services').then(setServices).catch(() => {}); }, [load]);

  const filtered = useMemo(() => {
    if (!rows) return [];
    const term = q.trim().toLowerCase();
    return rows.filter((r) => (status === 'all' || r.status === status)
      && (!term || [r.full_name, r.company, r.email, r.phone, r.service, r.message].some((v) => String(v || '').toLowerCase().includes(term))));
  }, [rows, q, status]);

  if (!rows) return <Loading />;

  const counts = rows.reduce((a, r) => ({ ...a, [r.status]: (a[r.status] || 0) + 1 }), {});

  const updateStatus = async (r, st) => {
    try {
      const updated = await api(`/api/admin/enquiries/${r.id}`, { method: 'PUT', body: { status: st } });
      setRows((rs) => rs.map((x) => (x.id === r.id ? updated : x)));
      if (viewing?.id === r.id) setViewing(updated);
      onChange?.(rows.map((x) => (x.id === r.id ? updated : x)).filter((x) => x.status === 'new').length);
      toast('Status updated');
    } catch (e) { toast(e.message, 'error'); }
  };

  const openView = (r) => {
    setViewing(r);
    if (r.status === 'new') updateStatus(r, 'in_progress');
  };

  const openForm = (r) => { setErrors({}); setValues(r === 'new' ? EMPTY : { ...EMPTY, ...Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v ?? ''])) }); setEditing(r); };

  const save = async (e) => {
    e?.preventDefault();
    const er = {};
    if (!values.full_name.trim()) er.full_name = 'Name is required';
    if (!values.email.trim()) er.email = 'Email is required';
    setErrors(er);
    if (Object.keys(er).length) return;
    const body = Object.fromEntries(Object.keys(EMPTY).map((k) => [k, values[k]]));
    setSaving(true);
    try {
      if (editing === 'new') await api('/api/admin/enquiries', { method: 'POST', body });
      else await api(`/api/admin/enquiries/${editing.id}`, { method: 'PUT', body });
      toast(editing === 'new' ? 'Enquiry added' : 'Enquiry updated');
      setEditing(null);
      load();
    } catch (err) {
      if (err.field) setErrors({ [err.field]: err.message });
      toast(err.message, 'error');
    } finally { setSaving(false); }
  };

  const remove = async () => {
    try {
      await api(`/api/admin/enquiries/${deleting.id}`, { method: 'DELETE' });
      toast('Enquiry deleted');
      setDeleting(null);
      setViewing(null);
      load();
    } catch (e) { toast(e.message, 'error'); }
  };

  const exportCsv = () => {
    const blob = new Blob([`﻿${toCsv(filtered)}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aerolex-enquiries-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e.target.value }));

  return (
    <>
      <div className="adm-page-head">
        <div>
          <h1>Enquiries</h1>
          <p>Messages sent from the website contact form and “Enquire Service” buttons.</p>
        </div>
        <div className="adm-actions">
          <button className="abtn" onClick={exportCsv} disabled={!filtered.length}><Download size={16} /> Export CSV</button>
          <button className="abtn abtn-primary" onClick={() => openForm('new')}><Plus size={17} /> Add enquiry</button>
        </div>
      </div>

      <div className="adm-card">
        <div className="adm-toolbar">
          <div className="adm-search">
            <Search size={16} />
            <input type="search" placeholder="Search name, company, email, service…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ width: 'auto', minWidth: 170 }} aria-label="Filter by status">
            <option value="all">All statuses ({rows.length})</option>
            {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label} ({counts[o.value] || 0})</option>)}
          </select>
        </div>
        {filtered.length === 0 ? (
          <div className="adm-empty"><Inbox size={36} /><p>{rows.length ? 'No enquiries match these filters.' : 'No enquiries yet.'}</p></div>
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr><th>Contact</th><th>Service</th><th>Message</th><th>Status</th><th>Received</th><th style={{ textAlign: 'right' }}>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} style={r.status === 'new' ? { background: '#fffafa' } : undefined}>
                    <td>
                      <div className="t-main">{r.full_name}</div>
                      <div className="t-sub">{[r.company, r.email].filter(Boolean).join(' · ')}</div>
                    </td>
                    <td>{r.service || '—'}</td>
                    <td><div className="t-sub" style={{ marginTop: 0, maxWidth: 260 }}>{r.message || '—'}</div></td>
                    <td>
                      <select value={r.status} onChange={(e) => updateStatus(r, e.target.value)} style={{ height: 34, width: 'auto', fontSize: 13 }} aria-label={`Status for ${r.full_name}`}>
                        {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>{formatDateTime(r.created_at)}</td>
                    <td className="t-actions">
                      <button className="abtn abtn-sm" onClick={() => openView(r)}><Eye size={15} /> View</button>
                      <button className="abtn abtn-sm" onClick={() => openForm(r)} aria-label="Edit"><Pencil size={15} /></button>
                      <button className="abtn abtn-sm abtn-danger" onClick={() => setDeleting(r)} aria-label="Delete"><Trash2 size={15} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {viewing && (
        <Dialog
          wide
          title={`Enquiry from ${viewing.full_name}`}
          onClose={() => setViewing(null)}
          actions={(
            <>
              <button className="abtn abtn-danger" onClick={() => setDeleting(viewing)}><Trash2 size={15} /> Delete</button>
              <a className="abtn" href={`mailto:${viewing.email}?subject=${encodeURIComponent(`Re: Your enquiry${viewing.service ? ` — ${viewing.service}` : ''}`)}`}><Mail size={15} /> Reply by email</a>
              <button className="abtn abtn-primary" onClick={() => { const r = viewing; setViewing(null); openForm(r); }}><Pencil size={15} /> Edit / add notes</button>
            </>
          )}
        >
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 10, flexWrap: 'wrap' }}>
            <StatusChip status={viewing.status} />
            <span className="adm-help">Received {formatDateTime(viewing.created_at)}</span>
          </div>
          <dl className="adm-detail" style={{ marginTop: 14 }}>
            <dt>Full name</dt><dd>{viewing.full_name}</dd>
            <dt>Company</dt><dd>{viewing.company || '—'}</dd>
            <dt>Email</dt><dd><a href={`mailto:${viewing.email}`} style={{ color: 'var(--a-red)' }}>{viewing.email}</a></dd>
            <dt>Phone</dt><dd>{viewing.phone ? <a href={`tel:${viewing.phone}`} style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}><Phone size={14} />{viewing.phone}</a> : '—'}</dd>
            <dt>Service</dt><dd>{viewing.service || '—'}</dd>
            <dt>Message</dt><dd>{viewing.message || '—'}</dd>
            <dt>Admin notes</dt><dd>{viewing.admin_notes || '—'}</dd>
          </dl>
          <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
            {STATUS_OPTIONS.map((o) => (
              <button key={o.value} className={`abtn abtn-sm ${viewing.status === o.value ? 'abtn-dark' : ''}`} onClick={() => updateStatus(viewing, o.value)}>Mark {o.label.toLowerCase()}</button>
            ))}
          </div>
        </Dialog>
      )}

      {editing && (
        <Drawer
          title={editing === 'new' ? 'Add enquiry' : 'Edit enquiry'}
          onClose={() => setEditing(null)}
          footer={(
            <>
              <button className="abtn" onClick={() => setEditing(null)} disabled={saving}>Cancel</button>
              <button className="abtn abtn-primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save enquiry'}</button>
            </>
          )}
        >
          <form className="adm-form" onSubmit={save}>
            <Field label="Full name" required error={errors.full_name}><input type="text" value={values.full_name} onChange={set('full_name')} /></Field>
            <Field label="Company"><input type="text" value={values.company} onChange={set('company')} /></Field>
            <Field label="Email" required error={errors.email}><input type="email" value={values.email} onChange={set('email')} /></Field>
            <Field label="Phone"><input type="text" value={values.phone} onChange={set('phone')} /></Field>
            <Field label="Service">
              <select value={values.service} onChange={set('service')}>
                <option value="">—</option>
                {[...new Set([...services.map((s) => s.title), 'Other / General Enquiry', values.service].filter(Boolean))].map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select value={values.status} onChange={set('status')}>
                {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </Field>
            <Field label="Message" full><textarea value={values.message} onChange={set('message')} /></Field>
            <Field label="Admin notes" full help="Internal only — never shown on the website"><textarea value={values.admin_notes} onChange={set('admin_notes')} /></Field>
            <button type="submit" hidden />
          </form>
        </Drawer>
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete this enquiry?"
          message={`The enquiry from ${deleting.full_name} will be permanently deleted.`}
          onConfirm={remove}
          onClose={() => setDeleting(null)}
        />
      )}
    </>
  );
}
