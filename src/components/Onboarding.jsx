import { useState, useRef } from 'react'

const BUDGET_OPTIONS = [
  { label: 'On a budget',   sub: '₦1,500 – ₦3,000', min: 1500, max: 3000 },
  { label: 'No complaints', sub: '₦3,000 – ₦6,000', min: 3000, max: 6000 },
  { label: 'Flex',          sub: '₦6,000+',          min: 6000, max: 99999 },
]

const DYK_CARDS = [
  {
    emoji: '⚡',
    fact: 'A calorie is just energy your food gives you.',
    detail: 'Your body literally runs on it — like fuel in a car.',
  },
  {
    emoji: '🔥',
    fact: 'Walking 30 mins burns ~150 kcal.\nSleeping 8 hours burns ~500 kcal.',
    detail: 'Yes, you burn energy doing absolutely nothing.',
  },
  {
    emoji: '🍛',
    fact: 'One plate of jollof rice = ~600 kcal.',
    detail: "That's more than an hour of jogging. So yeah, what you eat matters.",
  },
]

export default function Onboarding({ onComplete }) {
  // phase: 'splash' | 'dyk' | 'name' | 'budget' | 'transition'
  const [phase, setPhase] = useState('splash')
  const [dykIndex, setDykIndex] = useState(0)
  const [name, setName] = useState('')
  const [budget, setBudget] = useState(null)

  // DYK swipe state
  const dragStart = useRef({ x: 0, dragging: false })
  const [dykDelta, setDykDelta] = useState(0)
  const [dykFlying, setDykFlying] = useState(false)

  const handleDykPointerDown = (e) => {
    dragStart.current = { x: e.clientX, dragging: true }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const handleDykPointerMove = (e) => {
    if (!dragStart.current.dragging) return
    setDykDelta(e.clientX - dragStart.current.x)
  }
  const handleDykPointerUp = () => {
    if (!dragStart.current.dragging) return
    dragStart.current.dragging = false
    if (Math.abs(dykDelta) > 80) {
      advanceDyk()
    } else {
      setDykDelta(0)
    }
  }

  const advanceDyk = () => {
    setDykFlying(true)
    setTimeout(() => {
      if (dykIndex < DYK_CARDS.length - 1) {
        setDykIndex(i => i + 1)
      } else {
        setPhase('name')
      }
      setDykDelta(0)
      setDykFlying(false)
    }, 280)
  }

  const handleComplete = () => {
    onComplete({
      name: name.trim(),
      budgetMin: budget.min,
      budgetMax: budget.max,
      defaultBudget: budget.max,
      preferredCategories: [],
      watchingCalories: false,
      calorieTarget: 2000,
    })
  }

  // ── Splash ────────────────────────────────────────────────────────────────
  if (phase === 'splash') {
    return (
      <Screen>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, padding: '0 32px' }}>
          <BurbAvatar size={88} />
          <div style={{ textAlign: 'center' }}>
            <h1 style={styles.h1}>Hey, I'm Burb.</h1>
            <p style={{ ...styles.body, marginTop: 8, color: '#8C8C8C', lineHeight: 1.7 }}>
              I help you figure out what to eat.
            </p>
          </div>
        </div>
        <Footer>
          <button className="btn-primary" onClick={() => setPhase('dyk')}>
            Let's go
          </button>
        </Footer>
      </Screen>
    )
  }

  // ── DYK Cards ─────────────────────────────────────────────────────────────
  if (phase === 'dyk') {
    const card = DYK_CARDS[dykIndex]
    const rotate = dykFlying ? (dykDelta >= 0 ? 20 : -20) : dykDelta * 0.06
    const tx = dykFlying ? (dykDelta >= 0 ? 600 : -600) : dykDelta

    return (
      <Screen>
        {/* Header */}
        <div style={{ padding: '24px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <BurbLabel />
          <div style={{ display: 'flex', gap: 6 }}>
            {DYK_CARDS.map((_, i) => (
              <div key={i} style={{
                width: i === dykIndex ? 20 : 8, height: 8, borderRadius: 4,
                background: i <= dykIndex ? '#E8713A' : '#E8E0D8',
                transition: 'all 0.3s',
              }} />
            ))}
          </div>
        </div>

        {/* Card area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 24px 0', position: 'relative' }}>
          {/* Background cards for depth */}
          {[2, 1].map(offset => (
            <div key={offset} style={{
              position: 'absolute',
              width: '100%',
              height: 320,
              background: '#fff',
              borderRadius: 28,
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
              transform: `translateY(${offset * 10}px) scale(${1 - offset * 0.04})`,
            }} />
          ))}

          {/* Active DYK card */}
          <div
            onPointerDown={handleDykPointerDown}
            onPointerMove={handleDykPointerMove}
            onPointerUp={handleDykPointerUp}
            style={{
              position: 'relative', zIndex: 3,
              width: '100%', height: 320,
              background: '#fff',
              borderRadius: 28,
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              padding: '32px 28px',
              gap: 20,
              cursor: 'grab',
              userSelect: 'none',
              touchAction: 'none',
              transform: `translateX(${tx}px) rotate(${rotate}deg)`,
              transition: dragStart.current.dragging ? 'none' : 'transform 0.3s cubic-bezier(0.25,0.46,0.45,0.94)',
            }}
          >
            <div style={{
              width: 72, height: 72, borderRadius: 20,
              background: 'linear-gradient(135deg, #E8713A, #F5A07A)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 36,
            }}>
              {card.emoji}
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 18, color: '#1A1A1A', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                {card.fact}
              </p>
              <p style={{ fontFamily: 'Outfit', fontSize: 14, color: '#8C8C8C', marginTop: 10, lineHeight: 1.6 }}>
                {card.detail}
              </p>
            </div>
          </div>

          <p style={{ fontFamily: 'Outfit', fontSize: 13, color: '#8C8C8C', marginTop: 20 }}>
            Swipe to continue
          </p>
        </div>

        <Footer>
          <button className="btn-primary" onClick={advanceDyk}>
            {dykIndex < DYK_CARDS.length - 1 ? 'Got it →' : 'Let\'s do this →'}
          </button>
        </Footer>
      </Screen>
    )
  }

  // ── Name ──────────────────────────────────────────────────────────────────
  if (phase === 'name') {
    return (
      <Screen>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 24px', gap: 32 }}>
          <BurbLabel />
          <div>
            <h1 style={styles.h1}>What should I<br />call you?</h1>
          </div>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your name"
            autoFocus
            style={{
              width: '100%', padding: '18px 20px',
              borderRadius: 16, border: '1.5px solid #E8E0D8',
              fontFamily: 'Outfit', fontSize: 18, color: '#1A1A1A',
              background: '#fff', outline: 'none',
            }}
            onFocus={e => e.target.style.borderColor = '#E8713A'}
            onBlur={e => e.target.style.borderColor = '#E8E0D8'}
            onKeyDown={e => e.key === 'Enter' && name.trim() && setPhase('budget')}
          />
        </div>
        <Footer>
          <button
            className="btn-primary"
            onClick={() => setPhase('budget')}
            disabled={!name.trim()}
            style={{ opacity: name.trim() ? 1 : 0.4 }}
          >
            Continue
          </button>
        </Footer>
      </Screen>
    )
  }

  // ── Budget ────────────────────────────────────────────────────────────────
  if (phase === 'budget') {
    return (
      <Screen>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 24px', gap: 32 }}>
          <BurbLabel />
          <div>
            <h1 style={styles.h1}>How much are we<br />working with?</h1>
            <p style={{ ...styles.body, color: '#8C8C8C', marginTop: 8 }}>Per meal</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {BUDGET_OPTIONS.map(opt => {
              const active = budget?.label === opt.label
              return (
                <button
                  key={opt.label}
                  onClick={() => setBudget(opt)}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '18px 20px', borderRadius: 16,
                    border: `1.5px solid ${active ? '#E8713A' : '#E8E0D8'}`,
                    background: active ? '#FFF4EE' : '#fff',
                    cursor: 'pointer', transition: 'all 0.15s',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  <span style={{ fontFamily: 'Outfit', fontSize: 16, fontWeight: active ? 600 : 500, color: active ? '#E8713A' : '#1A1A1A' }}>
                    {opt.label}
                  </span>
                  <span style={{ fontFamily: 'Outfit', fontSize: 14, color: '#8C8C8C' }}>
                    {opt.sub}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
        <Footer>
          <button
            className="btn-primary"
            onClick={() => setPhase('transition')}
            disabled={!budget}
            style={{ opacity: budget ? 1 : 0.4 }}
          >
            Continue
          </button>
        </Footer>
      </Screen>
    )
  }

  // ── Transition ────────────────────────────────────────────────────────────
  if (phase === 'transition') {
    return (
      <Screen>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, padding: '0 32px' }}>
          <BurbAvatar size={88} />
          <div style={{ textAlign: 'center' }}>
            <h1 style={styles.h1}>Alright {name},<br />let's find your<br />next meal!</h1>
          </div>
        </div>
        <Footer>
          <button className="btn-primary" onClick={handleComplete}>
            Let's eat 🍽️
          </button>
        </Footer>
      </Screen>
    )
  }

  return null
}

// ── Shared sub-components ─────────────────────────────────────────────────────
function Screen({ children }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff', overflow: 'hidden' }}>
      {children}
    </div>
  )
}

function Footer({ children }) {
  return (
    <div style={{ padding: '16px 24px 40px', flexShrink: 0 }}>
      {children}
    </div>
  )
}

function BurbAvatar({ size = 56 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.28,
      background: 'linear-gradient(135deg, #E8713A 0%, #F5A07A 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.45,
      boxShadow: '0 4px 20px rgba(232,113,58,0.3)',
    }}>
      🍽️
    </div>
  )
}

function BurbLabel() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <BurbAvatar size={32} />
      <span style={{ fontFamily: 'Outfit', fontSize: 13, fontWeight: 600, color: '#E8713A' }}>Burb</span>
    </div>
  )
}

const styles = {
  h1: { fontFamily: 'Outfit', fontWeight: 700, fontSize: 32, color: '#1A1A1A', lineHeight: 1.2 },
  body: { fontFamily: 'Outfit', fontSize: 15, color: '#1A1A1A', lineHeight: 1.6 },
}
