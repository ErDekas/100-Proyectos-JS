import 'dotenv/config'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import { initSentry } from './lib/sentry'
import { dashboardRoutes } from './routes/dashboard'
import { authRoutes } from './routes/auth'
import { usersRoutes } from './routes/users'
import { registerEtlJobs } from './jobs/etl'

// ── Sentry (must init before anything else) ───────────────────────────────────
initSentry()

// ── Fastify ───────────────────────────────────────────────────────────────────
const app = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    transport: process.env.NODE_ENV !== 'production'
      ? { target: 'pino-pretty', options: { colorize: true } }
      : undefined,
  },
})

// ── Plugins ───────────────────────────────────────────────────────────────────
await app.register(cors, {
  origin: process.env.NODE_ENV === 'production'
    ? ['https://your-dashboard.vercel.app']   // ← update with your domain
    : true,
  credentials: true,
})

await app.register(swagger, {
  openapi: {
    info: { title: 'Analytiq API', version: '2.0.0' },
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
    security: [{ bearerAuth: [] }],
  },
})

await app.register(swaggerUi, {
  routePrefix: '/docs',
  uiConfig: { docExpansion: 'list', deepLinking: false },
})

// ── Routes ────────────────────────────────────────────────────────────────────
await app.register(authRoutes)
await app.register(dashboardRoutes)
await app.register(usersRoutes)

// Health check
app.get('/health', async () => ({
  status: 'ok',
  ts: new Date().toISOString(),
  env: process.env.NODE_ENV,
}))

// ── Global error handler ──────────────────────────────────────────────────────
app.setErrorHandler(async (err, req, reply) => {
  req.log.error(err)
  try {
    const { captureError } = await import('./lib/sentry')
    await captureError(err, { url: req.url, method: req.method })
  } catch (sentryErr) {
    req.log.error(sentryErr, 'Sentry capture failed')
  }
  reply.status(err.statusCode ?? 500).send({
    error: err.name ?? 'InternalError',
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    statusCode: err.statusCode ?? 500,
  })
})

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = Number(process.env.PORT ?? 3001)

try {
  await app.listen({ port: PORT, host: '0.0.0.0' })
  app.log.info(`🚀  API listening on http://localhost:${PORT}`)
  app.log.info(`📖  Swagger docs at http://localhost:${PORT}/docs`)

  // ── Register cron jobs (after successful startup) ───────────────────────────
  registerEtlJobs(app.log)
} catch (err) {
  app.log.error(err, 'Failed to start server')
  process.exit(1)
}
