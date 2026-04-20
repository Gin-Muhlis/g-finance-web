import api from '@/services/api'

export function listCategories(params = {}) {
  const { page = 1, limit = 10, type } = params
  const query = {
    page: String(page),
    limit: String(limit),
  }
  if (type) {
    query.type = type
  }
  return api.get('/api/categories', { params: query })
}

export function createCategory(body) {
  return api.post('/api/categories', body)
}

export function updateCategory(id, body) {
  return api.put(`/api/categories/${id}`, body)
}

export function deleteCategory(id) {
  return api.delete(`/api/categories/${id}`)
}
