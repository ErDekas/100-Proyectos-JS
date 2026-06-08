import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surf2)', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 64, fontWeight: 700, color: 'var(--ink2)', letterSpacing: '-2px', fontFamily: 'DM Mono, monospace' }}>404</div>
      <div style={{ fontSize: 15, color: 'var(--ink3)' }}>Página no encontrada</div>
      <Link to="/" style={{ padding: '8px 20px', borderRadius: 7, background: 'var(--blue)', color: '#fff', fontSize: 13, fontWeight: 600, textDecoration: 'none', fontFamily: 'Sora, sans-serif' }}>
        Volver al dashboard
      </Link>
    </div>
  )
}
