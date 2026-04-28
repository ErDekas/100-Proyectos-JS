import { useQuery } from '@tanstack/react-query'
import {
  kpis, sessionsData, revenueData, timeLabels,
  channels, campaigns, funnelSteps, feedItems,
} from '../data/mock'
import type { Period } from '../store/dashboard'

// ─── Simulates an async fetch — swap the body for a real fetch() call ─────────

async function fetchDashboard(_period: Period) {
  // TODO Phase 2: replace with → fetch(`/api/dashboard?period=${period}`)
  await new Promise((r) => setTimeout(r, 200)) // simulate network
  return { kpis, sessionsData, revenueData, timeLabels, channels, campaigns, funnelSteps, feedItems }
}

export function useDashboardData(period: Period) {
  return useQuery({
    queryKey: ['dashboard', period],
    queryFn: () => fetchDashboard(period),
  })
}
