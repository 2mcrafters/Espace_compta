import React from 'react'

const ToastContext = React.createContext(null)

export function useToast(){
  const ctx = React.useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within <ToasterProvider>')
  return ctx
}

let idCounter = 1

export default function ToasterProvider({ children }){
  const [toasts, setToasts] = React.useState([])
  const remove = React.useCallback((id) => setToasts(ts => ts.filter(t => t.id !== id)), [])
  const push = React.useCallback((opts) => {
    const id = idCounter++
    const toast = { id, title: opts.title || '', message: opts.message || '', type: opts.type || 'info', duration: opts.duration ?? 3000 }
    setToasts(ts => [...ts, toast])
    if (toast.duration > 0){
      setTimeout(() => remove(id), toast.duration)
    }
    return id
  }, [remove])

  const api = React.useMemo(() => ({
    success: (message, title = 'Succès') => push({ type: 'success', message, title }),
    error: (message, title = 'Erreur') => push({ type: 'error', message, title, duration: 5000 }),
    info: (message, title = 'Info') => push({ type: 'info', message, title }),
    remove,
  }), [push, remove])

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="fixed z-[9999] right-4 bottom-4 space-y-2 max-w-sm">
        {toasts.map(t => (
          <div key={t.id} className={`rounded-xl shadow-lg border px-4 py-3 backdrop-blur bg-white/90 dark:bg-gray-800/90 transition-colors ${t.type==='success' ? 'border-emerald-200 dark:border-emerald-700' : t.type==='error' ? 'border-rose-200 dark:border-rose-700' : 'border-gray-200 dark:border-gray-700'}`}>
            <div className="flex items-start gap-3">
              <div className={`w-2 h-2 mt-1 rounded-full ${t.type==='success' ? 'bg-emerald-500' : t.type==='error' ? 'bg-rose-500' : 'bg-gray-400'}`} />
              <div className="flex-1">
                {t.title && <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t.title}</div>}
                <div className="text-sm text-gray-700 dark:text-gray-300">{t.message}</div>
              </div>
              <button onClick={() => api.remove(t.id)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">×</button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
