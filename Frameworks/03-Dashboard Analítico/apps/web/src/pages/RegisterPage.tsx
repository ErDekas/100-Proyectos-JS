import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login } from '../lib/api'
import { useAuthStore } from '../store/auth'
import { useToastStore } from '../store/toast'

export function RegisterPage() {
  const navigate  = useNavigate()
  const setAuth   = useAuthStore(s => s.setAuth)
  const addToast  = useToastStore(s => s.addToast)
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  function update(k: string, v: string) { setForm(f => ({ ...f, [k]: v })) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.password !== form.confirm) return setError('Las contraseñas no coinciden')
    if (form.password.length < 8) return setError('La contraseña debe tener al menos 8 caracteres')
    setLoading(true); setError('')

    try {
      // Signup (use direct fetch since signup endpoint returns no tokens)
      const API = import.meta.env.VITE_API_URL ?? ''
      const signupRes = await fetch(`${API}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password, name: form.name }),
      })
      if (!signupRes.ok) {
        const err = await signupRes.json()
        throw new Error(err.message ?? 'Error al registrarse')
      }

      // Auto login after signup via centralized apiFetch
      const data = await login(form.email, form.password)
      addToast('success', 'Cuenta creada correctamente')
      setAuth(data.user as any, data.accessToken, data.refreshToken)
      navigate('/')
    } catch (err: any) {
      addToast('error', err.message)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surf2)' }}>
      <div style={{ width: 400, background: 'var(--surf)', border: '0.5px solid var(--border2)', borderRadius: 16, padding: '36px 32px', boxShadow: '0 20px 60px rgba(0,0,0,.12)' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
          <div style={{ width: 34, height: 34, background: 'var(--blue)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 16 16" width={16} height={16} fill="white"><rect x="2" y="8" width="3" height="6"/><rect x="6.5" y="5" width="3" height="9"/><rect x="11" y="2" width="3" height="12"/></svg>
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.3px' }}>Analytiq</div>
            <div style={{ fontSize: 10, color: 'var(--ink3)', fontFamily: 'DM Mono, monospace' }}>Dashboard v2.0</div>
          </div>
        </div>

        <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.4px', marginBottom: 6 }}>Crear cuenta</h1>
        <p style={{ fontSize: 13, color: 'var(--ink3)', marginBottom: 24 }}>Accede a tu dashboard analítico</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { key: 'name',     label: 'Nombre',            type: 'text',     placeholder: 'Ana García' },
            { key: 'email',    label: 'Email',             type: 'email',    placeholder: 'ana@empresa.com' },
            { key: 'password', label: 'Contraseña',        type: 'password', placeholder: '••••••••' },
            { key: 'confirm',  label: 'Confirmar contraseña', type: 'password', placeholder: '••••••••' },
          ].map(f => (
            <label key={f.key}>
              <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--ink3)', fontFamily: 'DM Mono, monospace', letterSpacing: '.5px', textTransform: 'uppercase', marginBottom: 6 }}>
                {f.label}
              </div>
              <input
                type={f.type}
                value={(form as any)[f.key]}
                onChange={e => update(f.key, e.target.value)}
                placeholder={f.placeholder}
                required
                style={{ width: '100%', padding: '9px 12px', borderRadius: 7, border: '0.5px solid var(--border2)', background: 'var(--surf2)', color: 'var(--ink)', fontSize: 13, fontFamily: 'Sora, sans-serif', outline: 'none' }}
              />
            </label>
          ))}

          {error && (
            <div style={{ fontSize: 12, color: 'var(--red)', background: 'var(--red-l)', padding: '8px 12px', borderRadius: 6 }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{ padding: '10px', borderRadius: 7, background: loading ? 'var(--ink3)' : 'var(--blue)', color: '#fff', fontWeight: 600, fontSize: 13, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Sora, sans-serif', marginTop: 4 }}>
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>

          <p style={{ fontSize: 12, color: 'var(--ink3)', textAlign: 'center' }}>
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" style={{ color: 'var(--blue)', textDecoration: 'none', fontWeight: 500 }}>Inicia sesión</Link>
          </p>
        </form>
      </div>
    </div>
  )
}