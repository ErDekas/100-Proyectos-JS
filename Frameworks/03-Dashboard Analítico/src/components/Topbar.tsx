import { useDashboardStore, type Period } from '../store/dashboard'
import { clsx } from 'clsx'

const PERIODS: Period[] = ['7d', '30d', '90d', '1y']

export function Topbar() {
  const { period, setPeriod } = useDashboardStore()

  return (
    <div style={{
      background: 'var(--surf)', borderBottom: '0.5px solid var(--border2)',
      padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink)', flex: 1, letterSpacing: '-0.3px' }}>
        Overview
      </span>

      <div style={{ display: 'flex', gap: 4 }}>
        {PERIODS.map(p => (
          <button
            key={p}
            className={clsx('period-pill', { active: period === p })}
            onClick={() => setPeriod(p)}
          >
            {p}
          </button>
        ))}
      </div>

      <button
        style={{
          padding: '6px 13px', borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: 'pointer',
          border: '0.5px solid var(--border2)', background: 'var(--surf)', color: 'var(--ink2)',
          fontFamily: 'Sora, sans-serif', display: 'flex', alignItems: 'center', gap: 5,
        }}
        onClick={() => window.location.reload()}
      >
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width={13} height={13}>
          <path d="M14 8A6 6 0 1 1 8 2"/><polyline points="11,1 14,2 13,5"/>
        </svg>
        Actualizar
      </button>
    </div>
  )
}
