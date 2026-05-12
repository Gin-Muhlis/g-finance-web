import api from '@/services/api'

/**
 * @param {number} year
 * @param {number} month 1–12
 */
export function getBudgetSummary(year, month) {
  return api.get('/api/budgets', {
    params: { year: String(year), month: String(month) },
  })
}

/**
 * Daftar budget per kategori (pagination).
 * @param {number} year
 * @param {number} month 1–12
 * @param {{ page?: number, limit?: number }} [opts] page & limit (max 100)
 */
export function getBudgetItems(year, month, opts = {}) {
  const page = opts.page ?? 1
  const limit = opts.limit ?? 10
  return api.get('/api/budgets/items', {
    params: {
      year: String(year),
      month: String(month),
      page: String(page),
      limit: String(limit),
    },
  })
}

/**
 * @param {{ year: number, month: number, totalBudget?: number | null, items: { categoryId: string, allocatedAmount: number }[] }} body
 */
export function putBudget(body) {
  return api.put('/api/budgets', body)
}

export function deleteBudget(budgetId) {
  return api.delete(`/api/budgets/${budgetId}`)
}
