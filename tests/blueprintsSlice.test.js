import { configureStore } from '@reduxjs/toolkit'

const { getMock, postMock } = vi.hoisted(() => ({
  getMock:  vi.fn(),
  postMock: vi.fn(),
}))

vi.mock('axios', () => ({
  default: {
    create: () => ({
      get: getMock,
      post: postMock,
      interceptors: {
        request:  { use: vi.fn() },
        response: { use: vi.fn() },
      },
    }),
  },
}))

import blueprintsReducer, {
  fetchAuthors,
  fetchByAuthor,
  fetchBlueprint,
  createBlueprint,
} from '../src/features/blueprints/blueprintsSlice'

const makeStore = () =>
  configureStore({ reducer: { blueprints: blueprintsReducer } })

// ── Estado inicial ────────────────────────────────────────────────
describe('blueprintsSlice — estado inicial', () => {
  it('tiene el estado inicial correcto', () => {
    const store = makeStore()
    const state = store.getState().blueprints
    expect(state.authors).toEqual([])
    expect(state.byAuthor).toEqual({})
    expect(state.current).toBeNull()
    expect(state.status).toBe('idle')
    expect(state.error).toBeNull()
  })
})

// ── fetchAuthors (el thunk que SÍ maneja status) ──────────────────
describe('fetchAuthors thunk', () => {
  beforeEach(() => { getMock.mockReset(); postMock.mockReset() })

  it('pending: cambia status a "loading"', () => {
    // fetchAuthors llama a GET /blueprints — nunca resuelve → queda en pending
    getMock.mockReturnValueOnce(new Promise(() => {}))
    const store = makeStore()
    store.dispatch(fetchAuthors())
    expect(store.getState().blueprints.status).toBe('loading')
  })

  it('fulfilled: extrae autores únicos y status "succeeded"', async () => {
    const mockData = [
      { author: 'johnoe', name: 'bp1', points: [] },
      { author: 'johnoe', name: 'bp2', points: [] },
      { author: 'janedoe', name: 'bp3', points: [] },
    ]
    getMock.mockResolvedValueOnce({ data: mockData })
    const store = makeStore()
    await store.dispatch(fetchAuthors())
    const state = store.getState().blueprints
    expect(state.status).toBe('succeeded')
    expect(state.authors).toContain('johnoe')
    expect(state.authors).toContain('janedoe')
    expect(state.authors).toHaveLength(2) // únicos
  })

  it('rejected: guarda el error y status "failed"', async () => {
    getMock.mockRejectedValueOnce(new Error('Network error'))
    const store = makeStore()
    await store.dispatch(fetchAuthors())
    const state = store.getState().blueprints
    expect(state.status).toBe('failed')
    expect(state.error).toBeTruthy()
  })
})

// ── fetchByAuthor ─────────────────────────────────────────────────
describe('fetchByAuthor thunk', () => {
  beforeEach(() => { getMock.mockReset(); postMock.mockReset() })

  it('fulfilled: almacena blueprints en byAuthor[author]', async () => {
    const mockData = [
      { author: 'johnoe', name: 'bp1', points: [{ x: 0, y: 0 }] },
      { author: 'johnoe', name: 'bp2', points: [{ x: 1, y: 1 }] },
    ]
    getMock.mockResolvedValueOnce({ data: mockData })
    const store = makeStore()
    await store.dispatch(fetchByAuthor('johnoe'))
    const state = store.getState().blueprints
    expect(state.byAuthor['johnoe']).toHaveLength(2)
    expect(state.byAuthor['johnoe'][0].name).toBe('bp1')
  })

  it('fulfilled: no sobreescribe blueprints de otros autores', async () => {
    getMock
      .mockResolvedValueOnce({ data: [{ author: 'johnoe', name: 'bp1', points: [] }] })
      .mockResolvedValueOnce({ data: [{ author: 'janedoe', name: 'bp3', points: [] }] })
    const store = makeStore()
    await store.dispatch(fetchByAuthor('johnoe'))
    await store.dispatch(fetchByAuthor('janedoe'))
    expect(store.getState().blueprints.byAuthor['johnoe']).toHaveLength(1)
    expect(store.getState().blueprints.byAuthor['janedoe']).toHaveLength(1)
  })
})

// ── fetchBlueprint ────────────────────────────────────────────────
describe('fetchBlueprint thunk', () => {
  beforeEach(() => getMock.mockReset())

  it('fulfilled: almacena el blueprint en state.current', async () => {
    const mockBp = { author: 'janedoe', name: 'bp3', points: [{ x: 5, y: 5 }] }
    getMock.mockResolvedValueOnce({ data: mockBp })
    const store = makeStore()
    await store.dispatch(fetchBlueprint({ author: 'janedoe', name: 'bp3' }))
    expect(store.getState().blueprints.current).toEqual(mockBp)
  })
})

// ── createBlueprint ───────────────────────────────────────────────
describe('createBlueprint thunk', () => {
  beforeEach(() => { getMock.mockReset(); postMock.mockReset() })

  it('fulfilled: agrega el blueprint a byAuthor si el autor ya existe', async () => {
    getMock.mockResolvedValueOnce({ data: [{ author: 'johnoe', name: 'bp1', points: [] }] })
    const newBp = { author: 'johnoe', name: 'bp-nuevo', points: [{ x: 10, y: 10 }] }
    postMock.mockResolvedValueOnce({ data: newBp })

    const store = makeStore()
    await store.dispatch(fetchByAuthor('johnoe'))
    await store.dispatch(createBlueprint(newBp))

    const blueprints = store.getState().blueprints.byAuthor['johnoe']
    expect(blueprints.some((b) => b.name === 'bp-nuevo')).toBe(true)
  })
})