import { Router } from 'express';
import multer from 'multer';
import bcrypt from 'bcryptjs';
import { query } from '../db.js';
import { requireAuth } from '../auth.js';
import { RESOURCES, cleanInput, present, slugify, ValidationError } from '../resources.js';

const router = Router();
router.use(requireAuth);

const wrap = (fn) => (req, res, next) => fn(req, res, next).catch(next);

/* ---------------------------- Dashboard stats ---------------------------- */
router.get('/stats', wrap(async (req, res) => {
  const counts = {};
  for (const [key, r] of Object.entries(RESOURCES)) {
    const [row] = await query(`SELECT COUNT(*) AS c FROM ${r.table}`);
    counts[key] = row.c;
  }
  const [e] = await query(`SELECT
      SUM(status='new') AS new_count, SUM(status='in_progress') AS in_progress, SUM(status='closed') AS closed
    FROM enquiries`);
  const recent = await query('SELECT id, full_name, company, email, service, status, created_at FROM enquiries ORDER BY created_at DESC, id DESC LIMIT 5');
  res.json({
    counts,
    enquiries: { new: Number(e.new_count || 0), in_progress: Number(e.in_progress || 0), closed: Number(e.closed || 0) },
    recent,
  });
}));

/* ------------------------------ Site settings ---------------------------- */
const SETTINGS_FIELDS = {
  site_name: { type: 'text', max: 150, required: true },
  logo: { type: 'text', max: 500 },
  cta_text: { type: 'text', max: 80 },
  cta_link: { type: 'text', max: 255 },
  topbar_link_text: { type: 'text', max: 120 },
  topbar_link_url: { type: 'text', max: 255 },
  topbar_frequency: { type: 'text', max: 120 },
  email: { type: 'email', max: 150 },
  phone: { type: 'text', max: 60 },
  address: { type: 'text', max: 255 },
  footer_about: { type: 'text', max: 2000 },
  copyright_text: { type: 'text', max: 255 },
  footer_tagline: { type: 'text', max: 150 },
  meta_title: { type: 'text', max: 200 },
  meta_description: { type: 'text', max: 300 },
};

router.get('/settings', wrap(async (req, res) => {
  const [row] = await query('SELECT * FROM site_settings WHERE id = 1');
  res.json(row || {});
}));

router.put('/settings', wrap(async (req, res) => {
  const data = cleanInput(SETTINGS_FIELDS, req.body, { partial: true });
  const cols = Object.keys(data);
  if (!cols.length) throw new ValidationError('Nothing to update');
  await query(
    `INSERT INTO site_settings (id, ${cols.join(',')}) VALUES (1, ${cols.map(() => '?').join(',')})
     ON DUPLICATE KEY UPDATE ${cols.map((c) => `${c}=VALUES(${c})`).join(',')}`,
    cols.map((c) => data[c]),
  );
  const [row] = await query('SELECT * FROM site_settings WHERE id = 1');
  res.json(row);
}));

/* ------------------------------ Page sections ---------------------------- */
const SECTION_FIELDS = {
  eyebrow: { type: 'text', max: 150 },
  title: { type: 'text', max: 255 },
  title_highlight: { type: 'text', max: 255 },
  description: { type: 'text', max: 3000 },
  image: { type: 'text', max: 500 },
  btn1_text: { type: 'text', max: 80 },
  btn1_link: { type: 'text', max: 255 },
  btn2_text: { type: 'text', max: 80 },
  btn2_link: { type: 'text', max: 255 },
  badge_label: { type: 'text', max: 120 },
  badge_value: { type: 'text', max: 120 },
  is_visible: { type: 'bool' },
};

router.get('/sections', wrap(async (req, res) => {
  res.json(await query('SELECT * FROM site_sections ORDER BY sort_order, label'));
}));

router.get('/sections/:key', wrap(async (req, res) => {
  const [row] = await query('SELECT * FROM site_sections WHERE section_key = ?', [req.params.key]);
  if (!row) return res.status(404).json({ error: 'Section not found' });
  res.json(row);
}));

