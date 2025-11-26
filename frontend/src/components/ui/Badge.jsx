import { motion } from 'framer-motion'

export const Badge = ({ 
  children, 
  variant = 'default',
  size = 'md',
  className = '' 
}) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white',
    success: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white',
    warning: 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white',
    danger: 'bg-gradient-to-r from-red-500 to-rose-500 text-white',
    info: 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white',
    gray: 'bg-gray-100 text-gray-800',
    blue: 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white',
    purple: 'bg-gradient-to-r from-purple-500 to-violet-500 text-white',
  }
  
  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  }
  
  return (
    <motion.span
      whileHover={{ scale: 1.05 }}
      className={`
        inline-flex items-center justify-center
        font-semibold rounded-full
        ${variants[variant]} ${sizes[size]} ${className}
      `}
    >
      {children}
    </motion.span>
  )
}

export default Badge
