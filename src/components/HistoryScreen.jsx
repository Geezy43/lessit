export default function HistoryScreen({ history, onPickAgain }) {
  if (history.length === 0) {
    return (
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '40px 32px', gap: 16, textAlign: 'center',
      }}>
        <span style={{ fontSize: 64 }}>🍽️</span>
        <h2 style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 22, color: '#1A1A1A' }}>
          No meals yet
        </h2>
        <p style={{ fontFamily: 'Outfit', fontSize: 15, color: '#8C8C8C', lineHeight: 1.6 }}>
          Swipe right and confirm a meal to see your history here.
        </p>
      </div>
    )
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '0 0 20px' }}>
      {/* Header */}
      <div style={{ padding: '20px 24px 16px' }}>
        <h1 style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 24, color: '#1A1A1A' }}>
          History
        </h1>
        <p style={{ fontFamily: 'Outfit', fontSize: 14, color: '#8C8C8C', marginTop: 2 }}>
          {history.length} meal{history.length !== 1 ? 's' : ''} confirmed
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '0 16px' }}>
        {[...history].reverse().map((entry, i) => (
          <div key={i} style={{
            background: '#fff',
            borderRadius: 20,
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'stretch',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          }}>
            {/* Color strip */}
            <div style={{
              width: 64,
              background: `linear-gradient(160deg, ${entry.meal.colors.from} 0%, ${entry.meal.colors.to} 100%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, flexShrink: 0,
            }}>
              {entry.meal.emoji}
            </div>

            {/* Info */}
            <div style={{ flex: 1, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <h3 style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 15, color: '#1A1A1A' }}>
                {entry.meal.name}
              </h3>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span style={{ fontFamily: 'Outfit', fontSize: 12, color: '#8C8C8C' }}>
                  🔥 {entry.meal.calories} kcal
                </span>
                <span style={{
                  fontFamily: 'Outfit', fontSize: 11, fontWeight: 500,
                  background: '#F5E6D3', color: '#E8713A',
                  borderRadius: 100, padding: '2px 8px',
                }}>
                  {entry.type === 'paired' ? '👥 Paired' : '👤 Solo'}
                </span>
              </div>
              <span style={{ fontFamily: 'Outfit', fontSize: 11, color: '#8C8C8C' }}>
                {formatDate(entry.date)}
              </span>
            </div>

            {/* Pick again */}
            <button
              onClick={() => onPickAgain(entry.meal)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '0 16px', color: '#E8713A',
                fontFamily: 'Outfit', fontSize: 12, fontWeight: 600,
                flexShrink: 0,
              }}
            >
              Again
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

function formatDate(iso) {
  const d = new Date(iso)
  const now = new Date()
  const diff = now - d
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (mins < 1)  return 'Just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days === 1) return 'Yesterday'
  return d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })
}
