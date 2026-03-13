import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'
import blueprintsReducer from '../src/features/blueprints/blueprintsSlice'
import BlueprintsPage from '../src/pages/BlueprintsPage'

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

const renderPage = (preloadedState = {}) => {
  const store = configureStore({
    reducer: { blueprints: blueprintsReducer },
    preloadedState: {
      blueprints: {
        authors: [], byAuthor: {}, current: null, status: 'idle', error: null,
        ...preloadedState,
      },
    },
  })
  render(
    <Provider store={store}>
      <MemoryRouter>
        <BlueprintsPage />
      </MemoryRouter>
    </Provider>,
  )
  return { store }
}

describe('BlueprintsPage', () => {
  beforeEach(() => {
    getMock.mockReset()
    postMock.mockReset()
    // fetchAuthors siempre resuelve vacío por defecto
    getMock.mockResolvedValue({ data: [] })
  })

  it('renderiza el campo de texto para buscar por autor', async () => {
    await act(async () => { renderPage() })
    expect(screen.getByPlaceholderText(/author/i)).toBeInTheDocument()
  })

  it('renderiza el botón "Get blueprints"', async () => {
    await act(async () => { renderPage() })
    expect(screen.getByRole('button', { name: /get blueprints/i })).toBeInTheDocument()
  })

  it('muestra "Sin resultados." en estado inicial', async () => {
    await act(async () => { renderPage() })
    expect(screen.getByText(/sin resultados/i)).toBeInTheDocument()
  })

  // "Cargando..." solo aparece cuando status=loading Y el componente ya tiene selectedAuthor
  // Para lograrlo, iniciamos la búsqueda y dejamos la promesa sin resolver
  it('muestra "Cargando..." mientras fetchAuthors está en curso', async () => {
    // fetchAuthors nunca resuelve → status queda en 'loading'
    getMock.mockReturnValueOnce(new Promise(() => {}))
    await act(async () => { renderPage() })
    expect(screen.getByText(/cargando/i)).toBeInTheDocument()
  })

  it('despacha fetchByAuthor al hacer clic con un autor escrito', async () => {
    getMock
      .mockResolvedValueOnce({ data: [] })  // fetchAuthors
      .mockResolvedValueOnce({ data: [{ author: 'johnoe', name: 'bp1', points: [] }] })

    await act(async () => { renderPage() })

    await userEvent.type(screen.getByPlaceholderText(/author/i), 'johnoe')
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /get blueprints/i }))
    })

    await waitFor(() => expect(getMock).toHaveBeenCalledTimes(2))
  })

  it('muestra la tabla con blueprints tras buscar', async () => {
    const mockData = [
      { author: 'johnoe', name: 'bp1', points: [{ x: 0, y: 0 }] },
      { author: 'johnoe', name: 'bp2', points: [{ x: 1, y: 1 }] },
    ]
    getMock
      .mockResolvedValueOnce({ data: [] })       // fetchAuthors
      .mockResolvedValueOnce({ data: mockData }) // fetchByAuthor

    await act(async () => { renderPage() })

    await userEvent.type(screen.getByPlaceholderText(/author/i), 'johnoe')
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /get blueprints/i }))
    })

    await waitFor(() => {
      expect(screen.getByText('bp1')).toBeInTheDocument()
      expect(screen.getByText('bp2')).toBeInTheDocument()
    })
  })
})
