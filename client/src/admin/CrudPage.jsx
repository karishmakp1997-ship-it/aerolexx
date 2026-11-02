import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowDown, ArrowUp, ExternalLink, Eye, Inbox, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { api, assetUrl } from '../api.js';
import { Icon } from '../icons.jsx';
import { MODULES, FIELD_LABELS } from './modules.js';
import { ConfirmDialog, Dialog, Drawer, Field, IconPicker, ImageField, Loading, Switch, TagsInput, useToast } from './ui.jsx';

function initialValues(fields, record) {
  const v = {};
  for (const f of fields) {
    if (record && record[f.name] !== undefined && record[f.name] !== null) v[f.name] = f.type === 'bool' ? !!record[f.name] : record[f.name];
    else if (f.type === 'bool') v[f.name] = f.default ?? false;
    else if (f.type === 'tags') v[f.name] = [];
    else v[f.name] = f.default ?? '';
  }
  if (v.published_on) v.published_on = String(v.published_on).slice(0, 10);
  return v;
}

export function RecordForm({ fields, values, setValues, errors, options }) {
  const set = (name) => (val) => setValues((v) => ({ ...v, [name]: val }));
  return (
    <div className="adm-form">
      {fields.map((f) => {
        const common = { label: f.label, required: f.required, help: f.help, error: errors[f.name], full: f.full || f.type === 'image' };
        const val = values[f.name];
        switch (f.type) {
          case 'bool':
            return <Field key={f.name} {...common} label={null}><Switch checked={val} onChange={set(f.name)} label={f.label} /></Field>;
          case 'icon':
            return <Field key={f.name} {...common}><IconPicker value={val} onChange={set(f.name)} /></Field>;
          case 'image':
            return <Field key={f.name} {...common}><ImageField value={val} onChange={set(f.name)} /></Field>;
          case 'tags':
            return <Field key={f.name} {...common}><TagsInput value={val || []} onChange={set(f.name)} /></Field>;
          case 'textarea':
            return <Field key={f.name} {...common}><textarea className={f.tall ? 'tall' : ''} value={val ?? ''} onChange={(e) => set(f.name)(e.target.value)} placeholder={f.placeholder} /></Field>;
          case 'select': {
            const opts = f.options || (options[f.optionsFrom] || []).map((o) => ({ value: o.id, label: o[f.optionLabel] }));
            return (
              <Field key={f.name} {...common}>
                <select value={val ?? ''} onChange={(e) => set(f.name)(e.target.value)}>
                  {!f.options && <option value="">{f.placeholder || 'Select…'}</option>}
                  {opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </Field>
            );
          }
          default:
            return (
              <Field key={f.name} {...common}>
                <input type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'} value={val ?? ''} placeholder={f.placeholder} onChange={(e) => set(f.name)(e.target.value)} />
              </Field>
            );
        }
      })}
    </div>
  );
}

function Cell({ col, row }) {
  const v = row[col];
  if (col === 'icon') return <span className="adm-icon-cell"><Icon name={v} size={17} /></span>;
  if (col === 'image') return v ? <img className="adm-thumb" src={assetUrl(v)} alt="" /> : <span className="adm-thumb" style={{ display: 'inline-block' }} />;
  if (col === 'tags') return <div className="adm-tags">{(v || []).slice(0, 3).map((t) => <span key={t} className="adm-chip">{t}</span>)}{(v || []).length > 3 && <span className="adm-chip">+{v.length - 3}</span>}</div>;
  if (col === 'value_style') return <span className={`adm-chip ${v === 'green' ? 'green' : ''}`}>{v}</span>;
  if (col.startsWith('show_in_')) return v ? <span className="adm-chip green">Yes</span> : <span className="adm-chip">No</span>;
  if (col === 'published_on') return v ? String(v).slice(0, 10) : '—';
  if (col === 'description') return <div className="t-sub" style={{ marginTop: 0 }}>{v || '—'}</div>;
  return <span className={col === 'title' || col === 'label' || col === 'name' ? 't-main' : ''}>{v ?? '—'}</span>;
}

export function DetailView({ fields, record }) {
  return (
    <dl className="adm-detail" style={{ marginTop: 16 }}>
      <dt>ID</dt><dd>{record.id}</dd>
      {fields.map((f) => {
        let v = record[f.name];
        if (f.type === 'bool') v = v ? 'Yes' : 'No';
        else if (f.type === 'tags') v = (v || []).join(', ') || '—';
        else if (f.type === 'image') v = v ? <img src={assetUrl(v)} alt="" /> : '—';
        else if (f.type === 'icon') v = <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}><Icon name={v} size={18} /> {v}</span>;
        else if (f.optionsFrom) v = record.category_name || '—';
        else if (v === null || v === undefined || v === '') v = '—';
        return [<dt key={`${f.name}-t`}>{f.label}</dt>, <dd key={`${f.name}-d`}>{v}</dd>];
      })}
      {record.created_at && <><dt>Created</dt><dd>{record.created_at}</dd></>}
    </dl>
  );
}

