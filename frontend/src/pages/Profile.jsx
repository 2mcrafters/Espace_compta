import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectUser } from '../store/redux/store'
import api from '../lib/api'
import Button from '../components/ui/Button'

export default function Profile(){
  const user = useSelector(selectUser)
  const [name, setName] = React.useState(user?.name || '')
  const [email, setEmail] = React.useState(user?.email || '')
  const [saving, setSaving] = React.useState(false)
  const [msg, setMsg] = React.useState('')

  React.useEffect(()=>{
    setName(user?.name || '')
    setEmail(user?.email || '')
  }, [user])

  async function saveProfile(e){
    e.preventDefault()
    setSaving(true)
    setMsg('')
    try{
      await api.put('/profile', { name, email })
      setMsg('Profil mis à jour')
    }catch(err){
      setMsg(err?.response?.data?.message || err.message)
    }finally{ setSaving(false) }
  }

  async function changePassword(e){
    e.preventDefault()
    setMsg('')
    const form = e.currentTarget
    const body = {
      current_password: form.current_password.value,
      password: form.password.value,
      password_confirmation: form.password_confirmation.value,
    }
    try{
      await api.post('/profile/password', body)
      setMsg('Mot de passe changé')
      form.reset()
    }catch(err){
      setMsg(err?.response?.data?.message || err.message)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
        <h2 className="text-lg font-semibold mb-4">Profil</h2>
        <form onSubmit={saveProfile} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Nom</label>
            <input className="w-full border rounded-lg px-3 py-2" value={name} onChange={e=>setName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Email</label>
            <input className="w-full border rounded-lg px-3 py-2" value={email} onChange={e=>setEmail(e.target.value)} />
          </div>
          <Button type="submit" disabled={saving} className="!from-primary-600 !to-primary-700">
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
          {msg && <div className="text-sm text-gray-600">{msg}</div>}
        </form>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
        <h2 className="text-lg font-semibold mb-4">Mot de passe</h2>
        <form onSubmit={changePassword} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Mot de passe actuel</label>
            <input name="current_password" type="password" className="w-full border rounded-lg px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Nouveau mot de passe</label>
            <input name="password" type="password" className="w-full border rounded-lg px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Confirmer</label>
            <input name="password_confirmation" type="password" className="w-full border rounded-lg px-3 py-2" required />
          </div>
          <Button type="submit" className="!from-emerald-500 !to-green-600">Changer</Button>
        </form>
      </div>
    </div>
  )
}
