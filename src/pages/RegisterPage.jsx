import RegisterForm from '../components/RegisterForm'

function RegisterPage() {
  return (
    <div style={styles.container}>
      <RegisterForm />
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

export default RegisterPage
