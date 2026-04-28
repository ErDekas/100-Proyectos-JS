// ─── Types ───────────────────────────────────────────────────────────────────

export interface KpiMetric {
  label: string
  value: string
  delta: string
  positive: boolean
  accent: 'blue' | 'green' | 'amber' | 'purple'
}

export interface Campaign {
  name: string
  channel: string
  sessions: number
  convRate: number
  revenue: number
  status: 'active' | 'pending' | 'paused'
}

export interface ChannelShare {
  name: string
  pct: number
  color: string
}

export interface FunnelStep {
  label: string
  count: number
  color: string
}

export interface FeedItem {
  type: 'up' | 'email' | 'warn' | 'money'
  title: string
  meta: string
}

// ─── Mock KPIs ───────────────────────────────────────────────────────────────

export const kpis: KpiMetric[] = [
  { label: 'Sesiones',        value: '84,210',  delta: '↑ 12.4%',  positive: true,  accent: 'blue'   },
  { label: 'Ingresos',        value: '€38,540', delta: '↑ 8.7%',   positive: true,  accent: 'green'  },
  { label: 'Conv. Rate',      value: '3.82%',   delta: '↓ 0.4 pp', positive: false, accent: 'amber'  },
  { label: 'Usuarios activos',value: '12,094',  delta: '↑ 21.1%',  positive: true,  accent: 'purple' },
]

// ─── Mock time-series (30 days) ───────────────────────────────────────────────

function last30Days(): string[] {
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - 29 + i)
    return `${d.getDate()}/${d.getMonth() + 1}`
  })
}

export const timeLabels = last30Days()

export const sessionsData = [
  1800,2100,1950,2400,2200,2800,3100,2750,3200,3500,
  3100,2900,3600,3800,3400,3200,3700,4100,3900,4300,
  4000,3800,4500,4800,4400,4200,4700,5100,4900,5400,
]

export const revenueData = [
  620, 710, 680, 820, 790, 960,1050, 940,1100,1180,
  1050, 980,1210,1290,1140,1080,1240,1380,1310,1440,
  1360,1290,1500,1620,1490,1420,1580,1710,1650,1830,
]

// ─── Channel distribution ─────────────────────────────────────────────────────

export const channels: ChannelShare[] = [
  { name: 'Orgánico',   pct: 42, color: '#2563eb' },
  { name: 'Email',      pct: 28, color: '#7c3aed' },
  { name: 'Pago (SEM)', pct: 18, color: '#d97706' },
  { name: 'Referido',   pct: 12, color: '#059669' },
]

// ─── Campaigns ───────────────────────────────────────────────────────────────

export const campaigns: Campaign[] = [
  { name: 'Black Friday — Email',    channel: 'Email',    sessions: 18420, convRate: 5.1, revenue: 12840, status: 'active'  },
  { name: 'Google Ads — Marca',      channel: 'SEM',      sessions: 11070, convRate: 4.3, revenue:  8290, status: 'active'  },
  { name: 'SEO — Blog Recurrente',   channel: 'Orgánico', sessions: 24100, convRate: 2.8, revenue:  7610, status: 'active'  },
  { name: 'Referidos — Partner Q3',  channel: 'Referido', sessions:  8940, convRate: 3.9, revenue:  4820, status: 'pending' },
  { name: 'Display — Retargeting',   channel: 'SEM',      sessions:  5310, convRate: 1.9, revenue:  2180, status: 'paused'  },
]

// ─── Funnel ───────────────────────────────────────────────────────────────────

export const funnelSteps: FunnelStep[] = [
  { label: 'Visitas',     count: 84210, color: '#2563eb' },
  { label: 'Registros',   count: 52200, color: '#7c3aed' },
  { label: 'Checkout',    count: 23580, color: '#d97706' },
  { label: 'Compra',      count: 11790, color: '#059669' },
  { label: 'Recurrente',  count:  5100, color: '#dc2626' },
]

// ─── Activity feed ────────────────────────────────────────────────────────────

export const feedItems: FeedItem[] = [
  { type: 'up',    title: 'Pico de tráfico orgánico',       meta: '+34% · hace 12 min' },
  { type: 'email', title: 'Campaña email enviada',           meta: '18,420 destinatarios · hace 2h' },
  { type: 'warn',  title: 'Conv. rate por debajo del umbral',meta: 'Display Retargeting · hace 3h' },
  { type: 'money', title: 'Meta mensual superada',           meta: '€38.5k / €35k target · hoy' },
]
