import request from '@/utils/request'

export function getModelExceptions(status, orderId, toothId) {
  return request.get('/model-exceptions', { params: { status, orderId, toothId } })
}

export function getModelException(id) {
  return request.get(`/model-exceptions/${id}`)
}

export function createModelException(data) {
  return request.post('/model-exceptions', data)
}

export function updateModelException(id, data) {
  return request.put(`/model-exceptions/${id}`, data)
}

export function notifyPatientForException(id, data) {
  return request.put(`/model-exceptions/${id}/notify-patient`, data)
}

export function doctorConfirmException(id, data) {
  return request.put(`/model-exceptions/${id}/doctor-confirm`, data)
}

export function recordExceptionLoss(id, data) {
  return request.put(`/model-exceptions/${id}/record-loss`, data)
}

export function rescheduleException(id, data) {
  return request.put(`/model-exceptions/${id}/reschedule`, data)
}
