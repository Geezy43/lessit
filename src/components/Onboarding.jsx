import { useState } from 'react'
import { CATEGORIES } from '../data/meals'

const STEPS = 4

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0)
  const [data, setData] = useState({
    name: '',
    preferredCategories: [],
    watchingCalories: false,
    calorieTarget: 2000,
    defaultBudget: 3000,
  })

  const next = () => {
    if (step < STEPS - 1) setStep(s => s + 1)
    else onComplete(data)
  }

  const back = () => setStep(s => s - 1)

  const canProceed = () => {
    if (step === 0) return data.name.trim().length > 0
    return true
  }

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      background: 'var(--bg)', overflow: 'hidden',
    }}>
      {/* Progress bar */}
      <div style={{ padding: '20px 24px 0' }}>
        {step > 0 && (
          <button onClick={back} className="btn-ghost" style={{ padding: '0 0 16px', color: '#8C8C8C', display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back
          </button>
        )}
        <div style={{ display: 'flex', gap: 6 }}>
          {Array.from({ length: STEPS }).map((_, i) => (
            <div key={i} style={{
              flex: 1, height: 4, borderRadius: 2,
              background: i <= step ? 'var(--primary)' : '#E8E0D8',
              transition: 'background 0.3s',
            }} />
          ))}
        </div>
      </div>

      {/* Step content */}
      <div style={{ flex: 1, padding: '32px 24px 24px', overflowY: 'auto' }}>
        {step === 0 && <StepName data={data} setData={setData} />}
        {step === 1 && <StepCategories data={data} setData={setData} />}
        {step === 2 && <StepCalories data={data} setData={setData} />}
        {step === 3 && <StepBudget data={data} setData={setData} />}
      </div>

      {/* CTA */}
      <div style={{ padding: '0 24px 40px' }}>
        <button className="btn-primary" onClick={next} disabled={!canProceed()} style={{
          opacity: canProceed() ? 1 : 0.45,
        }}>
          {step === STEPS - 1 ? "Let's eat! 🍽️" : 'Continue'}
        </button>
      </div>
    </div>
  )
}

function StepName({ data, setData }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <div style={{ fontSize: 56, marginBottom: 16 }}>👋</div>
        <h1 style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 28, color: '#1A1A1A', marginBottom: 8 }}>
          Hey, what do<br />we call you?
        </h1>
        <p style={{ fontFamily: 'Outfit', fontSize: 15, color: '#8C8C8C', lineHeight: 1.6 }}>
          Lessit helps you decide what to eat in under 60 seconds.
        </p>
      </div>
      <input
        value={data.name}
        onChange={e => setData(p => ({ ...p, name: e.target.value }))}
        placeholder="Your name"
        autoFocus
        style={{
          width: '100%', padding: '16px 18px',
          borderRadius: 16, border: '1.5px solid #E8E0D8',
          fontFamily: 'Outfit', fontSize: 16, color: '#1A1A1A',
          background: '#fff', outline: 'none',
        }}
        onFocus={e => e.target.style.borderColor = '#E8713A'}
        onBlur={e => e.target.style.borderColor = '#E8E0D8'}
      />
    </div>
  )
}

