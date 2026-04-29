import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthed = useAuthStore(s => s.isAuthed)
  if (!isAuthed) return <Navigate to="/login" replace />
  return <>{children}</>
}
