import request from '@/utils/request'

export function getProcessRecords(toothId) {
  return request.get('/process-records', { params: { toothId } })
}

export function createProcessRecord(data) {
  return request.post('/process-records', data)
}
