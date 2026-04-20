import api from '@/services/api'

export function listWallets(params = {}) {
  const { type } = params
  const query = {}
  if (type) {
    query.type = type
  }
  return api.get('/api/wallets', { params: query })
}

export function createWallet(requestBody) {
  return api.post('/api/wallets', requestBody)
}

export function updateWallet(walletId, requestBody) {
  return api.put(`/api/wallets/${walletId}`, requestBody)
}

export function deleteWallet(walletId) {
  return api.delete(`/api/wallets/${walletId}`)
}
