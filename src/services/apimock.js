let mockBlueprints = [
  {
    author: 'johnoe',
    name: 'blueprint1',
    points: [
      { x: 10, y: 20 },
      { x: 50, y: 80 },
      { x: 120, y: 40 },
    ],
  },
  {
    author: 'johnoe',
    name: 'blueprint2',
    points: [
      { x: 5, y: 15 },
      { x: 30, y: 60 },
    ],
  },
  {
    author: 'janedoe',
    name: 'blueprint3',
    points: [
      { x: 0, y: 0 },
      { x: 100, y: 100 },
      { x: 200, y: 50 },
      { x: 150, y: 200 },
    ],
  },
  {
    author: 'janedoe',
    name: 'blueprint4',
    points: [
      { x: 10, y: 10 },
      { x: 20, y: 30 },
      { x: 40, y: 20 },
    ],
  },
]

const delay = (ms = 80) => new Promise((res) => setTimeout(res, ms))

/** GET /api/blueprints — todos los blueprints */
export const getAll = async () => {
  await delay()
  return mockBlueprints.map((bp) => ({ ...bp, points: [...bp.points] }))
}

/** GET /api/blueprints/:author */
export const getByAuthor = async (author) => {
  await delay()
  const result = mockBlueprints.filter((bp) => bp.author === author)
  if (result.length === 0) throw new Error(`No blueprints found for author: ${author}`)
  return result.map((bp) => ({ ...bp, points: [...bp.points] }))
}

/** GET /api/blueprints/:author/:name */
export const getByAuthorAndName = async (author, name) => {
  await delay()
  const bp = mockBlueprints.find((b) => b.author === author && b.name === name)
  if (!bp) throw new Error(`Blueprint '${name}' by '${author}' not found`)
  return { ...bp, points: [...bp.points] }
}

/** POST /api/blueprints  — payload: { author, name, points } */
export const create = async (payload) => {
  await delay()
  const { author, name } = payload
  if (mockBlueprints.find((b) => b.author === author && b.name === name)) {
    throw new Error(`Blueprint '${name}' already exists for '${author}'`)
  }
  const newBp = { author, name, points: payload.points || [] }
  mockBlueprints.push(newBp)
  return { ...newBp }
}
