import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LoginPage }      from './pages/LoginPage'
import { RegisterPage }   from './pages/RegisterPage'
import { NotFoundPage }   from './pages/NotFoundPage'
import { ProtectedRoute } from './components/ProtectedRoute'
import { ToastContainer } from './components/ToastContainer'
import { Dashboard }      from './pages/Dashboard'
import { useAuthStore }   from './store/auth'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:          1000 * 60 * 2,
      refetchOnWindowFocus: false,
      retry: (count, err: any) => {
        if (err?.status === 401) return false   // don't retry auth errors
        return count < 2
      },
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ToastContainer />
        <Routes>
          <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
          <Route path="/"         element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="*"         element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const isAuthed = useAuthStore(s => s.isAuthed)
  return isAuthed ? <Navigate to="/" replace /> : <>{children}</>
}