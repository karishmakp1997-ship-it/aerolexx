import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { pool, query } from './db.js';
import { SCHEMA } from './schema.js';
import { seed } from './seed.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import publicRoutes from './routes/public.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.PORT || 5000);

app.set('trust proxy', 1);
app.disable('x-powered-by');

const origins = (process.env.CORS_ORIGIN || '').split(',').map((s) => s.trim()).filter(Boolean);
app.use(cors({ origin: origins.length ? origins : true }));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', async (req, res) => {
  try {
    await query('SELECT 1');
    res.json({ ok: true, db: 'connected' });
  } catch (e) {
    res.status(500).json({ ok: false, db: 'error', error: e.message });
  }
});

// Uploaded images are stored in MySQL so they survive redeploys on hosts with ephemeral disks.
app.get('/api/media/:id', async (req, res, next) => {
  try {
    const [row] = await query('SELECT mime_type, data FROM media WHERE id = ?', [Number(req.params.id)]);
    if (!row) return res.status(404).end();
    res.set('Content-Type', row.mime_type);
    res.set('Cache-Control', 'public, max-age=31536000, immutable');
    if (row.mime_type === 'image/svg+xml') res.set('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'");
    res.send(row.data);
  } catch (e) { next(e); }
});

app.use('/api/auth', authRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

// Serve the built React app when it exists (single-service deployment).
const clientDist = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist, { maxAge: '1h', index: false }));
  app.get('*', (req, res) => res.sendFile(path.join(clientDist, 'index.html')));
}

// Central error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ error: 'Image must be 5 MB or smaller' });
  if (err.code === 'ER_NO_REFERENCED_ROW_2') return res.status(400).json({ error: 'Selected category does not exist' });
  if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'A record with this value already exists' });
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON body' });
  const status = err.status || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ error: status >= 500 ? 'Something went wrong on the server' : err.message, field: err.field });
});

async function migrate() {
  for (const stmt of SCHEMA) await query(stmt);
  const done = await seed();
  if (done.length) console.log('[db] seeded:', done.join(', '));
}

migrate()
  .then(() => {
    app.listen(PORT, () => console.log(`Aerolex API running on http://localhost:${PORT}`));
  })
  .catch((e) => {
    console.error('[db] Could not initialise the database:', e.message);
    process.exit(1);
  });

process.on('SIGTERM', () => pool.end().finally(() => process.exit(0)));
