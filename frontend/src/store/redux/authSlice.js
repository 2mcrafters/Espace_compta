import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import api from '../../lib/api'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
const FORCE_DIRECT = (import.meta.env.VITE_FORCE_DIRECT || 'false').toLowerCase() === 'true'

export const fetchCsrf = createAsyncThunk('auth/csrf', async () => {
  // Always prefer the proxy (same-origin) to ensure XSRF cookie is set on the frontend host.
  // Only use a direct call when explicitly enabled via VITE_FORCE_DIRECT=true.
  const url = FORCE_DIRECT
    ? `${BACKEND_URL}/sanctum/csrf-cookie`
    : "/sanctum/csrf-cookie";

  await axios.get(url, {
    withCredentials: true,
    headers: { "X-Requested-With": "XMLHttpRequest" },
  });

  // Sanity check: make sure the browser actually received the XSRF cookie
  if (
    typeof document !== "undefined" &&
    !document.cookie.includes("XSRF-TOKEN=")
  ) {
    throw new Error(
      "CSRF cookie not set. Ensure you are using the same hostname (localhost vs 127.0.0.1) and that the request goes through the Vite proxy."
    );
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
