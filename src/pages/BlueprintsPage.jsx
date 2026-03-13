import { useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchByAuthor,
  fetchBlueprint,
  clearCurrent,
} from '../features/blueprints/blueprintsSlice.js'
import BlueprintCanvas from '../components/BlueprintCanvas.jsx'
import BlueprintList from '../components/BlueprintList.jsx'


export default function BlueprintsPage() {
  const dispatch = useDispatch()

  const { byAuthor, current, authorStatus, error } = useSelector((s) => s.blueprints)

  const [authorInput, setAuthorInput] = useState('')
  const [selectedAuthor, setSelectedAuthor] = useState('')

  const items = byAuthor[selectedAuthor] || []

  const totalPoints = useMemo(
    () => items.reduce((acc, bp) => acc + (bp.points?.length ?? 0), 0),
    [items],
  )



  const handleGetBlueprints = () => {
    const trimmed = authorInput.trim()
    if (!trimmed) return
    setSelectedAuthor(trimmed)
    dispatch(clearCurrent())
    dispatch(fetchByAuthor(trimmed))
  }


  const handleOpen = (bp) => {
    dispatch(fetchBlueprint({ author: bp.author, name: bp.name }))
  }


  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1.1fr 1.4fr',
        gap: 24,
        alignItems: 'start',
      }}
    >
      <section style={{ display: 'grid', gap: 16 }}>


        <div className="card">
          <h2 style={{ marginTop: 0 }}>Blueprints</h2>
          <div style={{ display: 'flex', gap: 12 }}>
            <input
              className="input"
              placeholder="Author name"
              value={authorInput}
              onChange={(e) => setAuthorInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGetBlueprints()}
              data-testid="author-input"
            />
            <button
              className="btn primary"
              onClick={handleGetBlueprints}
              data-testid="get-blueprints-btn"
            >
              Get blueprints
            </button>
          </div>
        </div>


        <div className="card">
          <h3 style={{ marginTop: 0 }}>
            {selectedAuthor ? `${selectedAuthor}'s blueprints:` : 'Results'}
          </h3>

          {authorStatus === 'loading' && <p style={{ color: '#94a3b8' }}>Cargando…</p>}

          {authorStatus === 'failed' && (
            <p style={{ color: '#f87171' }}>⚠ {error || 'Error al cargar blueprints.'}</p>
          )}

          {authorStatus !== 'loading' && (
            <BlueprintList items={items} onOpen={handleOpen} />
          )}

          {!!items.length && (
            <p style={{ marginTop: 12, fontWeight: 700, color: '#93c5fd' }}>
              Total user points: {totalPoints}
            </p>
          )}
        </div>
      </section>


      <section className="card">

        <h3 style={{ marginTop: 0 }}>Current blueprint:</h3>
        <input
          className="input"
          readOnly
          value={current?.name ?? ''}
          placeholder="— ninguno seleccionado —"
          data-testid="current-blueprint-name"
          style={{ marginBottom: 12, color: '#93c5fd', cursor: 'default' }}
        />

        <BlueprintCanvas points={current?.points ?? []} width={520} height={360} />

        {current && (
          <p style={{ marginTop: 10, color: '#94a3b8', fontSize: 13 }}>
            {current.points?.length ?? 0} puntos · autor: {current.author}
          </p>
        )}
      </section>
    </div>
  )
}
