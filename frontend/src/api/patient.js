import request from '@/utils/request'

export function getPatients(keyword) {
  return request.get('/patients', { params: { keyword } })
}

export function getPatient(id) {
  return request.get(`/patients/${id}`)
}

export function createPatient(data) {
  return request.post('/patients', data)
}

export function updatePatient(id, data) {
  return request.put(`/patients/${id}`, data)
}

export function deletePatient(id) {
  return request.delete(`/patients/${id}`)
}
