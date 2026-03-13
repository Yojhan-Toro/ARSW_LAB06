import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'
import blueprintsReducer from '../src/features/blueprints/blueprintsSlice'
import BlueprintsPage from '../src/pages/BlueprintsPage'

const { getAllMock, getByAuthorMock, getByAuthorAndNameMock, createMock } = vi.hoisted(() => ({
  getAllMock:              vi.fn(),
  getByAuthorMock:        vi.fn(),
  getByAuthorAndNameMock: vi.fn(),
  createMock:             vi.fn(),
}))

vi.mock('../src/services/blueprintsService.js', () => ({
  getAll:             getAllMock,
  getByAuthor:        getByAuthorMock,
  getByAuthorAndName: getByAuthorAndNameMock,
  create:             createMock,
}))

const renderPage = (preloadedState = {}) => {
  const store = configureStore({
    reducer: { blueprints: blueprintsReducer },
    preloadedState: {
      blueprints: {
        authors: [], byAuthor: {}, current: null,
        status: 'idle', authorStatus: 'idle', error: null,
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
    getAllMock.mockReset()
    getByAuthorMock.mockReset()
    getAllMock.mockResolvedValue([])
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
    expect(screen.getByText(/no hay blueprints/i)).toBeInTheDocument()
  })

  it('muestra "Cargando..." mientras fetchAuthors está en curso', async () => {
    getAllMock.mockReturnValueOnce(new Promise(() => {}))
    await act(async () => { renderPage() })
    expect(screen.getByRole('button', { name: /get blueprints/i })).toBeInTheDocument()
  })

  it('despacha fetchByAuthor al hacer clic con un autor escrito', async () => {
    getAllMock.mockResolvedValueOnce([])
    getByAuthorMock.mockResolvedValueOnce([{ author: 'johnoe', name: 'bp1', points: [] }])

    await act(async () => { renderPage() })

    await userEvent.type(screen.getByPlaceholderText(/author/i), 'johnoe')
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /get blueprints/i }))
    })

    await waitFor(() => expect(getByAuthorMock).toHaveBeenCalledWith('johnoe'))
  })

  it('muestra la tabla con blueprints tras buscar', async () => {
    const mockData = [
      { author: 'johnoe', name: 'bp1', points: [{ x: 0, y: 0 }] },
      { author: 'johnoe', name: 'bp2', points: [{ x: 1, y: 1 }] },
    ]
    getAllMock.mockResolvedValueOnce([])
    getByAuthorMock.mockResolvedValueOnce(mockData)

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
