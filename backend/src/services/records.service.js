const { v4: uuidv4 } = require('uuid');
const db = require('../models/database');
const { NotFoundError, ForbiddenError } = require('../utils/response');

const getRecords = (filters = {}, userId = null, userRole = null) => {
  const {
    type, category, from, to, search, tags,
    page = 1, limit = 20,
    sortBy = 'date', order = 'desc'
  } = filters;

  let query = 'SELECT r.*, u.name as created_by_name FROM financial_records r LEFT JOIN users u ON r.created_by = u.id WHERE r.is_deleted = 0';
  const params = [];

  if (type) { query += ' AND r.type = ?'; params.push(type); }
  if (category) { query += ' AND r.category = ?'; params.push(category); }
  if (from) { query += ' AND r.date >= ?'; params.push(from); }
  if (to) { query += ' AND r.date <= ?'; params.push(to); }
  if (search) {
    query += ' AND (r.description LIKE ? OR r.category LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  if (tags) {
    const tagList = tags.split(',').map(t => t.trim()).filter(Boolean);
    tagList.forEach(tag => {
      query += ' AND r.tags LIKE ?';
      params.push(`%"${tag}"%`);
    });
  }

  const VALID_SORT = { date: 'r.date', amount: 'r.amount', category: 'r.category', created_at: 'r.created_at' };
  const sortCol = VALID_SORT[sortBy] || 'r.date';
  const sortOrder = order === 'asc' ? 'ASC' : 'DESC';

  const countQuery = query.replace('SELECT r.*, u.name as created_by_name', 'SELECT COUNT(*) as c');
  const total = db.prepare(countQuery).get(...params).c;

  query += ` ORDER BY ${sortCol} ${sortOrder} LIMIT ? OFFSET ?`;
  params.push(limit, (page - 1) * limit);

  const records = db.prepare(query).all(...params).map(parseRecord);

  return {
    records,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasNext: page * limit < total,
    hasPrev: page > 1,
  };
};

const getRecordById = (id, userId, userRole) => {
  const record = db.prepare(`
    SELECT r.*, u.name as created_by_name 
    FROM financial_records r 
    LEFT JOIN users u ON r.created_by = u.id 
    WHERE r.id = ? AND r.is_deleted = 0
  `).get(id);

  if (!record) throw new NotFoundError('Financial record');
  return parseRecord(record);
};

const createRecord = (data, userId) => {
  const id = uuidv4();
  const { amount, type, category, date, description = null, tags = [] } = data;

  db.prepare(`
    INSERT INTO financial_records (id, amount, type, category, date, description, tags, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, amount, type, category, date, description, JSON.stringify(tags), userId);

  return getRecordById(id);
};

const updateRecord = (id, updates, userId, userRole) => {
  const record = db.prepare('SELECT * FROM financial_records WHERE id = ? AND is_deleted = 0').get(id);
  if (!record) throw new NotFoundError('Financial record');

  // Only admin or the creator can update
  if (userRole !== 'admin' && record.created_by !== userId) {
    throw new ForbiddenError('You can only edit your own records');
  }

  const allowedFields = ['amount', 'type', 'category', 'date', 'description', 'tags'];
  const fields = [];
  const values = [];

  for (const [key, val] of Object.entries(updates)) {
    if (!allowedFields.includes(key)) continue;
    fields.push(`${key} = ?`);
    values.push(key === 'tags' ? JSON.stringify(val) : val);
  }

  if (fields.length === 0) return parseRecord(record);

  values.push(new Date().toISOString(), id);
  db.prepare(`UPDATE financial_records SET ${fields.join(', ')}, updated_at = ? WHERE id = ?`).run(...values);

  return getRecordById(id);
};

const deleteRecord = (id, userId, userRole) => {
  const record = db.prepare('SELECT * FROM financial_records WHERE id = ? AND is_deleted = 0').get(id);
  if (!record) throw new NotFoundError('Financial record');

  if (userRole !== 'admin' && record.created_by !== userId) {
    throw new ForbiddenError('You can only delete your own records');
  }

  // Soft delete
  db.prepare(`
    UPDATE financial_records 
    SET is_deleted = 1, deleted_at = datetime('now'), deleted_by = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(userId, id);

  return { id, deleted: true };
};

const parseRecord = (record) => {
  if (!record) return null;
  return {
    ...record,
    tags: typeof record.tags === 'string' ? JSON.parse(record.tags || '[]') : (record.tags || []),
    amount: parseFloat(record.amount),
    is_deleted: Boolean(record.is_deleted),
  };
};

module.exports = { getRecords, getRecordById, createRecord, updateRecord, deleteRecord };