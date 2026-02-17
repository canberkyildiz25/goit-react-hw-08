import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import { selectIsLoggedIn } from '../store/authSlice'

function PublicRoute({ children }) {
  const isLoggedIn = useSelector(selectIsLoggedIn)

  // Zaten giriş yapmışsa contacts sayfasına yönlendir
  if (isLoggedIn) {
    return <Navigate to="/contacts" replace />
  }

  // Giriş yapmamışsa children'ı göster
  return children
}

export default PublicRoute
