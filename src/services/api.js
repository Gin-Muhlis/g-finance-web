import axios from 'axios'

const baseURL =
  typeof import.meta.env.VITE_BASE_API_URL === 'string'
    ? import.meta.env.VITE_BASE_API_URL
    : 'http://localhost:5000'

export const api = axios.create({
  baseURL,
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(async (config) => {
  const url = String(config.url || '')
  const isPublic =
    url.includes('/api/auth/login') ||
    url.includes('/api/auth/register') ||
    url.includes('/api/auth/refresh') ||
    url.includes('/api/auth/logout')

  if (isPublic) {
    return config
  }

  const { useAuthStore } = await import('@/stores/auth')
  const auth = useAuthStore()
  if (auth.accessToken) {
    config.headers.Authorization = `Bearer ${auth.accessToken}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const status = error.response?.status

    if (status !== 401 || !originalRequest) {
      return Promise.reject(error)
    }

    if (originalRequest._authRetry || originalRequest._skipAuthRetry) {
      return Promise.reject(error)
    }

    const url = String(originalRequest.url || '')
    if (
      url.includes('/api/auth/login') ||
      url.includes('/api/auth/register') ||
      url.includes('/api/auth/refresh') ||
      url.includes('/api/auth/logout')
    ) {
      return Promise.reject(error)
    }

    originalRequest._authRetry = true

    const { useAuthStore } = await import('@/stores/auth')
    const auth = useAuthStore()
    const ok = await auth.tryRefreshAccessToken()

    if (!ok) {
      return Promise.reject(error)
    }

    originalRequest.headers.Authorization = `Bearer ${auth.accessToken}`
    return api(originalRequest)
  }
)

export default api
