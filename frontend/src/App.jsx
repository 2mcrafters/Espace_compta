import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Badge from './components/ui/Badge'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from './store/redux/authSlice'
import { selectUser } from './store/redux/store'

export default function App() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const user = useSelector(selectUser)
  
  async function onLogout() {
    await dispatch(logout())
    navigate('/login', { replace: true })
  }
  
  const linkBase = 'px-4 py-2.5 rounded-lg transition-all duration-200 flex items-center gap-3 font-medium'
  const active = ({ isActive }) => isActive 
    ? `${linkBase} bg-gradient-to-r from-primary-500 to-primary-700 text-white shadow-lg shadow-primary-500/30` 
    : `${linkBase} text-gray-600 hover:bg-gray-100`
    
  const navItems = [
    { to: '/', label: 'Dashboard', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    )},
    { to: '/clients', label: 'Clients', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    )},
    { to: '/tasks', label: 'Tasks', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    )},
    { to: '/requests', label: 'Requests', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    )},
    { to: '/profile', label: 'Profile', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A8 8 0 1118.878 6.196 8 8 0 015.12 17.804zM15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )}
  ]
  
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-xl"
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <div className="font-bold text-lg bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                Espace Compta
              </div>
              <div className="text-xs text-gray-500">Gestion simplifiée</div>
            </div>
          </motion.div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item, i) => (
            <motion.div
              key={item.to}
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              <NavLink to={item.to} className={active} end={item.to === '/'}>
                {item.icon}
                {item.label}
              </NavLink>
            </motion.div>
          ))}
        </nav>
        
        {/* User section */}
        <div className="p-4 border-t border-gray-200">
          <div className="mb-3 px-3 py-2 bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg">
            <div className="text-sm font-medium text-gray-900">{user?.name || user?.email}</div>
            <div className="text-xs text-gray-500">{user?.roles?.[0] || 'User'}</div>
          </div>
          <motion.button 
            whileHover={{ 
              scale: 1.03,
              y: -2,
              borderColor: 'rgb(252, 165, 165)',
              backgroundColor: 'rgb(254, 242, 242)',
              boxShadow: '0 8px 20px rgba(239, 68, 68, 0.2)'
            }}
            whileTap={{ scale: 0.97 }}
            onClick={onLogout} 
            className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-200 hover:border-red-300 hover:bg-red-50 text-gray-700 hover:text-red-600 transition-all duration-300 flex items-center justify-center gap-2 font-semibold relative overflow-hidden group"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-red-100/30 to-transparent opacity-0 group-hover:opacity-100 transform -translate-x-full group-hover:translate-x-full transition-all duration-700"></span>
            <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="relative z-10">Déconnexion</span>
          </motion.button>
        </div>
      </motion.aside>
      
      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {/* Top header with user badge */}
        <div className="sticky top-0 z-10 bg-white/70 backdrop-blur border-b border-gray-200">
          <div className="px-6 py-3 flex items-center justify-end gap-3">
            <div className="text-sm text-gray-600">{user?.name || user?.email}</div>
            {Array.isArray(user?.roles) && user.roles.slice(0,1).map(r => (
              <Badge key={r} color="primary" className="uppercase">{r}</Badge>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8"
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  )
}
