const db = require('../models/database');

/**
 * Core summary: income, expenses, net balance, record counts
 */
const getSummary = (from, to) => {
  let where = 'WHERE is_deleted = 0';
  const params = [];
  if (from) { where += ' AND date >= ?'; params.push(from); }
  if (to) { where += ' AND date <= ?'; params.push(to); }

  const rows = db.prepare(`
    SELECT 
      type,
      COUNT(*) as count,
      SUM(amount) as total,
      AVG(amount) as avg,
      MIN(amount) as min,
      MAX(amount) as max
    FROM financial_records
    ${where}
    GROUP BY type
  `).all(...params);

  const income = rows.find(r => r.type === 'income') || { count: 0, total: 0, avg: 0, min: 0, max: 0 };
  const expense = rows.find(r => r.type === 'expense') || { count: 0, total: 0, avg: 0, min: 0, max: 0 };

  return {
    income: {
      total: round(income.total || 0),
      count: income.count,
      average: round(income.avg || 0),
      min: round(income.min || 0),
      max: round(income.max || 0),
    },
    expense: {
      total: round(expense.total || 0),
      count: expense.count,
      average: round(expense.avg || 0),
      min: round(expense.min || 0),
      max: round(expense.max || 0),
    },
    net_balance: round((income.total || 0) - (expense.total || 0)),
    total_records: income.count + expense.count,
    savings_rate: income.total > 0
      ? round(((income.total - expense.total) / income.total) * 100)
      : 0,
  };
};

/**
 * Category-wise breakdown with % share
 */
const getCategoryBreakdown = (type = null, from, to) => {
  let where = 'WHERE is_deleted = 0';
  const params = [];
  if (type) { where += ' AND type = ?'; params.push(type); }
  if (from) { where += ' AND date >= ?'; params.push(from); }
  if (to) { where += ' AND date <= ?'; params.push(to); }

  const rows = db.prepare(`
    SELECT 
      category,
      type,
      COUNT(*) as count,
      SUM(amount) as total
    FROM financial_records
    ${where}
    GROUP BY category, type
    ORDER BY total DESC
  `).all(...params);

  const grandTotal = rows.reduce((s, r) => s + r.total, 0);

  return rows.map(r => ({
    category: r.category,
    type: r.type,
    count: r.count,
    total: round(r.total),
    percentage: grandTotal > 0 ? round((r.total / grandTotal) * 100) : 0,
  }));
};

/**
 * Monthly trend data — great for line/bar charts
 */
const getMonthlyTrends = (months = 12) => {
  const rows = db.prepare(`
    SELECT 
      strftime('%Y-%m', date) as month,
      type,
      COUNT(*) as count,
      SUM(amount) as total
    FROM financial_records
    WHERE is_deleted = 0
      AND date >= date('now', '-${months} months')
    GROUP BY month, type
    ORDER BY month ASC
  `).all();

  // Build a complete month map
  const monthMap = {};
  rows.forEach(r => {
    if (!monthMap[r.month]) monthMap[r.month] = { month: r.month, income: 0, expense: 0, net: 0 };
    monthMap[r.month][r.type] = round(r.total);
  });

  return Object.values(monthMap).map(m => ({
    ...m,
    net: round(m.income - m.expense),
  }));
};

/**
 * Weekly trend — last N weeks
 */
const getWeeklyTrends = (weeks = 8) => {
  const rows = db.prepare(`
    SELECT 
      strftime('%Y-W%W', date) as week,
      type,
      SUM(amount) as total,
      COUNT(*) as count
    FROM financial_records
    WHERE is_deleted = 0
      AND date >= date('now', '-${weeks * 7} days')
    GROUP BY week, type
    ORDER BY week ASC
  `).all();

  const weekMap = {};
  rows.forEach(r => {
    if (!weekMap[r.week]) weekMap[r.week] = { week: r.week, income: 0, expense: 0 };
    weekMap[r.week][r.type] = round(r.total);
  });

  return Object.values(weekMap).map(m => ({
    ...m,
    net: round(m.income - m.expense),
  }));
};

