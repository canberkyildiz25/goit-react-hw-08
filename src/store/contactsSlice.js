import { createSelector, createSlice } from '@reduxjs/toolkit'
import {
  addContact,
  deleteContact,
  fetchContacts,
  updateContact,
} from '../redux/contactsOps'

const contactsSlice = createSlice({
  name: 'contacts',
  initialState: {
    items: [],
    status: 'idle',
    error: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchContacts.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchContacts.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchContacts.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || action.error.message
      })
      .addCase(addContact.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(addContact.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items.unshift(action.payload)
      })
      .addCase(addContact.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || action.error.message
      })
      .addCase(updateContact.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(updateContact.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const index = state.items.findIndex(
          (contact) => contact.id === action.meta.arg.id
        )
        if (index !== -1) {
          state.items[index] = action.payload
        }
      })
      .addCase(updateContact.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || action.error.message
      })
      .addCase(deleteContact.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(deleteContact.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = state.items.filter(
          (contact) => contact.id !== action.payload
        )
      })
      .addCase(deleteContact.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || action.error.message
      })
  },
})

export default contactsSlice.reducer

const selectContactsItems = (state) => state.contacts.items
const selectSearchValue = (state) => state.filters.search
const selectFilterValue = (state) => state.filters.filter

export const selectFilteredContacts = createSelector(
  [selectContactsItems, selectSearchValue, selectFilterValue],
  (items, search, filter) => {
    const normalizedSearch = search.trim().toLowerCase()
    return items.filter((contact) => {
      const matchesSearch = normalizedSearch
        ? `${contact.name} ${contact.phone} ${contact.email || ''}`
            .toLowerCase()
            .includes(normalizedSearch)
        : true

      const matchesFilter =
        filter === 'all' ||
        (filter === 'hasEmail' && contact.email) ||
        (filter === 'hasPhone' && contact.phone)

      return matchesSearch && matchesFilter
    })
  }
)