function StepCategories({ data, setData }) {
  const toggle = (cat) => {
    setData(prev => ({
      ...prev,
      preferredCategories: prev.preferredCategories.includes(cat)
        ? prev.preferredCategories.filter(c => c !== cat)
        : [...prev.preferredCategories, cat],
    }))
  }

  const categoryEmojis = {
    'Rice Dish': '🍛',
    'Swallow': '🫙',
    'Soup': '🍲',
    'Grilled Protein': '🍢',
    'Beans & Porridge': '🫘',
    'Street Food': '🌽',
    'Breakfast': '🍳',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🍜</div>
        <h1 style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 28, color: '#1A1A1A', marginBottom: 8 }}>
          What do you<br />usually eat?
        </h1>
        <p style={{ fontFamily: 'Outfit', fontSize: 15, color: '#8C8C8C' }}>
          Select all that apply. We'll show these first.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {CATEGORIES.map(cat => {
          const active = data.preferredCategories.includes(cat)
          return (
            <button
              key={cat}
              onClick={() => toggle(cat)}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 18px', borderRadius: 16,
                border: `1.5px solid ${active ? '#E8713A' : '#E8E0D8'}`,
                background: active ? '#FFF4EE' : '#fff',
                cursor: 'pointer', textAlign: 'left',
                transition: 'all 0.15s',
              }}
            >
              <span style={{ fontSize: 24 }}>{categoryEmojis[cat]}</span>
              <span style={{ fontFamily: 'Outfit', fontSize: 15, fontWeight: active ? 600 : 400, color: active ? '#E8713A' : '#1A1A1A' }}>
                {cat}
              </span>
              {active && <span style={{ marginLeft: 'auto', color: '#E8713A', fontSize: 18 }}>✓</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function StepCalories({ data, setData }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🔥</div>
        <h1 style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 28, color: '#1A1A1A', marginBottom: 8 }}>
          Watching<br />your calories?
        </h1>
        <p style={{ fontFamily: 'Outfit', fontSize: 15, color: '#8C8C8C', lineHeight: 1.6 }}>
          We'll show calorie info on every meal. No judgement either way.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[
          { val: true,  label: 'Yes, show me calories',    sub: 'I track what I eat',       emoji: '📊' },
          { val: false, label: 'No, just show me food',    sub: 'I eat what I want',         emoji: '😋' },
        ].map(opt => {
          const active = data.watchingCalories === opt.val
          return (
            <button
              key={String(opt.val)}
              onClick={() => setData(p => ({ ...p, watchingCalories: opt.val }))}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '18px', borderRadius: 16,
                border: `1.5px solid ${active ? '#E8713A' : '#E8E0D8'}`,
                background: active ? '#FFF4EE' : '#fff',
                cursor: 'pointer', textAlign: 'left',
                transition: 'all 0.15s',
              }}
            >
              <span style={{ fontSize: 28 }}>{opt.emoji}</span>
              <div>
                <p style={{ fontFamily: 'Outfit', fontSize: 15, fontWeight: active ? 600 : 500, color: active ? '#E8713A' : '#1A1A1A' }}>
                  {opt.label}
                </p>
                <p style={{ fontFamily: 'Outfit', fontSize: 12, color: '#8C8C8C', marginTop: 2 }}>{opt.sub}</p>
              </div>
            </button>
          )
        })}
      </div>

      {data.watchingCalories && (
        <div style={{ background: '#fff', borderRadius: 16, padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <p style={{ fontFamily: 'Outfit', fontSize: 14, fontWeight: 500, color: '#1A1A1A' }}>Daily target</p>
            <span style={{ fontFamily: 'Outfit', fontSize: 14, fontWeight: 600, color: '#E8713A' }}>{data.calorieTarget} kcal</span>
          </div>
          <input
            type="range" min="1200" max="4000" step="100"
            value={data.calorieTarget}
            onChange={e => setData(p => ({ ...p, calorieTarget: Number(e.target.value) }))}
          />
        </div>
      )}
    </div>
  )
}

function StepBudget({ data, setData }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <div style={{ fontSize: 56, marginBottom: 16 }}>💰</div>
        <h1 style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 28, color: '#1A1A1A', marginBottom: 8 }}>
          What's your<br />usual budget?
        </h1>
        <p style={{ fontFamily: 'Outfit', fontSize: 15, color: '#8C8C8C', lineHeight: 1.6 }}>
          We'll filter out meals above this. You can always change it.
        </p>
      </div>

      <div style={{ background: '#fff', borderRadius: 20, padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <span style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 40, color: '#E8713A' }}>
            ₦{data.defaultBudget.toLocaleString()}
          </span>
          <p style={{ fontFamily: 'Outfit', fontSize: 13, color: '#8C8C8C', marginTop: 4 }}>per meal</p>
        </div>
        <input
          type="range" min="500" max="10000" step="500"
          value={data.defaultBudget}
          onChange={e => setData(p => ({ ...p, defaultBudget: Number(e.target.value) }))}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
          <span style={{ fontFamily: 'Outfit', fontSize: 12, color: '#8C8C8C' }}>₦500</span>
          <span style={{ fontFamily: 'Outfit', fontSize: 12, color: '#8C8C8C' }}>₦10,000</span>
        </div>
      </div>

      {/* Budget tier hint */}
      <div style={{ background: '#F5E6D3', borderRadius: 16, padding: '16px 18px' }}>
        <p style={{ fontFamily: 'Outfit', fontSize: 13, color: '#8C8C8C', lineHeight: 1.6 }}>
          💡 <strong style={{ color: '#1A1A1A' }}>
            {data.defaultBudget <= 1000 ? 'Budget eater' :
             data.defaultBudget <= 3000 ? 'Everyday meals' :
             data.defaultBudget <= 6000 ? 'Treat yourself' : 'No limits 👑'}
          </strong>
          {' — '}
          {data.defaultBudget <= 1000 ? 'Street food & quick bites in range.' :
           data.defaultBudget <= 3000 ? 'Most bukas and local spots covered.' :
           data.defaultBudget <= 6000 ? 'Restaurants and premium spots open up.' :
           'The whole menu is yours.'}
        </p>
      </div>
    </div>
  )
}
