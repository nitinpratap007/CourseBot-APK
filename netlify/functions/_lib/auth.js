const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'coursebot-default-secret-change-me';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

function verifyToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split(' ')[1];
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

function requireAuth(event) {
  const headers = event.headers || {};
  const auth = headers.authorization || headers.Authorization;
  if (!verifyToken(auth)) {
    return {
      statusCode: 401,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Unauthorized' }),
    };
  }
  return null;
}

function createToken() {
  return jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
}

function checkPassword(password) {
  return password === ADMIN_PASSWORD;
}

module.exports = { requireAuth, createToken, checkPassword };
