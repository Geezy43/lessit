import { useRef, useState } from 'react'

const SWIPE_THRESHOLD = 100

export default function SwipeCard({ meal, stackIndex, isTop, onSwipe, onTap, showBurbChip }) {
  const dragStart = useRef({ x: 0, dragging: false })
  const [delta, setDelta] = useState(0)
  const [flyDir, setFlyDir] = useState(null)
  const cardRef = useRef(null)

  const scale     = 1 - stackIndex * 0.04
  const translateY = stackIndex * 12

  const handlePointerDown = (e) => {
    if (!isTop || flyDir) return
    dragStart.current = { x: e.clientX, dragging: true }
    cardRef.current?.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e) => {
    if (!dragStart.current.dragging) return
    setDelta(e.clientX - dragStart.current.x)
  }

  const handlePointerUp = (e) => {
    if (!dragStart.current.dragging) return
    dragStart.current.dragging = false
    const d = e.clientX - dragStart.current.x

    if (Math.abs(d) > SWIPE_THRESHOLD) {
      const dir = d > 0 ? 'right' : 'left'
      setFlyDir(dir)
      setTimeout(() => {
        onSwipe(dir, meal)
        setDelta(0)
        setFlyDir(null)
      }, 300)
    } else {
      if (Math.abs(d) < 5) onTap?.(meal)
      setDelta(0)
    }
  }

  const rotate    = flyDir ? (flyDir === 'right' ? 28 : -28) : delta * 0.07
  const translateX = flyDir
    ? (flyDir === 'right' ? 700 : -700)
    : delta

  const isDragging  = dragStart.current.dragging
  const showYum     = isTop && (delta > 30 || flyDir === 'right')
  const showNah     = isTop && (delta < -30 || flyDir === 'left')
  const yumOpacity  = Math.min(1, Math.abs(delta) / 100)
  const nahOpacity  = Math.min(1, Math.abs(delta) / 100)

  return (
    <div
      ref={cardRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{
        position: 'absolute',
        inset: 0,
        transform: `translateX(${translateX}px) translateY(${translateY}px) rotate(${rotate}deg) scale(${scale})`,
        transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        transformOrigin: 'center bottom',
        cursor: isTop ? 'grab' : 'default',
        userSelect: 'none',
        touchAction: 'none',
        zIndex: 3 - stackIndex,
      }}
    >
      {/* Card body */}
      <div style={{
        width: '100%',
        height: '100%',
        borderRadius: 28,
        overflow: 'hidden',
        background: '#fff',
        boxShadow: stackIndex === 0
          ? '0 12px 40px rgba(0,0,0,0.18)'
          : '0 4px 16px rgba(0,0,0,0.10)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Hero */}
        <div style={{
          flex: '0 0 62%',
          background: `linear-gradient(160deg, ${meal.colors.from} 0%, ${meal.colors.to} 100%)`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}>
          <span style={{ fontSize: 96, lineHeight: 1, filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))' }}>
            {meal.emoji}
          </span>

          {/* Category badge */}
          <div style={{
            position: 'absolute',
            top: 16,
            left: 16,
            background: 'rgba(255,255,255,0.22)',
            backdropFilter: 'blur(8px)',
            borderRadius: 100,
            padding: '5px 12px',
          }}>
            <span style={{ fontFamily: 'Outfit', fontSize: 11, fontWeight: 600, color: '#fff', letterSpacing: 0.5, textTransform: 'uppercase' }}>
              {meal.category}
            </span>
          </div>

          {/* Burb chip — first card only */}
          {showBurbChip && isTop && (
            <div style={{
              position: 'absolute',
              bottom: 16, left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(26,26,26,0.85)',
              backdropFilter: 'blur(8px)',
              borderRadius: 100,
              padding: '8px 16px',
              display: 'flex', alignItems: 'center', gap: 8,
              whiteSpace: 'nowrap',
              animation: 'fadeIn 0.4s ease',
            }}>
              <span style={{ fontSize: 14 }}>🍽️</span>
              <span style={{ fontFamily: 'Outfit', fontSize: 12, fontWeight: 500, color: '#fff' }}>
                Swipe right if you'd eat it. Left if not.
              </span>
            </div>
          )}

          {/* YUM overlay */}
          {showYum && (
            <div style={{
              position: 'absolute',
              top: 24,
              right: 16,
              opacity: yumOpacity,
              transform: `rotate(-12deg) scale(${0.8 + yumOpacity * 0.2})`,
              transition: 'opacity 0.05s',
            }}>
              <div style={{
                border: '3px solid #4CAF50',
                borderRadius: 8,
                padding: '4px 10px',
              }}>
                <span style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 22, color: '#4CAF50', letterSpacing: 1 }}>
                  YUM 🤤
                </span>
              </div>
            </div>
          )}

          {/* NAH overlay */}
          {showNah && (
            <div style={{
              position: 'absolute',
              top: 24,
              left: 16,
              opacity: nahOpacity,
              transform: `rotate(12deg) scale(${0.8 + nahOpacity * 0.2})`,
              transition: 'opacity 0.05s',
            }}>
              <div style={{
                border: '3px solid #E84040',
                borderRadius: 8,
                padding: '4px 10px',
              }}>
                <span style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 22, color: '#E84040', letterSpacing: 1 }}>
                  NAH 😑
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ padding: '20px 22px 16px', display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
          <div>
            <h2 style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 22, color: '#1A1A1A', marginBottom: 4 }}>
              {meal.name}
            </h2>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {meal.moods.slice(0, 3).map(m => (
                <span key={m} style={{
                  fontFamily: 'Outfit', fontSize: 12, fontWeight: 500,
                  color: '#8C8C8C', background: '#F5E6D3',
                  borderRadius: 100, padding: '3px 10px',
                }}>
                  {m}
                </span>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 16 }}>🔥</span>
              <span style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 16, color: '#1A1A1A' }}>
                {meal.calories} kcal
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 16 }}>💰</span>
              <span style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 16, color: '#E8713A' }}>
                ₦{meal.priceMin.toLocaleString()}+
              </span>
            </div>
          </div>

          <p style={{ fontFamily: 'Outfit', fontSize: 13, color: '#8C8C8C', marginTop: 'auto' }}>
            Tap card for full details
          </p>
        </div>
      </div>
    </div>
  )
}
