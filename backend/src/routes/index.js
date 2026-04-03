const express = require('express');
const router = express.Router();

const { authenticate, requireRole, requireMinRole } = require('../middleware/auth.middleware');
const { audit } = require('../middleware/audit.middleware');
const { validate, registerSchema, loginSchema, refreshTokenSchema,
        updateUserSchema, changePasswordSchema,
        createRecordSchema, updateRecordSchema, recordFiltersSchema,
        upsertBudgetSchema } = require('../validators/schemas');

const authCtrl = require('../controllers/auth.controller');
const usersCtrl = require('../controllers/users.controller');
const recordsCtrl = require('../controllers/records.controller');
const dashCtrl = require('../controllers/dashboard.controller');

// ── Health ────────────────────────────────────────────────────────────────────
router.get('/health', (req, res) => res.json({
  success: true,
  status: 'healthy',
  version: '1.0.0',
  timestamp: new Date().toISOString(),
}));

// ── Auth ──────────────────────────────────────────────────────────────────────
router.post('/auth/register', validate(registerSchema), audit('REGISTER', 'user'), authCtrl.register);
router.post('/auth/login', validate(loginSchema), audit('LOGIN', 'user'), authCtrl.login);
router.post('/auth/refresh', validate(refreshTokenSchema), authCtrl.refresh);
router.post('/auth/logout', authenticate, authCtrl.logout);
router.get('/auth/me', authenticate, authCtrl.me);

// ── Users (admin only) ────────────────────────────────────────────────────────
router.get('/users', authenticate, requireRole('admin'), usersCtrl.getUsers);
router.get('/users/stats', authenticate, requireRole('admin'), usersCtrl.getUserStats);
router.get('/users/:id', authenticate, requireMinRole('analyst'), usersCtrl.getUserById);
router.patch('/users/:id', authenticate, requireRole('admin'), validate(updateUserSchema), audit('UPDATE_USER', 'user'), usersCtrl.updateUser);
router.delete('/users/:id', authenticate, requireRole('admin'), audit('DELETE_USER', 'user'), usersCtrl.deleteUser);
router.post('/users/change-password', authenticate, validate(changePasswordSchema), usersCtrl.changePassword);

// ── Financial Records ─────────────────────────────────────────────────────────
// Viewers: GET only | Analysts: GET only | Admins: full CRUD
router.get('/records', authenticate, requireMinRole('viewer'), validate(recordFiltersSchema, 'query'), recordsCtrl.getRecords);
router.get('/records/:id', authenticate, requireMinRole('viewer'), recordsCtrl.getRecord);
router.post('/records', authenticate, requireMinRole('analyst'), validate(createRecordSchema), audit('CREATE_RECORD', 'financial_record'), recordsCtrl.createRecord);
router.patch('/records/:id', authenticate, requireMinRole('analyst'), validate(updateRecordSchema), audit('UPDATE_RECORD', 'financial_record'), recordsCtrl.updateRecord);
router.delete('/records/:id', authenticate, requireMinRole('analyst'), audit('DELETE_RECORD', 'financial_record'), recordsCtrl.deleteRecord);

// ── Dashboard Analytics ───────────────────────────────────────────────────────
// All roles can view dashboard data
router.get('/dashboard/summary', authenticate, requireMinRole('viewer'), dashCtrl.getSummary);
router.get('/dashboard/categories', authenticate, requireMinRole('viewer'), dashCtrl.getCategoryBreakdown);
router.get('/dashboard/trends/monthly', authenticate, requireMinRole('viewer'), dashCtrl.getMonthlyTrends);
router.get('/dashboard/trends/weekly', authenticate, requireMinRole('viewer'), dashCtrl.getWeeklyTrends);
router.get('/dashboard/activity', authenticate, requireMinRole('viewer'), dashCtrl.getRecentActivity);
router.get('/dashboard/insights', authenticate, requireMinRole('analyst'), dashCtrl.getInsights);
router.get('/dashboard/budget-analysis', authenticate, requireMinRole('viewer'), dashCtrl.getBudgetAnalysis);

// ── Budgets (admin only) ──────────────────────────────────────────────────────
router.get('/budgets', authenticate, requireMinRole('viewer'), dashCtrl.getBudgets);
router.put('/budgets', authenticate, requireRole('admin'), validate(upsertBudgetSchema), audit('UPSERT_BUDGET', 'budget'), dashCtrl.upsertBudget);
router.delete('/budgets/:category', authenticate, requireRole('admin'), audit('DELETE_BUDGET', 'budget'), dashCtrl.deleteBudget);

// ── Audit Logs (admin only) ───────────────────────────────────────────────────
router.get('/audit-logs', authenticate, requireRole('admin'), dashCtrl.getAuditLogs);

module.exports = router;