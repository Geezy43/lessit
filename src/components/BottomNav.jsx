const tabs = [
  { id: 'home',     label: 'Home',    icon: HomeIcon    },
  { id: 'history',  label: 'History', icon: HistoryIcon },
  { id: 'settings', label: 'You',     icon: PersonIcon  },
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
              fontSize: 11,
              fontWeight: isActive ? 600 : 400,
              color: isActive ? 'var(--primary)' : 'var(--text-muted)',
              letterSpacing: 0.3,
            }}>
              {label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}

function HomeIcon({ active }) {
  const c = active ? 'var(--primary)' : 'var(--text-muted)'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M3 9.5L12 3l9 6.5V21a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z"
        fill={active ? 'var(--secondary)' : 'none'}
        stroke={c} strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9 21V12h6v9" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
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
