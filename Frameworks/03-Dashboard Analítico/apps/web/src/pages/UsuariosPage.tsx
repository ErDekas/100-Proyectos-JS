import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '../store/auth'
import { useToastStore } from '../store/toast'

interface UserRecord {
  id: string
  email: string
  name: string
  role: 'admin' | 'viewer'
  created_at: string
  last_sign_in_at?: string
}

const API = import.meta.env.VITE_API_URL ?? ''

function useUsers() {
  const token = useAuthStore(s => s.token)
  const [users,   setUsers]   = useState<UserRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  const load = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/users`, { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error('Sin acceso')
      setUsers(await res.json())
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }, [token])

  useEffect(() => { load() }, [load])
  return { users, loading, error, reload: load, setUsers }
}

export function UsuariosPage() {
  const token   = useAuthStore(s => s.token)
  const me      = useAuthStore(s => s.user)
  const { users, loading, error, reload } = useUsers()

  const [showCreate, setShowCreate] = useState(false)
  const [editUser,   setEditUser]   = useState<UserRecord | null>(null)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'viewer' as 'admin' | 'viewer' })
  const [saving, setSaving] = useState(false)
  const [msg,    setMsg]    = useState('')
  const addToast = useToastStore(s => s.addToast)

  function resetForm() { setForm({ name: '', email: '', password: '', role: 'viewer' }) }

  async function createUser() {
    setSaving(true)
    try {
      const res = await fetch(`${API}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      addToast('success', 'Usuario creado correctamente'); setShowCreate(false); resetForm(); reload()
    } catch (e: any) { addToast('error', e.message) }
    finally { setSaving(false) }
  }

  async function updateUser() {
    if (!editUser) return
    setSaving(true)
    try {
      const body: any = { name: form.name, role: form.role }
      if (form.password) body.password = form.password
      const res = await fetch(`${API}/api/users/${editUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      addToast('success', 'Usuario actualizado'); setEditUser(null); resetForm(); reload()
    } catch (e: any) { addToast('error', e.message) }
    finally { setSaving(false) }
  }

  async function deleteUser(id: string) {
    if (!confirm('¿Borrar este usuario?')) return
    try {
      await fetch(`${API}/api/users/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      reload()
    } catch (e: any) { setMsg(e.message) }
  }

  const isAdmin = me?.role === 'admin'

  const FormModal = ({ title, onSave }: { title: string; onSave: () => void }) => (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
      <div style={{ background: 'var(--surf)', borderRadius: 14, padding: '28px 28px', width: 380, border: '0.5px solid var(--border2)' }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', marginBottom: 20 }}>{title}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { key: 'name',     label: 'Nombre',      type: 'text',     placeholder: 'Ana García' },
            { key: 'email',    label: 'Email',        type: 'email',    placeholder: 'ana@empresa.com', hide: !!editUser },
            { key: 'password', label: editUser ? 'Nueva contraseña (opcional)' : 'Contraseña', type: 'password', placeholder: '••••••••' },
          ].filter(f => !f.hide).map(f => (
            <label key={f.key}>
              <div style={{ fontSize: 10, fontWeight: 500, color: 'var(--ink3)', fontFamily: 'DM Mono, monospace', letterSpacing: '.5px', textTransform: 'uppercase', marginBottom: 5 }}>{f.label}</div>
              <input type={f.type} value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder}
                style={{ width: '100%', padding: '8px 11px', borderRadius: 6, border: '0.5px solid var(--border2)', background: 'var(--surf2)', color: 'var(--ink)', fontSize: 13, fontFamily: 'Sora, sans-serif', outline: 'none' }} />
            </label>
          ))}
          <label>
            <div style={{ fontSize: 10, fontWeight: 500, color: 'var(--ink3)', fontFamily: 'DM Mono, monospace', letterSpacing: '.5px', textTransform: 'uppercase', marginBottom: 5 }}>Rol</div>
            <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value as any }))}
              style={{ width: '100%', padding: '8px 11px', borderRadius: 6, border: '0.5px solid var(--border2)', background: 'var(--surf2)', color: 'var(--ink)', fontSize: 13, fontFamily: 'Sora, sans-serif', outline: 'none' }}>
              <option value="viewer">Viewer</option>
              <option value="admin">Admin</option>
            </select>
          </label>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
          <button onClick={() => { setShowCreate(false); setEditUser(null); resetForm() }}
            style={{ flex: 1, padding: '9px', borderRadius: 6, fontSize: 13, cursor: 'pointer', border: '0.5px solid var(--border2)', background: 'transparent', color: 'var(--ink2)', fontFamily: 'Sora, sans-serif' }}>
            Cancelar
          </button>
          <button onClick={onSave} disabled={saving}
            style={{ flex: 1, padding: '9px', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none', background: 'var(--blue)', color: '#fff', fontFamily: 'Sora, sans-serif' }}>
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
      {(showCreate) && <FormModal title="Crear usuario" onSave={createUser} />}
      {(editUser)   && <FormModal title="Editar usuario" onSave={updateUser} />}

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--ink)', flex: 1, letterSpacing: '-0.4px' }}>Gestión de usuarios</h2>
        {isAdmin && (
          <button onClick={() => { resetForm(); setShowCreate(true) }}
            style={{ padding: '7px 16px', borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: 'pointer', border: 'none', background: 'var(--blue)', color: '#fff', fontFamily: 'Sora, sans-serif' }}>
            + Nuevo usuario
          </button>
        )}
      </div>

      {msg && <div style={{ padding: '10px 14px', borderRadius: 7, background: 'var(--green-l)', color: 'var(--green)', fontSize: 12, border: '0.5px solid var(--green)' }}>{msg}</div>}
      {error && <div style={{ padding: '10px 14px', borderRadius: 7, background: 'var(--red-l)', color: 'var(--red)', fontSize: 12 }}>{error === 'Sin acceso' ? '⚠️ Solo los administradores pueden gestionar usuarios.' : error}</div>}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: 'var(--surf3)' }}>
              {['Usuario', 'Email', 'Rol', 'Creado', 'Último acceso', ...(isAdmin ? ['Acciones'] : [])].map(h => (
                <th key={h} style={{ fontSize: 10, fontWeight: 500, color: 'var(--ink3)', letterSpacing: '.6px', textTransform: 'uppercase', fontFamily: 'DM Mono, monospace', padding: '12px 16px', textAlign: 'left' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: 'var(--ink3)' }}>Cargando usuarios...</td></tr>
            ) : users.map((u, i) => (
              <tr key={u.id} style={{ borderBottom: i < users.length - 1 ? '0.5px solid var(--border)' : 'none' }}>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, color: '#fff', flexShrink: 0 }}>
                      {u.name?.slice(0, 2).toUpperCase() ?? '??'}
                    </div>
                    <span style={{ fontWeight: 500, color: 'var(--ink)' }}>{u.name}</span>
                  </div>
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--ink2)', fontFamily: 'DM Mono, monospace', fontSize: 11 }}>{u.email}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 500, fontFamily: 'DM Mono, monospace', background: u.role === 'admin' ? 'var(--blue-l)' : 'var(--surf3)', color: u.role === 'admin' ? 'var(--blue)' : 'var(--ink3)' }}>
                    {u.role}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--ink3)', fontFamily: 'DM Mono, monospace', fontSize: 11 }}>
                  {new Date(u.created_at).toLocaleDateString('es')}
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--ink3)', fontFamily: 'DM Mono, monospace', fontSize: 11 }}>
                  {u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString('es') : '—'}
                </td>
                {isAdmin && (
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => { setForm({ name: u.name, email: u.email, password: '', role: u.role }); setEditUser(u) }}
                        style={{ padding: '4px 10px', borderRadius: 5, fontSize: 11, cursor: 'pointer', border: '0.5px solid var(--border2)', background: 'transparent', color: 'var(--ink2)', fontFamily: 'Sora, sans-serif' }}>
                        Editar
                      </button>
                      {u.id !== me?.id && (
                        <button onClick={() => deleteUser(u.id)}
                          style={{ padding: '4px 10px', borderRadius: 5, fontSize: 11, cursor: 'pointer', border: '0.5px solid var(--red)', background: 'var(--red-l)', color: 'var(--red)', fontFamily: 'Sora, sans-serif' }}>
                          Borrar
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}