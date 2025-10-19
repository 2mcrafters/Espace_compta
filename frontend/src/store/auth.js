import React from 'react'
import { create } from 'zustand'
import api from '../lib/api'
import axios from 'axios'

export const useAuth = create((set, get) => ({
  user: null,
  loading: false,
  error: null,
  async fetchUser() {
    try {
      set({ loading: true, error: null })
      const { data } = await api.get('/user')
      set({ user: data || null, loading: false })
    } catch (e) {
      set({ user: null, loading: false, error: e })
    }
  },
  async login(email, password) {
    try {
      set({ loading: true, error: null })
      // Get CSRF cookie from Sanctum (must call absolute /sanctum path, not /api)
      await axios.get('/sanctum/csrf-cookie', { withCredentials: true })
      await api.post('/login', { email, password })
      await get().fetchUser()
      return true
    } catch (e) {
      set({ error: e, loading: false })
      return false
    }
  },
  async logout() {
    try {
      await api.post('/logout')
    } finally {
      set({ user: null })
    }
  }
}))

export function ProtectedRoute({ children }) {
  const { user, loading, fetchUser } = useAuth()
  React.useEffect(() => {
    if (!user && !loading) fetchUser()
  }, [user, loading, fetchUser])
  if (loading) return null
  if (!user) {
    if (window.location.pathname !== '/login') {
      window.location.href = '/login'
    }
    return null
  }
  return children
}
