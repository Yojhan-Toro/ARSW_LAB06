import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BlueprintForm from '../src/components/BlueprintForm'

describe('BlueprintForm', () => {
  it('renderiza los campos author, name y el botón de envío', () => {
    render(<BlueprintForm onSubmit={() => {}} />)

    expect(screen.getByPlaceholderText(/juan\.perez/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/mi-dibujo/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /guardar|crear|enviar/i })).toBeInTheDocument()
  })

  it('permite escribir en el campo author', async () => {
    render(<BlueprintForm onSubmit={() => {}} />)
    const authorInput = screen.getByPlaceholderText(/juan\.perez/i)

    await userEvent.clear(authorInput)
    await userEvent.type(authorInput, 'johnoe')
    expect(authorInput.value).toBe('johnoe')
  })

  it('permite escribir en el campo name', async () => {
    render(<BlueprintForm onSubmit={() => {}} />)
    const nameInput = screen.getByPlaceholderText(/mi-dibujo/i)

    await userEvent.clear(nameInput)
    await userEvent.type(nameInput, 'mi-blueprint')
    expect(nameInput.value).toBe('mi-blueprint')
  })

  it('llama a onSubmit con { author, name, points } al enviar', async () => {
    const mockSubmit = vi.fn()
    render(<BlueprintForm onSubmit={mockSubmit} />)

    const authorInput = screen.getByPlaceholderText(/juan\.perez/i)
    const nameInput   = screen.getByPlaceholderText(/mi-dibujo/i)
    const button      = screen.getByRole('button', { name: /guardar|crear|enviar/i })

    await userEvent.clear(authorInput)
    await userEvent.type(authorInput, 'johnoe')
    await userEvent.clear(nameInput)
    await userEvent.type(nameInput, 'mi-blueprint')

    fireEvent.click(button)

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledTimes(1)
    })

    const callArg = mockSubmit.mock.calls[0][0]
    expect(callArg).toMatchObject({ author: 'johnoe', name: 'mi-blueprint' })
    expect(Array.isArray(callArg.points)).toBe(true)
  })
})
