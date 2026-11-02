import { useCallback, useEffect, useRef, useState } from 'react';
import { Copy, ImagePlus, Images, Trash2 } from 'lucide-react';
import { api, assetUrl } from '../api.js';
import { ConfirmDialog, Loading, formatDateTime, useToast } from './ui.jsx';

const kb = (n) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.round(n / 1024)} KB`);

export default function MediaPage() {
  const toast = useToast();
  const [items, setItems] = useState(null);
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const input = useRef(null);

  const load = useCallback(() => api('/api/admin/media').then(setItems).catch((e) => { toast(e.message, 'error'); setItems([]); }), [toast]);
  useEffect(() => { load(); }, [load]);

  const upload = async (files) => {
    if (!files?.length) return;
    setBusy(true);
    let ok = 0;
    for (const file of files) {
      const form = new FormData();
      form.append('file', file);
      try { await api('/api/admin/media', { method: 'POST', form }); ok += 1; } catch (e) { toast(`${file.name}: ${e.message}`, 'error'); }
    }
    setBusy(false);
    if (input.current) input.current.value = '';
    if (ok) toast(`${ok} image${ok > 1 ? 's' : ''} uploaded`);
    load();
  };

  const copy = async (url) => {
    try { await navigator.clipboard.writeText(url); toast('Image URL copied'); } catch { toast(url); }
  };

  return (
    <>
      <div className="adm-page-head">
        <div>
          <h1>Media Library</h1>
          <p>All images uploaded through the admin panel. Images are stored in the MySQL database, so they survive redeploys.</p>
        </div>
        <div className="adm-actions">
          <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => upload([...e.target.files])} />
          <button className="abtn abtn-primary" onClick={() => input.current?.click()} disabled={busy}><ImagePlus size={17} /> {busy ? 'Uploading…' : 'Upload images'}</button>
        </div>
      </div>
      <div className="adm-card">
        {!items ? <Loading /> : items.length === 0 ? (
          <div className="adm-empty"><Images size={36} /><p>No uploaded images yet. Images you upload in any form also appear here.</p></div>
        ) : (
          <div className="adm-media-grid">
            {items.map((m) => (
              <div key={m.id} className="adm-media-item">
                <div className="img"><img src={assetUrl(m.url)} alt={m.filename} loading="lazy" /></div>
                <div className="meta">
                  <b title={m.filename}>{m.filename}</b>
                  <span>{kb(m.size_bytes)} · {formatDateTime(m.created_at)}</span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="abtn abtn-sm" style={{ flex: 1 }} onClick={() => copy(m.url)}><Copy size={14} /> Copy URL</button>
                    <button className="abtn abtn-sm abtn-danger" onClick={() => setDeleting(m)} aria-label="Delete image"><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {deleting && (
        <ConfirmDialog
          title="Delete this image?"
          message="Any section or record still using this image will show an empty image. This cannot be undone."
          onClose={() => setDeleting(null)}
          onConfirm={async () => {
            try { await api(`/api/admin/media/${deleting.id}`, { method: 'DELETE' }); toast('Image deleted'); setDeleting(null); load(); } catch (e) { toast(e.message, 'error'); }
          }}
        />
      )}
    </>
  );
}
