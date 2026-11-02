import { useCallback, useEffect, useState } from 'react';
import { KeyRound, Pencil, Plus, Trash2 } from 'lucide-react';
import { api } from '../api.js';
import { ConfirmDialog, Drawer, Field, Loading, formatDateTime, useToast } from './ui.jsx';
import { useAuth } from './AdminApp.jsx';

export function AdminsPage() {
  const toast = useToast();
  const { admin, setAdmin } = useAuth();
  const [rows, setRows] = useState(null);
  const [editing, setEditing] = useState(null);
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(() => api('/api/admin/admins').then(setRows).catch((e) => toast(e.message, 'error')), [toast]);
  useEffect(() => { load(); }, [load]);

  const open = (r) => { setErrors({}); setValues(r === 'new' ? { name: '', username: '', password: '' } : { name: r.name, username: r.username, password: '' }); setEditing(r); };

  const save = async (e) => {
    e?.preventDefault();
    const er = {};
    if (!values.name.trim()) er.name = 'Name is required';
    if (!values.username.trim()) er.username = 'Username is required';
    if (editing === 'new' && !values.password) er.password = 'Password is required';
    if (values.password && values.password.length < 6) er.password = 'At least 6 characters';
    setErrors(er);
    if (Object.keys(er).length) return;
    setSaving(true);
    try {
      const body = { name: values.name, username: values.username, ...(values.password ? { password: values.password } : {}) };
      const r = editing === 'new'
        ? await api('/api/admin/admins', { method: 'POST', body })
        : await api(`/api/admin/admins/${editing.id}`, { method: 'PUT', body });
      if (r.id === admin.id) setAdmin({ ...admin, name: r.name, username: r.username });
      toast(editing === 'new' ? 'Admin user added' : 'Admin user updated');
      setEditing(null);
      load();
    } catch (err) {
      if (err.field) setErrors({ [err.field]: err.message });
      toast(err.message, 'error');
    } finally { setSaving(false); }
  };

  if (!rows) return <Loading />;
  return (
    <>
      <div className="adm-page-head">
        <div><h1>Admin Users</h1><p>People who can sign in to this admin panel.</p></div>
        <button className="abtn abtn-primary" onClick={() => open('new')}><Plus size={17} /> Add admin</button>
      </div>
      <div className="adm-card adm-table-wrap">
        <table className="adm-table">
          <thead><tr><th>Name</th><th>Username</th><th>Created</th><th style={{ textAlign: 'right' }}>Actions</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="t-main">{r.name} {r.id === admin.id && <span className="adm-chip blue">You</span>}</td>
                <td>{r.username}</td>
                <td>{formatDateTime(r.created_at)}</td>
                <td className="t-actions">
                  <button className="abtn abtn-sm" onClick={() => open(r)}><Pencil size={15} /> Edit</button>
                  <button className="abtn abtn-sm abtn-danger" disabled={r.id === admin.id || rows.length <= 1} onClick={() => setDeleting(r)} aria-label="Delete"><Trash2 size={15} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editing && (
        <Drawer
          title={editing === 'new' ? 'Add admin user' : `Edit ${editing.name}`}
          onClose={() => setEditing(null)}
          footer={<><button className="abtn" onClick={() => setEditing(null)}>Cancel</button><button className="abtn abtn-primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button></>}
        >
          <form className="adm-form" onSubmit={save}>
            <Field label="Full name" required error={errors.name}><input type="text" value={values.name} onChange={(e) => setValues({ ...values, name: e.target.value })} /></Field>
            <Field label="Username" required error={errors.username}><input type="text" autoComplete="off" value={values.username} onChange={(e) => setValues({ ...values, username: e.target.value })} /></Field>
            <Field label={editing === 'new' ? 'Password' : 'New password'} required={editing === 'new'} error={errors.password} help={editing === 'new' ? 'At least 6 characters' : 'Leave empty to keep the current password'} full>
              <input type="password" autoComplete="new-password" value={values.password} onChange={(e) => setValues({ ...values, password: e.target.value })} />
            </Field>
            <button type="submit" hidden />
          </form>
        </Drawer>
      )}
      {deleting && (
        <ConfirmDialog
          title="Delete admin user?"
          message={`${deleting.name} will no longer be able to sign in.`}
          onClose={() => setDeleting(null)}
          onConfirm={async () => {
            try { await api(`/api/admin/admins/${deleting.id}`, { method: 'DELETE' }); toast('Admin user deleted'); setDeleting(null); load(); } catch (e) { toast(e.message, 'error'); }
          }}
        />
      )}
    </>
  );
}

export function AccountPage() {
  const toast = useToast();
  const { admin } = useAuth();
  const [v, setV] = useState({ current_password: '', new_password: '', confirm: '' });
  const [err, setErr] = useState({});
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const er = {};
    if (!v.current_password) er.current_password = 'Enter your current password';
    if (v.new_password.length < 6) er.new_password = 'At least 6 characters';
    if (v.confirm !== v.new_password) er.confirm = 'Passwords do not match';
    setErr(er);
    if (Object.keys(er).length) return;
    setBusy(true);
    try {
      await api('/api/auth/password', { method: 'PUT', body: { current_password: v.current_password, new_password: v.new_password } });
      toast('Password changed');
      setV({ current_password: '', new_password: '', confirm: '' });
    } catch (e2) {
      toast(e2.message, 'error');
      setErr({ current_password: e2.message });
    } finally { setBusy(false); }
  };

  return (
    <>
      <div className="adm-page-head"><div><h1>My Account</h1><p>Signed in as <b>{admin?.username}</b>.</p></div></div>
      <form className="adm-card adm-card-pad" style={{ maxWidth: 560 }} onSubmit={submit}>
        <h3 style={{ fontSize: 20, display: 'flex', gap: 8, alignItems: 'center', marginBottom: 18 }}><KeyRound size={19} /> Change password</h3>
        <div className="adm-form" style={{ gridTemplateColumns: '1fr' }}>
          <Field label="Current password" error={err.current_password}><input type="password" autoComplete="current-password" value={v.current_password} onChange={(e) => setV({ ...v, current_password: e.target.value })} /></Field>
          <Field label="New password" error={err.new_password} help="At least 6 characters"><input type="password" autoComplete="new-password" value={v.new_password} onChange={(e) => setV({ ...v, new_password: e.target.value })} /></Field>
          <Field label="Confirm new password" error={err.confirm}><input type="password" autoComplete="new-password" value={v.confirm} onChange={(e) => setV({ ...v, confirm: e.target.value })} /></Field>
        </div>
        <button className="abtn abtn-primary" style={{ marginTop: 20 }} disabled={busy}>{busy ? 'Saving…' : 'Update password'}</button>
      </form>
    </>
  );
}
