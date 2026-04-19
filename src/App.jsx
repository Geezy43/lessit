import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { meals as allMeals, filterMeals, shuffleMeals } from './data/meals'
import SwipeCard from './components/SwipeCard'
import MealDetail from './components/MealDetail'
import FilterSheet from './components/FilterSheet'
import HistoryScreen from './components/HistoryScreen'
import SettingsScreen from './components/SettingsScreen'
import MyPicksScreen from './components/MyPicksScreen'
import EndOfSession from './components/EndOfSession'
import BurbToast from './components/BurbToast'
import BottomNav from './components/BottomNav'
import Onboarding from './components/Onboarding'

const SESSION_SIZE = 15

const DEFAULT_SETTINGS = {
  name: '',
  budgetMin: 0,
  budgetMax: 99999,
  defaultBudget: 99999,
  preferredCategories: [],
  watchingCalories: false,
  calorieTarget: 2000,
}

const DEFAULT_FILTERS = { budget: 0, calories: 0, categories: [], moods: [] }

function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback }
  catch { return fallback }
}

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

export default function App() {
  const [onboarded, setOnboarded]     = useState(() => load('lessit_onboarded', false))
  const [settings, setSettings]       = useState(() => load('lessit_settings', DEFAULT_SETTINGS))
  const [history, setHistory]         = useState(() => load('lessit_history', []))
  const [filters, setFilters]         = useState(DEFAULT_FILTERS)

  const [tab, setTab]                 = useState('home')
  const [showFilter, setShowFilter]   = useState(false)
  const [selectedMeal, setSelectedMeal] = useState(null)

  // Deck
  const [deck, setDeck]               = useState([])
  const [seenIds, setSeenIds]         = useState(new Set())
  const [deckIndex, setDeckIndex]     = useState(0)
  const [picks, setPicks]             = useState([])
  const [swipeHistory, setSwipeHistory] = useState([]) // for undo
  const [sessionDone, setSessionDone] = useState(false)

  // Burb chip (first card only)
  const [burbChipDismissed, setBurbChipDismissed] = useState(() => load('lessit_burb_chip_done', false))

  // Streak toasts
  const [toast, setToast]             = useState(null)
  const nahStreak                     = useRef(0)
  const yumStreak                     = useRef(0)

  // Session persistence — next-day prompt
  const [showDayPrompt, setShowDayPrompt] = useState(false)
  const lastSessionDate = load('lessit_last_session_date', null)

  // Persist
  useEffect(() => { localStorage.setItem('lessit_history', JSON.stringify(history)) }, [history])
  useEffect(() => { localStorage.setItem('lessit_settings', JSON.stringify(settings)) }, [settings])
  useEffect(() => { localStorage.setItem('lessit_onboarded', JSON.stringify(onboarded)) }, [onboarded])
  useEffect(() => { localStorage.setItem('lessit_burb_chip_done', JSON.stringify(burbChipDismissed)) }, [burbChipDismissed])

  // Show next-day prompt if returning the following day
  useEffect(() => {
    if (onboarded && lastSessionDate && lastSessionDate !== todayStr()) {
      setShowDayPrompt(true)
    }
  }, [onboarded])

  // Build deck
  const buildDeck = useCallback((excludeIds = new Set()) => {
    const filtered = filterMeals(allMeals, {
      ...filters,
      budget: filters.budget || settings.defaultBudget || 0,
    })
    const unseen = filtered.filter(m => !excludeIds.has(m.id))
    const pool = unseen.length >= SESSION_SIZE ? unseen : filtered // fallback if too few unseen
    const preferred = pool.filter(m => settings.preferredCategories.includes(m.category))
    const rest = pool.filter(m => !settings.preferredCategories.includes(m.category))
    return [...shuffleMeals(preferred), ...shuffleMeals(rest)].slice(0, SESSION_SIZE * 2) // buffer
  }, [filters, settings.defaultBudget, settings.preferredCategories])

  useEffect(() => {
    setDeck(buildDeck(new Set()))
    setDeckIndex(0)
    setPicks([])
    setSwipeHistory([])
    setSessionDone(false)
  }, [filters, settings.defaultBudget, settings.preferredCategories])

  const visibleCards = useMemo(() => {
    if (deck.length === 0) return []
    return deck.slice(deckIndex, deckIndex + 3)
  }, [deck, deckIndex])

  const swipeCount = deckIndex // how many swipes done this session

  const handleSwipe = useCallback((direction, meal) => {
    // Dismiss Burb chip after first swipe
    if (!burbChipDismissed) setBurbChipDismissed(true)

    // Track for undo
    setSwipeHistory(prev => [...prev, { direction, meal, index: deckIndex }])

    if (direction === 'right') {
      setPicks(prev => [...prev, meal])
      nahStreak.current = 0
      yumStreak.current += 1
      if (yumStreak.current === 3) {
        setToast("You're hungry hungry. Noted 😋")
        yumStreak.current = 0
      }
    } else {
      yumStreak.current = 0
      nahStreak.current += 1
      if (nahStreak.current === 3) {
        setToast('Picky today? No judgment 😏')
        nahStreak.current = 0
      }
    }

    const nextIndex = deckIndex + 1
    // Track seen meal
    setSeenIds(prev => new Set([...prev, meal.id]))

    if (nextIndex >= SESSION_SIZE || nextIndex >= deck.length) {
      setSessionDone(true)
      localStorage.setItem('lessit_last_session_date', todayStr())
    } else {
      setDeckIndex(nextIndex)
    }
  }, [deckIndex, deck.length, burbChipDismissed])

  const handleUndo = useCallback(() => {
    if (swipeHistory.length === 0) return
    const last = swipeHistory[swipeHistory.length - 1]
    setSwipeHistory(prev => prev.slice(0, -1))
    setDeckIndex(last.index)
    if (last.direction === 'right') {
      setPicks(prev => prev.filter((_, i) => i !== prev.length - 1))
    }
    setSessionDone(false)
  }, [swipeHistory])

  const handleConfirm = useCallback((meal) => {
    const entry = { meal, date: new Date().toISOString(), type: 'solo' }
    setHistory(prev => [...prev, entry])
    setSelectedMeal(null)
    setTab('history')
  }, [])

  const handleSwipeAgain = useCallback(() => {
    const newDeck = buildDeck(seenIds)
    setDeck(newDeck)
    setDeckIndex(0)
    setPicks([])
    setSwipeHistory([])
    setSessionDone(false)
    nahStreak.current = 0
    yumStreak.current = 0
  }, [buildDeck, seenIds])

  const handleOnboardingComplete = useCallback((data) => {
    setSettings({ ...DEFAULT_SETTINGS, ...data })
    setOnboarded(true)
    localStorage.setItem('lessit_last_session_date', todayStr())
  }, [])

  // ── Onboarding ──────────────────────────────────────────────────────────────
  if (!onboarded) {
    return (
      <div className="app-shell">
        <Onboarding onComplete={handleOnboardingComplete} />
      </div>
    )
  }

  // ── Main app ────────────────────────────────────────────────────────────────
  return (
    <div className="app-shell">

      {/* Next-day prompt */}
      {showDayPrompt && (
        <DayPrompt
          onFresh={() => { setShowDayPrompt(false); handleSwipeAgain() }}
          onYesterday={() => { setShowDayPrompt(false); setTab('picks') }}
        />
      )}

      {/* Tab content */}
      {tab === 'home' && !sessionDone && (
        <HomeScreen
          meals={visibleCards}
          deckIndex={deckIndex}
          filters={filters}
          onSwipe={handleSwipe}
          onTap={setSelectedMeal}
          onFilterOpen={() => setShowFilter(true)}
          onUndo={handleUndo}
          canUndo={swipeHistory.length > 0}
          settings={settings}
          deckEmpty={deck.length === 0}
          showBurbChip={!burbChipDismissed}
        />
      )}

      {tab === 'home' && sessionDone && (
        <EndOfSession
          picks={picks}
          onSwipeAgain={handleSwipeAgain}
          onConfirm={handleConfirm}
        />
      )}

      {tab === 'picks' && (
        <MyPicksScreen picks={picks} onConfirm={handleConfirm} />
      )}

      {tab === 'history' && (
        <HistoryScreen
          history={history}
          onPickAgain={(meal) => { setSelectedMeal(meal); setTab('home') }}
        />
      )}

      {tab === 'settings' && (
        <SettingsScreen
          settings={settings}
          onSave={setSettings}
          onReset={() => { localStorage.clear(); window.location.reload() }}
        />
      )}

      <BottomNav active={tab} onNavigate={setTab} />

      {/* Overlays */}
      {showFilter && (
        <FilterSheet
          filters={filters}
          onApply={(f) => { setFilters(f); setShowFilter(false) }}
          onClose={() => setShowFilter(false)}
        />
      )}
      {selectedMeal && (
        <MealDetail
          meal={selectedMeal}
          onClose={() => setSelectedMeal(null)}
          onConfirm={handleConfirm}
        />
      )}

      {/* Burb streak toast */}
      <BurbToast message={toast} onDone={() => setToast(null)} />
    </div>
  )
}

