import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import api from '../lib/api'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import { useSelector } from 'react-redux'
import { selectUser } from '../store/redux/store'
import RequirePermission from '../components/RequirePermission'
import ConfirmDialog from '../components/ui/ConfirmDialog'

function useClients() {
  return useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data } = await api.get('/clients')
      return data?.data ?? data
    }
  })
}

export default function Clients() {
  const qc = useQueryClient()
  const user = useSelector(selectUser)
  const { data: clients = [], isLoading } = useClients()
  const [open, setOpen] = React.useState(false)
  const [editing, setEditing] = React.useState(null)
  const [confirm, setConfirm] = React.useState(null)

  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      if (payload.id) {
        const { id, ...rest } = payload
        const { data } = await api.put(`/clients/${id}`, rest)
        return data
      } else {
        const { data } = await api.post('/clients', payload)
        return data
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clients'] })
      setOpen(false)
      setEditing(null)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/clients/${id}`)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clients'] })
      setConfirm(null)
    }
  })

  function openCreate() {
    setEditing({ portfolio_id: '', raison_sociale: '', email: '', telephone: '', montant_contrat: '' })
    setOpen(true)
  }
  function openEdit(row) {
    setEditing({ ...row })
    setOpen(true)
  }

  const canSeeContract = !!user && Array.isArray(user.roles) && user.roles.some(r => ['ADMIN','CHEF_EQUIPE'].includes(r))

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
            Clients
          </h1>
          <p className="text-gray-600">Gérez vos clients et leurs informations</p>
        </div>
        <RequirePermission perm="clients.edit" fallback={null}>
        <Button onClick={openCreate} className="!from-primary-500 !to-primary-700">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Ajouter un client
        </Button>
        </RequirePermission>
      </motion.div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="h-16 bg-gray-200 rounded-xl animate-pulse"
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
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Raison sociale</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Telephone</th>
                  {canSeeContract && <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Montant contrat</th>}
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {clients.length === 0 ? (
                  <tr>
                    <td colSpan={canSeeContract ? 5 : 4} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <svg className="w-16 h-16 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <p className="font-medium">Aucun client</p>
                        <p className="text-sm">Cliquez sur "Ajouter un client" pour commencer</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  clients.map((row, i) => (
                    <motion.tr 
                      key={row.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ backgroundColor: 'rgba(243, 244, 246, 0.5)' }}
                      className="transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center text-white font-bold mr-3 shadow-lg">
                            {row.raison_sociale?.charAt(0)?.toUpperCase() || 'C'}
                          </div>
                          <div className="font-medium text-gray-900">{row.raison_sociale}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{row.email || '—'}</td>
                      <td className="px-6 py-4 text-gray-600">{row.telephone || '—'}</td>
                      {canSeeContract && (
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-emerald-100 text-emerald-700">
                            {row.montant_contrat ? `${parseFloat(row.montant_contrat).toLocaleString()} €` : '—'}
                          </span>
                        </td>
                      )}
                      <td className="px-6 py-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <RequirePermission perm="clients.edit" fallback={null}>
                            <RequirePermission perm="clients.edit" fallback={null}>
                            <motion.button
                              whileHover={{ 
                                scale: 1.05,
                                y: -2,
                                boxShadow: '0 10px 25px rgba(75, 85, 99, 0.4)'
                              }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => openEdit(row)}
                              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white text-sm font-medium shadow-md transition-all duration-300 relative overflow-hidden group"
                            >
                              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transform -translate-x-full group-hover:translate-x-full transition-all duration-500"></span>
                              <span className="relative">Modifier</span>
                            </motion.button>
                            </RequirePermission>
                          </RequirePermission>
                          <RequirePermission perm="clients.edit" fallback={null}>
                          <motion.button
                            whileHover={{ 
                              scale: 1.05,
                              y: -2,
                              boxShadow: '0 10px 25px rgba(239, 68, 68, 0.4)'
                            }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setConfirm(row)}
                            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-sm font-medium shadow-md transition-all duration-300 relative overflow-hidden group"
                          >
                            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transform -translate-x-full group-hover:translate-x-full transition-all duration-500"></span>
                            <span className="relative">Supprimer</span>
                          </motion.button>
                          </RequirePermission>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      <ClientFormModal open={open} onClose={() => { setOpen(false); setEditing(null) }}
        client={editing}
        onSubmit={(values) => saveMutation.mutate(values)}
        saving={saveMutation.isPending}
      />

      <ConfirmDialog open={!!confirm} title="Supprimer le client" description={`Êtes-vous sûr de vouloir supprimer ${confirm?.raison_sociale} ?`}
        onCancel={() => setConfirm(null)} onConfirm={() => deleteMutation.mutate(confirm.id)} />
    </div>
  )
}

function ClientFormModal({ open, onClose, client, onSubmit, saving }) {
  const [form, setForm] = React.useState(client || { portfolio_id: '', raison_sociale: '', email: '', telephone: '', montant_contrat: '' })
  React.useEffect(() => { setForm(client || { portfolio_id: '', raison_sociale: '', email: '', telephone: '', montant_contrat: '' }) }, [client])

  function update(field, value) { setForm(prev => ({ ...prev, [field]: value })) }
  function submit(e) { e.preventDefault(); onSubmit?.(form) }

  return (
    <Modal open={open} onClose={onClose} title={client?.id ? 'Modifier le client' : 'Ajouter un client'}
      footer={
        <div className="flex gap-3">
          <motion.button 
            whileHover={{ 
              scale: 1.03,
              borderColor: 'rgb(156, 163, 175)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
            }}
            whileTap={{ scale: 0.97 }}
            className="px-5 py-2.5 rounded-lg border-2 border-gray-300 font-semibold text-gray-700 hover:bg-gray-50 transition-all duration-300" 
            onClick={onClose}
          >
            Annuler
          </motion.button>
          <RequirePermission perm="clients.edit" fallback={null}>
          <Button disabled={saving} onClick={submit}>
            {saving ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enregistrement...
              </>
            ) : 'Enregistrer'}
          </Button>
          </RequirePermission>
        </div>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        {!client?.id && <Input label="Portfolio ID" type="number" value={form.portfolio_id} onChange={e=>update('portfolio_id', e.target.value)} required />}
        <Input label="Raison sociale" value={form.raison_sociale} onChange={e=>update('raison_sociale', e.target.value)} required />
        <Input label="Email" type="email" value={form.email} onChange={e=>update('email', e.target.value)} />
        <Input label="Telephone" value={form.telephone} onChange={e=>update('telephone', e.target.value)} />
        <Input label="Montant contrat (€)" type="number" step="0.01" value={form.montant_contrat ?? ''} onChange={e=>update('montant_contrat', e.target.value)} />
      </form>
    </Modal>
  )
}
