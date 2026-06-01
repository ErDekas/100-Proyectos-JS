import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login } from '../lib/api'
import { useAuthStore } from '../store/auth'

export function LoginPage() {
  const navigate   = useNavigate()
  const setAuth    = useAuthStore(s => s.setAuth)
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const data = await login(email, password)
      setAuth(data.user as any, data.accessToken, data.refreshToken)
      navigate('/')
    } catch (err: any) {
      setError(err.message ?? 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--surf2)',
    }}>
      <div style={{
        width: 380, background: 'var(--surf)', border: '0.5px solid var(--border2)',
        borderRadius: 16, padding: '36px 32px', boxShadow: '0 20px 60px rgba(0,0,0,.12)',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
          <div style={{ width: 34, height: 34, background: 'var(--blue)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 16 16" width={16} height={16} fill="white">
              <rect x="2" y="8" width="3" height="6"/><rect x="6.5" y="5" width="3" height="9"/><rect x="11" y="2" width="3" height="12"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.3px' }}>Analytiq</div>
            <div style={{ fontSize: 10, color: 'var(--ink3)', fontFamily: 'DM Mono, monospace' }}>Dashboard v2.0</div>
          </div>
        </div>

        <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.4px', marginBottom: 6 }}>
          Iniciar sesión
        </h1>
        <p style={{ fontSize: 13, color: 'var(--ink3)', marginBottom: 24 }}>
          Accede a tu dashboard analítico
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <label>
            <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--ink3)', fontFamily: 'DM Mono, monospace', letterSpacing: '.5px', textTransform: 'uppercase', marginBottom: 6 }}>
              Email
            </div>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)} required
              placeholder="ana@empresa.com"
              style={{
                width: '100%', padding: '9px 12px', borderRadius: 7, border: '0.5px solid var(--border2)',
                background: 'var(--surf2)', color: 'var(--ink)', fontSize: 13, fontFamily: 'Sora, sans-serif',
                outline: 'none', transition: 'border-color .12s',
              }}
            />
          </label>

          <label>
            <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--ink3)', fontFamily: 'DM Mono, monospace', letterSpacing: '.5px', textTransform: 'uppercase', marginBottom: 6 }}>
              Contraseña
            </div>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)} required
              placeholder="••••••••"
              style={{
                width: '100%', padding: '9px 12px', borderRadius: 7, border: '0.5px solid var(--border2)',
                background: 'var(--surf2)', color: 'var(--ink)', fontSize: 13, fontFamily: 'Sora, sans-serif',
                outline: 'none',
              }}
            />
          </label>

          {error && (
            <div style={{ fontSize: 12, color: 'var(--red)', background: 'var(--red-l)', padding: '8px 12px', borderRadius: 6 }}>
              {error}
            </div>
          )}

          <button
            type="submit" disabled={loading}
            style={{
              padding: '10px', borderRadius: 7, background: loading ? 'var(--ink3)' : 'var(--blue)',
              color: '#fff', fontWeight: 600, fontSize: 13, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'Sora, sans-serif', marginTop: 4, transition: 'background .12s',
            }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>

          <p style={{ fontSize: 12, color: 'var(--ink3)', textAlign: 'center', marginTop: 8 }}>
            ¿No tienes cuenta?{' '}
            <Link to="/register" style={{ color: 'var(--blue)', textDecoration: 'none', fontWeight: 500 }}>Crear cuenta</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
