import mysql from 'mysql2/promise';
import 'dotenv/config';

/**
 * Connection config.
 * Supports either a single DATABASE_URL / MYSQL_URL (Railway, Aiven, TiDB style)
 * or individual DB_* variables.
 */
function buildConfig() {
  const url = process.env.DATABASE_URL || process.env.MYSQL_URL;
  const useSsl = String(process.env.DB_SSL || '').toLowerCase() === 'true';
  const base = {
    waitForConnections: true,
    connectionLimit: Number(process.env.DB_POOL_SIZE || 10),
    charset: 'utf8mb4',
    dateStrings: true,
    multipleStatements: false,
  };
  if (useSsl) base.ssl = { rejectUnauthorized: false, minVersion: 'TLSv1.2' };

  if (url) {
    const u = new URL(url);
    return {
      ...base,
      host: u.hostname,
      port: Number(u.port || 3306),
      user: decodeURIComponent(u.username),
      password: decodeURIComponent(u.password),
      database: u.pathname.replace(/^\//, '') || process.env.DB_NAME,
      ...(u.searchParams.get('ssl') || u.searchParams.get('ssl-mode') ? { ssl: base.ssl || { rejectUnauthorized: false } } : {}),
    };
  }
  return {
    ...base,
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'aerolex',
  };
}

export const pool = mysql.createPool(buildConfig());

// Keep all timestamps in UTC so the admin panel can show them in the viewer's local time.
pool.on('connection', (conn) => {
  conn.query("SET time_zone = '+00:00'");
});

export async function query(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return rows;
}
