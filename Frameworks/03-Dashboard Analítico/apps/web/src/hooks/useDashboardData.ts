import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { fetchDashboard } from '../lib/api'
import type { Period } from '@analytiq/shared'

export function useDashboardData(period: Period) {
  return useQuery({
    queryKey:  ['dashboard', period],
    queryFn:   () => fetchDashboard(period),
    staleTime: 1000 * 60 * 2,          // 2 min cache
    retry:     2,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  })
}
