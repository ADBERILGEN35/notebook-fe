import { Navigate, useLocation } from 'react-router-dom'

interface ProtectedRouteProps {
  children: React.ReactNode
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const location = useLocation()
  const token = localStorage.getItem('accessToken')

  if (!token) {
    // Giriş yapılmamışsa login sayfasına yönlendir
    return <Navigate to="/auth/sign-in" state={{ from: location }} replace />
  }

  return <>{children}</>
}

export default ProtectedRoute