// ── Home Screen ──────────────────────────────────────────────────────────────

function HomeScreen({ meals, deckIndex, filters, onSwipe, onTap, onFilterOpen, onUndo, canUndo, settings, deckEmpty, showBurbChip }) {
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
        <Logo />
        <div style={{ display: 'flex', gap: 8 }}>
          {/* Undo */}
          {canUndo && (
            <button onClick={onUndo} style={{
              width: 44, height: 44, borderRadius: 14,
              background: '#fff', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M9 14L4 9l5-5" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4 9h10.5a5.5 5.5 0 000-11H11" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          )}
          {/* Filter */}
          <button onClick={onFilterOpen} style={{
            position: 'relative',
            width: 44, height: 44, borderRadius: 14,
            background: activeFilterCount > 0 ? '#E8713A' : '#fff',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
          }}>
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

      {/* Progress bar */}
      <div style={{ padding: '0 24px 8px', flexShrink: 0 }}>
        <div style={{ height: 3, background: '#F0EBE3', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 2,
            background: '#E8713A',
            width: `${(deckIndex / SESSION_SIZE) * 100}%`,
            transition: 'width 0.3s ease',
          }} />
        </div>
        <p style={{ fontFamily: 'Outfit', fontSize: 11, color: '#8C8C8C', marginTop: 4 }}>
          {deckIndex} of {SESSION_SIZE}
        </p>
      </div>

      {/* Card stack */}
      <div style={{ flex: 1, position: 'relative', padding: '0 16px', minHeight: 0 }}>
        {deckEmpty ? (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32,
            textAlign: 'center',
          }}>
            <span style={{ fontSize: 48 }}>😢</span>
            <p style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 16, color: '#1A1A1A' }}>
              Your filters are too strict. Even I can't work with this.
            </p>
            <button className="btn-secondary" onClick={() => {}}>Loosen filters</button>
          </div>
        ) : (
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
                showBurbChip={showBurbChip && stackIndex === 0}
              />
            )
          })
        )}
      </div>

      {/* Swipe hint */}
      {meals.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 40, padding: '8px 0', flexShrink: 0 }}>
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

      <div style={{ height: 8, flexShrink: 0 }} />
    </div>
  )
}

// ── Day prompt ───────────────────────────────────────────────────────────────
function DayPrompt({ onFresh, onYesterday }) {
  return (
    <>
      <div className="backdrop" style={{ zIndex: 80 }} />
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 90,
        background: '#fff', borderRadius: '24px 24px 0 0',
        padding: '24px 24px 48px',
        animation: 'slideUp 0.35s cubic-bezier(0.16,1,0.3,1)',
        display: 'flex', flexDirection: 'column', gap: 20,
      }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: '#E8E0D8' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: 'linear-gradient(135deg, #E8713A, #F5A07A)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0,
          }}>🍽️</div>
          <div>
            <p style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 16, color: '#1A1A1A' }}>
              New day, new cravings?
            </p>
            <p style={{ fontFamily: 'Outfit', fontSize: 13, color: '#8C8C8C', marginTop: 2 }}>
              Your last session was yesterday.
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button className="btn-primary" onClick={onFresh}>Start fresh</button>
          <button className="btn-secondary" onClick={onYesterday}>See yesterday's picks</button>
        </div>
      </div>
    </>
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
      <span style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 22, color: '#1A1A1A' }}>
        Lessit
      </span>
    </div>
  )
}
