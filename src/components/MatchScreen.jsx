import { useEffect, useState } from 'react'

const CONFETTI_COLORS = ['#E8713A', '#F5E6D3', '#4CAF50', '#FFD700', '#FF6B6B', '#87CEEB', '#DDA0DD']

function Confetti() {
  const [pieces] = useState(() =>
    Array.from({ length: 60 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 1.5}s`,
      duration: `${2 + Math.random() * 2}s`,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      size: 6 + Math.random() * 8,
      shape: Math.random() > 0.5 ? '50%' : '0%',
    }))
  )

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {pieces.map(p => (
        <div key={p.id} style={{
          position: 'absolute',
          top: '-20px',
          left: p.left,
          width: p.size,
          height: p.size,
          borderRadius: p.shape,
          background: p.color,
          animation: `confettiFall ${p.duration} ${p.delay} ease-in forwards`,
        }} />
      ))}
    </div>
  )
}

export default function MatchScreen({ meal, onConfirm, onClose }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(t)
  }, [])

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 90,
      background: 'rgba(0,0,0,0.75)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      animation: 'fadeIn 0.25s ease',
      padding: '24px',
    }}>
      <Confetti />

      <div style={{
        width: '100%',
        background: '#fff',
        borderRadius: 28,
        padding: '32px 24px 28px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
        position: 'relative',
        animation: visible ? 'scaleIn 0.4s cubic-bezier(0.34,1.56,0.64,1)' : 'none',
      }}>
        {/* Match header */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🎉</div>
          <h2 style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 26, color: '#1A1A1A', marginBottom: 4 }}>
            It's a Match!
          </h2>
          <p style={{ fontFamily: 'Outfit', fontSize: 15, color: '#8C8C8C' }}>
            You both want this 😍
          </p>
        </div>

        {/* Meal card */}
        <div style={{
          width: '100%',
          borderRadius: 20,
          overflow: 'hidden',
          background: `linear-gradient(160deg, ${meal.colors.from} 0%, ${meal.colors.to} 100%)`,
        }}>
          <div style={{
            height: 180,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 80 }}>{meal.emoji}</span>
          </div>
          <div style={{ background: '#fff', padding: '16px 20px' }}>
            <h3 style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 18, color: '#1A1A1A', marginBottom: 4 }}>
              {meal.name}
            </h3>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'Outfit', fontSize: 13, color: '#8C8C8C' }}>
                🔥 {meal.calories} kcal
              </span>
              <span style={{ fontFamily: 'Outfit', fontSize: 13, fontWeight: 600, color: '#E8713A' }}>
                ₦{meal.priceMin.toLocaleString()}+
              </span>
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button className="btn-primary" onClick={() => onConfirm(meal)}>
            Let's eat this! 🍽️
          </button>
          <button className="btn-ghost" onClick={onClose} style={{ color: '#8C8C8C' }}>
            Keep swiping
          </button>
        </div>
      </div>
    </div>
  )
}
