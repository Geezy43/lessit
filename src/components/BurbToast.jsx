import { useEffect, useState } from 'react'

export default function BurbToast({ message, onDone }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!message) return
    setVisible(true)
    const t = setTimeout(() => {
      setVisible(false)
      setTimeout(onDone, 300)
    }, 2500)
    return () => clearTimeout(t)
  }, [message])

  if (!message) return null

  return (
    <div style={{
      position: 'absolute',
      bottom: 'calc(var(--nav-height) + 16px)',
      left: '50%',
      transform: `translateX(-50%) translateY(${visible ? 0 : 20}px)`,
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.25s ease, transform 0.25s ease',
      zIndex: 40,
      pointerEvents: 'none',
      whiteSpace: 'nowrap',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: '#1A1A1A',
        borderRadius: 100,
        padding: '10px 18px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
      }}>
        <div style={{
          width: 24, height: 24, borderRadius: 7,
          background: 'linear-gradient(135deg, #E8713A, #F5A07A)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, flexShrink: 0,
        }}>
          🍽️
        </div>
        <span style={{
          fontFamily: 'Outfit', fontSize: 13, fontWeight: 500,
          color: '#fff',
        }}>
          {message}
        </span>
      </div>
    </div>
  )
}
