import 'dotenv/config'
import sql from './client'

async function seed() {
  console.log('🌱  Seeding database...')

  // ── Campaigns ──────────────────────────────────────────────────────────────
  const campaigns = await sql`
    INSERT INTO campaigns (name, channel, status) VALUES
      ('Black Friday — Email',   'Email',    'active'),
      ('Google Ads — Marca',     'SEM',      'active'),
      ('SEO — Blog Recurrente',  'Orgánico', 'active'),
      ('Referidos — Partner Q3', 'Referido', 'pending'),
      ('Display — Retargeting',  'SEM',      'paused')
    ON CONFLICT DO NOTHING
    RETURNING id, name
  `
  console.log(`  ✓ ${campaigns.length} campaigns`)

  // ── Daily metrics (last 90 days) ──────────────────────────────────────────
  const channels = ['Orgánico','Email','SEM','Referido']
  const rows: { date: string; sessions: number; revenue: number; conversions: number; new_users: number; channel: string }[] = []

  for (let i = 89; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const date = d.toISOString().split('T')[0]
    const trend = 1 + (89 - i) / 200  // slow upward trend

    for (const channel of channels) {
      const base = channel === 'Orgánico' ? 700 : channel === 'Email' ? 500 : channel === 'SEM' ? 350 : 200
      const sessions   = Math.round(base * trend + Math.random() * 200 - 100)
      const convRate   = 0.025 + Math.random() * 0.04
      const revenue    = Math.round(sessions * convRate * 45 * 100) / 100
      const conversions = Math.round(sessions * convRate)
      const new_users  = Math.round(sessions * 0.3 + Math.random() * 50)
      rows.push({ date, sessions, revenue, conversions, new_users, channel })
    }
  }

  for (const r of rows) {
    await sql`
      INSERT INTO daily_metrics (date, sessions, revenue, conversions, new_users, channel)
      VALUES (${r.date}, ${r.sessions}, ${r.revenue}, ${r.conversions}, ${r.new_users}, ${r.channel})
      ON CONFLICT (date, channel, campaign_id) DO UPDATE
        SET sessions = EXCLUDED.sessions, revenue = EXCLUDED.revenue
    `
  }
  console.log(`  ✓ ${rows.length} daily metric rows`)

  // ── Funnel events ──────────────────────────────────────────────────────────
  const steps = ['visit','register','checkout','purchase','recurrent'] as const
  const stepBase = [84210, 52200, 23580, 11790, 5100]

  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const date = d.toISOString().split('T')[0]
    for (let s = 0; s < steps.length; s++) {
      const count = Math.round(stepBase[s] / 30 * (0.9 + Math.random() * 0.2))
      await sql`
        INSERT INTO funnel_events (date, step, count)
        VALUES (${date}, ${steps[s]}, ${count})
        ON CONFLICT (date, step) DO UPDATE SET count = EXCLUDED.count
      `
    }
  }
  console.log(`  ✓ funnel events`)

  // ── Activity feed ──────────────────────────────────────────────────────────
  await sql`
    INSERT INTO activity_feed (type, title, meta, created_at) VALUES
      ('up',    'Pico de tráfico orgánico',        '+34% · hace 12 min',                NOW() - INTERVAL '12 minutes'),
      ('email', 'Campaña email enviada',            '18,420 destinatarios · hace 2h',   NOW() - INTERVAL '2 hours'),
      ('warn',  'Conv. rate por debajo del umbral', 'Display Retargeting · hace 3h',    NOW() - INTERVAL '3 hours'),
      ('money', 'Meta mensual superada',            '€38.5k / €35k target · hoy',       NOW() - INTERVAL '6 hours')
    ON CONFLICT DO NOTHING
  `
  console.log(`  ✓ activity feed`)

  console.log('✅  Seed complete.')
  await sql.end()
}

seed().catch((e) => { console.error(e); process.exit(1) })
