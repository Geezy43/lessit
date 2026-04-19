import MealDetail from './MealDetail'
import { useState } from 'react'

export default function MyPicksScreen({ picks, onConfirm }) {
  const [selected, setSelected] = useState(null)

  if (picks.length === 0) {
    return (
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '40px 32px', gap: 16, textAlign: 'center',
      }}>
        <span style={{ fontSize: 64 }}>🤤</span>
        <h2 style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 22, color: '#1A1A1A' }}>
          No picks yet
        </h2>
        <p style={{ fontFamily: 'Outfit', fontSize: 15, color: '#8C8C8C', lineHeight: 1.6 }}>
          Swipe right on meals you like and they'll show up here.
        </p>
      </div>
    )
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto' }}>
      <div style={{ padding: '20px 24px 12px' }}>
        <h1 style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 24, color: '#1A1A1A' }}>
          My Picks
        </h1>
        <p style={{ fontFamily: 'Outfit', fontSize: 14, color: '#8C8C8C', marginTop: 2 }}>
          {picks.length} meal{picks.length !== 1 ? 's' : ''} you liked
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '4px 16px 24px' }}>
        {picks.map((meal, i) => (
          <button
            key={`${meal.id}-${i}`}
            onClick={() => setSelected(meal)}
            style={{
              display: 'flex', alignItems: 'center', gap: 0,
              background: '#fff', borderRadius: 20,
              border: 'none', cursor: 'pointer', textAlign: 'left',
              overflow: 'hidden',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            {/* Colour strip */}
            <div style={{
              width: 72, height: 72, flexShrink: 0,
              background: `linear-gradient(160deg, ${meal.colors.from} 0%, ${meal.colors.to} 100%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 30,
            }}>
              {meal.emoji}
            </div>

            {/* Info */}
            <div style={{ flex: 1, padding: '12px 16px' }}>
              <p style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 15, color: '#1A1A1A', marginBottom: 3 }}>
                {meal.name}
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <span style={{ fontFamily: 'Outfit', fontSize: 12, color: '#8C8C8C' }}>
                  🔥 {meal.calories} kcal
                </span>
                <span style={{ fontFamily: 'Outfit', fontSize: 12, fontWeight: 600, color: '#E8713A' }}>
                  ₦{meal.priceMin.toLocaleString()}+
                </span>
              </div>
            </div>

            {/* Chevron */}
            <div style={{ padding: '0 16px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M9 18l6-6-6-6" stroke="#8C8C8C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <MealDetail
          meal={selected}
          onClose={() => setSelected(null)}
          onConfirm={(meal) => { onConfirm(meal); setSelected(null) }}
        />
      )}
    </div>
  )
}
