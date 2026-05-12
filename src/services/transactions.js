import api from '@/services/api'

/**
 * @param {object} params
 * @param {string} params.startDate - YYYY-MM-DD
 * @param {string} params.endDate - YYYY-MM-DD
 * @param {('income'|'expense')} [params.type]
 * @param {string} [params.walletId]
 * @param {string} [params.categoryId]
 */
export function listTransactions(params) {
  return api.get('/api/transactions', { params })
}

export function createTransaction(body) {
  return api.post('/api/transactions', body)
}

export function updateTransaction(id, body) {
  return api.put(`/api/transactions/${id}`, body)
}

export function deleteTransaction(id) {
  return api.delete(`/api/transactions/${id}`)
}

/**
 * @param {object} body
 * @param {string} body.fromWalletId
 * @param {string} body.toWalletId
 * @param {string} body.amount - decimal string max 2 desimal
 * @param {string} body.transactionDate - YYYY-MM-DD
 * @param {string} [body.description] - max 500 karakter
 */
export function walletTransfer(body) {
  return api.post('/api/transactions/wallet-transfer', body)
}
