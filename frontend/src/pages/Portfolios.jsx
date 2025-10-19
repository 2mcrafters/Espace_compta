import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import api from '../lib/api'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'
import RequirePermission from '../components/RequirePermission'
import ConfirmDialog from '../components/ui/ConfirmDialog'

function usePortfolios() {
  return useQuery({
    queryKey: ['portfolios'],
    queryFn: async () => {
      const { data } = await api.get('/portfolios')
      return data
    }
  })
}

export default function Portfolios() {
  const qc = useQueryClient()
  const { data: portfolios = [], isLoading } = usePortfolios()
  const [open, setOpen] = React.useState(false)
  const [editing, setEditing] = React.useState(null)
  const [collabFor, setCollabFor] = React.useState(null)
  const [confirmDelete, setConfirmDelete] = React.useState(null)

  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      if (payload.id) {
        const { id, ...rest } = payload
        const { data } = await api.put(`/portfolios/${id}`, rest)
        return data
      } else {
        const { data } = await api.post('/portfolios', payload)
        return data
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['portfolios'] }); setOpen(false); setEditing(null) }
  })

  const deleteMutation = useMutation({
    mutationFn: async (id) => { await api.delete(`/portfolios/${id}`) },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['portfolios'] }); setConfirmDelete(null) }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Portefeuilles</h1>
        <RequirePermission perm="clients.edit" fallback={null}>
          <Button onClick={() => { setEditing({ name: '', description: '' }); setOpen(true) }}>Nouveau portefeuille</Button>
        </RequirePermission>
      </div>
      {isLoading ? <p>Chargement...</p> : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {portfolios.map(p => (
            <motion.div key={p.id} className="bg-white border rounded-xl p-4 shadow-sm" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold">{p.name}</h3>
                  <p className="text-sm text-gray-500">{p.description || '—'}</p>
                </div>
                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">{p.clients_count} clients</span>
              </div>
              <div className="mt-4 flex gap-2">
                <Button onClick={() => { setEditing(p); setOpen(true) }} className="!from-gray-600 !to-gray-700">Modifier</Button>
                <Button onClick={() => setCollabFor(p)} className="!from-blue-500 !to-blue-600">Collaborateurs</Button>
                <RequirePermission perm="clients.edit" fallback={null}>
                  <Button onClick={() => setConfirmDelete(p)} className="!from-red-500 !to-red-600">Supprimer</Button>
                </RequirePermission>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => { setOpen(false); setEditing(null) }} title={editing?.id ? 'Modifier le portefeuille' : 'Nouveau portefeuille'}
        footer={<div className="flex gap-2"><Button onClick={() => setOpen(false)} className="!from-gray-200 !to-gray-300 !text-gray-800">Annuler</Button><Button onClick={() => saveMutation.mutate(editing)} disabled={saveMutation.isPending}>Enregistrer</Button></div>}
      >
        <div className="space-y-4">
          <Input label="Nom" value={editing?.name || ''} onChange={e => setEditing(s => ({ ...s, name: e.target.value }))} />
          <Input label="Description" value={editing?.description || ''} onChange={e => setEditing(s => ({ ...s, description: e.target.value }))} />
        </div>
      </Modal>

      <PortfolioCollaboratorsModal portfolio={collabFor} onClose={() => setCollabFor(null)} />

      <ConfirmDialog 
        open={!!confirmDelete}
        title="Supprimer le portefeuille"
        description={confirmDelete ? `Confirmez la suppression de "${confirmDelete.name}". Les rattachements clients seront détachés.` : ''}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={() => confirmDelete && deleteMutation.mutate(confirmDelete.id)}
      />
    </div>
  )
}

function PortfolioCollaboratorsModal({ portfolio, onClose }) {
  const open = !!portfolio
  const qc = useQueryClient()
  const { data: users = [] } = useQuery({ queryKey: ['users-lookup'], queryFn: async () => (await api.get('/users/lookup')).data, enabled: open })
  const { data: collabs = [] } = useQuery({ queryKey: ['portfolio-collabs', portfolio?.id], queryFn: async () => (await api.get(`/portfolios/${portfolio.id}/collaborators`)).data, enabled: open })

  const attachMutation = useMutation({
    mutationFn: async (user_id) => (await api.post(`/portfolios/${portfolio.id}/collaborators`, { user_id })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['portfolio-collabs', portfolio?.id] })
  })
  const detachMutation = useMutation({
    mutationFn: async (user_id) => (await api.delete(`/portfolios/${portfolio.id}/collaborators/${user_id}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['portfolio-collabs', portfolio?.id] })
  })

  const [confirmDetach, setConfirmDetach] = React.useState(null)

  return (
    <Modal open={open} onClose={onClose} title={portfolio ? `Collaborateurs • ${portfolio.name}` : 'Collaborateurs'}
      footer={<div className="flex gap-2"><Button onClick={onClose} className="!from-gray-200 !to-gray-300 !text-gray-800">Fermer</Button></div>}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold mb-2">Tous les utilisateurs</h4>
          <ul className="divide-y">
            {users.map(u => (
              <li key={u.id} className="py-2 flex items-center justify-between">
                <span>{u.name} <span className="text-gray-500 text-xs">({u.email})</span></span>
                <Button onClick={() => attachMutation.mutate(u.id)} className="!from-blue-500 !to-blue-600">Ajouter</Button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Collaborateurs du portefeuille</h4>
          <ul className="divide-y">
            {collabs.map(u => (
              <li key={u.id} className="py-2 flex items-center justify-between">
                <span>{u.name} <span className="text-gray-500 text-xs">({u.email})</span></span>
                <Button onClick={() => setConfirmDetach(u)} className="!from-red-500 !to-red-600">Retirer</Button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <ConfirmDialog 
        open={!!confirmDetach}
        title="Retirer le collaborateur"
        description={confirmDetach ? `Retirer ${confirmDetach.name} de ${portfolio?.name} ?` : ''}
        onCancel={() => setConfirmDetach(null)}
        onConfirm={() => { if (confirmDetach) { detachMutation.mutate(confirmDetach.id); setConfirmDetach(null) } }}
      />
    </Modal>
  )
}