/**
 * Recent activity feed
 */
const getRecentActivity = (limit = 10) => {
  return db.prepare(`
    SELECT r.id, r.amount, r.type, r.category, r.date, r.description, r.tags,
           u.name as created_by_name
    FROM financial_records r
    LEFT JOIN users u ON r.created_by = u.id
    WHERE r.is_deleted = 0
    ORDER BY r.created_at DESC
    LIMIT ?
  `).all(limit).map(r => ({
    ...r,
    tags: JSON.parse(r.tags || '[]'),
    amount: parseFloat(r.amount),
  }));
};

/**
 * Budget vs actual comparison (creative feature)
 */
const getBudgetAnalysis = (month = null) => {
  const targetMonth = month || new Date().toISOString().slice(0, 7);
  const [year, mon] = targetMonth.split('-');

  const actuals = db.prepare(`
    SELECT category, SUM(amount) as spent
    FROM financial_records
    WHERE is_deleted = 0 AND type = 'expense'
      AND strftime('%Y-%m', date) = ?
    GROUP BY category
  `).all(targetMonth);

  const budgets = db.prepare('SELECT * FROM budgets').all();

  const budgetMap = {};
  budgets.forEach(b => { budgetMap[b.category] = b.monthly_limit; });

  const actualMap = {};
  actuals.forEach(a => { actualMap[a.category] = round(a.spent); });

  const allCategories = new Set([...Object.keys(budgetMap), ...Object.keys(actualMap)]);

  return Array.from(allCategories).map(cat => {
    const limit = budgetMap[cat] || null;
    const spent = actualMap[cat] || 0;
    const remaining = limit !== null ? round(limit - spent) : null;
    const utilization = limit !== null ? round((spent / limit) * 100) : null;
    return {
      category: cat,
      budget: limit,
      spent,
      remaining,
      utilization_percent: utilization,
      status: limit === null ? 'no_budget'
        : utilization > 100 ? 'over_budget'
        : utilization > 80 ? 'warning'
        : 'on_track',
    };
  }).sort((a, b) => (b.utilization_percent || 0) - (a.utilization_percent || 0));
};

/**
 * Top spending categories and anomaly detection (creative addition)
 */
const getInsights = () => {
  // Average monthly spend per category (last 6 months)
  const avgByCategory = db.prepare(`
    SELECT category, AVG(monthly_total) as avg_monthly
    FROM (
      SELECT category, strftime('%Y-%m', date) as month, SUM(amount) as monthly_total
      FROM financial_records
      WHERE is_deleted = 0 AND type = 'expense'
        AND date >= date('now', '-6 months')
      GROUP BY category, month
    )
    GROUP BY category
  `).all();

  // Current month spend per category
  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentByCategory = db.prepare(`
    SELECT category, SUM(amount) as total
    FROM financial_records
    WHERE is_deleted = 0 AND type = 'expense'
      AND strftime('%Y-%m', date) = ?
    GROUP BY category
  `).all(currentMonth);

  const currentMap = {};
  currentByCategory.forEach(r => { currentMap[r.category] = round(r.total); });

  const insights = avgByCategory.map(r => {
    const current = currentMap[r.category] || 0;
    const avg = round(r.avg_monthly);
    const deviation = avg > 0 ? round(((current - avg) / avg) * 100) : 0;
    return {
      category: r.category,
      avg_monthly: avg,
      current_month: current,
      deviation_percent: deviation,
      anomaly: Math.abs(deviation) > 50,
    };
  }).filter(r => r.current_month > 0 || r.avg_monthly > 0);

  return {
    spending_insights: insights,
    anomalies: insights.filter(i => i.anomaly),
    top_categories: insights.sort((a, b) => b.current_month - a.current_month).slice(0, 5),
  };
};

const round = (n) => Math.round((n || 0) * 100) / 100;

module.exports = {
  getSummary,
  getCategoryBreakdown,
  getMonthlyTrends,
  getWeeklyTrends,
  getRecentActivity,
  getBudgetAnalysis,
  getInsights,
};