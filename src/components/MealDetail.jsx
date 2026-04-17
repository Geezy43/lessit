import { useState } from 'react'
import MacroDonut from './MacroDonut'

export default function MealDetail({ meal, onClose, onConfirm }) {
  const [imgLoaded, setImgLoaded] = useState(false)
  const [imgError, setImgError] = useState(false)

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 80,
      background: 'var(--bg)',
      display: 'flex', flexDirection: 'column',
      animation: 'slideUp 0.35s cubic-bezier(0.16,1,0.3,1)',
      overflowY: 'auto',
    }}>
      {/* Hero */}
      <div style={{
        height: 300,
        background: `linear-gradient(160deg, ${meal.colors.from} 0%, ${meal.colors.to} 100%)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', flexShrink: 0, overflow: 'hidden',
      }}>
        {/* Real photo */}
        {!imgError && (
          <img
            src={meal.image}
            alt={meal.name}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              objectFit: 'cover',
              opacity: imgLoaded ? 1 : 0,
              transition: 'opacity 0.4s ease',
            }}
          />
        )}
        {/* Gradient overlay so text remains readable */}
        {imgLoaded && !imgError && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.5) 100%)',
          }} />
        )}
        {/* Emoji fallback while loading or on error */}
        {(!imgLoaded || imgError) && (
          <span style={{ fontSize: 110, filter: 'drop-shadow(0 6px 16px rgba(0,0,0,0.2))', position: 'relative', zIndex: 1 }}>
            {meal.emoji}
          </span>
        )}

        {/* Back button */}
        <button onClick={onClose} style={{
          position: 'absolute', top: 16, left: 16,
          width: 40, height: 40, borderRadius: '50%',
          background: 'rgba(255,255,255,0.25)',
          backdropFilter: 'blur(8px)',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 5l-7 7 7 7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Category badge */}
        <div style={{
          position: 'absolute', bottom: 16, left: 16,
          background: 'rgba(255,255,255,0.22)', backdropFilter: 'blur(8px)',
          borderRadius: 100, padding: '5px 14px',
        }}>
          <span style={{ fontFamily: 'Outfit', fontSize: 12, fontWeight: 600, color: '#fff', letterSpacing: 0.5, textTransform: 'uppercase' }}>
            {meal.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '24px 24px 120px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Title row */}
        <div>
          <h1 style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 26, color: '#1A1A1A', marginBottom: 8 }}>
            {meal.name}
          </h1>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {meal.moods.map(m => (
              <span key={m} className="tag" style={{ fontSize: 12 }}>{m}</span>
            ))}
          </div>
        </div>

        {/* Price */}
        <div style={{
          background: '#fff', borderRadius: 16, padding: '16px 20px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        }}>
          <div>
            <p style={{ fontFamily: 'Outfit', fontSize: 12, color: '#8C8C8C', fontWeight: 500, marginBottom: 4 }}>PRICE RANGE</p>
            <p style={{ fontFamily: 'Outfit', fontSize: 22, fontWeight: 600, color: '#E8713A' }}>
              ₦{meal.priceMin.toLocaleString()} – ₦{meal.priceMax.toLocaleString()}
            </p>
          </div>
          <span style={{ fontSize: 32 }}>💰</span>
        </div>

        {/* Macros */}
        <div style={{
          background: '#fff', borderRadius: 16, padding: '20px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
        }}>
          <p style={{ fontFamily: 'Outfit', fontSize: 12, fontWeight: 600, color: '#8C8C8C', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 8 }}>
            Nutrition
          </p>
          <MacroDonut macros={meal.macros} calories={meal.calories} size={120} />
        </div>

        {/* Ingredients */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <p style={{ fontFamily: 'Outfit', fontSize: 12, fontWeight: 600, color: '#8C8C8C', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 12 }}>
            Key Ingredients
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {meal.ingredients.map(ing => (
              <span key={ing} style={{
                fontFamily: 'Outfit', fontSize: 13, fontWeight: 500,
                background: '#F5E6D3', color: '#2D2D2D',
                borderRadius: 100, padding: '6px 14px',
              }}>
                {ing}
              </span>
            ))}
          </div>
        </div>

        {/* Where to find */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <p style={{ fontFamily: 'Outfit', fontSize: 12, fontWeight: 600, color: '#8C8C8C', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 12 }}>
            Where to Find It
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {meal.whereToFind.map(place => (
              <div key={place} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 16 }}>📍</span>
                <span style={{ fontFamily: 'Outfit', fontSize: 14, color: '#1A1A1A' }}>{place}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <p style={{ fontFamily: 'Outfit', fontSize: 11, color: '#8C8C8C', textAlign: 'center', lineHeight: 1.6 }}>
          * Calorie estimates are approximate. Actual values may vary by portion size and preparation method.
        </p>
      </div>

      {/* CTA */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '16px 24px 32px',
        background: 'linear-gradient(to top, var(--bg) 70%, transparent)',
      }}>
        <button className="btn-primary" onClick={() => onConfirm(meal)}>
          This is it 🎉
        </button>
      </div>
    </div>
  )
}
