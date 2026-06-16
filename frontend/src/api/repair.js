import request from '@/utils/request'

export function getRepairs(status, toothId) {
  return request.get('/repairs', { params: { status, toothId } })
}

export function getRepair(id) {
  return request.get(`/repairs/${id}`)
}

export function createRepair(data) {
  return request.post('/repairs', data)
}

export function updateRepair(id, data) {
  return request.put(`/repairs/${id}`, data)
}
