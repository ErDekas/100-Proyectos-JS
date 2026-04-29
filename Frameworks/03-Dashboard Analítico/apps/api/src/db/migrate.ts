import 'dotenv/config'
import sql from './client'

async function migrate() {
  console.log('🗄️  Running migrations...')

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email       TEXT UNIQUE NOT NULL,
      name        TEXT NOT NULL,
      role        TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'viewer')),
      avatar_url  TEXT,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS campaigns (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name        TEXT NOT NULL,
      channel     TEXT NOT NULL,
      status      TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','pending','paused')),
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS daily_metrics (
      id          BIGSERIAL PRIMARY KEY,
      date        DATE NOT NULL,
      sessions    INTEGER NOT NULL DEFAULT 0,
      revenue     NUMERIC(12,2) NOT NULL DEFAULT 0,
      conversions INTEGER NOT NULL DEFAULT 0,
      new_users   INTEGER NOT NULL DEFAULT 0,
      channel     TEXT NOT NULL DEFAULT 'all',
      campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (date, channel, campaign_id)
    )
  `

  await sql`
    CREATE INDEX IF NOT EXISTS daily_metrics_date_idx ON daily_metrics(date DESC)
  `

  await sql`
    CREATE TABLE IF NOT EXISTS funnel_events (
      id          BIGSERIAL PRIMARY KEY,
      date        DATE NOT NULL,
      step        TEXT NOT NULL CHECK (step IN ('visit','register','checkout','purchase','recurrent')),
      count       INTEGER NOT NULL DEFAULT 0,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (date, step)
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS activity_feed (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      type        TEXT NOT NULL CHECK (type IN ('up','email','warn','money')),
      title       TEXT NOT NULL,
      meta        TEXT NOT NULL,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `

  await sql`
    CREATE INDEX IF NOT EXISTS activity_feed_created_idx ON activity_feed(created_at DESC)
  `

  await sql`
    CREATE TABLE IF NOT EXISTS etl_jobs (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name        TEXT NOT NULL,
      status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','running','success','error')),
      started_at  TIMESTAMPTZ,
      finished_at TIMESTAMPTZ,
      error       TEXT,
      rows_upserted INTEGER DEFAULT 0,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `

  console.log('✅  Migrations complete.')
  await sql.end()
}

migrate().catch((e) => { console.error(e); process.exit(1) })
