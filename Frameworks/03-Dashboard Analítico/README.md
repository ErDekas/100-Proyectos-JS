# Analytiq Dashboard — Fase 2

Stack completo según arquitectura: **API Node.js + Auth Supabase + PostgreSQL + ETL Jobs + Sentry**.

## Estructura del monorepo

```
analytiq-fase2/
├── apps/
│   ├── api/                    # Backend Fastify + TypeScript
│   │   ├── src/
│   │   │   ├── server.ts       # Entrypoint Fastify
│   │   │   ├── routes/
│   │   │   │   ├── auth.ts     # POST /api/auth/login|signup|refresh|logout, GET /me
│   │   │   │   └── dashboard.ts# GET /api/dashboard?period=30d
│   │   │   ├── services/
│   │   │   │   └── dashboard.service.ts  # Queries SQL agregadas
│   │   │   ├── middleware/
│   │   │   │   └── auth.ts     # Validación JWT Supabase
│   │   │   ├── jobs/
│   │   │   │   └── etl.ts      # Cron job ETL + trigger manual
│   │   │   ├── db/
│   │   │   │   ├── client.ts   # postgres pool
│   │   │   │   ├── migrate.ts  # npm run db:migrate
│   │   │   │   └── seed.ts     # npm run db:seed
│   │   │   └── lib/
│   │   │       ├── supabase.ts # Admin client
│   │   │       └── sentry.ts   # Observabilidad API
│   └── web/                    # Frontend React + Vite
│       ├── src/
│       │   ├── pages/
│       │   │   ├── LoginPage.tsx
│       │   │   └── Dashboard.tsx
│       │   ├── components/     # KpiGrid, TrendChart, ChannelChart, etc.
│       │   ├── hooks/
│       │   │   └── useDashboardData.ts  # TanStack Query → API real
│       │   ├── store/
│       │   │   ├── auth.ts     # Zustand auth state (persistido)
│       │   │   └── dashboard.ts# Zustand UI state
│       │   └── lib/
│       │       ├── api.ts      # fetch wrapper con auth + refresh
│       │       └── sentry.ts   # Sentry frontend
└── packages/
    └── shared/
        └── src/index.ts        # Tipos compartidos API ↔ Web
```

## Setup paso a paso

### 1. Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com)
2. Copia `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_KEY` y `DATABASE_URL`

### 2. Sentry

1. Crea proyectos en [sentry.io](https://sentry.io) (uno Node.js, uno React)
2. Copia los DSNs

### 3. Variables de entorno

```bash
# API
cp apps/api/.env.example apps/api/.env
# Rellena con tus credenciales

# Web
cp apps/web/.env.example apps/web/.env.local
# Rellena con tus credenciales
```

### 4. Instalar dependencias

```bash
npm install
```

### 5. Base de datos

```bash
npm run db:migrate   # Crea las tablas
npm run db:seed      # Rellena con datos de ejemplo (90 días)
```

### 6. Desarrollar

```bash
npm run dev          # Arranca API (port 3001) y Web (port 5173) en paralelo
```

Swagger/OpenAPI disponible en `http://localhost:3001/docs`

### 7. Build y deploy

```bash
npm run build

# API → Railway / Render / Fly.io
# Web → Vercel (apunta a apps/web, output dist)
```

## Endpoints API

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | /api/auth/signup | — | Crear usuario |
| POST | /api/auth/login | — | Login → JWT |
| POST | /api/auth/refresh | — | Renovar token |
| POST | /api/auth/logout | ✓ | Invalidar sesión |
| GET  | /api/auth/me | ✓ | Usuario actual |
| GET  | /api/dashboard?period=30d | ✓ | Payload completo |
| GET  | /health | — | Health check |

## ETL Jobs

El cron corre cada hora por defecto (`ETL_CRON_SCHEDULE=0 * * * *`).

Para ejecutar manualmente:
```bash
cd apps/api && npx tsx src/jobs/etl.ts
```

Para conectar tu fuente de datos real, edita `fetchExternalMetrics()` en `apps/api/src/jobs/etl.ts`.

## Observabilidad

- **API**: Sentry capta excepciones + OpenTelemetry traces en todas las rutas Fastify
- **Web**: Sentry React capta errores de UI + Session Replay en producción
- **Logs**: Pino structured logging, con pino-pretty en desarrollo
- **ETL**: Cada job queda registrado en tabla `etl_jobs` con estado, duración y filas procesadas
