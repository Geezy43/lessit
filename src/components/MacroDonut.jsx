export default function MacroDonut({ macros, calories, size = 100 }) {
  const proteinCal = macros.protein * 4
  const carbsCal   = macros.carbs   * 4
  const fatCal     = macros.fat     * 9
  const total      = proteinCal + carbsCal + fatCal || 1

  const proteinPct = (proteinCal / total) * 100
  const carbsPct   = (carbsCal   / total) * 100
  const fatPct     = (fatCal     / total) * 100

  const r = 38
  const circumference = 2 * Math.PI * r
  const gap = 2

  const proteinDash = (proteinPct / 100) * circumference - gap
  const carbsDash   = (carbsPct   / 100) * circumference - gap
  const fatDash     = (fatPct     / 100) * circumference - gap

  const proteinOffset = 0
  const carbsOffset   = -(proteinDash + gap)
  const fatOffset     = -(proteinDash + gap + carbsDash + gap)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <svg width={size} height={size} viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#F5E6D3" strokeWidth="10" />
        {proteinDash > 0 && (
          <circle
            cx="50" cy="50" r={r} fill="none"
            stroke="#E8713A" strokeWidth="10"
            strokeDasharray={`${proteinDash} ${circumference}`}
            strokeDashoffset={proteinOffset}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
          />
        )}
        {carbsDash > 0 && (
          <circle
            cx="50" cy="50" r={r} fill="none"
            stroke="#D4A574" strokeWidth="10"
            strokeDasharray={`${carbsDash} ${circumference}`}
            strokeDashoffset={carbsOffset}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
          />
        )}
        {fatDash > 0 && (
          <circle
            cx="50" cy="50" r={r} fill="none"
            stroke="#8C8C8C" strokeWidth="10"
            strokeDasharray={`${fatDash} ${circumference}`}
            strokeDashoffset={fatOffset}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
          />
        )}
        <text x="50" y="46" textAnchor="middle" fontFamily="Outfit" fontWeight="600" fontSize="14" fill="#1A1A1A">
          {calories}
        </text>
        <text x="50" y="60" textAnchor="middle" fontFamily="Outfit" fontWeight="400" fontSize="9" fill="#8C8C8C">
          kcal
        </text>
      </svg>

      <div style={{ display: 'flex', gap: 16 }}>
        {[
          { label: 'Protein', val: macros.protein, color: '#E8713A' },
          { label: 'Carbs',   val: macros.carbs,   color: '#D4A574' },
          { label: 'Fat',     val: macros.fat,      color: '#8C8C8C' },
        ].map(({ label, val, color }) => (
          <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
              <span style={{ fontFamily: 'Outfit', fontSize: 11, color: '#8C8C8C', fontWeight: 500 }}>{label}</span>
            </div>
            <span style={{ fontFamily: 'Outfit', fontSize: 13, color: '#1A1A1A', fontWeight: 600 }}>{val}g</span>
          </div>
        ))}
      </div>
    </div>
  )
}
