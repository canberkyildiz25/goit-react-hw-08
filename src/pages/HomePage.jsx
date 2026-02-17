import { useSelector } from 'react-redux'
import { Link, Navigate } from 'react-router-dom'
import { selectIsLoggedIn } from '../store/authSlice'

function HomePage() {
  const isLoggedIn = useSelector(selectIsLoggedIn)

  // Zaten giriş yapmışsa contacts sayfasına yönlendir
  if (isLoggedIn) {
    return <Navigate to="/contacts" replace />
  }

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.title}>Welcome to Contact Book</h1>
        <p style={styles.subtitle}>
          Manage all your contacts in one place. Register or login to get started.
        </p>
        <div style={styles.buttonGroup}>
          <Link to="/register" style={styles.buttonPrimary}>
            Register
          </Link>
          <Link to="/login" style={styles.buttonSecondary}>
            Login
          </Link>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '70vh',
    padding: '2rem',
  },
  content: {
    textAlign: 'center',
    maxWidth: '600px',
  },
  title: {
    fontSize: '2.5rem',
    marginBottom: '1rem',
    color: '#2c3e50',
  },
  subtitle: {
    fontSize: '1.2rem',
    marginBottom: '2rem',
    color: '#555',
  },
  buttonGroup: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#4a90e2',
    color: 'white',
    padding: '1rem 2rem',
    borderRadius: '4px',
    textDecoration: 'none',
    fontSize: '1rem',
    transition: 'background-color 0.2s',
  },
  buttonSecondary: {
    backgroundColor: '#f8f9fa',
    color: '#2c3e50',
    padding: '1rem 2rem',
    borderRadius: '4px',
    textDecoration: 'none',
    fontSize: '1rem',
    border: '1px solid #e0e0e0',
    transition: 'background-color 0.2s',
  },
}

export default HomePage
