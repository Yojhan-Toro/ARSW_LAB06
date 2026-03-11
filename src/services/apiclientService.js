import api from './apiClient.js'

/** GET /api/blueprints — todos los blueprints */
export const getAll = async () => {
  const { data } = await api.get('/blueprints')
  return data
}

/** GET /api/blueprints/:author */
export const getByAuthor = async (author) => {
  const { data } = await api.get(`/blueprints/${encodeURIComponent(author)}`)
  return data
}

/** GET /api/blueprints/:author/:name */
export const getByAuthorAndName = async (author, name) => {
  const { data } = await api.get(
    `/blueprints/${encodeURIComponent(author)}/${encodeURIComponent(name)}`,
  )
  return data
}

/** POST /api/blueprints — payload: { author, name, points } */
export const create = async (payload) => {
  const { data } = await api.post('/blueprints', payload)
  return data
}
