import type { KpiMetric } from '@analytiq/shared'

export function KpiGrid({ kpis }: { kpis: KpiMetric[] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
      {kpis.map(k => (
        <div key={k.label} className={`kpi-card ${k.accent}`}>
          <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--ink3)', letterSpacing: '.5px', textTransform: 'uppercase', fontFamily: 'DM Mono, monospace', marginBottom: 8 }}>{k.label}</div>
          <div style={{ fontSize: 26, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-1px', fontFamily: 'DM Mono, monospace', marginBottom: 6 }}>{k.value}</div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 500, fontFamily: 'DM Mono, monospace', color: k.positive ? 'var(--green)' : 'var(--red)' }}>{k.delta}</span>
            <span style={{ fontSize: 11, color: 'var(--ink3)', marginLeft: 4 }}>vs período ant.</span>
          </div>
        </div>
      ))}
    </div>
  )
}
