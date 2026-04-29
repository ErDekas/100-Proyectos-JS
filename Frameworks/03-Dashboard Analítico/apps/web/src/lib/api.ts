import type { DashboardPayload, Period } from '@analytiq/shared'

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

function getToken(): string | null {
  return localStorage.getItem('analytiq_token')
}

async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken()
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  })

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
  const data = await apiFetch<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  localStorage.setItem('analytiq_token',         data.accessToken)
  localStorage.setItem('analytiq_refresh_token', data.refreshToken)
  return data
}

export async function logout() {
  await apiFetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
  localStorage.removeItem('analytiq_token')
  localStorage.removeItem('analytiq_refresh_token')
}

export async function refreshToken(): Promise<string | null> {
  const rt = localStorage.getItem('analytiq_refresh_token')
  if (!rt) return null
  const data = await apiFetch<{ accessToken: string; refreshToken: string }>('/api/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken: rt }),
  })
  localStorage.setItem('analytiq_token',         data.accessToken)
  localStorage.setItem('analytiq_refresh_token', data.refreshToken)
  return data.accessToken
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export async function fetchDashboard(period: Period): Promise<DashboardPayload> {
  return apiFetch(`/api/dashboard?period=${period}`)
}
