import { useState, useEffect, useCallback, useMemo } from 'react'
import { meals as allMeals, filterMeals, shuffleMeals } from './data/meals'
import SwipeCard from './components/SwipeCard'
import MealDetail from './components/MealDetail'
import MatchScreen from './components/MatchScreen'
import FilterSheet from './components/FilterSheet'
import HistoryScreen from './components/HistoryScreen'
import SettingsScreen from './components/SettingsScreen'
import BottomNav from './components/BottomNav'
import Onboarding from './components/Onboarding'
import { PairedSessionOverlay } from './components/PairedSession'

const DEFAULT_SETTINGS = {
  name: '',
  defaultBudget: 3000,
  calorieTarget: 2000,
  watchingCalories: false,
  preferredCategories: [],
}

const DEFAULT_FILTERS = { budget: 0, calories: 0, categories: [], moods: [] }

function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback }
  catch { return fallback }
}

export default function App() {
  const [onboarded, setOnboarded]   = useState(() => load('lessit_onboarded', false))
  const [settings, setSettings]     = useState(() => load('lessit_settings', DEFAULT_SETTINGS))
  const [history, setHistory]       = useState(() => load('lessit_history', []))
  const [filters, setFilters]       = useState(DEFAULT_FILTERS)

  const [tab, setTab]               = useState('home')
  const [showFilter, setShowFilter] = useState(false)
  const [selectedMeal, setSelectedMeal] = useState(null)
  const [matchedMeal, setMatchedMeal]   = useState(null)

  const [deck, setDeck]             = useState([])
  const [deckIndex, setDeckIndex]   = useState(0)
  const [picks, setPicks]           = useState([])
  const [rightSwipeCount, setRightSwipeCount] = useState(0)
  const [showPaired, setShowPaired] = useState(false)

  // Persist history & settings
  useEffect(() => { localStorage.setItem('lessit_history', JSON.stringify(history)) }, [history])
  useEffect(() => { localStorage.setItem('lessit_settings', JSON.stringify(settings)) }, [settings])
  useEffect(() => { localStorage.setItem('lessit_onboarded', JSON.stringify(onboarded)) }, [onboarded])

  // Build deck whenever filters change
  useEffect(() => {
    const filtered = filterMeals(allMeals, {
      ...filters,
      budget: filters.budget || settings.defaultBudget || 0,
    })

    // Put preferred categories first
    const preferred = filtered.filter(m => settings.preferredCategories.includes(m.category))
    const rest = filtered.filter(m => !settings.preferredCategories.includes(m.category))
    setDeck([...shuffleMeals(preferred), ...shuffleMeals(rest)])
    setDeckIndex(0)
    setPicks([])
    setRightSwipeCount(0)
  }, [filters, settings.defaultBudget, settings.preferredCategories])

  const visibleCards = useMemo(() => {
    if (deck.length === 0) return []
    return deck.slice(deckIndex, deckIndex + 3)
  }, [deck, deckIndex])

  const handleSwipe = useCallback((direction, meal) => {
    if (direction === 'right') {
      setPicks(prev => [...prev, meal])
      const newCount = rightSwipeCount + 1
      setRightSwipeCount(newCount)
      if (newCount % 3 === 0) {
        setTimeout(() => setMatchedMeal(meal), 100)
      }
    }
    setDeckIndex(prev => {
      const next = prev + 1
      if (next >= deck.length) {
        // Reshuffle
        setDeck(d => shuffleMeals(d))
        return 0
      }
      return next
    })
  }, [rightSwipeCount, deck.length])

  const handleConfirm = useCallback((meal) => {
    const entry = { meal, date: new Date().toISOString(), type: 'solo' }
    setHistory(prev => [...prev, entry])
    setMatchedMeal(null)
    setSelectedMeal(null)
    setTab('history')
  }, [])

  const handlePickAgain = useCallback((meal) => {
    setSelectedMeal(meal)
    setTab('home')
  }, [])

  const handleOnboardingComplete = useCallback((data) => {
    setSettings({ ...DEFAULT_SETTINGS, ...data })
    setOnboarded(true)
  }, [])

  const handleSaveSettings = useCallback((s) => {
    setSettings(s)
  }, [])

  const handleApplyFilters = useCallback((f) => {
    setFilters(f)
    setShowFilter(false)
  }, [])

  if (!onboarded) {
    return (
      <div className="app-shell">
        {/* Splash header */}
        <div style={{
          padding: '24px 24px 0',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Logo />
        </div>
        <Onboarding onComplete={handleOnboardingComplete} />
      </div>
    )
  }

  return (
    <div className="app-shell">
      {/* Main tab content */}
      {tab === 'home' && (
        <HomeScreen
          meals={visibleCards}
          picks={picks}
          filters={filters}
          onSwipe={handleSwipe}
          onTap={setSelectedMeal}
          onFilterOpen={() => setShowFilter(true)}
          onDecideTogether={() => setShowPaired(true)}
          settings={settings}
          deckEmpty={deck.length === 0}
        />
      )}
      {tab === 'history' && (
        <HistoryScreen history={history} onPickAgain={handlePickAgain} />
      )}
      {tab === 'settings' && (
        <SettingsScreen settings={settings} onSave={handleSaveSettings} />
      )}

      <BottomNav active={tab} onNavigate={setTab} />

      {/* Overlays */}
      {showFilter && (
        <FilterSheet filters={filters} onApply={handleApplyFilters} onClose={() => setShowFilter(false)} />
      )}
      {selectedMeal && (
        <MealDetail meal={selectedMeal} onClose={() => setSelectedMeal(null)} onConfirm={handleConfirm} />
      )}
      {matchedMeal && (
        <MatchScreen meal={matchedMeal} onConfirm={handleConfirm} onClose={() => setMatchedMeal(null)} />
      )}
      {showPaired && (
        <PairedSessionOverlay
          meals={deck}
          onMatch={(meal) => { setMatchedMeal(meal); setShowPaired(false) }}
          onClose={() => setShowPaired(false)}
        />
      )}
    </div>
  )
}

// ── Home Screen ─────────────────────────────────────────────────────────────

function HomeScreen({ meals, picks, filters, onSwipe, onTap, onFilterOpen, onDecideTogether, settings, deckEmpty }) {
  const activeFilterCount = (filters.budget > 0 ? 1 : 0) +
    (filters.calories > 0 ? 1 : 0) +
    filters.categories.length + filters.moods.length

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        padding: '20px 24px 12px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexShrink: 0,
      }}>
        <div>
          <Logo />
          <p style={{ fontFamily: 'Outfit', fontSize: 13, color: '#8C8C8C', marginTop: 2 }}>
            {settings.name ? `Hey ${settings.name} 👋` : 'What are we eating?'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onDecideTogether}
            style={{
              height: 44, borderRadius: 14,
              background: '#FFF4EE', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6, padding: '0 14px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
            }}
          >
            <span style={{ fontSize: 16 }}>👫</span>
            <span style={{ fontFamily: 'Outfit', fontSize: 13, fontWeight: 600, color: '#E8713A' }}>Together</span>
          </button>
          <button
            onClick={onFilterOpen}
          style={{
            position: 'relative',
            width: 44, height: 44, borderRadius: 14,
            background: activeFilterCount > 0 ? '#E8713A' : '#fff',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M3 6h18M7 12h10M11 18h2"
              stroke={activeFilterCount > 0 ? '#fff' : '#1A1A1A'}
              strokeWidth="2" strokeLinecap="round" />
          </svg>
          {activeFilterCount > 0 && (
            <div style={{
              position: 'absolute', top: -4, right: -4,
              width: 18, height: 18, borderRadius: '50%',
              background: '#fff', border: '2px solid #E8713A',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontFamily: 'Outfit', fontSize: 10, fontWeight: 700, color: '#E8713A' }}>
                {activeFilterCount}
              </span>
            </div>
          )}
          </button>
        </div>
      </div>

      {/* Card stack */}
      <div style={{ flex: 1, position: 'relative', padding: '0 16px', minHeight: 0 }}>
        {deckEmpty ? (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 12,
          }}>
            <span style={{ fontSize: 56 }}>😢</span>
            <h3 style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 18, color: '#1A1A1A' }}>
              No meals match your filters
            </h3>
            <p style={{ fontFamily: 'Outfit', fontSize: 14, color: '#8C8C8C' }}>Try adjusting your filters</p>
          </div>
        ) : meals.length === 0 ? null : (
          [...meals].reverse().map((meal, reversedIdx) => {
            const stackIndex = meals.length - 1 - reversedIdx
            return (
              <SwipeCard
                key={meal.id}
                meal={meal}
                stackIndex={stackIndex}
                isTop={stackIndex === 0}
                onSwipe={onSwipe}
                onTap={onTap}
              />
            )
          })
        )}
      </div>

      {/* Swipe hint */}
      {meals.length > 0 && (
        <div style={{
          display: 'flex', justifyContent: 'center', gap: 32,
          padding: '8px 0', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 18 }}>👈</span>
            <span style={{ fontFamily: 'Outfit', fontSize: 12, color: '#E84040', fontWeight: 500 }}>NAH</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontFamily: 'Outfit', fontSize: 12, color: '#4CAF50', fontWeight: 500 }}>YUM</span>
            <span style={{ fontSize: 18 }}>👉</span>
          </div>
        </div>
      )}

      {/* My Picks */}
      <div style={{ padding: '8px 0 12px', flexShrink: 0 }}>
        <div style={{ padding: '0 24px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <p style={{ fontFamily: 'Outfit', fontSize: 13, fontWeight: 600, color: '#1A1A1A' }}>
            My Picks
          </p>
          <span style={{ fontFamily: 'Outfit', fontSize: 12, color: '#8C8C8C' }}>
            {picks.length} meal{picks.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div style={{
          display: 'flex', gap: 10, overflowX: 'auto',
          padding: '4px 24px',
        }}>
          {picks.length === 0 ? (
            <div style={{
              height: 70, display: 'flex', alignItems: 'center',
              padding: '0 4px',
            }}>
              <p style={{ fontFamily: 'Outfit', fontSize: 13, color: '#8C8C8C' }}>
                Swipe right on meals you like ✨
              </p>
            </div>
          ) : picks.map((meal, i) => (
            <div key={`${meal.id}-${i}`} style={{
              flexShrink: 0,
              width: 70, height: 70,
              borderRadius: 16,
              background: `linear-gradient(160deg, ${meal.colors.from} 0%, ${meal.colors.to} 100%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28,
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            }}>
              {meal.emoji}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Logo ─────────────────────────────────────────────────────────────────────
function Logo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{
        width: 28, height: 28, borderRadius: 8,
        background: 'linear-gradient(135deg, #E8713A 0%, #D4A574 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: 16 }}>🍽️</span>
      </div>
      <span style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 22, color: '#1A1A1A' }}>
        Lessit
      </span>
    </div>
  )
}
