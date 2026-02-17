import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import { selectIsLoggedIn, selectIsRefreshing } from '../store/authSlice'

function PrivateRoute({ children }) {
  const isLoggedIn = useSelector(selectIsLoggedIn)
  const isRefreshing = useSelector(selectIsRefreshing)

  // Token yenilenirken loading göster
  if (isRefreshing) {
    return (
      <div style={styles.container}>
        <div style={styles.spinner}></div>
        <p>Loading...</p>
      </div>
    )
  }

  // Giriş yapmamışsa login sayfasına yönlendir
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />
  }

  // Giriş yapmışsa children'ı göster
  return children
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '50vh',
    gap: '1rem',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #4a90e2',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
}

// CSS animation için global style eklenmesi gerekebilir
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.innerHTML = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `
  document.head.appendChild(style)
}

export default PrivateRoute
