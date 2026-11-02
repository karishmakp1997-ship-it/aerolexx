// Drops every Aerolex table and re-creates it with the default design content.
// Usage: npm run db:reset
import { pool, query } from '../db.js';
import { SCHEMA } from '../schema.js';
import { seed } from '../seed.js';

const TABLES = ['services', 'service_categories', 'site_sections', 'site_settings', 'topbar_items', 'nav_links',
  'hero_highlights', 'about_features', 'vip_features', 'process_steps', 'insights', 'enquiries', 'media', 'admins'];

try {
  await query('SET FOREIGN_KEY_CHECKS = 0');
  for (const t of TABLES) await query(`DROP TABLE IF EXISTS ${t}`);
  await query('SET FOREIGN_KEY_CHECKS = 1');
  for (const stmt of SCHEMA) await query(stmt);
  console.log('Seeded:', (await seed()).join(', '));
} catch (e) {
  console.error(e.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
