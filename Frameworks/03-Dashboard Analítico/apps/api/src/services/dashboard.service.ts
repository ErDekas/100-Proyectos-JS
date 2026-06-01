import sql from '../db/client'
import type { Period } from '@analytiq/shared'
import type {
  KpiMetric, TimeSeriesPoint, ChannelShare,
  Campaign, FunnelStep, FeedItem, DashboardPayload,
} from '@analytiq/shared'

const PERIOD_DAYS: Record<Period, number> = {
  '7d':  7,
  '30d': 30,
  '90d': 90,
  '1y':  365,
}

const VALID_PERIODS = new Set<Period>(['7d', '30d', '90d', '1y'])

export function parsePeriod(qs: string | undefined): Period {
  return VALID_PERIODS.has(qs as Period) ? (qs as Period) : '30d'
}

function periodToDays(p: Period): number {
  return PERIOD_DAYS[p]
}

// ── KPIs ──────────────────────────────────────────────────────────────────────

async function getKpis(days: number): Promise<KpiMetric[]> {
  const [curr] = await sql`
    SELECT
      SUM(sessions)    AS sessions,
      SUM(revenue)     AS revenue,
      SUM(conversions) AS conversions,
      SUM(new_users)   AS new_users
    FROM daily_metrics
    WHERE date >= CURRENT_DATE - ${days}::int
  `

  const [prev] = await sql`
    SELECT
      SUM(sessions)    AS sessions,
      SUM(revenue)     AS revenue,
      SUM(conversions) AS conversions,
      SUM(new_users)   AS new_users
    FROM daily_metrics
    WHERE date >= CURRENT_DATE - ${days * 2}::int
      AND date <  CURRENT_DATE - ${days}::int
  `

  const delta = (cur: number, pre: number) => {
    if (!pre) return { str: '—', val: 0, pos: true }
    const d = ((cur - pre) / pre) * 100
    return { str: `${d >= 0 ? '↑' : '↓'} ${Math.abs(d).toFixed(1)}%`, val: d, pos: d >= 0 }
  }

  const sessions    = Number(curr.sessions ?? 0)
  const revenue     = Number(curr.revenue  ?? 0)
  const conversions = Number(curr.conversions ?? 0)
  const newUsers    = Number(curr.newUsers ?? 0)
  const convRate    = sessions > 0 ? (conversions / sessions) * 100 : 0

  const pSessions    = Number(prev.sessions ?? 0)
  const pRevenue     = Number(prev.revenue  ?? 0)
  const pConversions = Number(prev.conversions ?? 0)
  const pSess2       = Number(prev.sessions ?? 1)
  const pConvRate    = pSess2 > 0 ? (pConversions / pSess2) * 100 : 0

  const dS  = delta(sessions, pSessions)
  const dR  = delta(revenue,  pRevenue)
  const dNU = delta(newUsers, Number(prev.newUsers ?? 0))
  const dCR = {
    str: `${convRate >= pConvRate ? '↑' : '↓'} ${Math.abs(convRate - pConvRate).toFixed(2)}pp`,
    val: convRate - pConvRate,
    pos: convRate >= pConvRate,
  }

  return [
    { label: 'Sesiones',         value: sessions.toLocaleString('es'),    rawValue: sessions,   delta: dS.str,  deltaValue: dS.val,  positive: dS.pos,  accent: 'blue'   },
    { label: 'Ingresos',         value: `€${revenue.toLocaleString('es')}`, rawValue: revenue,  delta: dR.str,  deltaValue: dR.val,  positive: dR.pos,  accent: 'green'  },
    { label: 'Conv. Rate',       value: `${convRate.toFixed(2)}%`,        rawValue: convRate,   delta: dCR.str, deltaValue: dCR.val, positive: dCR.pos, accent: 'amber'  },
    { label: 'Usuarios activos', value: newUsers.toLocaleString('es'),    rawValue: newUsers,   delta: dNU.str, deltaValue: dNU.val, positive: dNU.pos, accent: 'purple' },
  ]
}

// ── Time series ───────────────────────────────────────────────────────────────

