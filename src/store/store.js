import { configureStore } from '@reduxjs/toolkit'
import contactsReducer from './contactsSlice'
import filtersReducer from './filtersSlice'
import uiReducer from './uiSlice'

export const store = configureStore({
  reducer: {
    contacts: contactsReducer,
    filters: filtersReducer,
    ui: uiReducer,
  },
})
