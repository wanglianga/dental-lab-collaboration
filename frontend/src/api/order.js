import request from '@/utils/request'

export function getOrders(status, doctorId) {
  return request.get('/orders', { params: { status, doctorId } })
}

export function getOrder(id) {
  return request.get(`/orders/${id}`)
}

export function createOrder(data) {
  return request.post('/orders', data)
}

export function updateOrder(id, data) {
  return request.put(`/orders/${id}`, data)
}

export function updateOrderStatus(id, status) {
  return request.put(`/orders/${id}/status`, { status })
}

export function submitTryFeedback(id, feedback) {
  return request.post(`/orders/${id}/try-feedback`, { feedback })
}
