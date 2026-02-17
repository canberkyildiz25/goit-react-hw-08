import { createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const api = axios.create({
  baseURL: 'https://698d85bbb79d1c928ed59d0f.mockapi.io/contacts',
})

export const fetchContacts = createAsyncThunk(
  'contacts/fetchAll',
  async (_, thunkAPI) => {
    try {
      const response = await api.get('/')
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error?.message || 'Failed to fetch contacts'
      )
    }
  }
)

export const addContact = createAsyncThunk(
  'contacts/addContact',
  async (contact, thunkAPI) => {
    try {
      const response = await api.post('/', contact)
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error?.message || 'Failed to add contact'
      )
    }
  }
)

export const updateContact = createAsyncThunk(
  'contacts/updateContact',
  async ({ id, updates }, thunkAPI) => {
    try {
      const response = await api.put(`/${id}`, updates)
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error?.message || 'Failed to update contact'
      )
    }
  }
)

export const deleteContact = createAsyncThunk(
  'contacts/deleteContact',
  async (id, thunkAPI) => {
    try {
      await api.delete(`/${id}`)
      return id
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error?.message || 'Failed to delete contact'
      )
    }
  }
)