async function getTimeSeries(days: number): Promise<TimeSeriesPoint[]> {
  const rows = await sql`
    SELECT
      date::text,
      SUM(sessions)::int AS sessions,
      SUM(revenue)::numeric AS revenue
    FROM daily_metrics
    WHERE date >= CURRENT_DATE - ${days}::int
    GROUP BY date
    ORDER BY date
  `
  return rows.map(r => ({
    date:     r.date,
    sessions: r.sessions,
    revenue:  Number(r.revenue),
  }))
}

// ── Channels ──────────────────────────────────────────────────────────────────

const CHANNEL_COLORS: Record<string, string> = {
  'Orgánico': '#2563eb',
  'Email':    '#7c3aed',
  'SEM':      '#d97706',
  'Referido': '#059669',
}

async function getChannels(days: number): Promise<ChannelShare[]> {
  const rows = await sql`
    SELECT channel, SUM(sessions)::int AS sessions
    FROM daily_metrics
    WHERE date >= CURRENT_DATE - ${days}::int
    GROUP BY channel
    ORDER BY sessions DESC
  `
  const total = rows.reduce((s, r) => s + r.sessions, 0) || 1
  return rows.map(r => ({
    name:     r.channel,
    sessions: r.sessions,
    pct:      Math.round((r.sessions / total) * 100),
    color:    CHANNEL_COLORS[r.channel] ?? '#94a3b8',
  }))
}

// ── Campaigns ─────────────────────────────────────────────────────────────────

async function getCampaigns(): Promise<Campaign[]> {
  const rows = await sql`
    SELECT
      c.id, c.name, c.channel, c.status, c.updated_at,
      COALESCE(SUM(m.sessions)::int, 0)      AS sessions,
      COALESCE(SUM(m.revenue)::numeric, 0)   AS revenue,
      COALESCE(SUM(m.conversions)::int, 0)   AS conversions
    FROM campaigns c
    LEFT JOIN daily_metrics m ON m.campaign_id = c.id
      AND m.date >= CURRENT_DATE - 30
    GROUP BY c.id
    ORDER BY revenue DESC
  `
  return rows.map(r => ({
    id:        r.id,
    name:      r.name,
    channel:   r.channel,
    status:    r.status,
    sessions:  r.sessions,
    revenue:   Number(r.revenue),
    convRate:  r.sessions > 0 ? Number(((r.conversions / r.sessions) * 100).toFixed(1)) : 0,
    updatedAt: r.updatedAt,
  }))
}

// ── Funnel ────────────────────────────────────────────────────────────────────

const FUNNEL_COLORS = ['#2563eb','#7c3aed','#d97706','#059669','#dc2626']
const FUNNEL_LABELS: Record<string, string> = {
  visit: 'Visitas', register: 'Registros', checkout: 'Checkout',
  purchase: 'Compra', recurrent: 'Recurrente',
}

async function getFunnel(): Promise<FunnelStep[]> {
  const rows = await sql`
    SELECT step, SUM(count)::int AS count
    FROM funnel_events
    WHERE date >= CURRENT_DATE - 30
    GROUP BY step
    ORDER BY count DESC
  `
  const order = ['visit','register','checkout','purchase','recurrent']
  return order.map((step, i) => {
    const row = rows.find(r => r.step === step)
    return { label: FUNNEL_LABELS[step] ?? step, count: row?.count ?? 0, color: FUNNEL_COLORS[i] }
  })
}

// ── Feed ──────────────────────────────────────────────────────────────────────

async function getFeed(): Promise<FeedItem[]> {
  const rows = await sql`
    SELECT id, type, title, meta, created_at
    FROM activity_feed
    ORDER BY created_at DESC
    LIMIT 10
  `
  return rows.map(r => ({
    id:        r.id,
    type:      r.type,
    title:     r.title,
    meta:      r.meta,
    createdAt: r.createdAt,
  }))
}

// ── Aggregate ─────────────────────────────────────────────────────────────────

export async function getDashboard(period: Period): Promise<DashboardPayload> {
  const days = periodToDays(period)
  const [kpis, timeSeries, channels, campaigns, funnelSteps, feedItems] = await Promise.all([
    getKpis(days),
    getTimeSeries(days),
    getChannels(days),
    getCampaigns(),
    getFunnel(),
    getFeed(),
  ])
  return { kpis, timeSeries, channels, campaigns, funnelSteps, feedItems, generatedAt: new Date().toISOString() }
}
