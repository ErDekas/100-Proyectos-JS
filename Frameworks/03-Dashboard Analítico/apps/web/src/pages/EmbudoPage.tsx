import { useState } from 'react'

interface FunnelStep {
  label: string
  count: number
  color: string
  icon: string
}

const DEFAULT_STEPS: FunnelStep[] = [
  { label: 'Visitas',    count: 84210, color: '#2563eb', icon: '👁' },
  { label: 'Registros',  count: 52200, color: '#7c3aed', icon: '📝' },
  { label: 'Checkout',   count: 23580, color: '#d97706', icon: '🛒' },
  { label: 'Compra',     count: 11790, color: '#059669', icon: '💳' },
  { label: 'Recurrente', count:  5100, color: '#dc2626', icon: '🔄' },
]

export function EmbudoPage() {
  const [steps, setSteps] = useState<FunnelStep[]>(DEFAULT_STEPS)
  const [editing, setEditing] = useState<number | null>(null)

  const max = steps[0]?.count || 1

  function updateCount(i: number, val: number) {
    setSteps(s => s.map((step, idx) => idx === i ? { ...step, count: val } : step))
  }

  function updateLabel(i: number, val: string) {
    setSteps(s => s.map((step, idx) => idx === i ? { ...step, label: val } : step))
  }

  function reset() { setSteps(DEFAULT_STEPS) }

  const convRate = steps.length >= 2 ? ((steps[steps.length - 1].count / steps[0].count) * 100).toFixed(2) : '0'
  const dropoffs = steps.slice(1).map((s, i) => ({
    label: `${steps[i].label} → ${s.label}`,
    rate: (((steps[i].count - s.count) / steps[i].count) * 100).toFixed(1),
    lost: steps[i].count - s.count,
  }))

  return (
    <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--ink)', flex: 1, letterSpacing: '-0.4px' }}>Embudo de conversión</h2>
        <button onClick={() => setEditing(editing === null ? 0 : null)}
          style={{ padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: 'pointer', border: '0.5px solid var(--blue)', background: editing !== null ? 'var(--blue)' : 'transparent', color: editing !== null ? '#fff' : 'var(--blue)', fontFamily: 'Sora, sans-serif' }}>
          {editing !== null ? '✓ Guardar' : '✏️ Editar'}
        </button>
        <button onClick={reset}
          style={{ padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: 'pointer', border: '0.5px solid var(--border2)', background: 'transparent', color: 'var(--ink2)', fontFamily: 'Sora, sans-serif' }}>
          Resetear
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>

        {/* Visual funnel */}
        <div className="card">
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 20 }}>Visualización</div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            {steps.map((step, i) => {
              const pct = (step.count / max) * 100
              const width = 40 + pct * 0.6
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                  <div style={{ width: `${width}%`, minWidth: 80, background: step.color, borderRadius: 6, padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'width .4s ease', position: 'relative' }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>{step.icon} {step.label}</span>
                    <span style={{ fontSize: 11, fontFamily: 'DM Mono, monospace', color: 'rgba(255,255,255,.85)', fontWeight: 500 }}>{step.count.toLocaleString('es')}</span>
                  </div>
                  {i < steps.length - 1 && (
                    <div style={{ fontSize: 10, color: 'var(--ink3)', fontFamily: 'DM Mono, monospace', margin: '3px 0' }}>
                      ↓ {dropoffs[i]?.rate}% caída
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Editor */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="card">
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 16 }}>Editar pasos</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {steps.map((step, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: step.color, flexShrink: 0 }} />
                    <input
                      value={step.label}
                      onChange={e => updateLabel(i, e.target.value)}
                      style={{ flex: 1, fontSize: 12, fontWeight: 500, color: 'var(--ink)', background: 'transparent', border: 'none', outline: 'none', fontFamily: 'Sora, sans-serif' }}
                    />
                    <span style={{ fontSize: 11, fontFamily: 'DM Mono, monospace', color: 'var(--ink3)', width: 60, textAlign: 'right' }}>
                      {step.count.toLocaleString('es')}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={100}
                    max={i === 0 ? 500000 : steps[i - 1]?.count ?? 100000}
                    value={step.count}
                    onChange={e => {
                      const v = Number(e.target.value)
                      updateCount(i, v)
                      // Cascade — ensure next steps don't exceed this
                      setSteps(s => s.map((st, idx) => idx > i && st.count > v ? { ...st, count: Math.round(v * 0.6) } : st))
                    }}
                    style={{ width: '100%', accentColor: step.color }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* KPIs */}
          <div className="card">
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 14 }}>Métricas del embudo</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: 'var(--ink2)' }}>Conversión total</span>
                <span style={{ fontFamily: 'DM Mono, monospace', fontWeight: 600, color: 'var(--green)' }}>{convRate}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: 'var(--ink2)' }}>Usuarios perdidos</span>
                <span style={{ fontFamily: 'DM Mono, monospace', fontWeight: 600, color: 'var(--red)' }}>{(steps[0].count - steps[steps.length - 1].count).toLocaleString('es')}</span>
              </div>
              {dropoffs.map((d, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, borderTop: i === 0 ? '0.5px solid var(--border)' : 'none', paddingTop: i === 0 ? 10 : 0 }}>
                  <span style={{ color: 'var(--ink3)' }}>{d.label}</span>
                  <span style={{ fontFamily: 'DM Mono, monospace', color: Number(d.rate) > 50 ? 'var(--red)' : Number(d.rate) > 30 ? 'var(--amber)' : 'var(--green)' }}>-{d.rate}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}