import { render, screen, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'
import BlueprintsPage from '../src/pages/BlueprintsPage.jsx'
import blueprintsReducer from '../src/features/blueprints/blueprintsSlice.js'

// Mock del servicio para evitar llamadas reales
vi.mock('../src/services/blueprintsService.js', () => ({
  getAll: vi.fn(async () => []),
  getByAuthor: vi.fn(async (author) => {
    if (author === 'johnoe') {
      return [
        { author: 'johnoe', name: 'blueprint1', points: [{ x: 0, y: 0 }, { x: 10, y: 10 }, { x: 20, y: 5 }] },
        { author: 'johnoe', name: 'blueprint2', points: [{ x: 5, y: 5 }] },
      ]
    }
    throw new Error('Not found')
  }),
  getByAuthorAndName: vi.fn(async (author, name) => ({
    author,
    name,
    points: [{ x: 0, y: 0 }, { x: 100, y: 100 }],
  })),
  create: vi.fn(),
  default: {},
}))

function renderWithStore(preloadedState = {}) {
  const store = configureStore({
    reducer: { blueprints: blueprintsReducer },
    preloadedState,
  })
  return {
    store,
    ...render(
      <Provider store={store}>
        <MemoryRouter>
          <BlueprintsPage />
        </MemoryRouter>
      </Provider>,
    ),
  }
}

describe('BlueprintsPage', () => {
  it('renderiza el input de autor y el botón', () => {
    renderWithStore()
    expect(screen.getByTestId('author-input')).toBeInTheDocument()
    expect(screen.getByTestId('get-blueprints-btn')).toBeInTheDocument()
  })

  it('muestra el canvas con el identificador correcto', () => {
    renderWithStore()
    expect(screen.getByTestId('blueprint-canvas')).toBeInTheDocument()
  })

  it('muestra vacío cuando no hay plano seleccionado', () => {
    renderWithStore()
    expect(screen.getByTestId('current-blueprint-name')).toHaveValue('')
  })

  it('despacha fetchByAuthor al hacer clic en "Get blueprints"', async () => {
    const { store } = renderWithStore()
    fireEvent.change(screen.getByTestId('author-input'), { target: { value: 'johnoe' } })
    fireEvent.click(screen.getByTestId('get-blueprints-btn'))

    // Espera a que el thunk resuelva
    await screen.findByTestId('blueprint-table')

    const state = store.getState().blueprints
    expect(state.byAuthor['johnoe']).toHaveLength(2)
  })

  it('muestra la tabla con columnas correctas', async () => {
    renderWithStore({
      blueprints: {
        authors: [],
        byAuthor: {
          johnoe: [
            { author: 'johnoe', name: 'blueprint1', points: [{ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 2 }] },
          ],
        },
        current: null,
        status: 'idle',
        authorStatus: 'succeeded',
        error: null,
      },
    })

    // Forzar que selectedAuthor sea 'johnoe'
    fireEvent.change(screen.getByTestId('author-input'), { target: { value: 'johnoe' } })
    fireEvent.click(screen.getByTestId('get-blueprints-btn'))

    await screen.findByText('blueprint1')
    expect(screen.getByText('Blueprint name')).toBeInTheDocument()
    expect(screen.getByText('Number of points')).toBeInTheDocument()
    expect(screen.getAllByText('Open').length).toBeGreaterThan(0)
  })

  it('actualiza el nombre del plano en el DOM vía Redux al hacer Open', async () => {
    renderWithStore()
    fireEvent.change(screen.getByTestId('author-input'), { target: { value: 'johnoe' } })
    fireEvent.click(screen.getByTestId('get-blueprints-btn'))

    const openBtn = await screen.findAllByText('Open')
    fireEvent.click(openBtn[0])

    // El nombre viene de Redux → sin manipulación directa del DOM
    expect(await screen.findByTestId('current-blueprint-name')).not.toHaveTextContent('—')
  })
})
