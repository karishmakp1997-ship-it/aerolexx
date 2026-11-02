// API base: empty = same origin (Vite proxy in dev, Express serves the build in production).
// Set VITE_API_URL when the frontend is hosted separately (e.g. Vercel + Render).
export const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

const TOKEN_KEY = 'aerolex_admin_token';

export const auth = {
  get token() {
    try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
  },
  set(token) {
    try { localStorage.setItem(TOKEN_KEY, token); } catch { /* ignore */ }
  },
  clear() {
    try { localStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ }
  },
};

export class ApiError extends Error {
  constructor(message, status, field) {
    super(message);
    this.status = status;
    this.field = field;
  }
}

export async function api(path, { method = 'GET', body, form } = {}) {
  const headers = {};
  const token = auth.token;
  if (token && (path.startsWith('/api/admin') || path.startsWith('/api/auth'))) headers.Authorization = `Bearer ${token}`;
  let payload;
  if (form) payload = form;
  else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, { method, headers, body: payload });
  } catch {
    throw new ApiError('Cannot reach the server. Please check your connection.', 0);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && path.startsWith('/api/admin')) {
      auth.clear();
      window.dispatchEvent(new Event('aerolex:logout'));
    }
    throw new ApiError(data.error || `Request failed (${res.status})`, res.status, data.field);
  }
  return data;
}

// Resolve an image path stored in the database to a usable URL.
export function assetUrl(src) {
  if (!src) return '';
  if (/^(https?:)?\/\//.test(src) || src.startsWith('data:')) return src;
  if (src.startsWith('/api/')) return `${API_BASE}${src}`;
  return src;
}