router.put('/sections/:key', wrap(async (req, res) => {
  const [exists] = await query('SELECT section_key FROM site_sections WHERE section_key = ?', [req.params.key]);
  if (!exists) return res.status(404).json({ error: 'Section not found' });
  const data = cleanInput(SECTION_FIELDS, req.body, { partial: true });
  const cols = Object.keys(data);
  if (!cols.length) throw new ValidationError('Nothing to update');
  await query(`UPDATE site_sections SET ${cols.map((c) => `${c} = ?`).join(', ')} WHERE section_key = ?`, [...cols.map((c) => data[c]), req.params.key]);
  const [row] = await query('SELECT * FROM site_sections WHERE section_key = ?', [req.params.key]);
  res.json(row);
}));

/* ---------------------------------- Media -------------------------------- */
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'image/avif'];
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME.includes(file.mimetype)) cb(null, true);
    else cb(new ValidationError('Only image files (JPG, PNG, WEBP, GIF, SVG, AVIF) are allowed'));
  },
});

router.post('/media', upload.single('file'), wrap(async (req, res) => {
  if (!req.file) throw new ValidationError('Please choose an image to upload');
  const result = await query('INSERT INTO media (filename, mime_type, size_bytes, data) VALUES (?,?,?,?)', [
    req.file.originalname.slice(0, 250), req.file.mimetype, req.file.size, req.file.buffer,
  ]);
  res.status(201).json({ id: result.insertId, url: `/api/media/${result.insertId}` });
}));

router.get('/media', wrap(async (req, res) => {
  const rows = await query('SELECT id, filename, mime_type, size_bytes, created_at FROM media ORDER BY id DESC');
  res.json(rows.map((r) => ({ ...r, url: `/api/media/${r.id}` })));
}));

router.delete('/media/:id', wrap(async (req, res) => {
  const result = await query('DELETE FROM media WHERE id = ?', [Number(req.params.id)]);
  if (!result.affectedRows) return res.status(404).json({ error: 'Image not found' });
  res.json({ ok: true });
}));

/* ------------------------------ Admin users ------------------------------ */
router.get('/admins', wrap(async (req, res) => {
  res.json(await query('SELECT id, name, username, created_at FROM admins ORDER BY id'));
}));

router.post('/admins', wrap(async (req, res) => {
  const { name, username, password } = req.body || {};
  if (!name || !username || !password) throw new ValidationError('Name, username and password are required');
  if (String(password).length < 6) throw new ValidationError('Password must be at least 6 characters', 'password');
  const [dupe] = await query('SELECT id FROM admins WHERE username = ?', [String(username).trim()]);
  if (dupe) throw new ValidationError('That username is already taken', 'username');
  const r = await query('INSERT INTO admins (name, username, password_hash) VALUES (?,?,?)', [String(name).trim().slice(0, 120), String(username).trim().slice(0, 80), await bcrypt.hash(String(password), 10)]);
  const [row] = await query('SELECT id, name, username, created_at FROM admins WHERE id = ?', [r.insertId]);
  res.status(201).json(row);
}));

router.put('/admins/:id', wrap(async (req, res) => {
  const id = Number(req.params.id);
  const { name, username, password } = req.body || {};
  const [existing] = await query('SELECT id FROM admins WHERE id = ?', [id]);
  if (!existing) return res.status(404).json({ error: 'Admin not found' });
  if (username) {
    const [dupe] = await query('SELECT id FROM admins WHERE username = ? AND id <> ?', [String(username).trim(), id]);
    if (dupe) throw new ValidationError('That username is already taken', 'username');
  }
  if (password && String(password).length < 6) throw new ValidationError('Password must be at least 6 characters', 'password');
  const sets = []; const vals = [];
  if (name) { sets.push('name = ?'); vals.push(String(name).trim().slice(0, 120)); }
  if (username) { sets.push('username = ?'); vals.push(String(username).trim().slice(0, 80)); }
  if (password) { sets.push('password_hash = ?'); vals.push(await bcrypt.hash(String(password), 10)); }
  if (sets.length) await query(`UPDATE admins SET ${sets.join(', ')} WHERE id = ?`, [...vals, id]);
  const [row] = await query('SELECT id, name, username, created_at FROM admins WHERE id = ?', [id]);
  res.json(row);
}));

