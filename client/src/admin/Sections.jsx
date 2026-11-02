import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Layers, Pencil, Save } from 'lucide-react';
import { api, assetUrl } from '../api.js';
import { Field, ImageField, Loading, Switch, useToast } from './ui.jsx';

const T = (label, help) => ({ label, help });

// Which fields each page section uses, with labels that match the design.
export const SECTION_FORMS = {
  hero: {
    fields: {
      eyebrow: T('Eyebrow text'), title: T('Heading (white line)'), title_highlight: T('Heading highlight (red italic line)'),
      description: T('Paragraph'), image: T('Background image', 'Wide landscape image, at least 1600px wide'),
      btn1_text: T('Primary button text'), btn1_link: T('Primary button link', 'e.g. #services'),
      btn2_text: T('Secondary button text'), btn2_link: T('Secondary button link', 'e.g. #contact'),
      badge_label: T('Floating card label'), badge_value: T('Floating card value'),
    },
    related: [['hero-highlights', 'Hero Highlights (dark strip)']],
  },
  about: {
    fields: {
      eyebrow: T('Eyebrow text'), title: T('Heading'), title_highlight: T('Heading highlight (red)'),
      description: T('Paragraph'), image: T('Side image', 'Portrait image (approx. 568 × 682)'),
      btn1_text: T('Button text'), btn1_link: T('Button link'),
    },
    related: [['about-features', 'About Features']],
  },
  services: {
    fields: {
      eyebrow: T('Eyebrow text'), title: T('Heading'), title_highlight: T('Heading highlight (red)'),
      description: T('Paragraph'), btn1_text: T('Card link text', 'Shown on every service card, e.g. "Enquire Service"'),
    },
    related: [['services', 'Services'], ['service-categories', 'Service Categories (filter tabs)']],
  },
  vip: {
    fields: {
      eyebrow: T('Eyebrow text'), title: T('Heading'), title_highlight: T('Heading highlight (red)'),
      description: T('Paragraph'), image: T('Side image', 'Transparent PNG/WEBP works best'),
      btn1_text: T('Button text'), btn1_link: T('Button link'),
    },
    related: [['vip-features', 'VIP Features']],
  },
  process: {
    fields: {
      eyebrow: T('Eyebrow text'), title: T('Heading'), title_highlight: T('Heading highlight (red)'),
      image: T('Background image', 'Wide image with a light area behind the cards'),
    },
    related: [['process-steps', 'Process Steps']],
  },
  insights: {
    fields: {
      eyebrow: T('Eyebrow text'), title: T('Heading'), title_highlight: T('Heading highlight (red)'),
      btn1_text: T('Card link text', 'e.g. "Read Article"'),
    },
    related: [['insights', 'Insight Articles']],
  },
  cta: {
    fields: {
      eyebrow: T('Eyebrow text'), title: T('Heading'), title_highlight: T('Heading highlight (red)'),
      description: T('Paragraph'), image: T('Banner image'),
      btn1_text: T('Primary button text'), btn1_link: T('Primary button link'),
      btn2_text: T('Secondary button text'), btn2_link: T('Secondary button link'),
    },
    related: [],
  },
  contact: {
    fields: {
      eyebrow: T('Eyebrow text'), title: T('Heading'), title_highlight: T('Heading highlight (red)'),
      description: T('Paragraph'), image: T('Background image'),
      btn1_text: T('Submit button text'),
      badge_label: T('Success message title', 'Shown after the form is sent'), badge_value: T('Success message text'),
    },
    related: [],
    extraLinks: [['/admin/enquiries', 'Enquiries received'], ['/admin/settings', 'Email, phone & address (Site Settings)']],
  },
};

