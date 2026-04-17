import axios from 'axios'

const baseURL =
  typeof import.meta.env.BASE_API_URL === 'string'
    ? import.meta.env.BASE_API_URL
    : ''

export const api = axios.create({
  baseURL: baseURL || undefined,
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
  },
})

export default api
