import api from '@/services/api'

export function getAllocationSummary() {
  return api.get('/api/allocations/summary')
}

/**
 * @param {{ bucketId?: string }} [params]
 */
export function listAllocations(params = {}) {
  return api.get('/api/allocations', { params })
}

export function createAllocation(body) {
  return api.post('/api/allocations', body)
}

export function withdrawFromAllocation(body) {
  return api.post('/api/allocations/withdraw', body)
}
