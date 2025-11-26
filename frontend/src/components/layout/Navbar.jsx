import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Car, Menu, Home, Trophy, MapPin, User } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { useBookingStore } from '../../stores/bookingStore'
import NotificationDropdown from '../NotificationDropdown'

const Navbar = ({ onMenuClick }) => {
  const location = useLocation()
  const { user } = useAuthStore()
  const { activeBooking } = useBookingStore()
  
  const navLinks = [
    { path: '/app', label: 'หน้าหลัก', icon: Home },
    { path: '/app/privileges', label: 'สิทธิพิเศษ', icon: Trophy },
    { path: '/app/booking', label: 'การจอง', icon: MapPin },
  ]
  
  const isActive = (path) => {
    if (path === '/app') return location.pathname === '/app'
    return location.pathname.startsWith(path)
  }
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <div className="flex items-center gap-4">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <Menu className="w-6 h-6 text-gray-700" />
            </button>
            
            <Link to="/app" className="flex items-center gap-3 group">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-2xl flex items-center justify-center shadow-lg"
              >
                <Car className="w-7 h-7 text-white" />
              </motion.div>
              <span className="text-2xl font-bold gradient-text hidden sm:block">
                SciPark
              </span>
            </Link>
          </div>
          
          {/* Nav Links - Desktop */}
          <div className="hidden lg:flex items-center gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon
              const active = isActive(link.path)
              
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className="relative"
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`
                      px-6 py-3 rounded-xl font-semibold flex items-center gap-2
                      transition-all duration-300
                      ${active 
                        ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg' 
                        : 'text-gray-600 hover:bg-gray-100'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{link.label}</span>
                    {link.path === '/app/booking' && activeBooking && (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="w-2 h-2 bg-red-500 rounded-full"
                      />
                    )}
                  </motion.div>
                </Link>
              )
            })}
          </div>
          
          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <NotificationDropdown />
            
            {/* Profile */}
            <Link to="/app/profile">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-secondary-500 rounded-full flex items-center justify-center">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <User className="w-6 h-6 text-white" />
                  )}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold text-gray-800">{user?.name || 'User'}</p>
                  <p className="text-xs text-gray-500">{user?.rank || 'Iron'}</p>
                </div>
              </motion.div>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Mobile Bottom Nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="flex items-center justify-around px-4 py-3">
          {navLinks.map((link) => {
            const Icon = link.icon
            const active = isActive(link.path)
            
            return (
              <Link
                key={link.path}
                to={link.path}
                className="relative flex flex-col items-center gap-1"
              >
                <div className={`
                  p-3 rounded-xl transition-all duration-300
                  ${active 
                    ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white' 
                    : 'text-gray-600'
                  }
                `}>
                  <Icon className="w-5 h-5" />
                  {link.path === '/app/booking' && activeBooking && (
                    <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                  )}
                </div>
                <span className={`text-xs font-medium ${active ? 'text-primary-600' : 'text-gray-600'}`}>
                  {link.label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
