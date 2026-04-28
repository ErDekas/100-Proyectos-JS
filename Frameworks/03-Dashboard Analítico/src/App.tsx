import { Sidebar }        from './components/Sidebar'
import { Topbar }         from './components/Topbar'
import { KpiGrid }        from './components/KpiGrid'
import { TrendChart }     from './components/TrendChart'
import { ChannelChart }   from './components/ChannelChart'
import { CampaignsTable } from './components/CampaignsTable'
import { FunnelCard, ActivityFeed } from './components/FunnelAndFeed'
import { useDashboardStore } from './store/dashboard'
import { useDashboardData }  from './hooks/useDashboardData'

export default function App() {
  const period = useDashboardStore(s => s.period)
  const { data, isLoading } = useDashboardData(period)

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
        <Topbar />

        <main style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {isLoading || !data ? (
            <LoadingSkeleton />
          ) : (
            <>
              <KpiGrid kpis={data.kpis} />

              {/* Charts row */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
                <TrendChart labels={data.timeLabels} sessions={data.sessionsData} revenue={data.revenueData} />
                <ChannelChart channels={data.channels} />
              </div>

              {/* Bottom row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <CampaignsTable campaigns={data.campaigns} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <FunnelCard steps={data.funnelSteps} />
                  <ActivityFeed items={data.feedItems} />
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{ height: 100, background: 'var(--surf)', borderRadius: 10, border: '0.5px solid var(--border2)', animation: 'pulse 1.5s infinite' }} />
        ))}
      </div>
      <div style={{ height: 280, background: 'var(--surf)', borderRadius: 10, border: '0.5px solid var(--border2)', animation: 'pulse 1.5s infinite' }} />
    </div>
  )
}
