import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowRight, CheckCircle2, Mail, MapPin, Phone } from 'lucide-react';
import { api, assetUrl } from '../api.js';
import { Icon } from '../icons.jsx';
import { Reveal, SmartLink } from './nav.jsx';

const bg = (src) => (src ? { backgroundImage: `url("${assetUrl(src)}")` } : undefined);

export function Title({ s, as: Tag = 'h2', className = 'h-section', breakLine = false, id }) {
  return (
    <Tag className={className} id={id}>
      {s.title}
      {s.title_highlight && (
        <>
          {breakLine ? <br /> : ' '}
          <span className="hl">{s.title_highlight}</span>
        </>
      )}
    </Tag>
  );
}

/* --------------------------------- Hero --------------------------------- */
export function Hero({ s, highlights }) {
  return (
    <section id="home" className="hero" aria-labelledby="hero-title">
      <div className="hero-media" style={bg(s.image)}>
        <div className="hero-content">
          <div className="hero-copy">
            {s.eyebrow && <span className="eyebrow">{s.eyebrow}</span>}
            <h1 id="hero-title">
              {s.title} {s.title_highlight && <span className="hl">{s.title_highlight}</span>}
            </h1>
            {s.description && <p className="hero-text">{s.description}</p>}
            <div className="hero-actions">
              {s.btn1_text && <SmartLink to={s.btn1_link || '#services'} className="btn btn-red">{s.btn1_text} <ArrowRight size={16} /></SmartLink>}
              {s.btn2_text && <SmartLink to={s.btn2_link || '#contact'} className="btn btn-white">{s.btn2_text}</SmartLink>}
            </div>
          </div>
        </div>
        {(s.badge_label || s.badge_value) && (
          <div className="hero-badge">
            <div className="hero-badge-label">{s.badge_label}</div>
            <div className="hero-badge-value">{s.badge_value}</div>
          </div>
        )}
      </div>
      {highlights.length > 0 && (
        <div className="hero-strip">
          <div className="container hero-strip-grid">
            {highlights.map((h) => (
              <div key={h.id} className="hero-strip-item"><Icon name={h.icon} size={20} />{h.title}</div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

/* --------------------------------- About -------------------------------- */
export function About({ s, features }) {
  return (
    <section id="about" className="about" aria-labelledby="about-title">
      <div className="container about-grid">
        <Reveal className="about-media">
          {s.image && <img src={assetUrl(s.image)} alt="Aircraft wing above golden clouds" loading="lazy" width="568" height="682" />}
        </Reveal>
        <Reveal className="about-copy">
          {s.eyebrow && <span className="eyebrow">{s.eyebrow}</span>}
          <Title s={s} breakLine id="about-title" />
          {s.description && <p className="lead">{s.description}</p>}
          {features.length > 0 && (
            <div className="about-features">
              {features.map((f) => (
                <div key={f.id} className="feature-box">
                  <span className="feature-icon"><Icon name={f.icon} size={20} /></span>
                  <span>{f.title}</span>
                </div>
              ))}
            </div>
          )}
          {s.btn1_text && <SmartLink to={s.btn1_link || '#services'} className="btn btn-red">{s.btn1_text} <ArrowRight size={16} /></SmartLink>}
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------- Services ------------------------------- */
export function Services({ s, categories, services, onEnquire }) {
  const [filter, setFilter] = useState('all');
  const numbered = useMemo(() => services.map((sv, i) => ({ ...sv, num: String(i + 1).padStart(2, '0') })), [services]);
  const shown = filter === 'all' ? numbered : numbered.filter((sv) => String(sv.category_id) === String(filter));
  const usedCats = categories.filter((c) => services.some((sv) => sv.category_id === c.id));

  return (
    <section id="services" className="services" aria-labelledby="services-title">
      <div className="container">
        <Reveal className="section-head-center">
          {s.eyebrow && <span className="eyebrow">{s.eyebrow}</span>}
          <Title s={s} id="services-title" />
          {s.description && <p className="lead">{s.description}</p>}
        </Reveal>
        {usedCats.length > 0 && (
          <div className="filter-tabs" role="tablist" aria-label="Filter services">
            <button role="tab" aria-selected={filter === 'all'} className={`filter-tab ${filter === 'all' ? 'is-active' : ''}`} onClick={() => setFilter('all')}>All</button>
            {usedCats.map((c) => (
              <button key={c.id} role="tab" aria-selected={String(filter) === String(c.id)} className={`filter-tab ${String(filter) === String(c.id) ? 'is-active' : ''}`} onClick={() => setFilter(c.id)}>
                {c.name}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="services-wide">
        <div className="services-grid" key={filter}>
          {shown.map((sv, i) => (
            <article key={sv.id} className="service-card" style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}>
              <span className="service-num">{sv.num}</span>
              <span className="service-icon"><Icon name={sv.icon} size={20} /></span>
              <h3>{sv.title}</h3>
              {sv.description && <p>{sv.description}</p>}
              {sv.tags?.length > 0 && <div className="service-tags">{sv.tags.map((t) => <span key={t}>{t}</span>)}</div>}
              <button className="link-arrow" onClick={() => onEnquire(sv.title)} aria-label={`${s.btn1_text || 'Enquire Service'}: ${sv.title}`}>
                {s.btn1_text || 'Enquire Service'} <ArrowRight size={16} />
              </button>
            </article>
          ))}
          {shown.length === 0 && <p className="empty-note">No services in this category yet.</p>}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------- VIP --------------------------------- */
export function Vip({ s, items }) {
  return (
    <section id="vip" className="vip" aria-labelledby="vip-title">
      <div className="container vip-grid">
        <Reveal className="vip-copy">
          {s.eyebrow && <span className="eyebrow">{s.eyebrow}</span>}
          <Title s={s} breakLine id="vip-title" />
          {s.description && <p className="lead">{s.description}</p>}
          {items.length > 0 && (
            <div className="vip-list">
              {items.map((v) => (
                <div key={v.id} className="vip-item">
                  <span className="vip-icon"><Icon name={v.icon} size={20} /></span>
                  <div>
                    <h3>{v.title}</h3>
                    {v.description && <p>{v.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
          {s.btn1_text && <SmartLink to={s.btn1_link || '#contact'} className="btn btn-red">{s.btn1_text} <ArrowRight size={16} /></SmartLink>}
        </Reveal>
        {s.image && (
          <Reveal className="vip-media">
            <img src={assetUrl(s.image)} alt="Private jet with airstairs and red carpet at golden hour" loading="lazy" width="683" height="901" />
          </Reveal>
        )}
      </div>
    </section>
  );
}

/* -------------------------------- Process ------------------------------- */
export function Process({ s, steps }) {
  return (
    <section id="process" className="process" style={bg(s.image)} aria-labelledby="process-title">
      <div className="container">
        <Reveal className="process-head">
          {s.eyebrow && <span className="eyebrow">{s.eyebrow}</span>}
          <Title s={s} breakLine id="process-title" />
        </Reveal>
        <div className="process-grid">
          {steps.map((p, i) => (
            <div key={p.id} className="process-step" style={{ animationDelay: `${i * 80}ms` }}>
              <span className="process-icon"><Icon name={p.icon} size={22} /></span>
              <div className="process-card">
                <h3>{p.title}</h3>
                {p.description && <p>{p.description}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------- Insights ------------------------------- */
export function InsightCard({ a, readText = 'Read Article' }) {
  const href = `/insights/${a.slug}`;
  return (
    <article className="insight-card">
      <Link to={href} className="insight-img" tabIndex={-1} aria-hidden="true">
        {a.image && <img src={assetUrl(a.image)} alt="" loading="lazy" />}
      </Link>
      <div className="insight-body">
        <div className="insight-meta">
          <span className="insight-cat-icon"><Icon name={a.category_icon} size={15} strokeWidth={2} /></span>
          {a.category && <span className="insight-cat">{a.category}</span>}
        </div>
        <h3><Link to={href}>{a.title}</Link></h3>
        {a.excerpt && <p>{a.excerpt}</p>}
        <Link to={href} className="link-arrow">{readText} <ArrowRight size={16} /></Link>
      </div>
    </article>
  );
}

export function Insights({ s, items }) {
  return (
    <section id="insights" className="insights" aria-labelledby="insights-title">
      <div className="container">
        <Reveal className="insights-head">
          {s.eyebrow && <span className="eyebrow">{s.eyebrow}</span>}
          <Title s={s} id="insights-title" />
        </Reveal>
        <div className="insights-grid">
          {items.map((a) => <InsightCard key={a.id} a={a} readText={s.btn1_text || 'Read Article'} />)}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------- CTA --------------------------------- */
export function Cta({ s }) {
  return (
    <section className="cta" aria-labelledby="cta-title">
      <div className="container">
        <Reveal className="cta-card" style={bg(s.image)}>
          <div className="cta-copy">
            {s.eyebrow && <span className="eyebrow">{s.eyebrow}</span>}
            <Title s={s} id="cta-title" />
            {s.description && <p className="lead">{s.description}</p>}
            <div className="cta-actions">
              {s.btn1_text && <SmartLink to={s.btn1_link || '#contact'} className="btn btn-red">{s.btn1_text} <ArrowRight size={16} /></SmartLink>}
              {s.btn2_text && <SmartLink to={s.btn2_link || '#services'} className="btn btn-outline">{s.btn2_text}</SmartLink>}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* -------------------------------- Contact ------------------------------- */
const EMPTY = { full_name: '', company: '', email: '', phone: '', service: '', message: '', website: '' };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function Contact({ s, settings, services, preselect }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    if (preselect?.service) {
      setForm((f) => ({ ...f, service: preselect.service }));
      setStatus((st) => (st === 'sent' ? 'idle' : st));
    }
  }, [preselect]);

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }));
  };

  const validate = () => {
    const er = {};
    if (!form.full_name.trim()) er.full_name = 'Please enter your full name';
    if (!form.email.trim()) er.email = 'Please enter your business email';
    else if (!EMAIL_RE.test(form.email.trim())) er.email = 'Please enter a valid email address';
    if (form.phone && !/^[+()\d\s-]{6,20}$/.test(form.phone.trim())) er.phone = 'Please enter a valid phone number';
    if (!form.message.trim()) er.message = 'Please tell us about your flight or requirements';
    return er;
  };

  const submit = async (e) => {
    e.preventDefault();
    const er = validate();
    setErrors(er);
    if (Object.keys(er).length) {
      document.getElementById(`f-${Object.keys(er)[0]}`)?.focus();
      return;
    }
    setStatus('sending');
    setServerError('');
    try {
      await api('/api/public/enquiries', { method: 'POST', body: form });
      setStatus('sent');
      setForm(EMPTY);
    } catch (err) {
      setStatus('error');
      if (err.field) setErrors({ [err.field]: err.message });
      setServerError(err.message);
    }
  };

  const field = (k, label, props = {}, { full = false, required = false } = {}) => (
    <div className={`form-field ${full ? 'full' : ''} ${errors[k] ? 'has-error' : ''}`}>
      <label htmlFor={`f-${k}`}>{label}{required && <span className="req" aria-hidden="true">*</span>}</label>
      {props.as === 'textarea'
        ? <textarea id={`f-${k}`} value={form[k]} onChange={set(k)} aria-invalid={!!errors[k]} aria-required={required} placeholder={props.placeholder} maxLength={5000} />
        : <input id={`f-${k}`} value={form[k]} onChange={set(k)} aria-invalid={!!errors[k]} aria-required={required} {...props} />}
      {errors[k] && <span className="field-error" role="alert">{errors[k]}</span>}
    </div>
  );

  return (
    <section id="contact" className="contact" style={bg(s.image)} aria-labelledby="contact-title">
      <div className="contact-grid">
        <div className="contact-copy">
          {s.eyebrow && <span className="eyebrow">{s.eyebrow}</span>}
          <Title s={s} id="contact-title" />
          {s.description && <p className="lead">{s.description}</p>}
          <ul className="contact-list">
            {settings.email && <li><span className="ci"><Mail size={20} /></span><a href={`mailto:${settings.email}`}>{settings.email}</a></li>}
            {settings.phone && <li><span className="ci"><Phone size={20} /></span><a href={`tel:${settings.phone.replace(/[^\d+]/g, '')}`}>{settings.phone}</a></li>}
            {settings.address && <li><span className="ci"><MapPin size={20} /></span><span>{settings.address}</span></li>}
          </ul>
        </div>

        <div className="contact-form">
          {status === 'sent' ? (
            <div className="form-success" role="status">
              <div className="ok-icon"><CheckCircle2 size={32} /></div>
              <h3>{s.badge_label || 'Thank you! Your enquiry has been received.'}</h3>
              <p>{s.badge_value || 'Our operations desk will get back to you shortly.'}</p>
              <button className="btn btn-outline" onClick={() => setStatus('idle')}>Send another enquiry</button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate>
              <div className="form-grid">
                {field('full_name', 'Full Name', { placeholder: 'Jane Doe', autoComplete: 'name', maxLength: 150 }, { required: true })}
                {field('company', 'Company', { placeholder: 'Airline or operator', autoComplete: 'organization', maxLength: 150 })}
                {field('email', 'Business Email', { type: 'email', placeholder: 'you@company.com', autoComplete: 'email', maxLength: 150 }, { required: true })}
                {field('phone', 'Phone Number', { type: 'tel', placeholder: '+1 555 000 0000', autoComplete: 'tel', maxLength: 60 })}
                <div className="form-field full">
                  <label htmlFor="f-service">Service of Interest</label>
                  <select id="f-service" value={form.service} onChange={set('service')}>
                    <option value="">Select a service</option>
                    {services.map((sv) => <option key={sv.id} value={sv.title}>{sv.title}</option>)}
                    <option value="Other / General Enquiry">Other / General Enquiry</option>
                  </select>
                </div>
                {field('message', 'Message', { as: 'textarea', placeholder: 'Tell us about your flight or requirements' }, { full: true, required: true })}
              </div>
              <div className="hp" aria-hidden="true">
                <label htmlFor="f-website">Website</label>
                <input id="f-website" tabIndex={-1} autoComplete="off" value={form.website} onChange={set('website')} />
              </div>
              {status === 'error' && serverError && (
                <div className="form-alert error" role="alert"><AlertCircle size={18} /> {serverError}</div>
              )}
              <div className="form-actions">
                <button type="submit" className="btn btn-red" disabled={status === 'sending'}>
                  {status === 'sending' ? <><span className="spinner" /> Sending…</> : <>{s.btn1_text || 'Send Enquiry'} <ArrowRight size={16} /></>}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
