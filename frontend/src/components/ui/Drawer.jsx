import { motion, AnimatePresence } from 'framer-motion'

export default function Drawer({ open, side='right', title, onClose, children, footer }){
  const sideClasses = side === 'left' ? 'left-0' : 'right-0'
  const slideVariants = {
    hidden: { x: side === 'left' ? '-100%' : '100%', opacity: 0 },
    visible: { x: 0, opacity: 1 },
    exit: { x: side === 'left' ? '-100%' : '100%', opacity: 0 }
  }
  
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-40">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            variants={slideVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className={`absolute top-0 ${sideClasses} h-full w-full max-w-md bg-white dark:bg-gray-900 dark:text-gray-100 shadow-2xl flex flex-col`}
          >
            <div className="border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20 px-4 sm:px-6 py-4 flex items-center justify-between">
              <div className="font-semibold text-gray-900 dark:text-gray-100">
                {title}
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </motion.button>
            </div>
            <div className="flex-1 overflow-auto p-4 sm:p-6">{children}</div>
            {footer && (
              <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 py-4">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
