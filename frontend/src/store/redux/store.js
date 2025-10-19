import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
})

export const selectUser = (state) => state.auth.user
export const selectLoading = (state) => state.auth.loading
export const selectError = (state) => state.auth.error
