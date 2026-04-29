import { create } from 'zustand'
import type { Period } from '@analytiq/shared'

export type NavItem = 'overview' | 'tendencias' | 'embudo' | 'reportes' | 'usuarios' | 'campanas' | 'conversiones'

interface DashboardState {
  period:    Period
  activeNav: NavItem
  setPeriod:    (p: Period) => void
  setActiveNav: (n: NavItem) => void
}

export const useDashboardStore = create<DashboardState>()((set) => ({
  period:    '30d',
  activeNav: 'overview',
  setPeriod:    (period)    => set({ period }),
  setActiveNav: (activeNav) => set({ activeNav }),
}))
