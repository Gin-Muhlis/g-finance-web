import api from '@/services/api'

export function register(body) {
  return api.post('/api/auth/register', body)
}

export function login(body) {
  return api.post('/api/auth/login', body)
}

export function refreshTokens(body, config) {
  return api.post('/api/auth/refresh', body, config)
}

export function logout(body, config) {
  return api.post('/api/auth/logout', body, config)
}

export function getMe() {
  return api.get('/api/auth/me')
}
