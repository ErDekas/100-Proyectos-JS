import { useDashboardStore, type NavItem } from '../store/dashboard'
import { clsx } from 'clsx'
import type { User } from '@analytiq/shared'

interface NavLink { id: NavItem; label: string; badge?: string; icon: React.ReactNode }

const IconGrid = () => <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width={15} height={15}><rect x="1" y="1" width="6" height="6" rx="1"/><rect x="9" y="1" width="6" height="6" rx="1"/><rect x="1" y="9" width="6" height="6" rx="1"/><rect x="9" y="9" width="6" height="6" rx="1"/></svg>
const IconTrend  = () => <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width={15} height={15}><polyline points="1,12 5,7 8,9 12,4 15,6"/></svg>
const IconFunnel = () => <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width={15} height={15}><circle cx="8" cy="8" r="6"/><line x1="8" y1="4" x2="8" y2="8"/><line x1="8" y1="8" x2="11" y2="10"/></svg>
const IconReport = () => <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width={15} height={15}><rect x="2" y="3" width="12" height="10" rx="1"/><line x1="2" y1="7" x2="14" y2="7"/><line x1="6" y1="7" x2="6" y2="13"/></svg>
const IconUser   = () => <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width={15} height={15}><circle cx="8" cy="6" r="3"/><path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6"/></svg>
const IconMail   = () => <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width={15} height={15}><rect x="1" y="4" width="14" height="9" rx="1"/><polyline points="1,5 8,10 15,5"/></svg>
const IconCart   = () => <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width={15} height={15}><path d="M3 3h10l1 8H2L3 3z"/><circle cx="6" cy="13" r="1"/><circle cx="11" cy="13" r="1"/></svg>
const IconLogout = () => <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width={14} height={14}><path d="M10 3h3a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-3"/><polyline points="7,11 10,8 7,5"/><line x1="1" y1="8" x2="10" y2="8"/></svg>

const mainLinks: NavLink[] = [
  { id: 'overview',     label: 'Overview',     badge: 'Live', icon: <IconGrid /> },
  { id: 'tendencias',   label: 'Tendencias',                  icon: <IconTrend /> },
  { id: 'embudo',       label: 'Embudo',                      icon: <IconFunnel /> },
  { id: 'reportes',     label: 'Reportes',                    icon: <IconReport /> },
]

const channelLinks: NavLink[] = [
  { id: 'campanas',     label: 'Campañas',     icon: <IconMail /> },
  { id: 'conversiones', label: 'Conversiones', icon: <IconCart /> },
]

interface SidebarProps {
  user:     User | null
  onLogout: () => void
}

export function Sidebar({ user, onLogout }: SidebarProps) {
  const { activeNav, setActiveNav } = useDashboardStore()
  const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase() ?? '??'

  return (
    <aside style={{ background: 'var(--surf)', borderRight: '0.5px solid var(--border2)', display: 'flex', flexDirection: 'column', width: 220, flexShrink: 0, minHeight: '100vh' }}>
      <div style={{ padding: '20px 20px 16px', borderBottom: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 30, height: 30, background: 'var(--blue)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg viewBox="0 0 16 16" width={16} height={16} fill="white"><rect x="2" y="8" width="3" height="6"/><rect x="6.5" y="5" width="3" height="9"/><rect x="11" y="2" width="3" height="12"/></svg>
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.3px' }}>Analytiq</div>
          <div style={{ fontSize: 10, color: 'var(--ink3)', fontFamily: 'DM Mono, monospace' }}>v2.0 · fase 2</div>
        </div>
      </div>

      <nav style={{ padding: 12, flex: 1 }}>
        <NavSection label="Principal" links={mainLinks}  active={activeNav} onSelect={setActiveNav} />
        <NavSection label="Canales" links={[
          ...(user?.role === 'admin' ? [{ id: 'usuarios' as NavItem, label: 'Usuarios', icon: <IconUser /> }] : []),
          ...channelLinks,
        ]} active={activeNav} onSelect={setActiveNav} />
      </nav>

      <div style={{ padding: '14px 12px', borderTop: '0.5px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: '#fff', flexShrink: 0 }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name ?? 'Usuario'}</p>
            <span style={{ fontSize: 10, color: 'var(--ink3)', fontFamily: 'DM Mono, monospace' }}>{user?.role ?? 'viewer'}</span>
          </div>
          <button onClick={onLogout} title="Cerrar sesión"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink3)', padding: 4, borderRadius: 4, display: 'flex', alignItems: 'center' }}>
            <IconLogout />
          </button>
        </div>
      </div>
    </aside>
  )
}

function NavSection({ label, links, active, onSelect }: { label: string; links: NavLink[]; active: NavItem; onSelect: (id: NavItem) => void }) {
  return (
    <>
      <div style={{ fontSize: 10, fontWeight: 500, color: 'var(--ink3)', letterSpacing: '.8px', textTransform: 'uppercase', padding: '8px 8px 6px', fontFamily: 'DM Mono, monospace', marginTop: 8 }}>
        {label}
      </div>
      {links.map(link => (
        <div key={link.id} className={clsx('nav-item', { active: active === link.id })} onClick={() => onSelect(link.id)}>
          {link.icon}
          <span style={{ flex: 1 }}>{link.label}</span>
          {link.badge && (
            <span style={{ fontSize: 10, fontFamily: 'DM Mono, monospace', background: 'var(--blue-t)', color: 'var(--blue)', padding: '1px 6px', borderRadius: 4 }}>
              {link.badge}
            </span>
          )}
        </div>
      ))}
    </>
  )
}
