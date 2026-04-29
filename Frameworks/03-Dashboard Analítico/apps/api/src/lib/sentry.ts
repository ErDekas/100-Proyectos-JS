import * as Sentry from '@sentry/node'

export function initSentry() {
  const dsn = process.env.SENTRY_DSN
  if (!dsn) {
    console.warn('⚠️  SENTRY_DSN not set — Sentry disabled')
    return
  }

  Sentry.init({
    dsn,
    environment:   process.env.NODE_ENV ?? 'development',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
    integrations: [
      Sentry.httpIntegration(),
      Sentry.postgresIntegration(),
    ],
  })

  console.log('🔭  Sentry initialized')
}

export function captureError(err: unknown, context?: Record<string, unknown>) {
  Sentry.withScope(scope => {
    if (context) scope.setExtras(context)
    Sentry.captureException(err)
  })
}

// Custom business metric: track ETL job outcomes
export function trackEtlOutcome(status: 'success' | 'error', rows?: number) {
  Sentry.addBreadcrumb({
    category: 'etl',
    message:  `ETL job ${status}`,
    data:     { rows },
    level:    status === 'error' ? 'error' : 'info',
  })
}
