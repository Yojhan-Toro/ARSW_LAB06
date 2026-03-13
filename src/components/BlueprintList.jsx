
export default function BlueprintList({ items = [], onOpen }) {
  if (!items.length) {
    return <p style={{ color: '#94a3b8' }}>No hay blueprints para este autor.</p>
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table
        data-testid="blueprint-table"
        style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}
      >
        <thead>
          <tr>
            <th style={th}>Blueprint name</th>
            <th style={{ ...th, textAlign: 'right' }}>Number of points</th>
            <th style={{ ...th, textAlign: 'center', width: 90 }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {items.map((bp) => (
            <tr key={`${bp.author}-${bp.name}`} style={{ transition: 'background 0.15s' }}>
              <td style={td}>{bp.name}</td>
              <td style={{ ...td, textAlign: 'right' }}>{bp.points?.length ?? 0}</td>
              <td style={{ ...td, textAlign: 'center' }}>
                <button
                  className="btn primary"
                  style={{ padding: '4px 14px', fontSize: 13 }}
                  onClick={() => onOpen(bp)}
                >
                  Open
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}


const th = {
  textAlign: 'left',
  padding: '8px 10px',
  borderBottom: '2px solid #334155',
  color: '#94a3b8',
  fontWeight: 600,
  whiteSpace: 'nowrap',
}

const td = {
  padding: '8px 10px',
  borderBottom: '1px solid #1f2937',
  color: '#e2e8f0',
}
