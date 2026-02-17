import LoginForm from '../components/LoginForm'

function LoginPage() {
  return (
    <div style={styles.container}>
      <LoginForm />
    </div>
  )
}

const styles = {
  container: {
    maxWidth: '600px',
    margin: '2rem auto',
    padding: '0 2rem',
  },
}

export default LoginPage
