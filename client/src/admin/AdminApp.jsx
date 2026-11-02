import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Navigate, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import {
  Activity, BookOpen, Crown, ExternalLink, Gauge, Images, Inbox, LayoutTemplate, LogOut, Menu,
  Navigation, Plane, Settings, Shapes, Sparkles, Tags, UserCog, Users, Workflow,
} from 'lucide-react';
import '../styles/admin.css';
import { api, auth } from '../api.js';
import { Loading, ToastProvider } from './ui.jsx';
import Login from './Login.jsx';
import Dashboard from './Dashboard.jsx';
import CrudPage from './CrudPage.jsx';
import { SectionsPage, SectionEditor } from './Sections.jsx';
import SettingsPage from './SettingsPage.jsx';
import EnquiriesPage from './EnquiriesPage.jsx';
import MediaPage from './MediaPage.jsx';
import { AdminsPage, AccountPage } from './Users.jsx';
import { MODULES } from './modules.js';

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

const NAV = [
  { group: null, items: [
    { to: '/admin', label: 'Dashboard', icon: Gauge, end: true },
    { to: '/admin/enquiries', label: 'Enquiries', icon: Inbox, badge: 'enquiries' },
  ] },
  { group: 'Website content', items: [
    { to: '/admin/sections', label: 'Page Sections', icon: LayoutTemplate },
    { to: '/admin/m/topbar-items', label: 'Top Bar', icon: Activity },
    { to: '/admin/m/nav-links', label: 'Navigation', icon: Navigation },
    { to: '/admin/m/hero-highlights', label: 'Hero Highlights', icon: Sparkles },
    { to: '/admin/m/about-features', label: 'About Features', icon: Shapes },
    { to: '/admin/m/service-categories', label: 'Service Categories', icon: Tags },
    { to: '/admin/m/services', label: 'Services', icon: Plane },
    { to: '/admin/m/vip-features', label: 'VIP Features', icon: Crown },
    { to: '/admin/m/process-steps', label: 'Process Steps', icon: Workflow },
    { to: '/admin/m/insights', label: 'Insights', icon: BookOpen },
  ] },
  { group: 'Settings', items: [
    { to: '/admin/settings', label: 'Site Settings', icon: Settings },
    { to: '/admin/media', label: 'Media Library', icon: Images },
    { to: '/admin/admins', label: 'Admin Users', icon: Users },
    { to: '/admin/account', label: 'My Account', icon: UserCog },
  ] },
];

function pageName(pathname) {
  const m = pathname.match(/^\/admin\/m\/([^/]+)/);
  if (m) return MODULES[m[1]]?.title || 'Module';
  for (const g of NAV) for (const it of g.items) if (it.to !== '/admin' && pathname.startsWith(it.to)) return it.label;
  return 'Dashboard';
}

function Shell() {
  const { admin, logout } = useAuth();
  const { pathname } = useLocation();
  const [navOpen, setNavOpen] = useState(false);
  const [newCount, setNewCount] = useState(0);

  useEffect(() => { setNavOpen(false); }, [pathname]);
  useEffect(() => {
    api('/api/admin/stats').then((s) => setNewCount(s.enquiries.new)).catch(() => {});
  }, [pathname]);
  useEffect(() => { document.title = `${pageName(pathname)} · Aerolex Admin`; }, [pathname]);

  return (
    <div className={`adm-shell ${navOpen ? 'nav-open' : ''}`}>
      <aside className="adm-side">
        <div className="adm-brand">
          <img src="/images/logo.png" alt="" />
          <div><b>Aerolex</b><small>Admin Panel</small></div>
        </div>
        <nav className="adm-nav" aria-label="Admin">
          {NAV.map((g) => (
            <div key={g.group || 'main'}>
              {g.group && <div className="adm-nav-group">{g.group}</div>}
              {g.items.map((it) => (
                <NavLink key={it.to} to={it.to} end={it.end} className={({ isActive }) => (isActive ? 'active' : '')}>
                  <it.icon size={18} /> {it.label}
                  {it.badge === 'enquiries' && newCount > 0 && <span className="count">{newCount}</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="adm-side-foot adm-nav">
          <a href="/" target="_blank" rel="noreferrer"><ExternalLink size={18} /> View website</a>
          <a href="#logout" onClick={(e) => { e.preventDefault(); logout(); }}><LogOut size={18} /> Log out</a>
        </div>
      </aside>
      <div className="adm-backdrop" onClick={() => setNavOpen(false)} />
      <div className="adm-main">
        <header className="adm-top">
          <div className="adm-top-left">
            <button className="abtn abtn-icon adm-burger" onClick={() => setNavOpen(true)} aria-label="Open menu"><Menu size={19} /></button>
            <span className="adm-crumb">Admin / <b>{pageName(pathname)}</b></span>
          </div>
          <div className="adm-top-right">
            <a className="abtn abtn-sm" href="/" target="_blank" rel="noreferrer"><ExternalLink size={15} /> <span className="name">Website</span></a>
            <div className="adm-user">
              <span className="adm-avatar">{(admin?.name || 'A')[0].toUpperCase()}</span>
              <span className="name">{admin?.name}</span>
            </div>
          </div>
        </header>
        <main className="adm-content">
          <Routes>
            <Route index element={<Dashboard />} />
            <Route path="enquiries" element={<EnquiriesPage onChange={setNewCount} />} />
            <Route path="sections" element={<SectionsPage />} />
            <Route path="sections/:key" element={<SectionEditor />} />
            <Route path="m/:resource" element={<CrudPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="media" element={<MediaPage />} />
            <Route path="admins" element={<AdminsPage />} />
            <Route path="account" element={<AccountPage />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function AdminApp() {
  const [state, setState] = useState({ checking: true, admin: null });
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const logout = useCallback(() => {
    auth.clear();
    setState({ checking: false, admin: null });
    navigate('/admin/login', { replace: true });
  }, [navigate]);

  useEffect(() => {
    if (!auth.token) { setState({ checking: false, admin: null }); return; }
    api('/api/auth/me')
      .then((admin) => setState({ checking: false, admin }))
      .catch(() => { auth.clear(); setState({ checking: false, admin: null }); });
  }, []);

  useEffect(() => {
    const onLogout = () => setState({ checking: false, admin: null });
    window.addEventListener('aerolex:logout', onLogout);
    return () => window.removeEventListener('aerolex:logout', onLogout);
  }, []);

  const login = (token, admin) => {
    auth.set(token);
    setState({ checking: false, admin });
  };

  if (state.checking) return <div className="adm"><Loading text="Checking your session…" /></div>;

  const isLogin = pathname.replace(/\/$/, '') === '/admin/login';

  return (
    <AuthCtx.Provider value={{ admin: state.admin, login, logout, setAdmin: (a) => setState((s) => ({ ...s, admin: a })) }}>
      <ToastProvider>
        <div className="adm">
          {!state.admin
            ? (isLogin ? <Login /> : <Navigate to="/admin/login" replace state={{ from: pathname }} />)
            : (isLogin ? <Navigate to="/admin" replace /> : <Shell />)}
        </div>
      </ToastProvider>
    </AuthCtx.Provider>
  );
}

