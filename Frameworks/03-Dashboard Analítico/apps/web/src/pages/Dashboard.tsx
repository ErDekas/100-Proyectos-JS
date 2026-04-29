import { useDashboardStore }    from '../store/dashboard'
import { useMarketData }        from '../hooks/useMarketData'
import { useAuthStore }         from '../store/auth'
import { logout }               from '../lib/api'
import { KpiGrid }              from '../components/KpiGrid'
import { TrendChart }           from '../components/TrendChart'
import { ChannelChart }         from '../components/ChannelChart'
import { CampaignsTable }       from '../components/CampaignsTable'
import { FunnelCard, ActivityFeed } from '../components/FunnelAndFeed'
import { Sidebar }              from '../components/Sidebar'
import { TendenciasPage }       from './TendenciasPage'
import { EmbudoPage }           from './EmbudoPage'
import { ReportesPage }         from './ReportesPage'
import { UsuariosPage }         from './UsuariosPage'
import { useDashboardData }     from '../hooks/useDashboardData'
import type { Period }          from '@analytiq/shared'
import { clsx }                 from 'clsx'

const PERIODS: Period[] = ['7d', '30d', '90d', '1y']

export function Dashboard() {
  const { period, setPeriod, activeNav } = useDashboardStore()
  const clearAuth = useAuthStore(s => s.clearAuth)
  const user      = useAuthStore(s => s.user)

  const { kpis, timeSeries, isLoading: mktLoading } = useMarketData(period)
  const { data: dbData, isLoading: dbLoading, refetch } = useDashboardData(period)

  async function handleLogout() { await logout(); clearAuth() }

  const isLoading = mktLoading || dbLoading

  function renderContent() {
    switch (activeNav) {
      case 'tendencias':   return <TendenciasPage />
      case 'embudo':       return <EmbudoPage />
      case 'reportes':     return <ReportesPage />
      case 'usuarios':     return <UsuariosPage />
      case 'campanas':     return <ReportesPage />
      case 'conversiones': return <EmbudoPage />
      default:             return <OverviewContent kpis={kpis} timeSeries={timeSeries} dbData={dbData} isLoading={isLoading} />
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar user={user} onLogout={handleLogout} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto', minWidth: 0 }}>
        <div style={{ background: 'var(--surf)', borderBottom: '0.5px solid var(--border2)', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink)', flex: 1, letterSpacing: '-0.3px' }}>
            {activeNav === 'overview' ? 'Overview' : activeNav.charAt(0).toUpperCase() + activeNav.slice(1)}
          </span>
          {activeNav === 'overview' && (
            <>
              <div style={{ display: 'flex', gap: 4 }}>
                {PERIODS.map(p => (
                  <button key={p} onClick={() => setPeriod(p)} className={clsx('period-pill', { active: period === p })}>{p}</button>
                ))}
              </div>
              <button onClick={() => refetch()} style={{ padding: '6px 13px', borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: 'pointer', border: '0.5px solid var(--border2)', background: 'var(--surf)', color: 'var(--ink2)', fontFamily: 'Sora, sans-serif', display: 'flex', alignItems: 'center', gap: 5 }}>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width={13} height={13}><path d="M14 8A6 6 0 1 1 8 2"/><polyline points="11,1 14,2 13,5"/></svg>
                Actualizar
              </button>
            </>
          )}
        </div>
        <main style={{ flex: 1, overflow: 'auto' }}>{renderContent()}</main>
      </div>
    </div>
  )
}

function OverviewContent({ kpis, timeSeries, dbData, isLoading }: any) {
  if (isLoading || !kpis || !timeSeries || !dbData) return <LoadingSkeleton />
  return (
    <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <KpiGrid kpis={kpis} />
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
        <TrendChart labels={timeSeries.map((d: any) => d.date)} sessions={timeSeries.map((d: any) => d.sessions)} revenue={timeSeries.map((d: any) => d.revenue)} />
        <ChannelChart channels={dbData.channels} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        <CampaignsTable campaigns={dbData.campaigns} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <FunnelCard steps={dbData.funnelSteps} />
          <ActivityFeed items={dbData.feedItems} />
        </div>
      </div>
      <div style={{ fontSize: 11, color: 'var(--ink3)', fontFamily: 'DM Mono, monospace', textAlign: 'right' }}>
        KPIs: CoinGecko API (tiempo real) · BD: {new Date(dbData.generatedAt).toLocaleTimeString('es')}
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
        {[...Array(4)].map((_, i) => <div key={i} style={{ height: 100, background: 'var(--surf)', borderRadius: 10, border: '0.5px solid var(--border2)', opacity: 0.6 }} />)}
      </div>
      <div style={{ height: 280, background: 'var(--surf)', borderRadius: 10, border: '0.5px solid var(--border2)', opacity: 0.6 }} />
    </div>
  )
}