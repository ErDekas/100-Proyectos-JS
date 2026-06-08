import { useState } from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Filler, Tooltip, Legend, type ChartOptions } from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'
import { useCoinChart, useTopCoins } from '../hooks/useMarketData'
import type { Period } from '@analytiq/shared'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Filler, Tooltip, Legend)

const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
const gridC  = isDark ? 'rgba(241,245,249,.07)' : 'rgba(15,23,42,.06)'
const textC  = '#94a3b8'

const COINS = [
  { id: 'bitcoin',  label: 'Bitcoin',  color: '#f59e0b' },
  { id: 'ethereum', label: 'Ethereum', color: '#7c3aed' },
  { id: 'solana',   label: 'Solana',   color: '#059669' },
]

const PERIODS: { label: string; value: Period }[] = [
  { label: '7d', value: '7d' },
  { label: '30d', value: '30d' },
  { label: '90d', value: '90d' },
  { label: '1y', value: '1y' },
]

export function TendenciasPage() {
  const [period,   setPeriod]   = useState<Period>('30d')
  const [coinId,   setCoinId]   = useState('bitcoin')
  const [chartType, setChartType] = useState<'line' | 'bar'>('line')

  const { data: chart, isLoading } = useCoinChart(coinId, period)
  const { data: coins } = useTopCoins()

  const selectedCoin = COINS.find(c => c.id === coinId) ?? COINS[0]
  const coinData     = coins?.find(c => c.id === coinId)

  const labels = chart?.prices.map(([ts]) =>
    new Date(ts).toLocaleDateString('es', { day: '2-digit', month: '2-digit' })
  ) ?? []

  const priceData = chart?.prices.map(([, p]) => p) ?? []
  const volData   = chart?.total_volumes.map(([, v]) => Math.round(v / 1e6)) ?? []

  const lineData = {
    labels,
    datasets: [{
      label: `${selectedCoin.label} (€)`,
      data: priceData,
      borderColor: selectedCoin.color,
      backgroundColor: `${selectedCoin.color}18`,
      fill: true, tension: 0.4, pointRadius: 0, borderWidth: 2,
    }],
  }

  const barData = {
    labels,
    datasets: [{
      label: 'Volumen (M€)',
      data: volData,
      backgroundColor: `${selectedCoin.color}80`,
      borderColor: selectedCoin.color,
      borderWidth: 1,
      borderRadius: 3,
    }],
  }

  const lineOpts: ChartOptions<'line'> = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false, backgroundColor: isDark ? '#1e293b' : '#fff', titleColor: textC, bodyColor: isDark ? '#f1f5f9' : '#0f172a', borderColor: isDark ? 'rgba(241,245,249,.13)' : 'rgba(15,23,42,.1)', borderWidth: 1, padding: 10 } },
    scales: {
      x: { grid: { color: gridC }, ticks: { color: textC, font: { size: 10 }, maxTicksLimit: 10, maxRotation: 0 } },
      y: { grid: { color: gridC }, ticks: { color: textC, font: { size: 10 }, callback: v => `€${Number(v).toLocaleString()}` } },
    },
  }

  return (
    <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--ink)', flex: 1, letterSpacing: '-0.4px' }}>Tendencias de mercado</h2>

        {/* Coin selector */}
        <div style={{ display: 'flex', gap: 4 }}>
          {COINS.map(c => (
            <button key={c.id} onClick={() => setCoinId(c.id)}
              style={{ padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: 'pointer', border: `0.5px solid ${coinId === c.id ? c.color : 'var(--border2)'}`, background: coinId === c.id ? `${c.color}18` : 'transparent', color: coinId === c.id ? c.color : 'var(--ink2)', fontFamily: 'Sora, sans-serif', transition: 'all .12s' }}>
              {c.label}
            </button>
          ))}
        </div>

        {/* Period selector */}
        <div style={{ display: 'flex', gap: 4 }}>
          {PERIODS.map(p => (
            <button key={p.value} onClick={() => setPeriod(p.value)}
              className={`period-pill${period === p.value ? ' active' : ''}`}>
              {p.label}
            </button>
          ))}
        </div>

        {/* Chart type */}
        <div style={{ display: 'flex', gap: 4 }}>
          {(['line', 'bar'] as const).map(t => (
            <button key={t} onClick={() => setChartType(t)}
              style={{ padding: '5px 11px', borderRadius: 6, fontSize: 12, cursor: 'pointer', border: '0.5px solid var(--border2)', background: chartType === t ? 'var(--surf3)' : 'transparent', color: 'var(--ink2)', fontFamily: 'Sora, sans-serif' }}>
              {t === 'line' ? '📈 Línea' : '📊 Barras'}
            </button>
          ))}
        </div>
      </div>

      {/* Coin stats row */}
      {coinData && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {[
            { label: 'Precio actual', value: `€${(coinData.current_price ?? 0).toLocaleString('es')}` },
            { label: 'Market Cap', value: `€${((coinData.market_cap ?? 0) / 1e9).toFixed(2)}B` },
            { label: 'Volumen 24h', value: `€${((coinData.total_volume ?? 0) / 1e9).toFixed(2)}B` },
            { label: 'Cambio 24h', value: `${(coinData.price_change_percentage_24h ?? 0) >= 0 ? '+' : ''}${(coinData.price_change_percentage_24h ?? 0).toFixed(2)}%`, positive: (coinData.price_change_percentage_24h ?? 0) >= 0 },
          ].map(s => (
            <div key={s.label} className="card">
              <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: '.5px', fontFamily: 'DM Mono, monospace', marginBottom: 8 }}>{s.label}</div>
              <div style={{ fontSize: 22, fontWeight: 600, fontFamily: 'DM Mono, monospace', color: 'positive' in s ? (s.positive ? 'var(--green)' : 'var(--red)') : 'var(--ink)', letterSpacing: '-0.5px' }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Main chart */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', flex: 1 }}>
            {selectedCoin.label} — Precio histórico ({period})
          </span>
          <span style={{ fontSize: 11, color: 'var(--ink3)', fontFamily: 'DM Mono, monospace' }}>CoinGecko API · tiempo real</span>
        </div>
        <div style={{ height: 300, position: 'relative' }}>
          {isLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--ink3)', fontSize: 13 }}>Cargando datos...</div>
          ) : chartType === 'line' ? (
            <Line data={lineData} options={lineOpts} />
          ) : (
            <Bar data={barData} options={{ ...lineOpts as any, plugins: { ...lineOpts.plugins, legend: { display: false } } } as ChartOptions<'bar'>} />
          )}
        </div>
      </div>

      {/* Volume chart */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', flex: 1 }}>Volumen de trading (M€)</span>
          <span style={{ fontSize: 11, color: 'var(--ink3)', fontFamily: 'DM Mono, monospace' }}>{period}</span>
        </div>
        <div style={{ height: 180, position: 'relative' }}>
          {isLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--ink3)', fontSize: 13 }}>Cargando...</div>
          ) : (
            <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { backgroundColor: isDark ? '#1e293b' : '#fff', titleColor: textC, bodyColor: isDark ? '#f1f5f9' : '#0f172a', borderColor: isDark ? 'rgba(241,245,249,.13)' : 'rgba(15,23,42,.1)', borderWidth: 1 } }, scales: { x: { grid: { color: gridC }, ticks: { color: textC, font: { size: 10 }, maxTicksLimit: 8 } }, y: { grid: { color: gridC }, ticks: { color: textC, font: { size: 10 }, callback: v => `${v}M` } } } }} />
          )}
        </div>
      </div>

      {/* Top coins table */}
      {coins && (
        <div className="card">
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 16 }}>Top 10 criptomonedas</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr>{['#', 'Moneda', 'Precio', 'Cambio 24h', 'Market Cap', 'Volumen 24h'].map(h => (
                <th key={h} style={{ fontSize: 10, fontWeight: 500, color: 'var(--ink3)', letterSpacing: '.6px', textTransform: 'uppercase', fontFamily: 'DM Mono, monospace', padding: '0 12px 10px', textAlign: 'left', borderBottom: '0.5px solid var(--border2)' }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {coins.map((c, i) => (
                <tr key={c.id} style={{ borderBottom: i < coins.length - 1 ? '0.5px solid var(--border)' : 'none', cursor: 'pointer' }} onClick={() => setCoinId(c.id)}>
                  <td style={{ padding: '10px 12px', color: 'var(--ink3)', fontFamily: 'DM Mono, monospace' }}>{i + 1}</td>
                  <td style={{ padding: '10px 12px', color: 'var(--ink)', fontWeight: 500 }}>{c.name} <span style={{ color: 'var(--ink3)', fontFamily: 'DM Mono, monospace', fontSize: 11 }}>{c.symbol.toUpperCase()}</span></td>
                  <td style={{ padding: '10px 12px', fontFamily: 'DM Mono, monospace', color: 'var(--ink)' }}>€{(c.current_price ?? 0).toLocaleString('es')}</td>
                  <td style={{ padding: '10px 12px', fontFamily: 'DM Mono, monospace', fontWeight: 500, color: (c.price_change_percentage_24h ?? 0) >= 0 ? 'var(--green)' : 'var(--red)' }}>
                    {(c.price_change_percentage_24h ?? 0) >= 0 ? '+' : ''}{(c.price_change_percentage_24h ?? 0).toFixed(2)}%
                  </td>
                  <td style={{ padding: '10px 12px', fontFamily: 'DM Mono, monospace', color: 'var(--ink2)' }}>€{((c.market_cap ?? 0) / 1e9).toFixed(2)}B</td>
                  <td style={{ padding: '10px 12px', fontFamily: 'DM Mono, monospace', color: 'var(--ink2)' }}>€{((c.total_volume ?? 0) / 1e9).toFixed(2)}B</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}