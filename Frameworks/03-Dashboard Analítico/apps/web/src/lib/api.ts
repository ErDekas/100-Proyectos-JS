import type { DashboardPayload, Period } from '@analytiq/shared'
import { useAuthStore } from '../store/auth'

const BASE = import.meta.env.VITE_API_URL ?? ''

function authHeaders(hasBody: boolean): HeadersInit {
  const { token } = useAuthStore.getState()
  return {
    ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function tryRefresh(): Promise<boolean> {
  const { refreshToken: storeRT } = useAuthStore.getState()
  const rt = storeRT ?? localStorage.getItem('analytiq_refresh_token')
  if (!rt) {
    useAuthStore.getState().clearAuth()
    return false
  }
  try {
    const res = await fetch(`${BASE}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: rt }),
    })
    if (!res.ok) {
      useAuthStore.getState().clearAuth()
      return false
    }
    const data = await res.json() as { accessToken: string; refreshToken: string }
    useAuthStore.getState().updateTokens(data.accessToken, data.refreshToken)
    return true
  } catch {
    return false
  }
}

async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const hasBody = !!init.body
  const doFetch = () => fetch(`${BASE}${path}`, {
    ...init,
    headers: { ...authHeaders(hasBody), ...init.headers },
  })

  let res = await doFetch()

  if (res.status === 401) {
    const refreshed = await tryRefresh()
    if (refreshed) res = await doFetch()
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }))
    throw Object.assign(new Error(err.message ?? 'API error'), { status: res.status })
  }

  return res.json()
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  expiresAt: number
  user: { id: string; email: string; name: string; role: string }
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  return apiFetch<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export async function logout() {
  await apiFetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
  useAuthStore.getState().clearAuth()
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export async function fetchDashboard(period: Period): Promise<DashboardPayload> {
  return apiFetch(`/api/dashboard?period=${period}`)
}
