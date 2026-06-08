import type { FastifyInstance } from 'fastify'

const CG_BASE = 'https://api.coingecko.com/api/v3'
const CACHE_TTL = 60_000

const cache = new Map<string, { data: unknown; ts: number }>()

async function proxy(route: string, url: string, reply: any) {
  const cached = cache.get(route)
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data

  const res = await fetch(url, { headers: { 'Accept': 'application/json' } })
  if (!res.ok) return reply.status(res.status).send({ error: 'CoinGeckoError', message: `CoinGecko responded ${res.status}`, statusCode: res.status })

  const data = await res.json()
  cache.set(route, { data, ts: Date.now() })
  return data
}

export async function coingeckoRoutes(app: FastifyInstance) {
  app.get('/api/coingecko/markets', async (req, reply) => {
    const qs = new URLSearchParams(req.query as Record<string, string>).toString()
    return proxy(`markets?${qs}`, `${CG_BASE}/coins/markets?${qs}`, reply)
  })

  app.get('/api/coingecko/chart/:coinId', async (req, reply) => {
    const { coinId } = req.params as { coinId: string }
    const qs = new URLSearchParams(req.query as Record<string, string>).toString()
    return proxy(`chart/${coinId}?${qs}`, `${CG_BASE}/coins/${coinId}/market_chart?${qs}`, reply)
  })

  app.get('/api/coingecko/global', async (req, reply) => {
    return proxy('global', `${CG_BASE}/global`, reply)
  })
}
