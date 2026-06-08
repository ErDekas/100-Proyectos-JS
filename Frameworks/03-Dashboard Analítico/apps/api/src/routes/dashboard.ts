import type { FastifyInstance, FastifyRequest } from 'fastify'
import type { Period } from '@analytiq/shared'
import { authenticate } from '../middleware/auth'
import { getDashboard, parsePeriod } from '../services/dashboard.service'

interface DashboardQuery { period: Period }

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
  }, async (req: FastifyRequest, reply) => {
    const { period } = req.query as DashboardQuery

    try {
      const data = await getDashboard(period)
      reply.send(data)
    } catch (err) {
      req.log.error(err, 'dashboard query failed')
      reply.status(500).send({ error: 'InternalError', message: 'Failed to load dashboard', statusCode: 500 })
    }
  })
}
