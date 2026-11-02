import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Eye, EyeOff, LogIn } from 'lucide-react';
import { api } from '../api.js';
import { useAuth } from './AdminApp.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ username: '', password: '' });
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.username.trim() || !form.password) { setError('Please enter your username and password'); return; }
    setBusy(true);
    setError('');
    try {
      const r = await api('/api/auth/login', { method: 'POST', body: form });
      login(r.token, r.admin);
      const from = location.state?.from;
      navigate(from && from.startsWith('/admin') && from !== '/admin/login' ? from : '/admin', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="adm-login">
      <div className="adm-login-art" style={{ backgroundImage: 'url(/images/hero.jpg)' }}>
        <img src="/images/logo.png" alt="Aerolex Advisors" style={{ width: 120, marginBottom: 'auto', borderRadius: 3 }} />
        <h2>Operations Desk <span>Control Panel.</span></h2>
        <p>Manage every section of the Aerolex website — services, insights, process, enquiries and more.</p>
      </div>
      <div className="adm-login-form">
        <form onSubmit={submit} noValidate>
          <div>
            <h1>Welcome back</h1>
          </div>
          <p className="sub">Sign in to the Aerolex admin panel.</p>
          {error && <div className="adm-alert error" role="alert"><AlertCircle size={18} /> {error}</div>}
          <div className="adm-field">
            <label htmlFor="u">Username</label>
            <input id="u" type="text" autoComplete="username" autoFocus value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
          </div>
          <div className="adm-field">
            <label htmlFor="p">Password</label>
            <div className="adm-pass">
              <input id="p" type={show ? 'text' : 'password'} autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              <button type="button" className="abtn abtn-icon abtn-ghost abtn-sm" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'}>
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button className="abtn abtn-primary" type="submit" disabled={busy}><LogIn size={17} /> {busy ? 'Signing in…' : 'Sign in'}</button>
          <Link to="/" className="adm-help" style={{ display: 'inline-flex', gap: 6, alignItems: 'center', justifySelf: 'center' }}><ArrowLeft size={14} /> Back to website</Link>
        </form>
      </div>
    </div>
  );
}
