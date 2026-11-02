import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, ArrowUp, Menu, X } from 'lucide-react';
import { assetUrl } from '../api.js';
import { SmartLink, useScrollSpy } from './nav.jsx';

export function TopBar({ items = [], settings = {} }) {
  return (
    <div className="topbar" role="region" aria-label="Operations status">
      <div className="topbar-inner">
        <div className="topbar-items">
          {items.map((it, i) => (
            <span key={it.id} style={{ display: 'contents' }}>
              {i === 1 && <span className="topbar-sep" aria-hidden="true">|</span>}
              {i > 1 && <span className="topbar-bullet" aria-hidden="true">•</span>}
              <span className={`topbar-item ${i === 0 ? 'is-primary' : ''}`}>
                {i === 0 && <span className="topbar-dot" aria-hidden="true" />}
                <span className="label">{it.label}{it.value ? ':' : ''}</span>
                {it.value && <span className={it.value_style === 'green' ? 'v-green' : 'v-white'}>{it.value}</span>}
              </span>
            </span>
          ))}
        </div>
        <div className="topbar-right">
          {settings.topbar_frequency && <span className="topbar-freq">{settings.topbar_frequency}</span>}
          {settings.topbar_link_text && (
            <SmartLink to={settings.topbar_link_url || '/admin/login'} className="topbar-login">
              {settings.topbar_link_text} <ArrowRight size={12} strokeWidth={2.5} />
            </SmartLink>
          )}
        </div>
      </div>
    </div>
  );
}

export function Header({ settings = {}, nav = [] }) {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const links = nav.filter((n) => n.show_in_header);
  const sectionIds = links.filter((n) => n.target.startsWith('#')).map((n) => n.target.slice(1));
  const spied = useScrollSpy(sectionIds, pathname === '/');
  const active = pathname === '/' ? spied : pathname.startsWith('/insights') ? 'insights' : null;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey); };
  }, [open]);

  const brand = settings.logo
    ? <img src={assetUrl(settings.logo)} alt={settings.site_name || 'Aerolex Advisors'} width="101" height="55" />
    : <span className="brand-text">{settings.site_name}</span>;

  const isActive = (n) => n.target.startsWith('#') && active === n.target.slice(1);

  return (
    <>
    <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="header-inner">
        <SmartLink to="#home" className="brand" aria-label={`${settings.site_name || 'Aerolex'} home`}>{brand}</SmartLink>
        <nav className="main-nav" aria-label="Main">
          {links.map((n) => (
            <SmartLink key={n.id} to={n.target} className={isActive(n) ? 'is-active' : ''} aria-current={isActive(n) ? 'true' : undefined}>
              {n.label}
            </SmartLink>
          ))}
        </nav>
        {settings.cta_text && (
          <SmartLink to={settings.cta_link || '#contact'} className="btn btn-red btn-sm header-cta">
            {settings.cta_text} <ArrowRight size={16} />
          </SmartLink>
        )}
        <button className="menu-toggle" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen(true)}>
          <Menu size={22} />
        </button>
      </div>
    </header>

      <div className={`mobile-nav ${open ? 'is-open' : ''}`} onClick={() => setOpen(false)} aria-hidden={!open}>
        <div className="mobile-nav-panel" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Menu">
          <div className="mobile-nav-head">
            {brand}
            <button className="menu-toggle" style={{ display: 'inline-flex' }} aria-label="Close menu" onClick={() => setOpen(false)}>
              <X size={22} />
            </button>
          </div>
          {links.map((n) => (
            <SmartLink key={n.id} to={n.target} className={`nav-item ${isActive(n) ? 'is-active' : ''}`} onNavigate={() => setOpen(false)} tabIndex={open ? 0 : -1}>
              {n.label}
            </SmartLink>
          ))}
          {settings.cta_text && (
            <SmartLink to={settings.cta_link || '#contact'} className="btn btn-red" onNavigate={() => setOpen(false)} tabIndex={open ? 0 : -1}>
              {settings.cta_text} <ArrowRight size={16} />
            </SmartLink>
          )}
        </div>
      </div>
    </>
  );
}

export function Footer({ settings = {}, nav = [], services = [] }) {
  const quick = nav.filter((n) => n.show_in_footer);
  const footerServices = services.filter((s) => s.show_in_footer);
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          {settings.logo
            ? <img src={assetUrl(settings.logo)} alt={settings.site_name} width="127" height="69" loading="lazy" />
            : <span className="brand-text" style={{ color: '#fff' }}>{settings.site_name}</span>}
          {settings.footer_about && <p>{settings.footer_about}</p>}
        </div>
        <div className="footer-col">
          <h4>Quick Links</h4>
          <ul>{quick.map((n) => <li key={n.id}><SmartLink to={n.target}>{n.label}</SmartLink></li>)}</ul>
        </div>
        <div className="footer-col">
          <h4>Services</h4>
          <ul>{footerServices.map((s) => <li key={s.id}><SmartLink to="#services">{s.title}</SmartLink></li>)}</ul>
        </div>
        <div className="footer-col">
          <h4>Contact</h4>
          <ul>
            {settings.email && <li><a href={`mailto:${settings.email}`}>{settings.email}</a></li>}
            {settings.phone && <li><a href={`tel:${settings.phone.replace(/[^\d+]/g, '')}`}>{settings.phone}</a></li>}
            {settings.address && <li>{settings.address}</li>}
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <span>{settings.copyright_text}</span>
          <span>{settings.footer_tagline}</span>
        </div>
      </div>
    </footer>
  );
}

export function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 900);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <button className={`back-top ${show ? 'is-visible' : ''}`} aria-label="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
      <ArrowUp size={20} />
    </button>
  );
}

export function SiteShell({ data, children }) {
  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      <TopBar items={data.topbar} settings={data.settings} />
      <Header settings={data.settings} nav={data.nav} />
      <main id="main">{children}</main>
      <Footer settings={data.settings} nav={data.nav} services={data.services} />
      <BackToTop />
    </>
  );
}

export function NotFoundBlock({ title = 'Page not found', text = "The page you're looking for doesn't exist or has moved." }) {
  return (
    <div className="page-state">
      <div>
        <span className="eyebrow">404</span>
        <h1 style={{ marginTop: 12 }}>{title}</h1>
        <p>{text}</p>
        <Link to="/" className="btn btn-red">Back to Home <ArrowRight size={16} /></Link>
      </div>
    </div>
  );
}
