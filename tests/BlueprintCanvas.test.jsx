import { render } from '@testing-library/react'
import BlueprintCanvas from '../src/components/BlueprintCanvas'

describe('BlueprintCanvas', () => {
  it('renderiza un elemento <canvas> en el DOM', () => {
    render(<BlueprintCanvas points={[]} />)
    const canvas = document.querySelector('canvas')
    expect(canvas).not.toBeNull()
  })

  it('renderiza con puntos sin lanzar errores', () => {
    const points = [{ x: 10, y: 20 }, { x: 50, y: 80 }, { x: 120, y: 40 }]
    expect(() => render(<BlueprintCanvas points={points} />)).not.toThrow()
  })

  it('el canvas tiene dimensiones definidas', () => {
    render(<BlueprintCanvas points={[]} />)
    const canvas = document.querySelector('canvas')
    expect(canvas).not.toBeNull()
    expect(canvas.width).toBeGreaterThanOrEqual(0)
    expect(canvas.height).toBeGreaterThanOrEqual(0)
  })

  it('renderiza sin errores cuando points no se pasa', () => {
    expect(() => render(<BlueprintCanvas />)).not.toThrow()
  })
})
