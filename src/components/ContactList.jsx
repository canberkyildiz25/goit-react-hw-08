import { useDispatch, useSelector } from 'react-redux'
import { selectFilteredContacts } from '../store/contactsSlice'
import { deleteContact } from '../redux/contactsOps'
import { setEditingContact } from '../store/uiSlice'

const getInitials = (name) => {
  if (!name) {
    return '??'
  }
  const parts = name.trim().split(' ')
  const first = parts[0]?.[0] || ''
  const second = parts[1]?.[0] || ''
  return `${first}${second}`.toUpperCase()
}

function ContactList() {
  const dispatch = useDispatch()
  const contacts = useSelector(selectFilteredContacts)
  if (contacts.length === 0) {
    return <p className="empty-state">No contacts yet. Add someone above.</p>
  }

  return (
    <div className="contact-grid">
      {contacts.map((contact) => (
        <article className="contact-card" key={contact.id}>
          <div className="avatar">
            {contact.avatar ? (
              <img src={contact.avatar} alt={contact.name} />
            ) : (
              <span>{getInitials(contact.name)}</span>
            )}
          </div>
          <div className="contact-details">
            <h3>{contact.name}</h3>
            <p>{contact.phone}</p>
            {contact.email && <p>{contact.email}</p>}
          </div>
          <div className="contact-actions">
            <button
              type="button"
              className="ghost-button"
              onClick={() => dispatch(setEditingContact(contact))}
            >
              Edit
            </button>
            <button
              type="button"
              className="danger-button"
              onClick={() => dispatch(deleteContact(contact.id))}
            >
              Delete
            </button>
          </div>
        </article>
      ))}
    </div>
  )
}

export default ContactList
