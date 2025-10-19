import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import api from '../../lib/api'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
const FORCE_DIRECT = (import.meta.env.VITE_FORCE_DIRECT || 'false').toLowerCase() === 'true'

export const fetchCsrf = createAsyncThunk('auth/csrf', async () => {
  const doRequest = async (url) => axios.get(url, {
    withCredentials: true,
    headers: { 'X-Requested-With': 'XMLHttpRequest' },
  })
  try {
    // Prefer direct when asked
    if (FORCE_DIRECT) {
      await doRequest(`${BACKEND_URL}/sanctum/csrf-cookie`)
      return
    }
    // Default to proxy first
    await doRequest('/sanctum/csrf-cookie')
  } catch {
    // Fallback to the other path
    try {
      await doRequest(`${BACKEND_URL}/sanctum/csrf-cookie`)
    } catch (e) {
      throw e
    }
  }
})

export const login = createAsyncThunk('auth/login', async ({ email, password }, { dispatch }) => {
  await dispatch(fetchCsrf())
  await api.post('/login', { email, password })
  const { data } = await api.get('/user')
  return data
})

export const fetchUser = createAsyncThunk('auth/fetchUser', async () => {
  const { data } = await api.get('/user')
  return data
})

export const logout = createAsyncThunk('auth/logout', async () => {
  await api.post('/logout')
})

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => { state.loading = true; state.error = null })
      .addCase(login.fulfilled, (state, action) => { state.loading = false; state.user = action.payload })
      .addCase(login.rejected, (state, action) => { 
        state.loading = false; 
        // Normalize error to a readable string
        const err = action.error
        state.error = err?.message || err?.name || 'Une erreur est survenue'
      })
      .addCase(fetchUser.pending, (state) => { state.loading = true })
      .addCase(fetchUser.fulfilled, (state, action) => { state.loading = false; state.user = action.payload })
      .addCase(fetchUser.rejected, (state, action) => { 
        state.loading = false; 
        state.user = null; 
        const err = action.error
        state.error = err?.message || err?.name || 'Impossible de récupérer l’utilisateur'
      })
      .addCase(logout.fulfilled, (state) => { state.user = null })
  }
})

export default authSlice.reducer
