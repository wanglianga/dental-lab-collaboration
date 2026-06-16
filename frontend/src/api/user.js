import request from '@/utils/request'

export function getUsers() {
  return request.get('/users')
}

export function createUser(data) {
  return request.post('/users', data)
}
