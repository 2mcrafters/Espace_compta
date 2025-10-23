import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Modal({
  open,
  title,
  onClose,
  children,
  footer,
  className,
}) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`relative z-10 w-full ${
              className || "max-w-lg"
            } max-h-[88vh] flex flex-col overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700`}
          >
            {title && (
              <div className="shrink-0 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-sky-50 to-blue-50 dark:from-gray-800 dark:to-gray-800 px-6 py-4 rounded-t-2xl">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {title}
                </h3>
              </div>
            )}
            <div className="flex-1 overflow-y-auto p-6 text-gray-800 dark:text-gray-100">
              {children}
            </div>
            {footer && (
              <div className="shrink-0 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30 px-6 py-4 rounded-b-2xl flex justify-end gap-3">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
