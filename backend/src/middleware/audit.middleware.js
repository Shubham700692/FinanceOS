const { v4: uuidv4 } = require('uuid');
const db = require('../models/database');

const insertAuditLog = db.prepare(`
  INSERT INTO audit_logs (id, user_id, action, resource_type, resource_id, old_values, new_values, ip_address, user_agent, timestamp)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
`);

/**
 * Creates an audit log entry. Call this after successful mutations.
 */
const audit = (action, resourceType) => {
  return (req, res, next) => {
    // Wrap res.json to intercept successful responses
    const originalJson = res.json.bind(res);
    res.json = function (body) {
      // Only log on success
      if (body?.success && req.user) {
        try {
          insertAuditLog.run(
            uuidv4(),
            req.user.userId,
            action,
            resourceType,
            body?.data?.id || req.params?.id || null,
            req.auditOldValues ? JSON.stringify(req.auditOldValues) : null,
            body?.data ? JSON.stringify(body.data) : null,
            req.ip,
            req.get('user-agent') || null
          );
        } catch (_) { /* audit failure should never break main flow */ }
      }
      return originalJson(body);
    };
    next();
  };
};

/**
 * Get audit logs (admin only)
 */
const getAuditLogs = (filters = {}) => {
  let query = 'SELECT al.*, u.name as user_name, u.email as user_email FROM audit_logs al LEFT JOIN users u ON al.user_id = u.id WHERE 1=1';
  const params = [];

  if (filters.userId) { query += ' AND al.user_id = ?'; params.push(filters.userId); }
  if (filters.action) { query += ' AND al.action = ?'; params.push(filters.action); }
  if (filters.resourceType) { query += ' AND al.resource_type = ?'; params.push(filters.resourceType); }
  if (filters.from) { query += ' AND al.timestamp >= ?'; params.push(filters.from); }
  if (filters.to) { query += ' AND al.timestamp <= ?'; params.push(filters.to); }

  query += ' ORDER BY al.timestamp DESC LIMIT ? OFFSET ?';
  params.push(filters.limit || 50, filters.offset || 0);

  return db.prepare(query).all(...params);
};

module.exports = { audit, getAuditLogs };