import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import RequirePermission from '../components/RequirePermission'
import Modal from '../components/ui/Modal'

function useUsers(){
  return useQuery({ queryKey: ['users'], queryFn: async () => (await api.get('/users')).data })
}

function useStats(userId){
  return useQuery({ queryKey: ['user-stats', userId], queryFn: async () => (await api.get(`/users/${userId}/stats`)).data, enabled: !!userId })
}

export default function Collaborators(){
  const qc = useQueryClient()
  const { data: users = [], isLoading } = useUsers()
  const [editing, setEditing] = React.useState(null)
  const [rateUser, setRateUser] = React.useState(null)

  const saveMutation = useMutation({
    mutationFn: async ({ id, ...payload }) => (await api.put(`/users/${id}`, payload)).data,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); setEditing(null) }
  })
  const rateMutation = useMutation({
    mutationFn: async ({ id, hourly_rate_mad, effective_from }) => (await api.post(`/users/${id}/rate`, { hourly_rate_mad, effective_from })).data,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); setRateUser(null) }
  })

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Collaborateurs</h1>
      {isLoading ? <p>Chargement...</p> : (
        <div className="bg-white rounded-xl border p-4">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-600">
                <th className="py-2">Nom</th>
                <th className="py-2">Fonction</th>
                <th className="py-2">Email</th>
                <th className="py-2">Téléphone</th>
                <th className="py-2">Objectif mensuel</th>
                <th className="py-2">Taux horaire</th>
                <th className="py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map(u => (
                <Row key={u.id} user={u} onEdit={() => setEditing(u)} onSetRate={() => setRateUser(u)} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <EditUserModal user={editing} onClose={() => setEditing(null)} onSave={(payload) => saveMutation.mutate(payload)} saving={saveMutation.isPending} />
      )}
      {rateUser && (
        <SetRateModal user={rateUser} onClose={() => setRateUser(null)} onSave={(payload) => rateMutation.mutate(payload)} saving={rateMutation.isPending} />
      )}
    </div>
  )
}

function Row({ user, onEdit, onSetRate }){
  const { data: stats } = useStats(user.id)
  return (
    <tr>
      <td className="py-2">
        <div className="font-medium text-gray-900">{user.first_name || user.last_name ? `${user.first_name||''} ${user.last_name||''}`.trim() : user.name}</div>
        <div className="text-xs text-gray-500">{user.internal_id || '—'}</div>
      </td>
      <td className="py-2">{user.job_title || '—'}</td>
      <td className="py-2">{user.email}</td>
      <td className="py-2">{user.phone || '—'}</td>
      <td className="py-2">{user.monthly_hours_target || '—'} h</td>
      <td className="py-2">{user.hourly_rate_mad ? `${Number(user.hourly_rate_mad).toFixed(2)} MAD` : '—'}</td>
      <td className="py-2 text-right">
        <div className="flex gap-2 justify-end">
          <Button onClick={onEdit} className="!from-gray-600 !to-gray-700">Modifier</Button>
          <RequirePermission perm="users.rate" fallback={null}>
            <Button onClick={onSetRate} className="!from-indigo-500 !to-indigo-600">Taux horaire</Button>
          </RequirePermission>
        </div>
        <div className="text-xs text-gray-500 mt-1">Ce mois: {stats?.minutes_month ?? '—'} min · Cette année: {stats?.minutes_year ?? '—'} min</div>
      </td>
    </tr>
  )
}

function EditUserModal({ user, onClose, onSave, saving }){
  const [form, setForm] = React.useState({ ...user })
  function update(field, value){ setForm(s => ({ ...s, [field]: value })) }
  function submit(){ onSave({ id: user.id, ...form }) }
  return (
    <Modal open onClose={onClose} title={`Modifier ${user.name}`} footer={<div className="flex gap-2"><Button onClick={onClose} className="!from-gray-200 !to-gray-300 !text-gray-800">Annuler</Button><Button onClick={submit} disabled={saving}>Enregistrer</Button></div>}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Input label="Prénom" value={form.first_name||''} onChange={e=>update('first_name', e.target.value)} />
        <Input label="Nom" value={form.last_name||''} onChange={e=>update('last_name', e.target.value)} />
        <Input label="Email" value={form.email||''} onChange={e=>update('email', e.target.value)} />
        <Input label="Téléphone" value={form.phone||''} onChange={e=>update('phone', e.target.value)} />
        <Input label="Identifiant interne" value={form.internal_id||''} onChange={e=>update('internal_id', e.target.value)} />
        <Input label="Fonction" value={form.job_title||''} onChange={e=>update('job_title', e.target.value)} />
        <Input label="Objectif mensuel (h)" type="number" step="0.01" value={form.monthly_hours_target||''} onChange={e=>update('monthly_hours_target', e.target.value)} />
        <Input label="Objectif annuel (h)" type="number" step="0.01" value={form.yearly_hours_target||''} onChange={e=>update('yearly_hours_target', e.target.value)} />
      </div>
    </Modal>
  )
}

function SetRateModal({ user, onClose, onSave, saving }){
  const [rate, setRate] = React.useState('')
  const [date, setDate] = React.useState(new Date().toISOString().slice(0,10))
  function submit(){ onSave({ id: user.id, hourly_rate_mad: Number(rate), effective_from: date }) }
  return (
    <Modal open onClose={onClose} title={`Taux horaire • ${user.name}`} footer={<div className="flex gap-2"><Button onClick={onClose} className="!from-gray-200 !to-gray-300 !text-gray-800">Annuler</Button><Button onClick={submit} disabled={saving || !rate}>Enregistrer</Button></div>}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Input label="Taux (MAD/h)" type="number" step="0.01" value={rate} onChange={e=>setRate(e.target.value)} />
        <Input label="Date d'effet" type="date" value={date} onChange={e=>setDate(e.target.value)} />
        <p className="text-sm text-gray-500 md:col-span-2">Seuls les rôles autorisés peuvent consulter/modifier le taux horaire.</p>
      </div>
    </Modal>
  )
}
