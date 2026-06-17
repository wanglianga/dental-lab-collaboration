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

export function uploadToothFile(toothId, file, category) {
  const formData = new FormData()
  formData.append('file', file)
  if (category) formData.append('category', category)
  return request.post(`/teeth/${toothId}/files`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export function getToothFiles(toothId) {
  return request.get(`/teeth/${toothId}/files`)
}

export function linkFileToTooth(toothId, fileRecordId) {
  return request.post(`/teeth/${toothId}/link-file`, { fileRecordId })
}
