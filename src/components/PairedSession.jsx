import { useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001'

export default function PairedSession({ meals, onMatch, onClose }) {
  const [phase, setPhase] = useState('menu')   // menu | hosting | joining | waiting | swiping
  const [code, setCode] = useState('')
  const [joinInput, setJoinInput] = useState('')
  const [error, setError] = useState('')
  const [partnerActivity, setPartnerActivity] = useState(false)
  const socketRef = useRef(null)

  useEffect(() => {
    const socket = io(SERVER_URL, { transports: ['websocket', 'polling'] })
    socketRef.current = socket

    socket.on('session-ready', () => setPhase('swiping'))
    socket.on('partner-left', () => {
      setError('Your partner left the session.')
      setPhase('menu')
    })
    socket.on('partner-swiped-right', () => {
      setPartnerActivity(true)
      setTimeout(() => setPartnerActivity(false), 1500)
    })
    socket.on('match', ({ mealId }) => {
      const meal = meals.find(m => m.id === mealId)
      if (meal) onMatch(meal)
    })

    return () => socket.disconnect()
  }, [meals, onMatch])

  const createSession = () => {
    setPhase('hosting')
    socketRef.current.emit('create-session', {}, ({ ok, code: c }) => {
      if (ok) setCode(c)
    })
  }

  const joinSession = () => {
    if (joinInput.trim().length < 4) return
    socketRef.current.emit('join-session', { code: joinInput.toUpperCase() }, ({ ok, error: e }) => {
      if (ok) {
        setCode(joinInput.toUpperCase())
        setPhase('swiping')
      } else {
        setError(e || 'Could not join session')
      }
    })
  }

  const swipe = (mealId, direction) => {
    socketRef.current.emit('swipe', { mealId, direction })
  }

  const confirmMeal = (mealId) => {
    socketRef.current.emit('confirm-meal', { mealId })
  }

  return { phase, code, joinInput, setJoinInput, error, partnerActivity, createSession, joinSession, swipe, confirmMeal }
}

// ── Paired Session Overlay ───────────────────────────────────────────────────
export function PairedSessionOverlay({ meals, onMatch, onClose }) {
  const {
    phase, code, joinInput, setJoinInput, error, partnerActivity,
    createSession, joinSession, swipe, confirmMeal,
  } = PairedSession({ meals, onMatch, onClose })

  if (phase === 'swiping') {
    return null // App.jsx handles the swipe deck; just pass swipe fn up via onMatch
  }

  return (
    <>
      <div className="backdrop" onClick={onClose} />
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 70,
        background: '#fff', borderRadius: '24px 24px 0 0',
        padding: '0 24px 48px',
        animation: 'slideUp 0.35s cubic-bezier(0.16,1,0.3,1)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 8px' }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: '#E8E0D8' }} />
        </div>

        {phase === 'menu' && (
          <MenuPhase
            onHost={createSession}
            error={error}
            onClose={onClose}
          />
        )}
        {phase === 'hosting' && (
          <HostingPhase code={code} onClose={onClose} />
        )}
        {phase === 'joining' && (
          <JoiningPhase
            value={joinInput}
            onChange={setJoinInput}
            onJoin={joinSession}
            error={error}
            onBack={() => { /* reset */ }}
          />
        )}
        {phase === 'menu' && (
          <div style={{ marginTop: 16 }}>
            <button className="btn-secondary" onClick={() => {
              // switch to join view inline
            }} style={{ marginTop: 8 }}>
              Join a session
            </button>
          </div>
        )}
      </div>
    </>
  )
}

// ── Sub-views ─────────────────────────────────────────────────────────────────
function MenuPhase({ onHost, error, onClose }) {
  const [showJoin, setShowJoin] = useState(false)
  const [code, setCode] = useState('')
  const socketRef = useRef(null)

  if (showJoin) {
    return (
      <div style={{ paddingTop: 8, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <button onClick={() => setShowJoin(false)} className="btn-ghost" style={{ alignSelf: 'flex-start', padding: '4px 0', color: '#8C8C8C' }}>
          ← Back
        </button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🔑</div>
          <h2 style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 22, color: '#1A1A1A', marginBottom: 6 }}>
            Enter session code
          </h2>
          <p style={{ fontFamily: 'Outfit', fontSize: 14, color: '#8C8C8C' }}>
            Ask your partner for the 5-letter code
          </p>
        </div>
        <input
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase().slice(0, 5))}
          placeholder="E.g. AB3XY"
          maxLength={5}
          style={{
            width: '100%', padding: '18px', borderRadius: 16,
            border: '1.5px solid #E8E0D8', fontFamily: 'Outfit',
            fontSize: 24, fontWeight: 600, letterSpacing: 6,
            textAlign: 'center', color: '#1A1A1A', background: '#FEFAF6',
            outline: 'none',
          }}
          onFocus={e => e.target.style.borderColor = '#E8713A'}
          onBlur={e => e.target.style.borderColor = '#E8E0D8'}
        />
        {error && <p style={{ fontFamily: 'Outfit', fontSize: 13, color: '#E84040', textAlign: 'center' }}>{error}</p>}
        <button className="btn-primary" onClick={() => onHost(code)} disabled={code.length < 4} style={{ opacity: code.length >= 4 ? 1 : 0.4 }}>
          Join session
        </button>
      </div>
    )
  }

  return (
    <div style={{ paddingTop: 8, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>👫</div>
        <h2 style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 22, color: '#1A1A1A', marginBottom: 6 }}>
          Decide Together
        </h2>
        <p style={{ fontFamily: 'Outfit', fontSize: 14, color: '#8C8C8C', lineHeight: 1.6 }}>
          Both swipe independently. When you both right-swipe the same meal — match 🎉
        </p>
      </div>
      <button className="btn-primary" onClick={onHost}>
        Start a session (I'll share the code)
      </button>
      <button className="btn-secondary" onClick={() => setShowJoin(true)}>
        Join with a code
      </button>
      <button className="btn-ghost" onClick={onClose} style={{ color: '#8C8C8C' }}>
        Cancel
      </button>
    </div>
  )
}

function HostingPhase({ code }) {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard?.writeText(code).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ paddingTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>⏳</div>
        <h2 style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 22, color: '#1A1A1A', marginBottom: 6 }}>
          Waiting for partner…
        </h2>
        <p style={{ fontFamily: 'Outfit', fontSize: 14, color: '#8C8C8C' }}>
          Share this code with them
        </p>
      </div>

      {/* Code display */}
      <div style={{
        background: '#FFF4EE',
        borderRadius: 20, padding: '20px 32px',
        textAlign: 'center', width: '100%',
      }}>
        <p style={{ fontFamily: 'Outfit', fontSize: 11, fontWeight: 600, color: '#8C8C8C', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>
          Session Code
        </p>
        <p style={{ fontFamily: 'Outfit', fontSize: 44, fontWeight: 600, color: '#E8713A', letterSpacing: 10, marginBottom: 12 }}>
          {code || '•••••'}
        </p>
        <button onClick={copy} className="btn-secondary" style={{ width: 'auto', padding: '10px 24px' }}>
          {copied ? '✓ Copied!' : 'Copy code'}
        </button>
      </div>

      {/* Animated waiting dots */}
      <div style={{ display: 'flex', gap: 6 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 8, height: 8, borderRadius: '50%',
            background: '#E8713A',
            animation: `pulse 1.2s ${i * 0.2}s ease-in-out infinite`,
          }} />
        ))}
      </div>
    </div>
  )
}
