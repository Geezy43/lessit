import { useState } from 'react'
import { CATEGORIES } from '../data/meals'

export default function SettingsScreen({ settings, onSave }) {
  const [local, setLocal] = useState({ ...settings })
  const [saved, setSaved] = useState(false)

  const save = () => {
    onSave(local)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const toggleCategory = (cat) => {
    setLocal(prev => ({
      ...prev,
      preferredCategories: prev.preferredCategories.includes(cat)
        ? prev.preferredCategories.filter(c => c !== cat)
        : [...prev.preferredCategories, cat],
    }))
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '0 0 40px' }}>
      {/* Header */}
      <div style={{ padding: '20px 24px 8px' }}>
        <h1 style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 24, color: '#1A1A1A' }}>
          Settings
        </h1>
      </div>

      <div style={{ padding: '16px 16px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Profile */}
        <Card title="Profile">
          <Label>Display name</Label>
          <input
            value={local.name}
            onChange={e => setLocal(p => ({ ...p, name: e.target.value }))}
            placeholder="What should we call you?"
            style={inputStyle}
          />
        </Card>

        {/* Budget */}
        <Card title="Default Budget">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <Label>Max spend per meal</Label>
            <span style={{ fontFamily: 'Outfit', fontSize: 14, fontWeight: 600, color: '#E8713A' }}>
              ₦{local.defaultBudget.toLocaleString()}
            </span>
          </div>
          <input
            type="range" min="500" max="10000" step="500"
            value={local.defaultBudget}
            onChange={e => setLocal(p => ({ ...p, defaultBudget: Number(e.target.value) }))}
          />
        </Card>

        {/* Calories */}
        <Card title="Calorie Tracking">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <Label>Watching calories?</Label>
              <p style={{ fontFamily: 'Outfit', fontSize: 12, color: '#8C8C8C', marginTop: 2 }}>
                Show calorie filter by default
              </p>
            </div>
            <Toggle
              on={local.watchingCalories}
              onChange={v => setLocal(p => ({ ...p, watchingCalories: v }))}
            />
          </div>

          {local.watchingCalories && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Label>Daily calorie target</Label>
                <span style={{ fontFamily: 'Outfit', fontSize: 14, fontWeight: 600, color: '#E8713A' }}>
                  {local.calorieTarget} kcal
                </span>
              </div>
              <input
                type="range" min="1200" max="4000" step="100"
                value={local.calorieTarget}
                onChange={e => setLocal(p => ({ ...p, calorieTarget: Number(e.target.value) }))}
              />
            </>
          )}
        </Card>

        {/* Preferred categories */}
        <Card title="Preferred Categories">
          <p style={{ fontFamily: 'Outfit', fontSize: 13, color: '#8C8C8C', marginBottom: 12 }}>
            We'll show these first in your deck.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`tag ${local.preferredCategories.includes(cat) ? 'active' : ''}`}
                onClick={() => toggleCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </Card>

        {/* Save */}
        <button className="btn-primary" onClick={save} style={{ marginTop: 4 }}>
          {saved ? '✓ Saved!' : 'Save changes'}
        </button>
      </div>
    </div>
  )
}

function Card({ title, children }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 20, padding: '20px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    }}>
      <p style={{
        fontFamily: 'Outfit', fontSize: 11, fontWeight: 600,
        color: '#8C8C8C', letterSpacing: 0.8, textTransform: 'uppercase',
        marginBottom: 16,
      }}>
        {title}
      </p>
      {children}
    </div>
  )
}

function Label({ children }) {
  return (
    <p style={{ fontFamily: 'Outfit', fontSize: 14, fontWeight: 500, color: '#1A1A1A', marginBottom: 8 }}>
      {children}
    </p>
  )
}

const inputStyle = {
  width: '100%',
  padding: '12px 16px',
  borderRadius: 12,
  border: '1.5px solid #E8E0D8',
  fontFamily: 'Outfit',
  fontSize: 15,
  color: '#1A1A1A',
  background: '#FEFAF6',
  outline: 'none',
}

function Toggle({ on, onChange }) {
  return (
    <div
      onClick={() => onChange(!on)}
      style={{
        width: 48, height: 28, borderRadius: 14,
        background: on ? '#E8713A' : '#E8E0D8',
        position: 'relative', cursor: 'pointer',
        transition: 'background 0.2s',
        flexShrink: 0,
      }}
    >
      <div style={{
        position: 'absolute', top: 3,
        left: on ? 23 : 3,
        width: 22, height: 22, borderRadius: '50%',
        background: '#fff',
        boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
        transition: 'left 0.2s',
      }} />
    </div>
  )
}
