import request from '@/utils/request'

export function uploadFile(file, category, toothId, orderId) {
  const formData = new FormData()
  formData.append('file', file)
  if (category) formData.append('category', category)
  if (toothId) formData.append('toothId', toothId)
  if (orderId) formData.append('orderId', orderId)
  return request.post('/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export function getFiles(toothId, orderId) {
  return request.get('/files', { params: { toothId, orderId } })
}

export function deleteFile(id) {
  return request.delete(`/files/${id}`)
}
