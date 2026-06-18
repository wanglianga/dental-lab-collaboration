import request from '@/utils/request'

export function getRepairs(status, toothId, repairType) {
  return request.get('/repairs', { params: { status, toothId, repairType } })
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

export function technicianHandleRepair(id, data) {
  return request.put(`/repairs/${id}/technician`, data)
}

export function inspectorReviewRepair(id, data) {
  return request.put(`/repairs/${id}/inspector`, data)
}
