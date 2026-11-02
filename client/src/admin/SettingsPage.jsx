import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { api } from '../api.js';
import { Field, ImageField, Loading, useToast } from './ui.jsx';

const GROUPS = [
  ['Brand', [
    ['site_name', 'Site name', { required: true }],
    ['logo', 'Logo', { type: 'image', full: true, help: 'Used in the header, footer and admin panel' }],
  ]],
  ['Header', [
    ['cta_text', 'Header button text', { help: 'e.g. Book a Consultation' }],
    ['cta_link', 'Header button link', { help: 'e.g. #contact' }],
  ]],
  ['Top bar', [
    ['topbar_frequency', 'Frequency text', { help: 'Shown on the right of the top bar' }],
    ['topbar_link_text', 'Login link text'],
    ['topbar_link_url', 'Login link URL', { help: 'Default /admin/login' }],
  ]],
  ['Contact details', [
    ['email', 'Email', { type: 'email' }],
    ['phone', 'Phone'],
    ['address', 'Address / desk line', { full: true }],
  ]],
  ['Footer', [
    ['footer_about', 'About text', { type: 'textarea', full: true }],
    ['copyright_text', 'Copyright text'],
    ['footer_tagline', 'Tagline (bottom right)'],
  ]],
  ['SEO', [
    ['meta_title', 'Browser / Google title', { full: true }],
    ['meta_description', 'Meta description', { type: 'textarea', full: true, help: 'Up to 300 characters' }],
  ]],
];

export default function SettingsPage() {
  const toast = useToast();
  const [values, setValues] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => { api('/api/admin/settings').then(setValues).catch((e) => toast(e.message, 'error')); }, [toast]);
  if (!values) return <Loading />;

  const set = (k) => (v) => { setValues((s) => ({ ...s, [k]: v })); setErrors((e) => ({ ...e, [k]: undefined })); };

  const save = async (e) => {
    e.preventDefault();
    if (!String(values.site_name || '').trim()) { setErrors({ site_name: 'Site name is required' }); return; }
    const body = {};
    GROUPS.forEach(([, fields]) => fields.forEach(([k]) => { body[k] = values[k] ?? ''; }));
    setSaving(true);
    try {
      setValues(await api('/api/admin/settings', { method: 'PUT', body }));
      toast('Site settings saved');
    } catch (err) {
      if (err.field) setErrors({ [err.field]: err.message });
      toast(err.message, 'error');
    } finally { setSaving(false); }
  };

  return (
    <form onSubmit={save}>
      <div className="adm-page-head">
        <div>
          <h1>Site Settings</h1>
          <p>Brand, header button, top bar, contact details, footer and SEO — used across the whole website.</p>
        </div>
        <button className="abtn abtn-primary" type="submit" disabled={saving}><Save size={16} /> {saving ? 'Saving…' : 'Save settings'}</button>
      </div>
      <div className="adm-card adm-card-pad">
        <div className="adm-form">
          {GROUPS.map(([group, fields]) => [
            <div key={group} className="adm-form-section">{group}</div>,
            ...fields.map(([k, label, o = {}]) => (
              <Field key={k} label={label} required={o.required} help={o.help} error={errors[k]} full={o.full}>
                {o.type === 'image' ? <ImageField value={values[k]} onChange={set(k)} />
                  : o.type === 'textarea' ? <textarea value={values[k] ?? ''} onChange={(e) => set(k)(e.target.value)} />
                    : <input type={o.type === 'email' ? 'email' : 'text'} value={values[k] ?? ''} onChange={(e) => set(k)(e.target.value)} />}
              </Field>
            )),
          ])}
        </div>
      </div>
    </form>
  );
}
