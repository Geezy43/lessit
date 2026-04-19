const tabs = [
  { id: 'home',     label: 'Swipe',    icon: SwipeIcon    },
  { id: 'picks',    label: 'My Picks', icon: PicksIcon    },
  { id: 'history',  label: 'History',  icon: HistoryIcon  },
  { id: 'settings', label: 'You',      icon: PersonIcon   },
]

export default function BottomNav({ active, onNavigate }) {
  return (
    <nav style={{
      height: 'var(--nav-height)',
      background: 'var(--surface)',
      borderTop: '1px solid #F0EBE3',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      flexShrink: 0,
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      {tabs.map(({ id, label, icon: Icon }) => {
        const isActive = active === id
        return (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px 0',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <Icon active={isActive} />
            <span style={{
              fontFamily: 'Outfit',
              fontSize: 10,
              fontWeight: isActive ? 600 : 400,
              color: isActive ? 'var(--primary)' : 'var(--text-muted)',
              letterSpacing: 0.2,
            }}>
              {label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}

function SwipeIcon({ active }) {
  const c = active ? 'var(--primary)' : 'var(--text-muted)'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="3" width="16" height="18" rx="3"
        fill={active ? 'var(--secondary)' : 'none'}
        stroke={c} strokeWidth="1.8" />
      <path d="M9 8h6M9 12h6M9 16h3" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function PicksIcon({ active }) {
  const c = active ? 'var(--primary)' : 'var(--text-muted)'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        fill={active ? 'var(--secondary)' : 'none'}
        stroke={c} strokeWidth="1.8" />
    </svg>
  )
}

function HistoryIcon({ active }) {
  const c = active ? 'var(--primary)' : 'var(--text-muted)'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke={c} strokeWidth="1.8" />
      <path d="M12 7v5l3 3" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function PersonIcon({ active }) {
  const c = active ? 'var(--primary)' : 'var(--text-muted)'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke={c} strokeWidth="1.8" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}
