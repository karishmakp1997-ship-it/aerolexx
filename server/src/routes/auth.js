import { Router } from 'express';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import { query } from '../db.js';
import { signToken, requireAuth } from '../auth.js';

const router = Router();

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false,
  message: { error: 'Too many login attempts. Please try again in a few minutes.' } });

router.post('/login', loginLimiter, async (req, res, next) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ error: 'Username and password are required' });
    const [admin] = await query('SELECT * FROM admins WHERE username = ?', [String(username).trim()]);
    if (!admin || !(await bcrypt.compare(String(password), admin.password_hash))) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    res.json({ token: signToken(admin), admin: { id: admin.id, name: admin.name, username: admin.username } });
  } catch (e) { next(e); }
});

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const [admin] = await query('SELECT id, name, username, created_at FROM admins WHERE id = ?', [req.admin.id]);
    if (!admin) return res.status(401).json({ error: 'Account no longer exists' });
    res.json(admin);
  } catch (e) { next(e); }
});

router.put('/password', requireAuth, async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body || {};
    if (!current_password || !new_password) return res.status(400).json({ error: 'Both current and new password are required' });
    if (String(new_password).length < 6) return res.status(400).json({ error: 'New password must be at least 6 characters' });
    const [admin] = await query('SELECT * FROM admins WHERE id = ?', [req.admin.id]);
    if (!admin || !(await bcrypt.compare(String(current_password), admin.password_hash))) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }
    await query('UPDATE admins SET password_hash = ? WHERE id = ?', [await bcrypt.hash(String(new_password), 10), admin.id]);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

export default router;
