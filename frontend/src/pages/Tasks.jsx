import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../lib/api'
import Button from '../components/ui/Button'
import Select from '../components/ui/Select'
import RequirePermission from '../components/RequirePermission'

const STATUS = [
  { key: 'EN_ATTENTE', label: 'En attente', color: 'from-gray-400 to-gray-500', bgColor: 'bg-gray-50', borderColor: 'border-gray-200' },
  { key: 'EN_COURS', label: 'En cours', color: 'from-primary-400 to-primary-700', bgColor: 'bg-primary-50', borderColor: 'border-primary-200' },
  { key: 'EN_VALIDATION', label: 'En validation', color: 'from-amber-400 to-orange-500', bgColor: 'bg-amber-50', borderColor: 'border-amber-200' },
  { key: 'TERMINEE', label: 'Terminée', color: 'from-emerald-400 to-green-600', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200' }
]

function useTasks() {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const { data } = await api.get('/tasks')
      return data.data ?? data
    }
  })
}

export default function Tasks(){
  const qc = useQueryClient()
  const { data: tasks = [], isLoading } = useTasks()
  const [runningByTask, setRunningByTask] = React.useState({})

  const startMutation = useMutation({
    mutationFn: async (taskId) => {
      const { data } = await api.post(`/tasks/${taskId}/time/start`, {})
      return data
    },
    onSuccess: (entry) => {
      setRunningByTask(prev => ({ ...prev, [entry.task_id]: entry.id }))
    }
  })

  const stopMutation = useMutation({
    mutationFn: async (entryId) => {
      const { data } = await api.post(`/time-entries/${entryId}/stop`, {})
      return data
    },
    onSuccess: (entry) => {
      setRunningByTask(prev => ({ ...prev, [entry.task_id]: undefined }))
    }
  })

  const assignMutation = useMutation({
    mutationFn: async ({ taskId, userId }) => {
      const { data } = await api.post(`/tasks/${taskId}/assign`, { user_id: Number(userId) })
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] })
    }
  })

  const grouped = React.useMemo(() => {
    const g = Object.fromEntries(STATUS.map(s => [s.key, []]))
    for (const t of tasks) {
      g[t.status ?? 'EN_ATTENTE'].push(t)
    }
    return g
  }, [tasks])

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
          Tâches
        </h1>
        <p className="text-gray-600">Suivez et gérez vos tâches par statut</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {STATUS.map((statusObj, colIndex) => (
          <motion.div 
            key={statusObj.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: colIndex * 0.1 }}
            className={`rounded-2xl border-2 ${statusObj.borderColor} ${statusObj.bgColor} overflow-hidden shadow-lg`}
          >
            <div className={`bg-gradient-to-r ${statusObj.color} px-4 py-3`}>
              <h3 className="font-bold text-white text-sm uppercase tracking-wide">{statusObj.label}</h3>
              <div className="text-xs text-white/80 mt-0.5">{(grouped[statusObj.key] ?? []).length} tâche(s)</div>
            </div>
            <div className="p-4 space-y-3 min-h-[200px]">
              {isLoading ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="h-32 bg-white/50 rounded-xl animate-pulse" />
                ))
              ) : (grouped[statusObj.key] ?? []).length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="text-sm">Aucune tâche</p>
                </div>
              ) : (
                <AnimatePresence>
                  {(grouped[statusObj.key] ?? []).map((task, i) => (
                    <TaskCard 
                      key={task.id} 
                      task={task}
                      index={i}
                      runningEntryId={runningByTask[task.id]}
                      onStart={() => startMutation.mutate(task.id)}
                      onStop={() => runningByTask[task.id] && stopMutation.mutate(runningByTask[task.id])}
                      onAssign={(userId) => assignMutation.mutate({ taskId: task.id, userId })}
                    />
                  ))}
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function TaskCard({ task, index, runningEntryId, onStart, onStop, onAssign }){
  const [assignee, setAssignee] = React.useState('')
  const [isHovered, setIsHovered] = React.useState(false)
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -3, scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative rounded-xl border-2 border-gray-200 bg-white p-4 shadow-md hover:shadow-xl transition-all duration-300"
    >
      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gray-100 rounded-t-xl overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${task.progress ?? 0}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-primary-500 to-primary-700"
        />
      </div>

      <div className="flex items-start justify-between gap-3 mt-2">
        <div className="flex-1">
          <div className="font-semibold text-gray-900">{task.title ?? task.name ?? `Tâche #${task.id}`}</div>
          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              {task.category || 'Général'}
            </span>
            <span className="inline-flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {task.due_at ?? '—'}
            </span>
          </div>
        </div>
        <motion.div 
          animate={{ scale: isHovered ? 1.1 : 1 }}
          className="text-sm font-bold text-gray-700 px-2 py-1 rounded-lg bg-gray-100"
        >
          {task.progress ?? 0}%
        </motion.div>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <RequirePermission perm="tasks.manage" fallback={
          !runningEntryId ? (
            <div className="text-xs text-center text-red-600 py-1">Pas de permission</div>
          ) : (
            <div className="text-xs text-center text-red-600 py-1">Pas de permission</div>
          )
        }>
        {!runningEntryId ? (
          <motion.button
            whileHover={{ 
              scale: 1.03,
              y: -2,
              boxShadow: '0 15px 30px rgba(16, 185, 129, 0.4)'
            }}
            whileTap={{ scale: 0.97 }}
            onClick={onStart}
            className="w-full px-3 py-2.5 rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold shadow-lg transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden group"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transform -translate-x-full group-hover:translate-x-full transition-all duration-700"></span>
            <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="relative z-10">Démarrer</span>
          </motion.button>
        ) : (
          <motion.button
            animate={{ boxShadow: ['0 0 0 0 rgba(244, 63, 94, 0.4)', '0 0 0 8px rgba(244, 63, 94, 0)'] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            whileHover={{ 
              scale: 1.03,
              y: -2,
              boxShadow: '0 15px 30px rgba(239, 68, 68, 0.5)'
            }}
            whileTap={{ scale: 0.97 }}
            onClick={onStop}
            className="w-full px-3 py-2.5 rounded-lg bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-semibold shadow-lg transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden group"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transform -translate-x-full group-hover:translate-x-full transition-all duration-700"></span>
            <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            </svg>
            <span className="relative z-10">Arrêter</span>
          </motion.button>
        )}
        </RequirePermission>

        <RequirePermission perm="tasks.manage" fallback={<div className="text-xs text-center text-red-600 py-1">Pas de permission</div>}>
          <div className="flex gap-2">
            <Select 
              value={assignee} 
              onChange={e=>setAssignee(e.target.value)} 
              options={[{value:'',label:'Assigner…'},1,2,3,4].map(v => typeof v==='object'?v:{value:v,label:`User ${v}`})}
              className="flex-1 text-sm"
            />
            <motion.button
              whileHover={{ 
                scale: 1.05,
                y: -2,
                boxShadow: '0 10px 20px rgba(75, 85, 99, 0.4)'
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => assignee && onAssign(assignee)}
              disabled={!assignee}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white text-sm font-semibold shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 relative overflow-hidden group"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transform -translate-x-full group-hover:translate-x-full transition-all duration-500"></span>
              <span className="relative z-10">OK</span>
            </motion.button>
          </div>
        </RequirePermission>
      </div>
    </motion.div>
  )
}
