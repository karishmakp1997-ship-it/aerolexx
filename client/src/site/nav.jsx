import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export function scrollToId(id, behavior = 'smooth') {
  const el = id === 'home' ? document.body : document.getElementById(id);
  if (!el) return false;
  if (id === 'home') window.scrollTo({ top: 0, behavior });
  else el.scrollIntoView({ behavior, block: 'start' });
  return true;
}

/** Returns a click handler that understands "#section", "/path" and external URLs. */
export function useGo() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  return useCallback((target, e) => {
    if (!target) return;
    const isExternal = /^(https?:|mailto:|tel:)/.test(target);
    if (isExternal) return; // let the browser handle it
    if (e) e.preventDefault();
    if (target.startsWith('#')) {
      const id = target.slice(1) || 'home';
      if (pathname === '/') {
        scrollToId(id);
        window.history.replaceState(null, '', id === 'home' ? '/' : target);
      } else {
        navigate(`/${target}`);
      }
      return;
    }
    navigate(target);
    window.scrollTo(0, 0);
  }, [navigate, pathname]);
}

export function SmartLink({ to, children, onNavigate, ...rest }) {
  const go = useGo();
  const external = /^(https?:)/.test(to || '');
  return (
    <a
      href={to?.startsWith('#') ? `/${to}` : to || '#'}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      onClick={(e) => { go(to, e); onNavigate?.(); }}
      {...rest}
    >
      {children}
    </a>
  );
}

/** Highlights the nav item of the section currently in view. */
export function useScrollSpy(ids, enabled) {
  const [active, setActive] = useState(ids[0] || null);
  const key = ids.join(',');
  useEffect(() => {
    if (!enabled) return undefined;
    const els = key.split(',').map((id) => document.getElementById(id)).filter(Boolean);
    if (!els.length) return undefined;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((en) => en.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [key, enabled]);
  return active;
}

/** Fades elements in as they scroll into view. */
export function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (!('IntersectionObserver' in window)) { el.classList.add('is-visible'); return undefined; }
    const obs = new IntersectionObserver(([en]) => {
      if (en.isIntersecting) { el.classList.add('is-visible'); obs.disconnect(); }
    }, { threshold: 0.12 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

export function Reveal({ as: Tag = 'div', className = '', children, ...rest }) {
  const ref = useReveal();
  return <Tag ref={ref} className={`reveal ${className}`} {...rest}>{children}</Tag>;
}
