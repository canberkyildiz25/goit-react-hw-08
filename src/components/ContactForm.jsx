import { useState } from 'react'

const emptyContact = {
  name: '',
  phone: '',
  email: '',
  avatar: '',
}

function ContactForm({ onSubmit }) {
  const [formData, setFormData] = useState(emptyContact)

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const payload = {
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      avatar: formData.avatar.trim(),
    }
    if (!payload.name || !payload.phone) {
      return
    }
    onSubmit(payload)
    setFormData(emptyContact)
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <div className="form-header">
        <div>
          <p className="form-eyebrow">Contact greenhouse</p>
          <h2>Add new contact</h2>
        </div>
      </div>
      <div className="form-grid">
        <label>
          Full name
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Olivia Green"
            required
          />
        </label>
        <label>
          Phone
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+90 555 123 45 67"
            required
          />
        </label>
        <label>
          Email
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="olivia@leafline.com"
          />
        </label>
        <label>
          Avatar URL
          <input
            type="url"
            name="avatar"
            value={formData.avatar}
            onChange={handleChange}
            placeholder="https://..."
          />
        </label>
      </div>
      <button type="submit" className="primary-button">
        Add contact
      </button>
    </form>
  )
}

export default ContactForm
