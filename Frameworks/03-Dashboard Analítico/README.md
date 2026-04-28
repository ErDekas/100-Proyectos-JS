# Analytiq Dashboard

Dashboard analítico — **Fase 1: sin backend**, listo para crecer a Fase 2.

## Stack (Fase 1)

| Capa | Tecnología |
|------|-----------|
| Framework | React 18 + Vite + TypeScript |
| Estilos | Tailwind CSS + CSS variables |
| Estado UI | Zustand (`src/store/dashboard.ts`) |
| Fetching/cache | TanStack Query (`src/hooks/useDashboardData.ts`) |
| Gráficos | Chart.js + react-chartjs-2 |
| Deploy | Vercel / Netlify (build estático) |

## Arrancar el proyecto

```bash
npm install
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173).

## Estructura

```
src/
├── components/
│   ├── Sidebar.tsx          # Navegación lateral
│   ├── Topbar.tsx           # Barra superior + selector de período
│   ├── KpiGrid.tsx          # Tarjetas de métricas
│   ├── TrendChart.tsx       # Gráfico de líneas (sesiones + ingresos)
│   ├── ChannelChart.tsx     # Donut + leyenda de canales
│   ├── CampaignsTable.tsx   # Tabla de campañas
│   └── FunnelAndFeed.tsx    # Embudo + feed de actividad
├── data/
│   └── mock.ts              # Datos de ejemplo (Fase 1)
├── hooks/
│   └── useDashboardData.ts  # Hook TanStack Query — cambia aquí a API real
├── store/
│   └── dashboard.ts         # Zustand store (período, nav activo)
├── App.tsx
├── main.tsx
└── index.css
```

## Migrar a Fase 2 (cuando tengas backend)

1. **Sustituye los datos mock** en `src/hooks/useDashboardData.ts`:
   ```ts
   // Antes (mock):
   await new Promise(r => setTimeout(r, 200))
   return { kpis, ... }

   // Después (API real):
   const res = await fetch(`/api/dashboard?period=${period}`)
   return res.json()
   ```

2. **Añade auth** (Supabase Auth o Clerk): crea un `AuthProvider` en `main.tsx` y protege las rutas.

3. **Variables de entorno**: crea `.env.local` con `VITE_API_URL=https://tu-api.com`.

## Build y deploy

```bash
npm run build   # genera /dist
# Sube /dist a Vercel, Netlify o cualquier CDN estático
```
