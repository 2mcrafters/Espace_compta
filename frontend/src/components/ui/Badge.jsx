import { motion } from 'framer-motion'

export default function Badge({ color='gray', children, className='' }){
  const colors = {
    gray: 'bg-gray-100 text-gray-800 ring-gray-200',
    green: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    red: 'bg-rose-50 text-rose-700 ring-rose-200',
    rose: 'bg-rose-50 text-rose-700 ring-rose-200',
    blue: 'bg-primary-50 text-primary-700 ring-primary-200',
    yellow: 'bg-amber-50 text-amber-700 ring-amber-200',
    amber: 'bg-amber-50 text-amber-700 ring-amber-200',
    sky: 'bg-primary-50 text-primary-700 ring-primary-200',
    primary: 'bg-primary-50 text-primary-700 ring-primary-200',
  }
  return (
    <motion.span 
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${colors[color] ?? colors.gray} ${className}`}
    >
      {children}
    </motion.span>
  )
}
