import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { updateContact } from '../redux/contactsOps'
import { clearEditingContact } from '../store/uiSlice'
import './EditModal.css'

const emptyContact = {
  name: '',
  phone: '',
  email: '',
  avatar: '',
}

function EditModalContent({ editingContact, onClose }) {
  const dispatch = useDispatch()
  const [formData, setFormData] = useState(() => ({ ...emptyContact, ...editingContact }))

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
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
    await dispatch(updateContact({ id: editingContact.id, updates: payload }))
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit contact</h2>
          <button type="button" className="close-button" onClick={onClose}>
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
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
          <div className="modal-actions">
            <button type="button" className="ghost-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary-button">
              Save changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function EditModal() {
  const dispatch = useDispatch()
  const editingContact = useSelector((state) => state.ui.editingContact)

  const handleClose = () => {
    dispatch(clearEditingContact())
  }

  if (!editingContact) {
    return null
  }

  return (
    <EditModalContent 
      key={editingContact.id} 
      editingContact={editingContact} 
      onClose={handleClose} 
    />
  )
}

export default EditModal
