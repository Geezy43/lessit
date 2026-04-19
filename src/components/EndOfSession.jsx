import { useState } from 'react'
import MealDetail from './MealDetail'

export default function EndOfSession({ picks, onSwipeAgain, onConfirm }) {
  const [selected, setSelected] = useState(null)

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      {/* Burb header */}
      <div style={{
        padding: '32px 24px 24px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
        textAlign: 'center',
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: 18,
          background: 'linear-gradient(135deg, #E8713A, #F5A07A)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 32,
          boxShadow: '0 4px 16px rgba(232,113,58,0.3)',
        }}>
          🍽️
        </div>
        <div>
          <h1 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 24, color: '#1A1A1A', marginBottom: 6 }}>
            That's 15 meals.
          </h1>
          <p style={{ fontFamily: 'Outfit', fontSize: 15, color: '#8C8C8C' }}>
            Here's what caught your eye.
          </p>
        </div>
      </div>

      {/* YUM shortlist */}
      <div style={{ flex: 1, padding: '0 16px' }}>
        {picks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <p style={{ fontFamily: 'Outfit', fontSize: 15, color: '#8C8C8C' }}>
              Nothing caught your eye this round. Picky today?
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {picks.map((meal, i) => (
              <div key={`${meal.id}-${i}`} style={{
                display: 'flex', alignItems: 'center', gap: 0,
                background: '#fff', borderRadius: 20,
                overflow: 'hidden',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              }}>
                {/* Colour strip */}
                <div style={{
                  width: 64, height: 64, flexShrink: 0,
                  background: `linear-gradient(160deg, ${meal.colors.from} 0%, ${meal.colors.to} 100%)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 26,
                }}>
                  {meal.emoji}
                </div>

                {/* Name */}
                <div style={{ flex: 1, padding: '12px 14px' }}>
                  <p style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 14, color: '#1A1A1A', marginBottom: 2 }}>
                    {meal.name}
                  </p>
                  <span style={{ fontFamily: 'Outfit', fontSize: 12, color: '#8C8C8C' }}>
                    ₦{meal.priceMin.toLocaleString()}+ · {meal.calories} kcal
                  </span>
                </div>

                {/* See details */}
                <button
                  onClick={() => setSelected(meal)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: '0 14px', height: '100%',
                    fontFamily: 'Outfit', fontSize: 12, fontWeight: 600, color: '#E8713A',
                    flexShrink: 0,
                  }}
                >
                  Details
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CTA */}
      <div style={{ padding: '24px 24px 40px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button className="btn-primary" onClick={onSwipeAgain}>
          Swipe another round 🔄
        </button>
      </div>

      {/* Meal detail overlay */}
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
