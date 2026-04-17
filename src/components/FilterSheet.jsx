import { useState } from 'react'
import { CATEGORIES, MOODS } from '../data/meals'

export default function FilterSheet({ filters, onApply, onClose }) {
  const [local, setLocal] = useState({ ...filters })

  const toggleItem = (key, value) => {
    setLocal(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(v => v !== value)
        : [...prev[key], value],
    }))
  }

  const reset = () => setLocal({ budget: 0, calories: 0, categories: [], moods: [] })

  return (
    <>
      <div className="backdrop" onClick={onClose} />
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 60,
        background: '#fff',
        borderRadius: '24px 24px 0 0',
        padding: '0 24px 40px',
        maxHeight: '85%',
        overflowY: 'auto',
        animation: 'slideUp 0.35s cubic-bezier(0.16,1,0.3,1)',
      }}>
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 8px' }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: '#E8E0D8' }} />
        </div>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingTop: 4 }}>
          <h2 style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 20, color: '#1A1A1A' }}>Filter</h2>
          <button className="btn-ghost" onClick={reset} style={{ color: '#E8713A', padding: '6px 0' }}>
            Reset all
          </button>
        </div>

        {/* Budget slider */}
        <Section label="Max Budget" value={local.budget > 0 ? `₦${local.budget.toLocaleString()}` : 'Any'}>
          <input
            type="range" min="500" max="8000" step="500"
            value={local.budget || 8000}
            onChange={e => setLocal(p => ({ ...p, budget: Number(e.target.value) }))}
            style={{ accentColor: '#E8713A' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <span style={{ fontFamily: 'Outfit', fontSize: 11, color: '#8C8C8C' }}>₦500</span>
            <span style={{ fontFamily: 'Outfit', fontSize: 11, color: '#8C8C8C' }}>₦8,000</span>
          </div>
        </Section>

        {/* Calories slider */}
        <Section label="Max Calories" value={local.calories > 0 ? `${local.calories} kcal` : 'Any'}>
          <input
            type="range" min="200" max="1000" step="50"
            value={local.calories || 1000}
            onChange={e => setLocal(p => ({ ...p, calories: Number(e.target.value) }))}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <span style={{ fontFamily: 'Outfit', fontSize: 11, color: '#8C8C8C' }}>200 kcal</span>
            <span style={{ fontFamily: 'Outfit', fontSize: 11, color: '#8C8C8C' }}>1,000 kcal</span>
          </div>
        </Section>

        {/* Categories */}
        <Section label="Category">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`tag ${local.categories.includes(cat) ? 'active' : ''}`}
                onClick={() => toggleItem('categories', cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </Section>

        {/* Moods */}
        <Section label="Mood / Craving">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {MOODS.map(mood => (
              <button
                key={mood}
                className={`tag ${local.moods.includes(mood) ? 'active' : ''}`}
                onClick={() => toggleItem('moods', mood)}
              >
                {mood}
              </button>
            ))}
          </div>
        </Section>

        {/* Apply */}
        <button className="btn-primary" onClick={() => onApply(local)} style={{ marginTop: 8 }}>
          Show meals
        </button>
      </div>
    </>
  )
}

function Section({ label, value, children }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
        <p style={{ fontFamily: 'Outfit', fontSize: 14, fontWeight: 600, color: '#1A1A1A', letterSpacing: 0.2 }}>
          {label}
        </p>
        {value && (
          <span style={{ fontFamily: 'Outfit', fontSize: 13, fontWeight: 600, color: '#E8713A' }}>{value}</span>
        )}
      </div>
      {children}
    </div>
  )
}
