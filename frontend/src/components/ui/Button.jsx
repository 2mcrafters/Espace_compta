import { motion } from 'framer-motion'

export default function Button({ className='', children, ...props }){
  const base = 'inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-primary-500 to-primary-700 hover:from-primary-600 hover:to-primary-800 text-white font-medium shadow-lg shadow-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 relative overflow-hidden group'
  return (
    <motion.button 
      whileHover={{ 
        scale: 1.03, 
        y: -2,
        boxShadow: '0 20px 40px rgba(0, 68, 147, 0.4)'
      }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className={`${base} ${className}`} 
      {...props}
    >
      {/* Animated shine effect */}
      <motion.span
        initial={{ x: '-100%', opacity: 0 }}
        whileHover={{ x: '200%', opacity: [0, 0.5, 0] }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
      />
      <span className="relative z-10">{children}</span>
    </motion.button>
  )
}
