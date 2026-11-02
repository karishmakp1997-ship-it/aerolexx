import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { query } from '../db.js';
import { RESOURCES, cleanInput, present } from '../resources.js';

const router = Router();
const wrap = (fn) => (req, res, next) => fn(req, res, next).catch(next);

const active = (table, extra = '') => query(`SELECT * FROM ${table} WHERE is_active = 1 ${extra} ORDER BY sort_order ASC, id ASC`);

const INSIGHT_CARD_COLS = 'id, title, slug, category, category_icon, image, excerpt, author, published_on, read_time';

// Everything the home page needs, in one request.
router.get('/home', wrap(async (req, res) => {
  const [settings] = await query('SELECT * FROM site_settings WHERE id = 1');
  const sectionRows = await query('SELECT * FROM site_sections ORDER BY sort_order');
  const sections = Object.fromEntries(sectionRows.map((s) => [s.section_key, s]));

  const [topbar, nav, highlights, aboutFeatures, categories, services, vip, process, insights] = await Promise.all([
    active('topbar_items'),
    active('nav_links'),
    active('hero_highlights'),
    active('about_features'),
    active('service_categories'),
    query(`SELECT s.*, c.name AS category_name FROM services s
           LEFT JOIN service_categories c ON c.id = s.category_id
           WHERE s.is_active = 1 ORDER BY s.sort_order ASC, s.id ASC`),
    active('vip_features'),
    active('process_steps'),
    query(`SELECT ${INSIGHT_CARD_COLS} FROM insights WHERE is_active = 1 ORDER BY sort_order ASC, id ASC`),
  ]);

  res.set('Cache-Control', 'no-store');
  res.json({
    settings: settings || {},
    sections,
    topbar,
    nav,
    highlights,
    aboutFeatures,
    categories,
    services: services.map((s) => present(RESOURCES.services.fields, s)),
    vip,
    process,
    insights,
  });
}));

router.get('/insights', wrap(async (req, res) => {
  res.json(await query(`SELECT ${INSIGHT_CARD_COLS} FROM insights WHERE is_active = 1 ORDER BY sort_order ASC, id ASC`));
}));

router.get('/insights/:slug', wrap(async (req, res) => {
  const [article] = await query('SELECT * FROM insights WHERE slug = ? AND is_active = 1', [req.params.slug]);
  if (!article) return res.status(404).json({ error: 'Article not found' });
  const related = await query(
    `SELECT ${INSIGHT_CARD_COLS} FROM insights WHERE is_active = 1 AND id <> ? ORDER BY sort_order ASC, id ASC LIMIT 3`,
    [article.id],
  );
  res.json({ article, related });
}));

const enquiryLimiter = rateLimit({ windowMs: 10 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false,
  message: { error: 'Too many enquiries from this device. Please try again shortly.' } });

router.post('/enquiries', enquiryLimiter, wrap(async (req, res) => {
  const body = req.body || {};
  // Honeypot field: real users never fill it.
  if (body.website) return res.status(201).json({ ok: true });
  const { status, admin_notes, ...publicFields } = RESOURCES.enquiries.fields;
  const data = cleanInput(publicFields, body);
  const cols = Object.keys(data);
  const r = await query(`INSERT INTO enquiries (${cols.join(',')}) VALUES (${cols.map(() => '?').join(',')})`, cols.map((c) => data[c]));
  res.status(201).json({ ok: true, id: r.insertId });
}));

export default router;
