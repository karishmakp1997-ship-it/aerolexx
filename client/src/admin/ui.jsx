import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, ChevronDown, ImagePlus, Link2, Trash2, X } from 'lucide-react';
import { api, assetUrl } from '../api.js';
import { ICON_NAMES, Icon } from '../icons.jsx';

/* ------------------------------- Toasts ------------------------------- */
const ToastCtx = createContext(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((message, type = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="adm-toasts" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`adm-toast ${t.type}`} role={t.type === 'error' ? 'alert' : 'status'}>
            {t.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
            {t.message}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

/* ------------------------------ Overlays ------------------------------ */
function useEscape(onClose) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [onClose]);
}

export function Drawer({ title, onClose, children, footer }) {
  useEscape(onClose);
  return (
    <div className="adm-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="adm-drawer" role="dialog" aria-modal="true" aria-label={title}>
        <div className="adm-drawer-head">
          <h2>{title}</h2>
          <button className="abtn abtn-icon abtn-ghost" onClick={onClose} aria-label="Close"><X size={20} /></button>
        </div>
        <div className="adm-drawer-body">{children}</div>
        {footer && <div className="adm-drawer-foot">{footer}</div>}
      </div>
    </div>
  );
}

export function Dialog({ title, children, onClose, actions, wide }) {
  useEscape(onClose);
  return (
    <div className="adm-overlay center" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`adm-dialog ${wide ? 'wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
          <h3>{title}</h3>
          <button className="abtn abtn-icon abtn-ghost" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        {children}
        {actions && <div className="adm-dialog-actions">{actions}</div>}
      </div>
    </div>
  );
}

export function ConfirmDialog({ title = 'Delete record?', message, confirmText = 'Delete', onConfirm, onClose }) {
  const [busy, setBusy] = useState(false);
  return (
    <Dialog
      title={title}
      onClose={onClose}
      actions={(
        <>
          <button className="abtn" onClick={onClose} disabled={busy}>Cancel</button>
          <button className="abtn abtn-primary" disabled={busy} onClick={async () => { setBusy(true); try { await onConfirm(); } finally { setBusy(false); } }}>
            <Trash2 size={16} /> {busy ? 'Deleting…' : confirmText}
          </button>
        </>
      )}
    >
      <p>{message || 'This action cannot be undone.'}</p>
    </Dialog>
  );
}

/* ------------------------------- Inputs ------------------------------- */
export function Switch({ checked, onChange, label, disabled }) {
  return (
    <label className="adm-switch">
      <input type="checkbox" checked={!!checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
      <span className="track" />
      {label && <span>{label}</span>}
    </label>
  );
}

export function Field({ label, required, help, error, full, children }) {
  return (
    <div className={`adm-field ${full ? 'full' : ''} ${error ? 'has-err' : ''}`}>
      {label && <label>{label}{required && <span className="req"> *</span>}</label>}
      {children}
      {error ? <span className="adm-err">{error}</span> : help ? <span className="adm-help">{help}</span> : null}
    </div>
  );
}

export function IconPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);
  return (
    <div className="adm-icon-picker" ref={ref}>
      <button type="button" className="adm-icon-current" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span className="adm-icon-cell"><Icon name={value} size={16} /></span>
        {value || 'Choose an icon'}
        <ChevronDown size={16} className="chev" />
      </button>
      {open && (
        <div className="adm-icon-grid" role="listbox">
          {ICON_NAMES.map((n) => (
            <button type="button" key={n} title={n} aria-label={n} className={n === value ? 'sel' : ''} onClick={() => { onChange(n); setOpen(false); }}>
              <Icon name={n} size={18} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function TagsInput({ value = [], onChange, placeholder = 'Type and press Enter' }) {
  const [text, setText] = useState('');
  const add = () => {
    const parts = text.split(',').map((t) => t.trim()).filter(Boolean);
    if (parts.length) onChange([...value, ...parts.filter((p) => !value.includes(p))]);
    setText('');
  };
  return (
    <div className="adm-tags-input">
      {value.map((t) => (
        <span className="tag" key={t}>{t}<button type="button" aria-label={`Remove ${t}`} onClick={() => onChange(value.filter((x) => x !== t))}><X size={13} /></button></span>
      ))}
      <input
        type="text"
        value={text}
        placeholder={value.length ? '' : placeholder}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(); }
          else if (e.key === 'Backspace' && !text && value.length) onChange(value.slice(0, -1));
        }}
        onBlur={add}
      />
    </div>
  );
}

export function ImageField({ value, onChange }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const inputRef = useRef(null);
  const upload = async (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast('Image must be 5 MB or smaller', 'error'); return; }
    const form = new FormData();
    form.append('file', file);
    setBusy(true);
    try {
      const r = await api('/api/admin/media', { method: 'POST', form });
      onChange(r.url);
      toast('Image uploaded');
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };
  return (
    <div className="adm-image">
      <div className="adm-image-preview">
        {value ? <img src={assetUrl(value)} alt="" /> : <ImagePlus size={26} />}
      </div>
      <div className="adm-image-body">
        <div style={{ position: 'relative' }}>
          <input type="text" value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder="Upload an image or paste an image URL" />
        </div>
        <div className="adm-image-btns">
          <input ref={inputRef} type="file" accept="image/*" hidden onChange={(e) => upload(e.target.files?.[0])} />
          <button type="button" className="abtn abtn-sm abtn-dark" onClick={() => inputRef.current?.click()} disabled={busy}>
            <ImagePlus size={15} /> {busy ? 'Uploading…' : 'Upload image'}
          </button>
          {value && <a className="abtn abtn-sm" href={assetUrl(value)} target="_blank" rel="noreferrer"><Link2 size={15} /> Open</a>}
          {value && <button type="button" className="abtn abtn-sm abtn-danger" onClick={() => onChange('')}><X size={15} /> Remove</button>}
        </div>
      </div>
    </div>
  );
}

export function Loading({ text = 'Loading…' }) {
  return <div className="adm-loading"><div className="adm-spin" /><span>{text}</span></div>;
}

const STATUS = { new: ['New', 'red'], in_progress: ['In progress', 'amber'], closed: ['Closed', 'green'] };
export function StatusChip({ status }) {
  const [label, color] = STATUS[status] || [status, ''];
  return <span className={`adm-chip ${color}`}>{label}</span>;
}
export const STATUS_OPTIONS = Object.entries(STATUS).map(([value, [label]]) => ({ value, label }));

export function formatDateTime(v) {
  if (!v) return '—';
  const d = new Date(String(v).replace(' ', 'T') + (String(v).includes('Z') ? '' : 'Z'));
  return Number.isNaN(d.getTime()) ? v : d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
