import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../lib/api'
import Drawer from '../components/ui/Drawer'
import Badge from '../components/ui/Badge'
import Select from '../components/ui/Select'
import RequirePermission from '../components/RequirePermission'
import Button from '../components/ui/Button'
import FileUploader from '../components/FileUploader'

function useRequests() {
  return useQuery({
    queryKey: ['requests'],
    queryFn: async () => {
      const { data } = await api.get('/requests')
      return data.data ?? data
    }
  })
}

const STATUS = [
  { value: 'EN_ATTENTE', label: 'En attente' },
  { value: 'EN_RELANCE', label: 'En relance' },
  { value: 'RECU', label: 'Reçu' },
  { value: 'INCOMPLET', label: 'Incomplet' },
  { value: 'VALIDE', label: 'Validé' },
]

const STATUS_COLORS = {
  'EN_ATTENTE': 'sky',
  'EN_RELANCE': 'amber',
  'RECU': 'blue',
  'INCOMPLET': 'rose',
  'VALIDE': 'emerald',
}

export default function Requests(){
  const qc = useQueryClient()
  const { data: rows = [], isLoading } = useRequests()
  const [selected, setSelected] = React.useState(null)
  const [open, setOpen] = React.useState(false)

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      const { data } = await api.put(`/requests/${id}`, { status })
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['requests'] }),
  })

  function onRowClick(row){
    setSelected(row)
    setOpen(true)
  }

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
          Demandes
        </h1>
        <p className="text-gray-600">Gérez les demandes clients et leurs documents</p>
      </motion.div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="h-20 bg-gray-200 rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Titre</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date limite</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <svg className="w-16 h-16 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="font-medium">Aucune demande</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  rows.map((row, i) => (
                    <motion.tr 
                      key={row.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ backgroundColor: 'rgba(243, 244, 246, 0.5)' }}
                      onClick={() => onRowClick(row)}
                      className="cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center text-white font-bold mr-3 shadow-lg">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div className="font-medium text-gray-900">{row.title}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{row.client?.raison_sociale ?? row.client?.name ?? '—'}</td>
                      <td className="px-6 py-4">
                        <Badge color={STATUS_COLORS[row.status] || 'sky'}>{row.status}</Badge>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{row.due_date || '—'}</td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      <Drawer open={open} onClose={() => setOpen(false)} title={selected?.title}>
        {selected ? (
          <RequestDetails id={selected.id} onStatus={(s) => statusMutation.mutate({ id: selected.id, status: s })} />
        ) : (
          <div className="text-gray-500">Sélectionnez une demande</div>
        )}
      </Drawer>
    </div>
  )
}

function RequestDetails({ id, onStatus }){
  const { data, isLoading } = useQuery({
    queryKey: ['request', id],
    queryFn: async () => (await api.get(`/requests/${id}`)).data,
    enabled: !!id,
  })

  const uploadMutation = useMutation({
    mutationFn: async (file) => {
      const form = new FormData()
      form.append('file', file)
      const { data } = await api.post(`/requests/${id}/files`, form, { headers: { 'Content-Type': 'multipart/form-data' } })
      return data
    },
    onSuccess: () => {
      // refresh details
    }
  })

  const qc = useQueryClient()
  React.useEffect(() => {
    if (uploadMutation.isSuccess) {
      qc.invalidateQueries({ queryKey: ['request', id] })
    }
  }, [uploadMutation.isSuccess, id, qc])

  if (isLoading) return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />
      ))}
    </div>
  )
  if (!data) return <div className="text-gray-500 text-center py-8">Demande non trouvée</div>

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Status */}
      <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100">
        <div className="text-sm font-medium text-gray-700">Statut</div>
        <RequirePermission perm="requests.manage" fallback={<Badge color="gray">{data.status}</Badge>}>
          <Select 
            value={data.status} 
            onChange={e=>onStatus(e.target.value)} 
            options={[
              { value: data.status, label: data.status },
              ...STATUS.filter(s => s.value !== data.status)
            ]}
            className="flex-1"
          />
        </RequirePermission>
      </div>

      {/* Thread */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <div className="font-semibold text-gray-900">Conversation</div>
        </div>
        <div className="space-y-3">
          <AnimatePresence>
            {(data.request_messages ?? []).map((m, i) => (
              <motion.div 
                key={m.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: i * 0.05 }}
                className="border-2 border-gray-200 rounded-xl p-4 bg-white hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center text-white text-xs font-bold">
                    {m.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="text-xs text-gray-500">{new Date(m.created_at).toLocaleString()}</div>
                </div>
                <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: m.message_html }} />
              </motion.div>
            ))}
          </AnimatePresence>
          {(!data.request_messages || data.request_messages.length===0) && (
            <div className="text-center py-8 text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-sm">Aucun message</p>
            </div>
          )}
        </div>
      </div>

      {/* Files */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <div className="font-semibold text-gray-900">Documents</div>
        </div>
        <div className="space-y-3">
          <AnimatePresence>
            {(data.request_files ?? []).map((f, i) => (
              <motion.div 
                key={f.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.02 }}
                className="flex items-center justify-between border-2 border-gray-200 rounded-xl p-3 bg-white hover:shadow-md transition-all"
              >
                <a className="flex items-center gap-3 text-primary-700 hover:text-primary-800 font-medium" href={f.url} target="_blank" rel="noreferrer">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {f.original_name}
                </a>
                <div className="text-xs font-medium text-gray-500 px-2 py-1 rounded-lg bg-gray-100">
                  {Math.round((f.size_bytes||0)/1024)} KB
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <RequirePermission perm="requests.manage" fallback={null}>
            <FileUploader onFiles={files => files.forEach(file => uploadMutation.mutate(file))} />
          </RequirePermission>
        </div>
      </div>
    </motion.div>
  )
}
