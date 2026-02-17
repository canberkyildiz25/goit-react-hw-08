import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { register } from '../redux/authOps'
import { selectAuthStatus } from '../store/authSlice'

function RegisterForm() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const status = useSelector(selectAuthStatus)

  const [formData, setFormData] = useState({
    name: '',
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
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password,
    }

    if (!payload.name || !payload.email || !payload.password) {
      return
    }

    const result = await dispatch(register(payload))

    if (result.type === 'auth/register/fulfilled') {
      toast.success('Registration successful! Welcome!')
      navigate('/contacts')
    } else {
      const errorMessage = result.payload

      // Status code veya mesaj içeriğine göre kontrol
      if (errorMessage?.includes('400:') ||
          errorMessage?.includes('409:') ||
          errorMessage?.toLowerCase().includes('already') ||
          errorMessage?.toLowerCase().includes('exist') ||
          errorMessage?.toLowerCase().includes('in use') ||
          errorMessage?.toLowerCase().includes('duplicate')) {
        toast.error('Kullanıcı zaten kayıtlı')
      } else {
        toast.error('Kayıt başarısız. Lütfen tekrar deneyin.')
      }
    }
  }

  const isLoading = status === 'loading'

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <div className="form-header">
        <div>
          <p className="form-eyebrow">Welcome</p>
          <h2>Register</h2>
        </div>
      </div>

      <div className="form-grid">
        <label>
          Full Name
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="John Doe"
            required
            disabled={isLoading}
            autoComplete="name"
          />
        </label>

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
            placeholder="At least 6 characters"
            required
            minLength={6}
            disabled={isLoading}
            autoComplete="new-password"
          />
        </label>
      </div>

      <button type="submit" className="primary-button" disabled={isLoading}>
        {isLoading ? 'Registering...' : 'Register'}
      </button>

      <p style={{ marginTop: '1rem', textAlign: 'center' }}>
        Already have an account?{' '}
        <Link to="/login" style={{ color: '#4a90e2', textDecoration: 'underline' }}>
          Login
        </Link>
      </p>
    </form>
  )
}

export default RegisterForm
