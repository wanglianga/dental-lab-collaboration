import request from '@/utils/request'

export function getInspections(toothId) {
  return request.get('/inspections', { params: { toothId } })
}

export function createInspection(data) {
  return request.post('/inspections', data)
}
