import { createSlice } from '@reduxjs/toolkit'

const filtersSlice = createSlice({
  name: 'filters',
  initialState: {
    search: '',
    filter: 'all',
  },
  reducers: {
    setSearch(state, action) {
      state.search = action.payload
    },
    setFilter(state, action) {
      state.filter = action.payload
    },
  },
})

export const { setSearch, setFilter } = filtersSlice.actions
export default filtersSlice.reducer
