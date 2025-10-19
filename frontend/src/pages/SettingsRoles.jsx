import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import RequirePermission from '../components/RequirePermission'
import Button from '../components/ui/Button'

export default function SettingsRoles(){
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['roles-permissions'],
    queryFn: async () => (await api.get('/roles-permissions')).data
  })

  const mutate = useMutation({
    mutationFn: async ({ roleId, permissions }) => (await api.put(`/roles/${roleId}/permissions`, { permissions })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['roles-permissions'] })
  })

  if (isLoading) return <div>Chargement…</div>
  const roles = data?.roles ?? []
  const permissions = data?.permissions ?? []
  const matrix = data?.matrix ?? {}

  function toggle(role, perm){
    const current = new Set(matrix[role.name] || [])
    if (current.has(perm.name)) current.delete(perm.name)
    else current.add(perm.name)
    mutate.mutate({ roleId: role.id, permissions: Array.from(current) })
  }

  return (
    <RequirePermission perm="users.edit" fallback={<div className="text-red-600">Accès refusé</div>}>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Rôles & permissions</h1>
        <div className="overflow-auto border rounded-xl">
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="px-3 py-2 text-left">Permission</th>
                {roles.map(r => (
                  <th key={r.id} className="px-3 py-2 text-left">{r.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {permissions.map(p => (
                <tr key={p.id} className="odd:bg-gray-50">
                  <td className="px-3 py-2 font-medium">{p.name}</td>
                  {roles.map(r => {
                    const checked = (matrix[r.name] || []).includes(p.name)
                    return (
                      <td key={r.id} className="px-3 py-2">
                        <label className="inline-flex items-center gap-2">
                          <input type="checkbox" checked={checked} onChange={()=>toggle(r,p)} />
                          <span className="text-xs text-gray-500">{checked ? 'On' : 'Off'}</span>
                        </label>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <Button onClick={()=>qc.invalidateQueries({ queryKey: ['roles-permissions'] })}>Rafraîchir</Button>
        </div>
      </div>
    </RequirePermission>
  )
}
