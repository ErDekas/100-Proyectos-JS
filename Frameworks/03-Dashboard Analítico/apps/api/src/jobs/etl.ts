import cron from 'node-cron'
import sql from '../db/client'
import type { FastifyBaseLogger } from 'fastify'

// ── ETL: ingest daily metrics from external source ────────────────────────────
// In production, replace `fetchExternalMetrics` with a real API call
// e.g. Google Analytics Data API, Mixpanel Export, Plausible, etc.

async function fetchExternalMetrics(date: string) {
  // TODO: replace with real fetch, e.g.:
  // const res = await fetch(`https://analyticsapi.example.com/export?date=${date}&key=${process.env.EXTERNAL_ANALYTICS_API_KEY}`)
  // return res.json()

  // Stub: generate realistic data
  const channels = ['Orgánico','Email','SEM','Referido']
  return channels.map(channel => {
    const base = channel === 'Orgánico' ? 700 : channel === 'Email' ? 500 : channel === 'SEM' ? 350 : 200
    const sessions    = Math.round(base + Math.random() * 300)
    const conversions = Math.round(sessions * (0.02 + Math.random() * 0.04))
    const revenue     = Math.round(conversions * 45 * (0.8 + Math.random() * 0.4) * 100) / 100
    const new_users   = Math.round(sessions * 0.3 + Math.random() * 50)
    return { channel, sessions, conversions, revenue, new_users }
  })
}

async function runEtl(log: FastifyBaseLogger) {
  const jobId = crypto.randomUUID()
  const date  = new Date().toISOString().split('T')[0]

  await sql`
    INSERT INTO etl_jobs (id, name, status, started_at)
    VALUES (${jobId}, 'daily-metrics', 'running', NOW())
  `

  try {
    log.info({ jobId, date }, 'ETL job started')
    const rows = await fetchExternalMetrics(date)
    let upserted = 0

    for (const row of rows) {
      await sql`
        INSERT INTO daily_metrics (date, channel, sessions, revenue, conversions, new_users)
        VALUES (${date}, ${row.channel}, ${row.sessions}, ${row.revenue}, ${row.conversions}, ${row.new_users})
        ON CONFLICT (date, channel, campaign_id)
        DO UPDATE SET
          sessions    = EXCLUDED.sessions,
          revenue     = EXCLUDED.revenue,
          conversions = EXCLUDED.conversions,
          new_users   = EXCLUDED.new_users
      `
      upserted++
    }

    // Also update funnel_events
    const steps = ['visit','register','checkout','purchase','recurrent']
    const counts = [
      rows.reduce((s,r) => s + r.sessions, 0),
      Math.round(rows.reduce((s,r) => s + r.sessions, 0) * 0.62),
      Math.round(rows.reduce((s,r) => s + r.sessions, 0) * 0.28),
      rows.reduce((s,r) => s + r.conversions, 0),
      Math.round(rows.reduce((s,r) => s + r.conversions, 0) * 0.43),
    ]
    for (let i = 0; i < steps.length; i++) {
      await sql`
        INSERT INTO funnel_events (date, step, count)
        VALUES (${date}, ${steps[i]}, ${counts[i]})
        ON CONFLICT (date, step) DO UPDATE SET count = EXCLUDED.count
      `
    }

    // Log activity
    await sql`
      INSERT INTO activity_feed (type, title, meta)
      VALUES ('up', 'ETL completado', ${`${upserted} canales actualizados · ${date}`})
    `

    await sql`
      UPDATE etl_jobs
      SET status='success', finished_at=NOW(), rows_upserted=${upserted}
      WHERE id=${jobId}
    `

    log.info({ jobId, upserted }, 'ETL job succeeded')
  } catch (err: any) {
    await sql`
      UPDATE etl_jobs
      SET status='error', finished_at=NOW(), error=${err.message}
      WHERE id=${jobId}
    `
    log.error({ jobId, err: err.message }, 'ETL job failed')

    await sql`
      INSERT INTO activity_feed (type, title, meta)
      VALUES ('warn', 'ETL fallido', ${`Error: ${err.message.slice(0,80)}`})
    `
    throw err
  }
}

export function registerEtlJobs(log: FastifyBaseLogger) {
  const schedule = process.env.ETL_CRON_SCHEDULE ?? '0 * * * *'   // every hour
  cron.schedule(schedule, () => {
    runEtl(log).catch(e => log.error(e, 'ETL cron error'))
  })
  log.info({ schedule }, 'ETL cron registered')
}

// Allow manual trigger via CLI: tsx src/jobs/etl.ts
// Permite trigger manual: npx tsx src/jobs/etl.ts
const isMain = process.argv[1]?.endsWith('etl.ts')
if (isMain) {
  const { default: sqlClient } = await import('../db/client.js')
  const log = { info: console.log, error: console.error } as any
  await runEtl(log).finally(() => sqlClient.end())
}
