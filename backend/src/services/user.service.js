const { v4: uuidv4 } = require('uuid');
const db = require('../models/database');
const { hashPassword, comparePassword } = require('../utils/auth');
const { NotFoundError, AppError, ForbiddenError } = require('../utils/response');

const SAFE_FIELDS = 'id, name, email, role, status, created_at, updated_at, last_login';

const getAllUsers = ({ page = 1, limit = 20, role, status, search } = {}) => {
  let query = `SELECT ${SAFE_FIELDS} FROM users WHERE 1=1`;
  const params = [];

  if (role) { query += ' AND role = ?'; params.push(role); }
  if (status) { query += ' AND status = ?'; params.push(status); }
  if (search) { query += ' AND (name LIKE ? OR email LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }

  const total = db.prepare(query.replace(`SELECT ${SAFE_FIELDS}`, 'SELECT COUNT(*)')).get(...params)['COUNT(*)'];

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, (page - 1) * limit);

  const users = db.prepare(query).all(...params);
  return { users, total, page, limit, totalPages: Math.ceil(total / limit) };
};

const getUserById = (id) => {
  const user = db.prepare(`SELECT ${SAFE_FIELDS} FROM users WHERE id = ?`).get(id);
  if (!user) throw new NotFoundError('User');
  return user;
};

const updateUser = (id, updates, requesterId, requesterRole) => {
  const user = db.prepare(`SELECT ${SAFE_FIELDS} FROM users WHERE id = ?`).get(id);
  if (!user) throw new NotFoundError('User');

  // Prevent demoting yourself
  if (id === requesterId && updates.role && updates.role !== user.role) {
    throw new ForbiddenError('Cannot change your own role');
  }
  // Prevent deactivating yourself
  if (id === requesterId && updates.status === 'inactive') {
    throw new ForbiddenError('Cannot deactivate your own account');
  }

  const fields = Object.keys(updates).map(k => `${k} = ?`).join(', ');
  const values = [...Object.values(updates), new Date().toISOString(), id];
  db.prepare(`UPDATE users SET ${fields}, updated_at = ? WHERE id = ?`).run(...values);

  return db.prepare(`SELECT ${SAFE_FIELDS} FROM users WHERE id = ?`).get(id);
};

const deleteUser = (id, requesterId) => {
  if (id === requesterId) throw new ForbiddenError('Cannot delete your own account');
  const user = db.prepare('SELECT id FROM users WHERE id = ?').get(id);
  if (!user) throw new NotFoundError('User');
  // Soft-approach: deactivate instead of hard delete to preserve audit history
  db.prepare("UPDATE users SET status = 'inactive', updated_at = datetime('now') WHERE id = ?").run(id);
};

const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = db.prepare('SELECT id, password_hash FROM users WHERE id = ?').get(userId);
  const valid = await comparePassword(currentPassword, user.password_hash);
  if (!valid) throw new AppError('Current password is incorrect', 400, 'INVALID_PASSWORD');

  const newHash = await hashPassword(newPassword);
  db.prepare("UPDATE users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?").run(newHash, userId);
};

const getUserStats = () => {
  return {
    total: db.prepare('SELECT COUNT(*) as c FROM users').get().c,
    active: db.prepare("SELECT COUNT(*) as c FROM users WHERE status = 'active'").get().c,
    byRole: db.prepare('SELECT role, COUNT(*) as count FROM users GROUP BY role').all(),
  };
};

module.exports = { getAllUsers, getUserById, updateUser, deleteUser, changePassword, getUserStats };