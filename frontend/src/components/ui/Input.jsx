import { motion } from 'framer-motion'

export default function Input({label, error, className='', ...props}){
  return (
    <motion.label
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`block ${className}`}
    >
      {label && (
        <div className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
          {label}
        </div>
      )}
      <input
        className={`w-full rounded-lg border-2 px-4 py-2.5 transition-all duration-200 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 hover:border-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 ${
          error
            ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
            : "border-gray-200"
        }`}
        {...props}
      />
      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-1.5 text-xs text-red-600 dark:text-red-400"
        >
          {error}
        </motion.div>
      )}
    </motion.label>
  );
}
