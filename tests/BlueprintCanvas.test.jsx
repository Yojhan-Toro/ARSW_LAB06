import { render, screen } from '@testing-library/react'
import BlueprintCanvas from '../src/components/BlueprintCanvas.jsx'

describe('BlueprintCanvas', () => {
  it('renderiza el canvas con data-testid correcto', () => {
    render(<BlueprintCanvas />)
    expect(screen.getByTestId('blueprint-canvas')).toBeInTheDocument()
  })

  it('tiene las dimensiones por defecto 520×360', () => {
    render(<BlueprintCanvas />)
    const canvas = screen.getByTestId('blueprint-canvas')
    expect(canvas).toHaveAttribute('width', '520')
    expect(canvas).toHaveAttribute('height', '360')
  })

  it('acepta dimensiones personalizadas', () => {
    render(<BlueprintCanvas width={300} height={200} />)
    const canvas = screen.getByTestId('blueprint-canvas')
    expect(canvas).toHaveAttribute('width', '300')
    expect(canvas).toHaveAttribute('height', '200')
  })

  it('llama a getContext al recibir puntos', () => {
    render(<BlueprintCanvas points={[{ x: 10, y: 10 }, { x: 50, y: 50 }]} />)
    expect(HTMLCanvasElement.prototype.getContext).toHaveBeenCalledWith('2d')
  })
})
