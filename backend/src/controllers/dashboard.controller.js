const dashboardService = require('../services/dashboard.service');
const { sendSuccess } = require('../utils/response');
const db = require('../models/database');
const { v4: uuidv4 } = require('uuid');
const { NotFoundError } = require('../utils/response');

const getSummary = (req, res, next) => {
  try {
    const { from, to } = req.query;
    const data = dashboardService.getSummary(from, to);
    sendSuccess(res, data, 'Dashboard summary');
  } catch (err) { next(err); }
};

const getCategoryBreakdown = (req, res, next) => {
  try {
    const { type, from, to } = req.query;
    const data = dashboardService.getCategoryBreakdown(type, from, to);
    sendSuccess(res, data, 'Category breakdown');
  } catch (err) { next(err); }
};

const getMonthlyTrends = (req, res, next) => {
  try {
    const months = parseInt(req.query.months) || 12;
    const data = dashboardService.getMonthlyTrends(Math.min(months, 24));
    sendSuccess(res, data, 'Monthly trends');
  } catch (err) { next(err); }
};

const getWeeklyTrends = (req, res, next) => {
  try {
    const weeks = parseInt(req.query.weeks) || 8;
    const data = dashboardService.getWeeklyTrends(Math.min(weeks, 52));
    sendSuccess(res, data, 'Weekly trends');
  } catch (err) { next(err); }
};

const getRecentActivity = (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const data = dashboardService.getRecentActivity(limit);
    sendSuccess(res, data, 'Recent activity');
  } catch (err) { next(err); }
};

const getInsights = (req, res, next) => {
  try {
    const data = dashboardService.getInsights();
    sendSuccess(res, data, 'Spending insights');
  } catch (err) { next(err); }
};

const getBudgetAnalysis = (req, res, next) => {
  try {
    const data = dashboardService.getBudgetAnalysis(req.query.month);
    sendSuccess(res, data, 'Budget analysis');
  } catch (err) { next(err); }
};

// Budget CRUD
const upsertBudget = (req, res, next) => {
  try {
    const { category, monthly_limit } = req.body;
    const existing = db.prepare('SELECT id FROM budgets WHERE category = ?').get(category);
    if (existing) {
      db.prepare("UPDATE budgets SET monthly_limit = ?, updated_at = datetime('now') WHERE category = ?")
        .run(monthly_limit, category);
    } else {
      db.prepare('INSERT INTO budgets (id, category, monthly_limit, created_by) VALUES (?, ?, ?, ?)')
        .run(uuidv4(), category, monthly_limit, req.user.userId);
    }
    const budget = db.prepare('SELECT * FROM budgets WHERE category = ?').get(category);
    sendSuccess(res, budget, existing ? 'Budget updated' : 'Budget created', existing ? 200 : 201);
  } catch (err) { next(err); }
};

const getBudgets = (req, res, next) => {
  try {
    const budgets = db.prepare('SELECT * FROM budgets ORDER BY category').all();
    sendSuccess(res, budgets, 'Budgets retrieved');
  } catch (err) { next(err); }
};

const deleteBudget = (req, res, next) => {
  try {
    const result = db.prepare('DELETE FROM budgets WHERE category = ?').run(req.params.category);
    if (result.changes === 0) throw new NotFoundError('Budget');
    sendSuccess(res, null, 'Budget deleted');
  } catch (err) { next(err); }
};

const getAuditLogs = (req, res, next) => {
  try {
    const { getAuditLogs } = require('../middleware/audit.middleware');
    const { page = 1, limit = 50, ...filters } = req.query;
    const logs = getAuditLogs({ ...filters, limit: parseInt(limit), offset: (parseInt(page) - 1) * parseInt(limit) });
    sendSuccess(res, logs, 'Audit logs');
  } catch (err) { next(err); }
};

module.exports = {
  getSummary, getCategoryBreakdown, getMonthlyTrends, getWeeklyTrends,
  getRecentActivity, getInsights, getBudgetAnalysis,
  upsertBudget, getBudgets, deleteBudget, getAuditLogs,
};