export default function CrudPage() {
  const { resource } = useParams();
  const mod = MODULES[resource];
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState(null); // null | 'new' | record
  const [viewing, setViewing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [options, setOptions] = useState({});

  const load = useCallback(async () => {
    if (!mod) return;
    setLoading(true);
    try {
      setRows(await api(`/api/admin/${resource}`));
      const sources = [...new Set(mod.fields.filter((f) => f.optionsFrom).map((f) => f.optionsFrom))];
      const loaded = {};
      for (const s of sources) loaded[s] = await api(`/api/admin/${s}`);
      setOptions(loaded);
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [resource, mod, toast]);

  useEffect(() => { setQ(''); setEditing(null); load(); }, [load]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((r) => Object.values(r).some((v) => (Array.isArray(v) ? v.join(' ') : String(v ?? '')).toLowerCase().includes(term)));
  }, [rows, q]);

  if (!mod) return <div className="adm-card adm-empty">Unknown module. <Link to="/admin">Back to dashboard</Link></div>;

  const openForm = (record) => {
    setErrors({});
    setValues(initialValues(mod.fields, record === 'new' ? null : record));
    setEditing(record);
  };

  const save = async (e) => {
    e?.preventDefault();
    const er = {};
    mod.fields.forEach((f) => {
      const v = values[f.name];
      if (f.required && (v === '' || v === null || v === undefined)) er[f.name] = `${f.label} is required`;
    });
    setErrors(er);
    if (Object.keys(er).length) return;
    const body = { ...values };
    if (body.sort_order === '' || body.sort_order === undefined) delete body.sort_order;
    setSaving(true);
    try {
      if (editing === 'new') {
        await api(`/api/admin/${resource}`, { method: 'POST', body });
        toast(`${mod.singular[0].toUpperCase()}${mod.singular.slice(1)} added`);
      } else {
        await api(`/api/admin/${resource}/${editing.id}`, { method: 'PUT', body });
        toast('Changes saved');
      }
      setEditing(null);
      load();
    } catch (err) {
      if (err.field) setErrors({ [err.field]: err.message });
      toast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (row, on) => {
    setRows((rs) => rs.map((r) => (r.id === row.id ? { ...r, is_active: on ? 1 : 0 } : r)));
    try {
      await api(`/api/admin/${resource}/${row.id}`, { method: 'PUT', body: { is_active: on } });
      toast(on ? 'Now visible on website' : 'Hidden from website');
    } catch (e) { toast(e.message, 'error'); load(); }
  };

  const move = async (index, dir) => {
    const a = filtered[index]; const b = filtered[index + dir];
    if (!a || !b) return;
    let ao = a.sort_order; let bo = b.sort_order;
    if (ao === bo) { ao = index + 1; bo = index + 1 + dir; }
    try {
      await Promise.all([
        api(`/api/admin/${resource}/${a.id}`, { method: 'PUT', body: { sort_order: bo } }),
        api(`/api/admin/${resource}/${b.id}`, { method: 'PUT', body: { sort_order: ao } }),
      ]);
      load();
    } catch (e) { toast(e.message, 'error'); }
  };

  const remove = async () => {
    try {
      await api(`/api/admin/${resource}/${deleting.id}`, { method: 'DELETE' });
      toast('Deleted');
      setDeleting(null);
      load();
    } catch (e) { toast(e.message, 'error'); }
  };

  const hasSort = mod.fields.some((f) => f.name === 'sort_order');
  const hasActive = mod.fields.some((f) => f.name === 'is_active');
  const titleOf = (r) => r.title || r.label || r.name || `#${r.id}`;

  return (
    <>
      <div className="adm-page-head">
        <div>
          <h1>{mod.title}</h1>
          <p>{mod.description}</p>
        </div>
        <div className="adm-actions">
          <button className="abtn abtn-primary" onClick={() => openForm('new')}><Plus size={17} /> Add {mod.singular}</button>
        </div>
      </div>

      <div className="adm-card">
        <div className="adm-toolbar">
          <div className="adm-search">
            <Search size={16} />
            <input type="search" placeholder={`Search ${mod.title.toLowerCase()}…`} value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <span className="adm-help">{filtered.length} of {rows.length} records</span>
        </div>
        {loading ? <Loading /> : filtered.length === 0 ? (
          <div className="adm-empty">
            <Inbox size={36} />
            <p>{rows.length ? 'No records match your search.' : `No ${mod.title.toLowerCase()} yet.`}</p>
            {!rows.length && <button className="abtn abtn-primary" style={{ marginTop: 14 }} onClick={() => openForm('new')}><Plus size={16} /> Add the first one</button>}
          </div>
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  {hasSort && <th style={{ width: 96 }}>Order</th>}
                  {mod.columns.map((c) => <th key={c}>{FIELD_LABELS[c] || c}</th>)}
                  {hasActive && <th>Visible</th>}
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr key={r.id}>
                    {hasSort && (
                      <td>
                        <div className="adm-order">
                          <button className="abtn abtn-icon abtn-ghost abtn-sm" disabled={!!q || i === 0} onClick={() => move(i, -1)} aria-label="Move up"><ArrowUp size={15} /></button>
                          <span>{i + 1}</span>
                          <button className="abtn abtn-icon abtn-ghost abtn-sm" disabled={!!q || i === filtered.length - 1} onClick={() => move(i, 1)} aria-label="Move down"><ArrowDown size={15} /></button>
                        </div>
                      </td>
                    )}
                    {mod.columns.map((c) => <td key={c}><Cell col={c} row={r} /></td>)}
                    {hasActive && <td><Switch checked={!!r.is_active} onChange={(on) => toggleActive(r, on)} /></td>}
                    <td className="t-actions">
                      <button className="abtn abtn-sm" onClick={() => setViewing(r)} aria-label={`View ${titleOf(r)}`}><Eye size={15} /></button>
                      <button className="abtn abtn-sm" onClick={() => openForm(r)}><Pencil size={15} /> Edit</button>
                      <button className="abtn abtn-sm abtn-danger" onClick={() => setDeleting(r)} aria-label={`Delete ${titleOf(r)}`}><Trash2 size={15} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && (
        <Drawer
          title={editing === 'new' ? `Add ${mod.singular}` : `Edit ${mod.singular}`}
          onClose={() => setEditing(null)}
          footer={(
            <>
              <button className="abtn" onClick={() => setEditing(null)} disabled={saving}>Cancel</button>
              <button className="abtn abtn-primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : editing === 'new' ? `Add ${mod.singular}` : 'Save changes'}</button>
            </>
          )}
        >
          <form onSubmit={save}>
            <RecordForm fields={mod.fields} values={values} setValues={setValues} errors={errors} options={options} />
            <button type="submit" hidden />
          </form>
        </Drawer>
      )}

      {viewing && (
        <Dialog
          wide
          title={titleOf(viewing)}
          onClose={() => setViewing(null)}
          actions={(
            <>
              {mod.viewLink && <a className="abtn" href={mod.viewLink(viewing)} target="_blank" rel="noreferrer"><ExternalLink size={15} /> Open on website</a>}
              <button className="abtn abtn-primary" onClick={() => { const r = viewing; setViewing(null); openForm(r); }}><Pencil size={15} /> Edit</button>
            </>
          )}
        >
          <DetailView fields={mod.fields} record={viewing} />
        </Dialog>
      )}

      {deleting && (
        <ConfirmDialog
          title={`Delete this ${mod.singular}?`}
          message={`"${titleOf(deleting)}" will be permanently removed from the website.`}
          onConfirm={remove}
          onClose={() => setDeleting(null)}
        />
      )}
    </>
  );
}
