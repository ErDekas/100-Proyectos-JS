// ─── Shared types used by both API and Web ────────────────────────────────────

export type Period = '7d' | '30d' | '90d' | '1y'

export interface KpiMetric {
  label: string
  value: string
  rawValue: number
  delta: string
  deltaValue: number
  positive: boolean
  accent: 'blue' | 'green' | 'amber' | 'purple'
}

export interface TimeSeriesPoint {
  date: string
  sessions: number
  revenue: number
}

export interface ChannelShare {
  name: string
  pct: number
  color: string
  sessions: number
}

export interface Campaign {
  id: string
  name: string
  channel: string
  sessions: number
  convRate: number
  revenue: number
  status: 'active' | 'pending' | 'paused'
  updatedAt: string
}

export interface FunnelStep {
  label: string
  count: number
  color: string
}

export interface FeedItem {
  id: string
  type: 'up' | 'email' | 'warn' | 'money'
  title: string
  meta: string
  createdAt: string
}

export interface DashboardPayload {
  kpis: KpiMetric[]
  timeSeries: TimeSeriesPoint[]
  channels: ChannelShare[]
  campaigns: Campaign[]
  funnelSteps: FunnelStep[]
  feedItems: FeedItem[]
  generatedAt: string
}

export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'viewer'
  avatarUrl?: string
}

export interface ApiError {
  error: string
  message: string
  statusCode: number
}
