import { useState, useMemo } from 'react'
import { useTopCoins } from '../hooks/useMarketData'

type SortKey = 'name' | 'current_price' | 'price_change_percentage_24h' | 'market_cap' | 'total_volume'

export function ReportesPage() {
  const { data: coins, isLoading } = useTopCoins()
  const [search,   setSearch]   = useState('')
  const [sortKey,  setSortKey]  = useState<SortKey>('market_cap')
  const [sortDir,  setSortDir]  = useState<'asc' | 'desc'>('desc')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')

  const filtered = useMemo(() => {
    if (!coins) return []
    return coins
      .filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.symbol.toLowerCase().includes(search.toLowerCase()))
      .filter(c => !minPrice || c.current_price >= Number(minPrice))
      .filter(c => !maxPrice || c.current_price <= Number(maxPrice))
      .sort((a, b) => {
        const av = (a[sortKey] ?? 0) as number
        const bv = (b[sortKey] ?? 0) as number
        return sortDir === 'asc' ? av - bv : bv - av
      })
  }, [coins, search, sortKey, sortDir, minPrice, maxPrice])

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  function exportCSV() {
    const headers = ['Nombre', 'Símbolo', 'Precio (€)', 'Cambio 24h (%)', 'Market Cap (€)', 'Volumen 24h (€)']
    const rows = filtered.map(c => [
      c.name, c.symbol.toUpperCase(),
      c.current_price ?? 0, (c.price_change_percentage_24h ?? 0).toFixed(2),
      c.market_cap ?? 0, c.total_volume ?? 0,
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = `analytiq-reporte-${new Date().toISOString().split('T')[0]}.csv`
    a.click(); URL.revokeObjectURL(url)
  }

  function exportPDF() {
    const win = window.open('', '_blank')!
    win.document.write(`
      <html><head><title>Reporte Analytiq</title>
      <style>
        body { font-family: 'Sora', sans-serif; padding: 32px; color: #0f172a; }
        h1 { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
        p  { font-size: 12px; color: #94a3b8; margin-bottom: 24px; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th { background: #f1f5f9; padding: 10px 12px; text-align: left; font-weight: 600; font-size: 11px; color: #475569; text-transform: uppercase; letter-spacing: .5px; }
        td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; }
        .up { color: #059669; } .dn { color: #dc2626; }
        .mono { font-family: 'DM Mono', monospace; }
      </style></head><body>
      <h1>📊 Reporte de mercado — Analytiq</h1>
      <p>Generado el ${new Date().toLocaleString('es')} · ${filtered.length} activos</p>
      <table>
        <thead><tr><th>#</th><th>Activo</th><th>Precio</th><th>Cambio 24h</th><th>Market Cap</th><th>Volumen 24h</th></tr></thead>
        <tbody>
          ${filtered.map((c, i) => `
            <tr>
              <td class="mono">${i + 1}</td>
              <td><strong>${c.name}</strong> <span style="color:#94a3b8">${c.symbol.toUpperCase()}</span></td>
              <td class="mono">€${(c.current_price ?? 0).toLocaleString('es')}</td>
              <td class="mono ${(c.price_change_percentage_24h ?? 0) >= 0 ? 'up' : 'dn'}">${(c.price_change_percentage_24h ?? 0) >= 0 ? '+' : ''}${(c.price_change_percentage_24h ?? 0).toFixed(2)}%</td>
              <td class="mono">€${((c.market_cap ?? 0) / 1e9).toFixed(2)}B</td>
              <td class="mono">€${((c.total_volume ?? 0) / 1e9).toFixed(2)}B</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      </body></html>
    `)
    win.document.close()
    setTimeout(() => { win.print(); win.close() }, 500)
  }

  const SortIcon = ({ k }: { k: SortKey }) => sortKey !== k ? null : (
    <span style={{ marginLeft: 4 }}>{sortDir === 'asc' ? '↑' : '↓'}</span>
  )

  return (
    <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--ink)', flex: 1, letterSpacing: '-0.4px' }}>Reportes de mercado</h2>
        <button onClick={exportCSV} style={{ padding: '7px 14px', borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: 'pointer', border: '0.5px solid var(--green)', background: 'var(--green-l)', color: 'var(--green)', fontFamily: 'Sora, sans-serif' }}>
          ↓ Exportar CSV
        </button>
        <button onClick={exportPDF} style={{ padding: '7px 14px', borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: 'pointer', border: '0.5px solid var(--blue)', background: 'var(--blue-l)', color: 'var(--blue)', fontFamily: 'Sora, sans-serif' }}>
          ↓ Exportar PDF
        </button>
      </div>

      {/* Filters */}
      <div className="card" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', padding: '14px 16px' }}>
        <input
          placeholder="Buscar por nombre o símbolo..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 200, padding: '8px 12px', borderRadius: 6, border: '0.5px solid var(--border2)', background: 'var(--surf2)', color: 'var(--ink)', fontSize: 13, fontFamily: 'Sora, sans-serif', outline: 'none' }}
        />
        <input
          placeholder="Precio mín (€)" type="number"
          value={minPrice} onChange={e => setMinPrice(e.target.value)}
          style={{ width: 140, padding: '8px 12px', borderRadius: 6, border: '0.5px solid var(--border2)', background: 'var(--surf2)', color: 'var(--ink)', fontSize: 13, fontFamily: 'DM Mono, monospace', outline: 'none' }}
        />
        <input
          placeholder="Precio máx (€)" type="number"
          value={maxPrice} onChange={e => setMaxPrice(e.target.value)}
          style={{ width: 140, padding: '8px 12px', borderRadius: 6, border: '0.5px solid var(--border2)', background: 'var(--surf2)', color: 'var(--ink)', fontSize: 13, fontFamily: 'DM Mono, monospace', outline: 'none' }}
        />
        {(search || minPrice || maxPrice) && (
          <button onClick={() => { setSearch(''); setMinPrice(''); setMaxPrice('') }}
            style={{ padding: '8px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer', border: '0.5px solid var(--border2)', background: 'transparent', color: 'var(--ink3)', fontFamily: 'Sora, sans-serif' }}>
            Limpiar
          </button>
        )}
        <span style={{ fontSize: 12, color: 'var(--ink3)', fontFamily: 'DM Mono, monospace', display: 'flex', alignItems: 'center' }}>
          {filtered.length} resultados
        </span>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: 'var(--surf3)' }}>
                {([
                  { key: null,           label: '#' },
                  { key: 'name',         label: 'Activo' },
                  { key: 'current_price',label: 'Precio' },
                  { key: 'price_change_percentage_24h', label: 'Cambio 24h' },
                  { key: 'market_cap',   label: 'Market Cap' },
                  { key: 'total_volume', label: 'Volumen 24h' },
                ] as { key: SortKey | null; label: string }[]).map(h => (
                  <th key={h.label}
                    onClick={() => h.key && toggleSort(h.key)}
                    style={{ fontSize: 10, fontWeight: 500, color: 'var(--ink3)', letterSpacing: '.6px', textTransform: 'uppercase', fontFamily: 'DM Mono, monospace', padding: '12px 16px', textAlign: 'left', cursor: h.key ? 'pointer' : 'default', userSelect: 'none', whiteSpace: 'nowrap' }}>
                    {h.label}{h.key && <SortIcon k={h.key} />}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: 'var(--ink3)' }}>Cargando datos de mercado...</td></tr>
              ) : filtered.map((c, i) => (
                <tr key={c.id} style={{ borderBottom: '0.5px solid var(--border)' }}>
                  <td style={{ padding: '12px 16px', color: 'var(--ink3)', fontFamily: 'DM Mono, monospace' }}>{i + 1}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 500, color: 'var(--ink)' }}>{c.name}</div>
                    <div style={{ fontSize: 10, color: 'var(--ink3)', fontFamily: 'DM Mono, monospace' }}>{c.symbol.toUpperCase()}</div>
                  </td>
                  <td style={{ padding: '12px 16px', fontFamily: 'DM Mono, monospace', color: 'var(--ink)', fontWeight: 500 }}>€{(c.current_price ?? 0).toLocaleString('es')}</td>
                  <td style={{ padding: '12px 16px', fontFamily: 'DM Mono, monospace', fontWeight: 500, color: (c.price_change_percentage_24h ?? 0) >= 0 ? 'var(--green)' : 'var(--red)' }}>
                    {(c.price_change_percentage_24h ?? 0) >= 0 ? '+' : ''}{(c.price_change_percentage_24h ?? 0).toFixed(2)}%
                  </td>
                  <td style={{ padding: '12px 16px', fontFamily: 'DM Mono, monospace', color: 'var(--ink2)' }}>€{((c.market_cap ?? 0) / 1e9).toFixed(2)}B</td>
                  <td style={{ padding: '12px 16px', fontFamily: 'DM Mono, monospace', color: 'var(--ink2)' }}>€{((c.total_volume ?? 0) / 1e9).toFixed(2)}B</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}