import { useQuery } from '@tanstack/react-query'
import {
  fetchTopCoins, fetchMarketChart, fetchGlobalStats,
  mapToKpis, mapToTimeSeries,
} from '../lib/coingecko'
import type { Period } from '@analytiq/shared'

function periodToDays(p: Period) {
  return p === '7d' ? 7 : p === '30d' ? 30 : p === '90d' ? 90 : 365
}

export function useMarketData(period: Period) {
  const days = periodToDays(period)

  const coins = useQuery({
    queryKey: ['coins', 'markets'],
    queryFn:  () => fetchTopCoins(),
    staleTime: 1000 * 60 * 2,
  })

  const global = useQuery({
    queryKey: ['coins', 'global'],
    queryFn:  () => fetchGlobalStats(),
    staleTime: 1000 * 60 * 2,
  })

  const chart = useQuery({
    queryKey: ['coins', 'chart', 'bitcoin', days],
    queryFn:  () => fetchMarketChart('bitcoin', days),
    staleTime: 1000 * 60 * 5,
  })

  const isLoading = coins.isLoading || global.isLoading || chart.isLoading
  const error     = coins.error || global.error || chart.error

  const kpis       = coins.data && global.data ? mapToKpis(coins.data, global.data) : null
  const timeSeries = chart.data ? mapToTimeSeries(chart.data) : null
  const topCoins   = coins.data ?? null

  return { kpis, timeSeries, topCoins, isLoading, error }
}

export function useCoinChart(coinId: string, period: Period) {
  const days = periodToDays(period)
  return useQuery({
    queryKey: ['coins', 'chart', coinId, days],
    queryFn:  () => fetchMarketChart(coinId, days),
    staleTime: 1000 * 60 * 5,
  })
}

export function useTopCoins() {
  return useQuery({
    queryKey: ['coins', 'markets'],
    queryFn:  () => fetchTopCoins(),
    staleTime: 1000 * 60 * 2,
    refetchInterval: 1000 * 60 * 2,
  })
}