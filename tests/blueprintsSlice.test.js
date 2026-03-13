import { configureStore } from '@reduxjs/toolkit'

const { getAllMock, getByAuthorMock, getByAuthorAndNameMock, createMock } = vi.hoisted(() => ({
  getAllMock:              vi.fn(),
  getByAuthorMock:        vi.fn(),
  getByAuthorAndNameMock: vi.fn(),
  createMock:             vi.fn(),
}))

vi.mock('../src/services/blueprintsService.js', () => ({
  getAll:              getAllMock,
  getByAuthor:         getByAuthorMock,
  getByAuthorAndName:  getByAuthorAndNameMock,
  create:              createMock,
}))

import blueprintsReducer, {
  fetchAuthors,
  fetchByAuthor,
  fetchBlueprint,
  createBlueprint,
} from '../src/features/blueprints/blueprintsSlice'

const makeStore = () =>
  configureStore({ reducer: { blueprints: blueprintsReducer } })

describe('blueprintsSlice — estado inicial', () => {
  it('tiene el estado inicial correcto', () => {
    const store = makeStore()
    const state = store.getState().blueprints
    expect(state.authors).toEqual([])
    expect(state.byAuthor).toEqual({})
    expect(state.current).toBeNull()
    expect(state.status).toBe('idle')
    expect(state.authorStatus).toBe('idle')
    expect(state.error).toBeNull()
  })
})

describe('fetchAuthors thunk', () => {
  beforeEach(() => getAllMock.mockReset())

  it('pending: cambia status a "loading"', () => {
    getAllMock.mockReturnValueOnce(new Promise(() => {}))
    const store = makeStore()
    store.dispatch(fetchAuthors())
    expect(store.getState().blueprints.status).toBe('loading')
  })

  it('fulfilled: extrae autores únicos y status "succeeded"', async () => {
    getAllMock.mockResolvedValueOnce([
      { author: 'johnoe',  name: 'bp1', points: [] },
      { author: 'johnoe',  name: 'bp2', points: [] },
      { author: 'janedoe', name: 'bp3', points: [] },
    ])
    const store = makeStore()
    await store.dispatch(fetchAuthors())
    const state = store.getState().blueprints
    expect(state.status).toBe('succeeded')
    expect(state.authors).toHaveLength(2)
    expect(state.authors).toContain('johnoe')
    expect(state.authors).toContain('janedoe')
  })

  it('rejected: status "failed" y error guardado', async () => {
    getAllMock.mockRejectedValueOnce(new Error('Network error'))
    const store = makeStore()
    await store.dispatch(fetchAuthors())
    const state = store.getState().blueprints
    expect(state.status).toBe('failed')
    expect(state.error).toBeTruthy()
  })
})

describe('fetchByAuthor thunk', () => {
  beforeEach(() => getByAuthorMock.mockReset())

  it('pending: cambia authorStatus a "loading"', () => {
    getByAuthorMock.mockReturnValueOnce(new Promise(() => {}))
    const store = makeStore()
    store.dispatch(fetchByAuthor('johnoe'))
    expect(store.getState().blueprints.authorStatus).toBe('loading')
  })

  it('fulfilled: almacena blueprints en byAuthor[author]', async () => {
    const mockData = [
      { author: 'johnoe', name: 'bp1', points: [{ x: 0, y: 0 }] },
      { author: 'johnoe', name: 'bp2', points: [{ x: 1, y: 1 }] },
    ]
    getByAuthorMock.mockResolvedValueOnce(mockData)
    const store = makeStore()
    await store.dispatch(fetchByAuthor('johnoe'))
    const state = store.getState().blueprints
    expect(state.authorStatus).toBe('succeeded')
    expect(state.byAuthor['johnoe']).toHaveLength(2)
    expect(state.byAuthor['johnoe'][0].name).toBe('bp1')
  })

  it('rejected: authorStatus "failed" y error guardado', async () => {
    getByAuthorMock.mockRejectedValueOnce(new Error('Not found'))
    const store = makeStore()
    await store.dispatch(fetchByAuthor('autor-invalido'))
    const state = store.getState().blueprints
    expect(state.authorStatus).toBe('failed')
    expect(state.error).toBeTruthy()
  })
})

describe('fetchBlueprint thunk', () => {
  beforeEach(() => getByAuthorAndNameMock.mockReset())

  it('fulfilled: almacena el blueprint en state.current', async () => {
    const mockBp = { author: 'janedoe', name: 'bp3', points: [{ x: 5, y: 5 }] }
    getByAuthorAndNameMock.mockResolvedValueOnce(mockBp)
    const store = makeStore()
    await store.dispatch(fetchBlueprint({ author: 'janedoe', name: 'bp3' }))
    expect(store.getState().blueprints.current).toEqual(mockBp)
  })
})

describe('createBlueprint thunk', () => {
  beforeEach(() => { getByAuthorMock.mockReset(); createMock.mockReset() })

  it('fulfilled: agrega el blueprint a byAuthor si el autor ya existe', async () => {
    getByAuthorMock.mockResolvedValueOnce([{ author: 'johnoe', name: 'bp1', points: [] }])
    const newBp = { author: 'johnoe', name: 'bp-nuevo', points: [{ x: 10, y: 10 }] }
    createMock.mockResolvedValueOnce(newBp)

    const store = makeStore()
    await store.dispatch(fetchByAuthor('johnoe'))
    await store.dispatch(createBlueprint(newBp))

    const blueprints = store.getState().blueprints.byAuthor['johnoe']
    expect(blueprints.some((b) => b.name === 'bp-nuevo')).toBe(true)
  })
})