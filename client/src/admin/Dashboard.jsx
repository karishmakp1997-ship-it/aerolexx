import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, CheckCircle2, Clock, Inbox, LayoutTemplate, Plane, Settings } from 'lucide-react';
import { api } from '../api.js';
import { MODULES } from './modules.js';
import { Loading, StatusChip, formatDateTime, useToast } from './ui.jsx';
import { useAuth } from './AdminApp.jsx';

export default function Dashboard() {
  const { admin } = useAuth();
  const toast = useToast();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api('/api/admin/stats').then(setStats).catch((e) => toast(e.message, 'error'));
  }, [toast]);

  if (!stats) return <Loading />;
  const c = stats.counts;

  const cards = [
    { to: '/admin/enquiries', icon: Inbox, value: stats.enquiries.new, label: 'New enquiries' },
    { to: '/admin/enquiries', icon: Clock, value: stats.enquiries.in_progress, label: 'In progress' },
    { to: '/admin/m/services', icon: Plane, value: c.services, label: 'Services' },
    { to: '/admin/m/insights', icon: BookOpen, value: c.insights, label: 'Insight articles' },
  ];

  return (
    <>
      <div className="adm-page-head">
        <div>
          <h1>Hello, {admin?.name?.split(' ')[0] || 'Admin'}</h1>
          <p>Here’s what’s happening on the Aerolex website.</p>
        </div>
        <div className="adm-actions">
          <Link to="/admin/sections" className="abtn"><LayoutTemplate size={16} /> Edit page sections</Link>
          <Link to="/admin/settings" className="abtn abtn-dark"><Settings size={16} /> Site settings</Link>
        </div>
      </div>

      <div className="adm-grid-stats">
        {cards.map((k) => (
          <Link key={k.label} to={k.to} className="adm-card adm-stat">
            <span className="adm-stat-icon"><k.icon size={22} /></span>
            <div><b>{k.value}</b><span>{k.label}</span></div>
          </Link>
        ))}
      </div>

      <div className="adm-two">
        <div className="adm-card">
          <div className="adm-card-head">
            <h2>Latest enquiries</h2>
            <Link to="/admin/enquiries" className="abtn abtn-sm">View all <ArrowRight size={14} /></Link>
          </div>
          {stats.recent.length === 0 ? (
            <div className="adm-empty"><CheckCircle2 size={34} /><p>No enquiries yet. They’ll appear here when visitors use the contact form.</p></div>
          ) : (
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead><tr><th>Name</th><th>Service</th><th>Status</th><th>Received</th></tr></thead>
                <tbody>
                  {stats.recent.map((e) => (
                    <tr key={e.id}>
                      <td><div className="t-main">{e.full_name}</div><div className="t-sub">{e.company || e.email}</div></td>
                      <td>{e.service || '—'}</td>
                      <td><StatusChip status={e.status} /></td>
                      <td style={{ whiteSpace: 'nowrap' }}>{formatDateTime(e.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="adm-card">
          <div className="adm-card-head"><h2>Content modules</h2></div>
          <div className="adm-modules">
            {Object.entries(MODULES).map(([key, m]) => (
              <Link key={key} to={`/admin/m/${key}`} className="adm-module-link">{m.title}<small>{c[key] ?? 0}</small></Link>
            ))}
            <Link to="/admin/sections" className="adm-module-link">Page Sections<small>8</small></Link>
            <Link to="/admin/enquiries" className="adm-module-link">Enquiries<small>{c.enquiries}</small></Link>
          </div>
        </div>
      </div>
    </>
  );
}