export function SectionsPage() {
  const toast = useToast();
  const [rows, setRows] = useState(null);

  const load = () => api('/api/admin/sections').then(setRows).catch((e) => toast(e.message, 'error'));
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = async (s, on) => {
    setRows((rs) => rs.map((r) => (r.section_key === s.section_key ? { ...r, is_visible: on ? 1 : 0 } : r)));
    try {
      await api(`/api/admin/sections/${s.section_key}`, { method: 'PUT', body: { is_visible: on } });
      toast(on ? `${s.label} section is now visible` : `${s.label} section hidden`);
    } catch (e) { toast(e.message, 'error'); load(); }
  };

  if (!rows) return <Loading />;
  return (
    <>
      <div className="adm-page-head">
        <div>
          <h1>Page Sections</h1>
          <p>Every section of the home page, in display order. Edit headings, text, images and buttons, or hide a section.</p>
        </div>
      </div>
      <div className="adm-section-list">
        {rows.map((s) => (
          <div key={s.section_key} className="adm-card adm-section-card">
            <div className="img" style={s.image ? { backgroundImage: `url("${assetUrl(s.image)}")` } : undefined} />
            <div className="body">
              <span className="adm-help" style={{ textTransform: 'uppercase', letterSpacing: '.1em', fontWeight: 700 }}>{String(s.sort_order).padStart(2, '0')} · {s.eyebrow || s.label}</span>
              <h3>{s.label}</h3>
              <p>{[s.title, s.title_highlight].filter(Boolean).join(' ')}</p>
            </div>
            <div className="foot">
              <Switch checked={!!s.is_visible} onChange={(on) => toggle(s, on)} label={s.is_visible ? 'Visible' : 'Hidden'} />
              <Link to={`/admin/sections/${s.section_key}`} className="abtn abtn-sm abtn-dark"><Pencil size={14} /> Edit</Link>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export function SectionEditor() {
  const { key } = useParams();
  const toast = useToast();
  const navigate = useNavigate();
  const [row, setRow] = useState(null);
  const [values, setValues] = useState({});
  const [saving, setSaving] = useState(false);
  const form = SECTION_FORMS[key];

  useEffect(() => {
    api(`/api/admin/sections/${key}`)
      .then((r) => { setRow(r); setValues(r); })
      .catch((e) => { toast(e.message, 'error'); navigate('/admin/sections'); });
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!row || !form) return <Loading />;

  const save = async (e) => {
    e.preventDefault();
    const body = { is_visible: !!values.is_visible };
    Object.keys(form.fields).forEach((k) => { body[k] = values[k] ?? ''; });
    setSaving(true);
    try {
      const r = await api(`/api/admin/sections/${key}`, { method: 'PUT', body });
      setRow(r); setValues(r);
      toast(`${row.label} section saved`);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const set = (k) => (v) => setValues((s) => ({ ...s, [k]: v }));
  const isLong = (k) => k === 'description';

  return (
    <form onSubmit={save}>
      <div className="adm-page-head">
        <div>
          <Link to="/admin/sections" className="adm-help" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><ArrowLeft size={14} /> All sections</Link>
          <h1 style={{ marginTop: 6 }}>{row.label} section</h1>
          <p>Changes go live on the website as soon as you save.</p>
        </div>
        <div className="adm-actions">
          <a className="abtn" href={`/#${key === 'cta' ? 'contact' : key}`} target="_blank" rel="noreferrer"><ExternalLink size={15} /> Preview</a>
          <button className="abtn abtn-primary" type="submit" disabled={saving}><Save size={16} /> {saving ? 'Saving…' : 'Save section'}</button>
        </div>
      </div>

      <div className="adm-two" style={{ marginTop: 0 }}>
        <div className="adm-card adm-card-pad">
          <div className="adm-form">
            {Object.entries(form.fields).map(([k, f]) => (
              <Field key={k} label={f.label} help={f.help} full={isLong(k) || k === 'image' || k === 'eyebrow'}>
                {k === 'image'
                  ? <ImageField value={values[k]} onChange={set(k)} />
                  : isLong(k)
                    ? <textarea value={values[k] ?? ''} onChange={(e) => set(k)(e.target.value)} />
                    : <input type="text" value={values[k] ?? ''} onChange={(e) => set(k)(e.target.value)} />}
              </Field>
            ))}
          </div>
        </div>
        <div style={{ display: 'grid', gap: 16, alignContent: 'start' }}>
          <div className="adm-card adm-card-pad">
            <h3 style={{ fontSize: 18 }}>Visibility</h3>
            <p className="adm-help" style={{ margin: '6px 0 14px' }}>Hidden sections are removed from the home page.</p>
            <Switch checked={!!values.is_visible} onChange={set('is_visible')} label={values.is_visible ? 'Visible on website' : 'Hidden'} />
          </div>
          {(form.related.length > 0 || form.extraLinks) && (
            <div className="adm-card adm-card-pad">
              <h3 style={{ fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}><Layers size={18} /> Items in this section</h3>
              <div className="adm-related" style={{ marginTop: 14, flexDirection: 'column' }}>
                {form.related.map(([res, label]) => <Link key={res} className="adm-module-link" to={`/admin/m/${res}`}>{label}</Link>)}
                {(form.extraLinks || []).map(([to, label]) => <Link key={to} className="adm-module-link" to={to}>{label}</Link>)}
              </div>
            </div>
          )}
        </div>
      </div>
    </form>
  );
}
