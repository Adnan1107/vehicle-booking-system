import { Navigate, useLocation } from 'react-router-dom'
import { isAuthenticated, isAdmin } from '../utils/api'

// Previously this only checked localStorage.getItem('user'), so a stale
// 'user' entry with no valid token still let someone in. Now requires both.
export default function ProtectedRoute({ children }) {
  const location = useLocation()

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return children
}

// For admin-only pages (Admin Dashboard, vehicle management, etc.).
export function AdminRoute({ children }) {
  const location = useLocation()

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (!isAdmin()) {
    return <Navigate to="/" replace />
  }

  return children
}