router.delete('/admins/:id', wrap(async (req, res) => {
  const id = Number(req.params.id);
  if (id === req.admin.id) throw new ValidationError('You cannot delete your own account');
  const [{ c }] = await query('SELECT COUNT(*) AS c FROM admins');
  if (c <= 1) throw new ValidationError('At least one admin account is required');
  const r = await query('DELETE FROM admins WHERE id = ?', [id]);
  if (!r.affectedRows) return res.status(404).json({ error: 'Admin not found' });
  res.json({ ok: true });
}));

/* ------------------------- Generic list resources ------------------------ */
function getResource(req) {
  const r = RESOURCES[req.params.resource];
  if (!r) {
    const err = new Error('Unknown module');
    err.status = 404;
    throw err;
  }
  return r;
}

async function uniqueSlug(table, base, excludeId) {
  const root = base || 'item';
  let slug = root; let n = 2;
  // eslint-disable-next-line no-await-in-loop
  while ((await query(`SELECT id FROM ${table} WHERE slug = ? AND id <> ?`, [slug, excludeId || 0])).length) {
    slug = `${root}-${n++}`;
  }
  return slug;
}

async function applySlug(r, data, id, current) {
  for (const [name, def] of Object.entries(r.fields)) {
    if (def.type !== 'slug') continue;
    const wanted = data[name] || (current && !(name in data) ? current[name] : null) || slugify(data[def.from] ?? current?.[def.from]);
    data[name] = await uniqueSlug(r.table, wanted, id);
  }
}

async function fetchOne(r, id) {
  const sql = r.select ? `${r.select} WHERE ${r.alias}.id = ?` : `SELECT * FROM ${r.table} WHERE id = ?`;
  const [row] = await query(sql, [id]);
  return present(r.fields, row);
}

router.get('/:resource', wrap(async (req, res) => {
  const r = getResource(req);
  const order = r.orderBy || 'sort_order ASC, id ASC';
  const base = r.select || `SELECT * FROM ${r.table}`;
  const prefixed = r.alias ? order.split(',').map((p) => `${r.alias}.${p.trim()}`).join(', ') : order;
  const rows = await query(`${base} ORDER BY ${prefixed}`);
  res.json(rows.map((row) => present(r.fields, row)));
}));

router.get('/:resource/:id', wrap(async (req, res) => {
  const r = getResource(req);
  const row = await fetchOne(r, Number(req.params.id));
  if (!row) return res.status(404).json({ error: 'Record not found' });
  res.json(row);
}));

router.post('/:resource', wrap(async (req, res) => {
  const r = getResource(req);
  const data = cleanInput(r.fields, req.body);
  await applySlug(r, data, 0);
  if ('sort_order' in r.fields && !('sort_order' in (req.body || {}))) {
    const [m] = await query(`SELECT COALESCE(MAX(sort_order),0)+1 AS n FROM ${r.table}`);
    data.sort_order = m.n;
  }
  const cols = Object.keys(data);
  const result = await query(`INSERT INTO ${r.table} (${cols.join(',')}) VALUES (${cols.map(() => '?').join(',')})`, cols.map((c) => data[c]));
  res.status(201).json(await fetchOne(r, result.insertId));
}));

router.put('/:resource/:id', wrap(async (req, res) => {
  const r = getResource(req);
  const id = Number(req.params.id);
  const current = await fetchOne(r, id);
  if (!current) return res.status(404).json({ error: 'Record not found' });
  const data = cleanInput(r.fields, req.body, { partial: true });
  if (Object.values(r.fields).some((d) => d.type === 'slug') && ('slug' in data || 'title' in data)) await applySlug(r, data, id, current);
  const cols = Object.keys(data);
  if (cols.length) {
    await query(`UPDATE ${r.table} SET ${cols.map((c) => `${c} = ?`).join(', ')} WHERE id = ?`, [...cols.map((c) => data[c]), id]);
  }
  res.json(await fetchOne(r, id));
}));

router.delete('/:resource/:id', wrap(async (req, res) => {
  const r = getResource(req);
  const result = await query(`DELETE FROM ${r.table} WHERE id = ?`, [Number(req.params.id)]);
  if (!result.affectedRows) return res.status(404).json({ error: 'Record not found' });
  res.json({ ok: true });
}));

export default router;
