import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { login } from '../redux/authOps'
import { selectAuthStatus } from '../store/authSlice'

function LoginForm() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const status = useSelector(selectAuthStatus)

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleChange = event => {
    const { name, value } = event.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async event => {
    event.preventDefault()

    const payload = {
      email: formData.email.trim(),
      password: formData.password,
    }

    if (!payload.email || !payload.password) {
      return
    }

    const result = await dispatch(login(payload))

    if (result.type === 'auth/login/fulfilled') {
      toast.success(`Welcome back, ${result.payload.user.name}!`)
      navigate('/contacts')
    } else {
      toast.error(result.payload || 'Login failed. Please check your credentials.')
    }
  }

  const isLoading = status === 'loading'

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <div className="form-header">
        <div>
          <p className="form-eyebrow">Welcome back</p>
          <h2>Login</h2>
        </div>
      </div>

      <div className="form-grid">
        <label>
          Email
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="john@example.com"
            required
            disabled={isLoading}
            autoComplete="username"
          />
        </label>

        <label>
          Password
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
            disabled={isLoading}
            autoComplete="current-password"
          />
        </label>
      </div>

      <button type="submit" className="primary-button" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </button>

      <p style={{ marginTop: '1rem', textAlign: 'center' }}>
        Don't have an account?{' '}
        <Link to="/register" style={{ color: '#4a90e2', textDecoration: 'underline' }}>
          Register
        </Link>
      </p>
    </form>
  )
}

export default LoginForm
