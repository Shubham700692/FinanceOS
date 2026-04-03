
const db = require('../models/database')
const { hashPassword } = require('./auth')
const { v4: uuidv4 } = require('uuid')

const CATEGORIES = [
  'salary','freelance','investment','food','transport',
  'housing','utilities','healthcare','entertainment',
  'education','shopping','travel','subscriptions','other',
]

const rand   = (min, max) => Math.round((Math.random() * (max - min) + min) * 100) / 100
const pick   = (arr) => arr[Math.floor(Math.random() * arr.length)]
const dateStr = (daysAgo) => {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return d.toISOString().split('T')[0]
}

async function seed() {
  console.log('🌱 Seeding database…')

  
  db.prepare('DELETE FROM financial_records').run()
  db.prepare('DELETE FROM budgets').run()
  db.prepare('DELETE FROM audit_logs').run()
  db.prepare('DELETE FROM refresh_tokens').run()
  db.prepare('DELETE FROM users').run()


  const users = [
    { id: uuidv4(), name: 'Admin User',    email: 'admin@financeos.dev',   role: 'admin',   password: 'Admin@123'   },
    { id: uuidv4(), name: 'Analyst User',  email: 'analyst@financeos.dev', role: 'analyst', password: 'Analyst@123' },
    { id: uuidv4(), name: 'Viewer User',   email: 'viewer@financeos.dev',  role: 'viewer',  password: 'Viewer@123'  },
  ]

  for (const u of users) {
    const hash = await hashPassword(u.password)
    db.prepare(`
      INSERT INTO users (id, name, email, password_hash, role, status)
      VALUES (?, ?, ?, ?, ?, 'active')
    `).run(u.id, u.name, u.email, hash, u.role)
    console.log(`  ✔ Created ${u.role}: ${u.email} / ${u.password}`)
  }

  const adminId = users[0].id


  const budgets = [
    { category: 'food',          monthly_limit: 8000  },
    { category: 'transport',     monthly_limit: 4000  },
    { category: 'entertainment', monthly_limit: 3000  },
    { category: 'shopping',      monthly_limit: 10000 },
    { category: 'utilities',     monthly_limit: 5000  },
    { category: 'subscriptions', monthly_limit: 2000  },
  ]
  for (const b of budgets) {
    db.prepare('INSERT INTO budgets (id, category, monthly_limit, created_by) VALUES (?, ?, ?, ?)')
      .run(uuidv4(), b.category, b.monthly_limit, adminId)
  }
  console.log(`  ✔ Created ${budgets.length} budgets`)

  
  const records = []

  
  for (let i = 0; i < 9; i++) {
    const daysAgo = i * 30 + Math.floor(Math.random() * 3)
    records.push({ type: 'income', category: 'salary', amount: rand(45000, 55000), daysAgo, description: 'Monthly salary credit', tags: ['salary', 'recurring'] })
  }

  
  for (let i = 0; i < 6; i++) {
    records.push({ type: 'income', category: 'freelance', amount: rand(5000, 25000), daysAgo: rand(1, 270), description: 'Freelance project payment', tags: ['freelance'] })
  }

  
  for (let i = 0; i < 4; i++) {
    records.push({ type: 'income', category: 'investment', amount: rand(1000, 8000), daysAgo: rand(1, 270), description: 'Mutual fund return', tags: ['investment'] })
  }

  
  const expenseTemplates = [
    { category: 'food',          min: 200,  max: 800,   desc: 'Groceries and dining',  tags: ['food'] },
    { category: 'food',          min: 100,  max: 500,   desc: 'Restaurant / Swiggy',   tags: ['food', 'dining'] },
    { category: 'transport',     min: 500,  max: 2000,  desc: 'Fuel and transport',    tags: ['transport'] },
    { category: 'housing',       min: 12000,max: 15000, desc: 'Monthly rent',          tags: ['rent', 'recurring'] },
    { category: 'utilities',     min: 800,  max: 2000,  desc: 'Electricity and water', tags: ['utilities', 'recurring'] },
    { category: 'entertainment', min: 300,  max: 1500,  desc: 'Movies and events',     tags: ['entertainment'] },
    { category: 'shopping',      min: 500,  max: 5000,  desc: 'Online shopping',       tags: ['shopping'] },
    { category: 'healthcare',    min: 200,  max: 3000,  desc: 'Medical expenses',      tags: ['health'] },
    { category: 'education',     min: 500,  max: 3000,  desc: 'Online courses',        tags: ['education'] },
    { category: 'subscriptions', min: 199,  max: 999,   desc: 'Streaming services',    tags: ['subscriptions', 'recurring'] },
    { category: 'travel',        min: 2000, max: 15000, desc: 'Travel expenses',       tags: ['travel'] },
  ]

  for (let i = 0; i < 40; i++) {
    const t = pick(expenseTemplates)
    records.push({ type: 'expense', ...t, amount: rand(t.min, t.max), daysAgo: rand(1, 270) })
  }

  
  const stmt = db.prepare(`
    INSERT INTO financial_records (id, amount, type, category, date, description, tags, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `)
  for (const r of records) {
    stmt.run(uuidv4(), r.amount, r.type, r.category, dateStr(r.daysAgo), r.description || null, JSON.stringify(r.tags || []), adminId)
  }
  console.log(`  ✔ Created ${records.length} financial records`)

  console.log('\n✅ Seed complete! Login credentials:')
  for (const u of users) {
    console.log(`   ${u.role.padEnd(8)} → ${u.email} / ${u.password}`)
  }
}

seed().catch(console.error)