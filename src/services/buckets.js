import api from '@/services/api'

export function listBuckets() {
  return api.get('/api/buckets')
}

export function createBucket(body) {
  return api.post('/api/buckets', body)
}

export function updateBucket(id, body) {
  return api.put(`/api/buckets/${id}`, body)
}

export function deleteBucket(id) {
  return api.delete(`/api/buckets/${id}`)
}
