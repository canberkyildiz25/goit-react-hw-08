import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import './App.css'
import ContactForm from './components/ContactForm'
import ContactList from './components/ContactList'
import EditModal from './components/EditModal'
import FilterBar from './components/FilterBar'
import SearchBar from './components/SearchBar'
import {
  addContact,
  fetchContacts,
} from './redux/contactsOps'
import { selectFilteredContacts } from './store/contactsSlice'
import { setFilter, setSearch } from './store/filtersSlice'

function App() {
  const dispatch = useDispatch()
  const { items, status, error } = useSelector((state) => state.contacts)
  const { search, filter } = useSelector((state) => state.filters)

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchContacts())
    }
  }, [dispatch, status])

  const filteredContacts = useSelector(selectFilteredContacts)

  const handleSubmit = (payload) => {
    dispatch(addContact(payload))
  }

  return (
    <div className="app">
      <header className="hero">
        <div className="hero-content">
          <p className="eyebrow">Forest contacts</p>
          <h1>Leafline Directory</h1>
          <p className="subtitle">
            Keep your people organized with a calm, green-first contact hub.
          </p>
          <div className="hero-stats">
            <div>
              <span>Total</span>
              <strong>{items.length}</strong>
            </div>
            <div>
              <span>Filtered</span>
              <strong>{filteredContacts.length}</strong>
            </div>
            <div>
              <span>Status</span>
              <strong>{status === 'loading' ? 'Loading' : 'Ready'}</strong>
            </div>
          </div>
        </div>
        <div className="hero-card">
          <ContactForm onSubmit={handleSubmit} />
        </div>
      </header>

      <main className="content">
        <section className="panel">
          <div className="panel-header">
            <h2>Search and filter</h2>
            <p>Find the people you need faster.</p>
          </div>
          <div className="panel-controls">
            <SearchBar value={search} onChange={(value) => dispatch(setSearch(value))} />
            <FilterBar value={filter} onChange={(value) => dispatch(setFilter(value))} />
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <h2>Contact list</h2>
            <p>Manage details, update, or remove contacts.</p>
          </div>
          {status === 'failed' && (
            <div className="error-banner">{error}</div>
          )}
          <ContactList />
        </section>
      </main>
      <EditModal />
    </div>
  )
}

export default App
