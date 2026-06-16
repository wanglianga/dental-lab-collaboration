import request from '@/utils/request'

export function getLogistics(toothId, type) {
  return request.get('/logistics', { params: { toothId, type } })
}

export function createLogistics(data) {
  return request.post('/logistics', data)
}
