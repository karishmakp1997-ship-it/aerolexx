import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'aerolex-dev-secret-change-me';
if (!process.env.JWT_SECRET) {
  console.warn('[auth] JWT_SECRET not set — using a development secret. Set JWT_SECRET in production.');
}

export function signToken(admin) {
  return jwt.sign({ id: admin.id, username: admin.username, name: admin.name }, SECRET, { expiresIn: '12h' });
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Authentication required' });
  try {
    req.admin = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Session expired. Please log in again.' });
  }
}
