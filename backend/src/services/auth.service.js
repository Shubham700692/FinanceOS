const { v4: uuidv4 } = require('uuid');
const db = require('../models/database');
const { generateTokens, verifyRefreshToken, hashPassword, comparePassword, hashToken } = require('../utils/auth');
const { AuthError, NotFoundError, AppError } = require('../utils/response');

const REFRESH_TOKEN_EXPIRY_DAYS = 7;

const register = async ({ name, email, password, role }) => {
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) throw new AppError('Email already registered', 409, 'EMAIL_EXISTS');

  const passwordHash = await hashPassword(password);
  const id = uuidv4();

  db.prepare(`
    INSERT INTO users (id, name, email, password_hash, role, status)
    VALUES (?, ?, ?, ?, ?, 'active')
  `).run(id, name, email, passwordHash, role);

  const user = db.prepare('SELECT id, name, email, role, status, created_at FROM users WHERE id = ?').get(id);
  const { accessToken, refreshToken } = generateTokens(user);

 
  storeRefreshToken(id, refreshToken);

  return { user, accessToken, refreshToken };
};

const login = async ({ email, password }) => {
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) throw new AuthError('Invalid email or password');
  if (user.status === 'inactive') throw new AuthError('Account is deactivated. Contact an admin.');

  const valid = await comparePassword(password, user.password_hash);
  if (!valid) throw new AuthError('Invalid email or password');

    db.prepare("UPDATE users SET last_login = datetime('now') WHERE id = ?").run(user.id);

  const { accessToken, refreshToken } = generateTokens(user);
  storeRefreshToken(user.id, refreshToken);

  const { password_hash, ...safeUser } = user;
  return { user: safeUser, accessToken, refreshToken };
};

const refreshTokens = (refreshToken) => {
  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    throw new AuthError('Invalid or expired refresh token');
  }

  const tokenHash = hashToken(refreshToken);
  const stored = db.prepare('SELECT * FROM refresh_tokens WHERE user_id = ? AND token_hash = ?')
    .get(decoded.userId, tokenHash);

  if (!stored || new Date(stored.expires_at) < new Date()) {
    throw new AuthError('Refresh token not found or expired');
  }

  const user = db.prepare('SELECT id, name, email, role, status FROM users WHERE id = ?').get(decoded.userId);
  if (!user || user.status === 'inactive') throw new AuthError('User unavailable');

  // Rotate token
  db.prepare('DELETE FROM refresh_tokens WHERE id = ?').run(stored.id);
  const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);
  storeRefreshToken(user.id, newRefreshToken);

  return { accessToken, refreshToken: newRefreshToken };
};

const logout = (userId, refreshToken) => {
  if (refreshToken) {
    const tokenHash = hashToken(refreshToken);
    db.prepare('DELETE FROM refresh_tokens WHERE user_id = ? AND token_hash = ?').run(userId, tokenHash);
  }
};

const storeRefreshToken = (userId, token) => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);
  db.prepare(`
    INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at)
    VALUES (?, ?, ?, ?)
  `).run(uuidv4(), userId, hashToken(token), expiresAt.toISOString());
};

module.exports = { register, login, refreshTokens, logout };