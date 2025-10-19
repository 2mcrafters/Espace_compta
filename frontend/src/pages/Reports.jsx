import React from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../lib/api'
import RequirePermission from '../components/RequirePermission'
import Button from '../components/ui/Button'

function useProductivity(from, to){
  return useQuery({
    queryKey: ['reports','productivity',from,to],
    queryFn: async () => (await api.get('/reports/productivity', { params: { from, to } })).data,
    enabled: !!from && !!to
  })
}
function useTimesheet(from, to, userId){
  return useQuery({
    queryKey: ['reports','timesheet',from,to,userId],
    queryFn: async () => (await api.get('/reports/timesheet', { params: { from, to, user_id: userId || undefined } })).data,
    enabled: !!from && !!to
  })
}
function useClientCosts(from, to){
  return useQuery({
    queryKey: ['reports','client-costs',from,to],
    queryFn: async () => (await api.get('/reports/client-costs', { params: { from, to } })).data,
    enabled: !!from && !!to
  })
}

export default function Reports(){
  const [tab, setTab] = React.useState('productivity')
  const [from, setFrom] = React.useState(new Date().toISOString().slice(0,10))
  const [to, setTo] = React.useState(new Date().toISOString().slice(0,10))
  const [userId, setUserId] = React.useState('')

  const prod = useProductivity(from, to)
  const sheet = useTimesheet(from, to, userId)
  const costs = useClientCosts(from, to)

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Rapports</h1>
      <div className="flex gap-2 items-end">
        <div className="flex flex-col">
          <label className="text-xs text-gray-600">Du</label>
          <input type="date" value={from} onChange={e=>setFrom(e.target.value)} className="border rounded px-2 py-1" />
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-gray-600">Au</label>
          <input type="date" value={to} onChange={e=>setTo(e.target.value)} className="border rounded px-2 py-1" />
        </div>
        <div className="ml-auto flex gap-2">
          <Button onClick={()=>{ /* trigger refetch via state deps */ }}>Actualiser</Button>
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={()=>setTab('productivity')} className={`px-3 py-1 rounded ${tab==='productivity'?'bg-primary-600 text-white':'bg-gray-100'}`}>Productivité</button>
        <button onClick={()=>setTab('timesheet')} className={`px-3 py-1 rounded ${tab==='timesheet'?'bg-primary-600 text-white':'bg-gray-100'}`}>Feuilles de temps</button>
        <RequirePermission perm="users.rate.set" fallback={<span className="px-3 py-1 rounded bg-gray-200 text-gray-500">Coûts clients (restreint)</span>}>
          <button onClick={()=>setTab('costs')} className={`px-3 py-1 rounded ${tab==='costs'?'bg-primary-600 text-white':'bg-gray-100'}`}>Coûts clients</button>
        </RequirePermission>
      </div>

      {tab==='productivity' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="border rounded-xl overflow-hidden">
            <div className="px-3 py-2 font-semibold bg-gray-50 border-b">Minutes par client</div>
            <table className="min-w-full text-sm">
              <thead><tr><th className="px-3 py-2 text-left">Client</th><th className="px-3 py-2 text-right">Minutes</th><th className="px-3 py-2 text-right">Heures</th></tr></thead>
              <tbody>
                {(prod.data?.per_client||[]).map((r,i)=> (
                  <tr key={i} className="odd:bg-gray-50"><td className="px-3 py-2">{r.client_id}</td><td className="px-3 py-2 text-right">{r.minutes}</td><td className="px-3 py-2 text-right">{(r.minutes/60).toFixed(2)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border rounded-xl overflow-hidden">
            <div className="px-3 py-2 font-semibold bg-gray-50 border-b">Minutes par collaborateur</div>
            <table className="min-w-full text-sm">
              <thead><tr><th className="px-3 py-2 text-left">Utilisateur</th><th className="px-3 py-2 text-right">Minutes</th><th className="px-3 py-2 text-right">Heures</th></tr></thead>
              <tbody>
                {(prod.data?.per_user||[]).map((r,i)=> (
                  <tr key={i} className="odd:bg-gray-50"><td className="px-3 py-2">{r.user_id}</td><td className="px-3 py-2 text-right">{r.minutes}</td><td className="px-3 py-2 text-right">{(r.minutes/60).toFixed(2)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab==='timesheet' && (
        <div className="space-y-3">
          <div className="flex gap-2 items-end">
            <div className="flex flex-col">
              <label className="text-xs text-gray-600">Utilisateur (ID)</label>
              <input type="number" value={userId} onChange={e=>setUserId(e.target.value)} placeholder="Facultatif" className="border rounded px-2 py-1 w-40" />
            </div>
          </div>
          <div className="border rounded-xl overflow-hidden">
            <table className="min-w-full text-sm">
              <thead><tr><th className="px-3 py-2 text-left">Début</th><th className="px-3 py-2 text-left">Fin</th><th className="px-3 py-2 text-right">Min</th><th className="px-3 py-2">Task</th><th className="px-3 py-2">Client</th><th className="px-3 py-2">User</th><th className="px-3 py-2">Commentaire</th></tr></thead>
              <tbody>
                {(sheet.data?.entries||[]).map((e,i)=> (
                  <tr key={i} className="odd:bg-gray-50">
                    <td className="px-3 py-2">{e.start_at}</td>
                    <td className="px-3 py-2">{e.end_at}</td>
                    <td className="px-3 py-2 text-right">{e.minutes}</td>
                    <td className="px-3 py-2">{e.task_id}</td>
                    <td className="px-3 py-2">{e.client_id}</td>
                    <td className="px-3 py-2">{e.user?.name || e.user?.email}</td>
                    <td className="px-3 py-2">{e.comment}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab==='costs' && (
        <RequirePermission perm="users.rate.set" fallback={<div className="text-red-600">Accès restreint</div>}>
          <div className="border rounded-xl overflow-hidden">
            <table className="min-w-full text-sm">
              <thead><tr><th className="px-3 py-2 text-left">Client</th><th className="px-3 py-2 text-right">Minutes</th><th className="px-3 py-2 text-right">Heures</th><th className="px-3 py-2 text-right">Coût (MAD)</th></tr></thead>
              <tbody>
                {(costs.data?.per_client||[]).map((r,i)=> (
                  <tr key={i} className="odd:bg-gray-50"><td className="px-3 py-2">{r.client_id}</td><td className="px-3 py-2 text-right">{r.minutes}</td><td className="px-3 py-2 text-right">{r.hours.toFixed(2)}</td><td className="px-3 py-2 text-right">{r.cost_mad.toFixed(2)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </RequirePermission>
      )}
    </div>
  )
}
