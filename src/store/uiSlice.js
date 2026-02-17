import { createSlice } from '@reduxjs/toolkit'

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    editingContact: null,
  },
  reducers: {
    setEditingContact(state, action) {
      state.editingContact = action.payload
    },
    clearEditingContact(state) {
      state.editingContact = null
    },
  },
})

export const { setEditingContact, clearEditingContact } = uiSlice.actions
export default uiSlice.reducer
