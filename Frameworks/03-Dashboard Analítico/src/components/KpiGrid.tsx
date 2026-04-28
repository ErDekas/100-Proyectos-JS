import type { KpiMetric } from '../data/mock'

export function KpiGrid({ kpis }: { kpis: KpiMetric[] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
      {kpis.map(k => <KpiCard key={k.label} metric={k} />)}
    </div>
  )
}

function KpiCard({ metric }: { metric: KpiMetric }) {
  return (
    <div className={`kpi-card ${metric.accent}`}>
      <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--ink3)', letterSpacing: '.5px', textTransform: 'uppercase', fontFamily: 'DM Mono, monospace', marginBottom: 8 }}>
        {metric.label}
      </div>
      <div style={{ fontSize: 26, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-1px', fontFamily: 'DM Mono, monospace', marginBottom: 6 }}>
        {metric.value}
      </div>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        <span style={{ fontSize: 11, fontWeight: 500, fontFamily: 'DM Mono, monospace', color: metric.positive ? 'var(--green)' : 'var(--red)' }}>
          {metric.delta}
        </span>
        <span style={{ fontSize: 11, color: 'var(--ink3)', marginLeft: 4 }}>vs mes ant.</span>
      </div>
    </div>
  )
}
