import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { selectIsLoggedIn } from '../store/authSlice'
import UserMenu from './UserMenu'

function Navigation() {
  const isLoggedIn = useSelector(selectIsLoggedIn)

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        <Link to="/" style={styles.logo}>
          Contact Book
        </Link>

        <div style={styles.menu}>
          {isLoggedIn ? (
            <UserMenu />
          ) : (
            <div style={styles.authLinks}>
              <Link to="/register" style={styles.link}>
                Register
              </Link>
              <Link to="/login" style={styles.linkPrimary}>
                Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

const styles = {
  nav: {
    backgroundColor: '#f8f9fa',
    borderBottom: '1px solid #e0e0e0',
    padding: '1rem 0',
    marginBottom: '2rem',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#2c3e50',
    textDecoration: 'none',
  },
  menu: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  authLinks: {
    display: 'flex',
    gap: '1rem',
  },
  link: {
    color: '#555',
    textDecoration: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    transition: 'background-color 0.2s',
  },
  linkPrimary: {
    color: 'white',
    backgroundColor: '#4a90e2',
    textDecoration: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    transition: 'background-color 0.2s',
  },
}

export default Navigation
