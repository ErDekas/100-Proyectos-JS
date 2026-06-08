// CoinGecko API — free, no auth required
// Docs: https://www.coingecko.com/en/api/documentation

const BASE = import.meta.env.VITE_API_URL ?? ''

export interface CoinPrice {
  id: string
  symbol: string
  name: string
  current_price: number
  market_cap: number
  total_volume: number
  price_change_percentage_24h: number
  price_change_percentage_7d_in_currency?: number
  sparkline_in_7d?: { price: number[] }
}

export interface MarketChart {
  prices: [number, number][]
  total_volumes: [number, number][]
  market_caps: [number, number][]
}

// Top coins for dashboard
export async function fetchTopCoins(days = 30): Promise<CoinPrice[]> {
  const qs = `vs_currency=eur&order=market_cap_desc&per_page=10&page=1&sparkline=true&price_change_percentage=7d`
  const res = await fetch(`${BASE}/api/coingecko/markets?${qs}`)
  if (!res.ok) throw new Error('CoinGecko API error')
  return res.json()
}

// Historical data for trend chart
export async function fetchMarketChart(coinId: string, days: number): Promise<MarketChart> {
  const interval = days <= 7 ? 'hourly' : 'daily'
  const res = await fetch(`${BASE}/api/coingecko/chart/${coinId}?vs_currency=eur&days=${days}&interval=${interval}`)
  if (!res.ok) throw new Error('CoinGecko API error')
  return res.json()
}

// Global market stats
export async function fetchGlobalStats() {
  const res = await fetch(`${BASE}/api/coingecko/global`)
  if (!res.ok) throw new Error('CoinGecko API error')
  const data = await res.json()
  return data.data
}

// Map CoinGecko data to dashboard KPIs
export function mapToKpis(coins: CoinPrice[], global: any) {
  const totalVol   = coins.reduce((s, c) => s + c.total_volume, 0)
  const totalMcap  = coins.reduce((s, c) => s + c.market_cap, 0)
  const avgChange  = coins.reduce((s, c) => s + (c.price_change_percentage_24h ?? 0), 0) / coins.length
  const activeCoins = global?.active_cryptocurrencies ?? 0

  const fmt = (n: number) => n >= 1e9
    ? `€${(n / 1e9).toFixed(1)}B`
    : n >= 1e6 ? `€${(n / 1e6).toFixed(1)}M` : `€${n.toLocaleString('es')}`

  return [
    {
      label: 'Volumen 24h',
      value: fmt(totalVol),
      rawValue: totalVol,
      delta: `${avgChange >= 0 ? '↑' : '↓'} ${Math.abs(avgChange).toFixed(1)}%`,
      deltaValue: avgChange,
      positive: avgChange >= 0,
      accent: 'blue' as const,
    },
    {
      label: 'Market Cap',
      value: fmt(totalMcap),
      rawValue: totalMcap,
      delta: `${avgChange >= 0 ? '↑' : '↓'} ${Math.abs(avgChange * 0.8).toFixed(1)}%`,
      deltaValue: avgChange * 0.8,
      positive: avgChange >= 0,
      accent: 'green' as const,
    },
    {
      label: 'Variación media',
      value: `${avgChange >= 0 ? '+' : ''}${avgChange.toFixed(2)}%`,
      rawValue: avgChange,
      delta: avgChange >= 0 ? '↑ En positivo' : '↓ En negativo',
      deltaValue: avgChange,
      positive: avgChange >= 0,
      accent: 'amber' as const,
    },
    {
      label: 'Cryptos activas',
      value: activeCoins.toLocaleString('es'),
      rawValue: activeCoins,
      delta: '↑ En tiempo real',
      deltaValue: 0,
      positive: true,
      accent: 'purple' as const,
    },
  ]
}

// Map chart data
export function mapToTimeSeries(chart: MarketChart) {
  return chart.prices.map(([ts, price], i) => ({
    date: new Date(ts).toLocaleDateString('es', { day: '2-digit', month: '2-digit' }),
    sessions: Math.round(chart.total_volumes[i]?.[1] / 1e6) || 0,
    revenue: Math.round(price * 100) / 100,
  }))
}