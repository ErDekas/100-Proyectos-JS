import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { authenticate } from '../middleware/auth'
import { getDashboard } from '../services/dashboard.service'
import type { Period } from '@analytiq/shared'

const PeriodSchema = z.enum(['7d', '30d', '90d', '1y']).default('30d')

export async function dashboardRoutes(app: FastifyInstance) {
  app.get('/api/dashboard', {
    preHandler: authenticate,
    schema: {
      tags: ['dashboard'],
      summary: 'Get full dashboard payload',
      querystring: {
        type: 'object',
        properties: { period: { type: 'string', enum: ['7d','30d','90d','1y'] } },
      },
    },
  }, async (req, reply) => {
    const { period } = PeriodSchema.safeParse((req.query as any).period).success
      ? { period: (req.query as any).period as Period }
      : { period: '30d' as Period }

    try {
      const data = await getDashboard(period)
      reply.send(data)
    } catch (err) {
      req.log.error(err, 'dashboard query failed')
      reply.status(500).send({ error: 'InternalError', message: 'Failed to load dashboard', statusCode: 500 })
    }
  })
}
