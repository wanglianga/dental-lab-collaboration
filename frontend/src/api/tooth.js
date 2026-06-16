import request from '@/utils/request'

export function getTeeth(status, orderId) {
  return request.get('/teeth', { params: { status, orderId } })
}

export function getTooth(id) {
  return request.get(`/teeth/${id}`)
}

export function createTooth(data) {
  return request.post('/teeth', data)
}

export function updateTooth(id, data) {
  return request.put(`/teeth/${id}`, data)
}

export function updateToothStatus(id, data) {
  return request.put(`/teeth/${id}/status`, data)
}

export function submitToothTryFeedback(id, feedback) {
  return request.post(`/teeth/${id}/try-feedback`, { feedback })
}
