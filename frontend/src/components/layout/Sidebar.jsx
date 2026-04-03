// import { NavLink, useNavigate } from 'react-router-dom'
// import {
//   LayoutDashboard, Receipt, Users, PieChart,
//   Target, ClipboardList, LogOut, TrendingUp,
//   ChevronRight, Wallet
// } from 'lucide-react'
// import { useAuth } from '../../context/AuthContext'
// import { cn } from '../../utils'

// const navItems = [
//   { to: '/',          label: 'Dashboard',  icon: LayoutDashboard, minRole: 'viewer'  },
//   { to: '/records',   label: 'Records',    icon: Receipt,         minRole: 'viewer'  },
//   { to: '/analytics', label: 'Analytics',  icon: TrendingUp,      minRole: 'viewer'  },
//   { to: '/budgets',   label: 'Budgets',    icon: Target,          minRole: 'viewer'  },
//   { to: '/insights',  label: 'Insights',   icon: PieChart,        minRole: 'analyst' },
//   { to: '/users',     label: 'Users',      icon: Users,           minRole: 'admin'   },
//   { to: '/audit',     label: 'Audit Log',  icon: ClipboardList,   minRole: 'admin'   },
// ]

// const ROLE_LEVELS = { viewer: 1, analyst: 2, admin: 3 }

// export default function Sidebar() {
//   const { user, logout, isAdmin } = useAuth()
//   const navigate = useNavigate()

//   const canView = (minRole) =>
//     (ROLE_LEVELS[user?.role] || 0) >= (ROLE_LEVELS[minRole] || 99)

//   const handleLogout = async () => {
//     await logout()
//     navigate('/login')
//   }

//   return (
//     <aside className="w-64 bg-white border-r border-surface-200 flex flex-col h-screen sticky top-0">
//       {/* Logo */}
//       <div className="px-5 py-5 border-b border-surface-100">
//         <div className="flex items-center gap-3">
//           <div className="p-2 bg-brand-600 rounded-xl">
//             <Wallet className="h-5 w-5 text-white" />
//           </div>
//           <div>
//             <p className="text-sm font-bold text-surface-900">FinanceOS</p>
//             <p className="text-xs text-surface-400">Dashboard</p>
//           </div>
//         </div>
//       </div>

//       {/* Nav */}
//       <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
//         {navItems.filter(n => canView(n.minRole)).map(({ to, label, icon: Icon }) => (
//           <NavLink
//             key={to}
//             to={to}
//             end={to === '/'}
//             className={({ isActive }) => cn('sidebar-link', isActive && 'active')}
//           >
//             <Icon className="h-4 w-4 flex-shrink-0" />
//             <span className="flex-1">{label}</span>
//             <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100" />
//           </NavLink>
//         ))}
//       </nav>

//       {/* User panel */}
//       <div className="p-3 border-t border-surface-100">
//         <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-surface-50">
//           <div className="h-8 w-8 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
//             <span className="text-xs font-bold text-brand-700">
//               {user?.name?.charAt(0)?.toUpperCase()}
//             </span>
//           </div>
//           <div className="flex-1 min-w-0">
//             <p className="text-xs font-medium text-surface-800 truncate">{user?.name}</p>
//             <p className="text-xs text-surface-400 capitalize">{user?.role}</p>
//           </div>
//           <button
//             onClick={handleLogout}
//             className="p-1.5 rounded-lg hover:bg-surface-200 text-surface-400 hover:text-surface-700 transition-colors"
//             title="Logout"
//           >
//             <LogOut className="h-3.5 w-3.5" />
//           </button>
//         </div>
//       </div>
//     </aside>
//   )
// }

import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Receipt, Users, PieChart, Target, ClipboardList, LogOut, TrendingUp, Wallet } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { to: '/',          label: 'Dashboard',  icon: LayoutDashboard, minRole: 'viewer'  },
  { to: '/records',   label: 'Records',    icon: Receipt,         minRole: 'viewer'  },
  { to: '/analytics', label: 'Analytics',  icon: TrendingUp,      minRole: 'viewer'  },
  { to: '/budgets',   label: 'Budgets',    icon: Target,          minRole: 'viewer'  },
  { to: '/insights',  label: 'Insights',   icon: PieChart,        minRole: 'analyst' },
  { to: '/users',     label: 'Users',      icon: Users,           minRole: 'admin'   },
  { to: '/audit',     label: 'Audit Log',  icon: ClipboardList,   minRole: 'admin'   },
]

const ROLE_LEVELS = { viewer: 1, analyst: 2, admin: 3 }

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const canView = (minRole) => (ROLE_LEVELS[user?.role] || 0) >= (ROLE_LEVELS[minRole] || 99)

  const handleLogout = async () => { await logout(); navigate('/login') }

  return (
    <aside style={{
      width: '240px', minWidth: '240px', background: '#fff',
      borderRight: '1px solid #e2e8f0', display: 'flex',
      flexDirection: 'column', height: '100vh', position: 'sticky', top: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: '1.25rem 1rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ padding: '0.5rem', background: '#4f46e5', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Wallet size={18} color="#fff" />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>FinanceOS</div>
          <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Dashboard</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '0.75rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {navItems.filter(n => canView(n.minRole)).map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} end={to === '/'}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.625rem 0.75rem', borderRadius: '0.75rem',
              fontSize: '0.875rem', fontWeight: 500, textDecoration: 'none',
              transition: 'all 0.15s',
              background: isActive ? '#eef2ff' : 'transparent',
              color: isActive ? '#4338ca' : '#64748b',
            })}
            onMouseEnter={e => { if (!e.currentTarget.classList.contains('active-link')) { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#0f172a' } }}
            onMouseLeave={e => { if (!e.currentTarget.classList.contains('active-link')) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b' } }}
          >
            <Icon size={16} style={{ flexShrink: 0 }} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User panel */}
      <div style={{ padding: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0.75rem', background: '#f8fafc', borderRadius: '0.75rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '9999px', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4338ca' }}>{user?.name?.charAt(0)?.toUpperCase()}</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'capitalize' }}>{user?.role}</div>
          </div>
          <button onClick={handleLogout} title="Logout"
            style={{ padding: '0.375rem', borderRadius: '0.5rem', border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center' }}
            onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  )
}