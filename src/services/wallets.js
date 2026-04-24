import api from '@/services/api'

export function listWallets() {
  return api.get('/api/wallets')
}
