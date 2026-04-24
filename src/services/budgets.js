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
 * @param {{ year: number, month: number, totalBudget?: string | null, items: { categoryId: string, allocatedAmount: string }[] }} body
 */
export function putBudget(body) {
  return api.put('/api/budgets', body)
}

export function deleteBudget(budgetId) {
  return api.delete(`/api/budgets/${budgetId}`)
}
