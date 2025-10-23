import { motion } from 'framer-motion'

export default function Badge({ color='gray', children, className='' }){
  const colors = {
    gray: "bg-gray-100 text-gray-800 ring-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:ring-gray-700",
    green:
      "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:ring-emerald-800",
    emerald:
      "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:ring-emerald-800",
    red: "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:ring-rose-800",
    rose: "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:ring-rose-800",
    blue: "bg-primary-50 text-primary-700 ring-primary-200 dark:bg-blue-900/30 dark:text-blue-300 dark:ring-blue-800",
    yellow:
      "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:ring-amber-800",
    amber:
      "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:ring-amber-800",
    sky: "bg-primary-50 text-primary-700 ring-primary-200 dark:bg-sky-900/30 dark:text-sky-300 dark:ring-sky-800",
    primary:
      "bg-primary-50 text-primary-700 ring-primary-200 dark:bg-blue-900/30 dark:text-blue-300 dark:ring-blue-800",
  };
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
