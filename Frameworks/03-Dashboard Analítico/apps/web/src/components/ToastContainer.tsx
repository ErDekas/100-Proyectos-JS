import { useToastStore } from '../store/toast'

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'fixed', top: 16, right: 16, zIndex: 9999,
    display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 360,
  },
  toast: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 16px', borderRadius: 8,
    fontSize: 13, fontWeight: 500,
    boxShadow: '0 4px 16px rgba(0,0,0,.15)',
    animation: 'toastIn .25s ease-out',
  },
}

const bg: Record<string, string> = {
  success: '#065f46',
  error:   '#991b1b',
  info:    '#1e3a5f',
}

const icons: Record<string, string> = {
  success: '\u2713',
  error:   '\u2717',
  info:    '\u2139',
}

export function ToastContainer() {
  const toasts = useToastStore(s => s.toasts)
  const remove = useToastStore(s => s.removeToast)
  if (!toasts.length) return null

  return (
    <div style={styles.container}>
      {toasts.map(t => (
        <div
          key={t.id}
          onClick={() => remove(t.id)}
          style={{ ...styles.toast, background: bg[t.type], color: '#fff', cursor: 'pointer' }}
        >
          <span style={{ fontSize: 15 }}>{icons[t.type]}</span>
          <span style={{ flex: 1 }}>{t.message}</span>
        </div>
      ))}
    </div>
  )
}
