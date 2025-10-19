import axios from 'axios'

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
const API_BASE = import.meta.env.VITE_API_BASE || '/api'
const FORCE_DIRECT = (import.meta.env.VITE_FORCE_DIRECT || 'false').toLowerCase() === 'true'

const api = axios.create({
  baseURL: FORCE_DIRECT ? `${BACKEND}${API_BASE}` : API_BASE,
  withCredentials: true,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
})

// Recommended for Laravel Sanctum/AJAX requests
api.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'

// Helper to read a cookie value by name
function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^|; )' + name.replace(/([.$?*|{}()\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'))
  return match ? decodeURIComponent(match[2]) : null
}

// Attach X-XSRF-TOKEN on cross-origin requests as axios only auto-adds it on same-origin
api.interceptors.request.use((config) => {
  if (!config.headers) config.headers = {}
  if (!config.headers['X-XSRF-TOKEN']) {
    const token = getCookie('XSRF-TOKEN')
    if (token) {
      config.headers['X-XSRF-TOKEN'] = token
    }
  }
  return config
})

export default api
