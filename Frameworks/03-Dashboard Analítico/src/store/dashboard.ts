import { create } from 'zustand'

export type Period = '7d' | '30d' | '90d' | '1y'
export type NavItem = 'overview' | 'tendencias' | 'embudo' | 'reportes' | 'usuarios' | 'campanas' | 'conversiones'

interface DashboardState {
  period: Period
  activeNav: NavItem
  setPeriod: (p: Period) => void
  setActiveNav: (n: NavItem) => void
}

export const useDashboardStore = create<DashboardState>((set) => ({
  period: '30d',
  activeNav: 'overview',
  setPeriod: (period) => set({ period }),
  setActiveNav: (activeNav) => set({ activeNav }),
}))
