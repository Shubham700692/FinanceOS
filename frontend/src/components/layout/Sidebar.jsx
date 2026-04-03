import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Receipt, Users, PieChart,
  Target, ClipboardList, LogOut, TrendingUp,
  ChevronRight, Wallet
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { cn } from '../../utils'

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
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()

  const canView = (minRole) =>
    (ROLE_LEVELS[user?.role] || 0) >= (ROLE_LEVELS[minRole] || 99)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <aside className="w-64 bg-white border-r border-surface-200 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-surface-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-600 rounded-xl">
            <Wallet className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-surface-900">FinanceOS</p>
            <p className="text-xs text-surface-400">Dashboard</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.filter(n => canView(n.minRole)).map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => cn('sidebar-link', isActive && 'active')}
          >
            <Icon className="h-4 w-4 flex-shrink-0" />
            <span className="flex-1">{label}</span>
            <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100" />
          </NavLink>
        ))}
      </nav>

      {/* User panel */}
      <div className="p-3 border-t border-surface-100">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-surface-50">
          <div className="h-8 w-8 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-brand-700">
              {user?.name?.charAt(0)?.toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-surface-800 truncate">{user?.name}</p>
            <p className="text-xs text-surface-400 capitalize">{user?.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg hover:bg-surface-200 text-surface-400 hover:text-surface-700 transition-colors"
            title="Logout"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  )
}