const { z } = require('zod');

// ── Auth ──────────────────────────────────────────────────────────────────────

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128).regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain uppercase, lowercase, and a number'
  ),
  role: z.enum(['viewer', 'analyst', 'admin']).default('viewer'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

// ── Users ─────────────────────────────────────────────────────────────────────

const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  role: z.enum(['viewer', 'analyst', 'admin']).optional(),
  status: z.enum(['active', 'inactive']).optional(),
}).refine(obj => Object.keys(obj).length > 0, { message: 'At least one field required' });

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(128).regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain uppercase, lowercase, and a number'
  ),
});

// ── Financial Records ─────────────────────────────────────────────────────────

const CATEGORIES = [
  'salary', 'freelance', 'investment', 'business', 'rental',
  'food', 'transport', 'housing', 'utilities', 'healthcare',
  'entertainment', 'education', 'shopping', 'travel', 'insurance',
  'taxes', 'subscriptions', 'other'
];

const createRecordSchema = z.object({
  amount: z.number().positive().max(1_000_000_000),
  type: z.enum(['income', 'expense']),
  category: z.string().min(1).max(50),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  description: z.string().max(500).optional(),
  tags: z.array(z.string().max(30)).max(10).default([]),
});

const updateRecordSchema = z.object({
  amount: z.number().positive().max(1_000_000_000).optional(),
  type: z.enum(['income', 'expense']).optional(),
  category: z.string().min(1).max(50).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  description: z.string().max(500).optional(),
  tags: z.array(z.string().max(30)).max(10).optional(),
}).refine(obj => Object.keys(obj).length > 0, { message: 'At least one field required' });

const recordFiltersSchema = z.object({
  type: z.enum(['income', 'expense']).optional(),
  category: z.string().optional(),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  search: z.string().max(100).optional(),
  tags: z.string().optional(), // comma-separated
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['date', 'amount', 'category', 'created_at']).default('date'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

// ── Budgets ───────────────────────────────────────────────────────────────────

const upsertBudgetSchema = z.object({
  category: z.string().min(1).max(50),
  monthly_limit: z.number().positive(),
});

// ── Validation middleware factory ─────────────────────────────────────────────

const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const result = schema.safeParse(source === 'query' ? req.query : req.body);
    if (!result.success) {
      const errors = result.error.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: errors },
      });
    }
    if (source === 'query') req.validatedQuery = result.data;
    else req.body = result.data;
    next();
  };
};

module.exports = {
  registerSchema, loginSchema, refreshTokenSchema,
  updateUserSchema, changePasswordSchema,
  createRecordSchema, updateRecordSchema, recordFiltersSchema,
  upsertBudgetSchema,
  validate,
};