/**
 * ============================================================================
 * CONTACTS OPERATIONS
 * ============================================================================
 *
 * Bu dosya kişi yönetimi (CRUD) ile ilgili tüm asenkron işlemleri içerir.
 * Redux Toolkit'in createAsyncThunk fonksiyonu ile API çağrıları yapılır.
 *
 * API: https://connections-api.goit.global
 *
 * İşlemler:
 * - fetchContacts: Giriş yapmış kullanıcının tüm kişilerini getir
 * - addContact: Yeni kişi ekle
 * - updateContact: Mevcut kişiyi güncelle
 * - deleteContact: Kişiyi sil
 *
 * ÖNEMLİ NOTLAR:
 * - Tüm işlemler authentication gerektirir (JWT token otomatik eklenir)
 * - Her kullanıcı sadece kendi kişilerini görür ve düzenleyebilir
 * - Her thunk başarılı/başarısız durumları contactsSlice.js'de handle edilir
 * ============================================================================
 */

import { createAsyncThunk } from '@reduxjs/toolkit'
import api from '../api/axios'

/**
 * -----------------------------------------------------------------------------
 * FETCH CONTACTS - Kişi Listesini Getir
 * -----------------------------------------------------------------------------
 *
 * Giriş yapmış kullanıcının tüm kişilerini backend'den çeker.
 * Her kullanıcı sadece kendi eklediği kişileri görür (backend filtreliyor).
 *
 * @async
 * @returns {Promise<Array>} Kişi listesi: [{ id, name, number }, ...]
 * @throws {string} Hata mesajı (örn: "Failed to fetch contacts", "Network error")
 *
 * Kullanım:
 * ```js
 * useEffect(() => {
 *   dispatch(fetchContacts())
 * }, [dispatch])
 * ```
 *
 * Akış:
 * 1. ContactsPage component mount olduğunda çağrılır
 * 2. Axios interceptor otomatik olarak Authorization header'ı ekler
 * 3. Backend kullanıcının token'ından user ID'yi çıkartır
 * 4. Sadece o kullanıcıya ait kişileri döner
 * 5. contactsSlice.js'de state güncelenir, UI render edilir
 */
export const fetchContacts = createAsyncThunk(
  'contacts/fetchAll',
  async (_, thunkAPI) => {
    try {
      // GoIT Connections API'den kişileri çek
      // Token axios interceptor tarafından otomatik eklenir
      const response = await api.get('/contacts')

      // Backend response: [{ id, name, number }, ...]
      return response.data
    } catch (error) {
      // API hatası (401: token geçersiz, 500: sunucu hatası, network error, vb.)
      return thunkAPI.rejectWithValue(
        error?.message || 'Failed to fetch contacts'
      )
    }
  }
)

/**
 * -----------------------------------------------------------------------------
 * ADD CONTACT - Yeni Kişi Ekle
 * -----------------------------------------------------------------------------
 *
 * Kullanıcının kişi listesine yeni bir kişi ekler.
 * Eklenen kişi sadece o kullanıcıya ait olur (backend tarafından user ID ile ilişkilendirilir).
 *
 * @async
 * @param {Object} contact - Eklenecek kişi bilgileri
 * @param {string} contact.name - Kişinin tam adı (zorunlu)
 * @param {string} contact.number - Telefon numarası (zorunlu)
 *
 * @returns {Promise<Object>} Oluşturulan kişi: { id, name, number }
 * @throws {string} Hata mesajı (örn: "Failed to add contact", "Validation error")
 *
 * Kullanım:
 * ```js
 * const handleSubmit = async (values) => {
 *   const result = await dispatch(addContact({ name, number }))
 *   if (result.type.endsWith('/fulfilled')) {
 *     toast.success('Kişi eklendi')
 *   }
 * }
 * ```
 *
 * Akış:
 * 1. ContactForm submit edilir
 * 2. API'ye POST /contacts isteği gönderilir (token otomatik eklenir)
 * 3. Backend validation yapar (name/number zorunlu ve geçerli mi?)
 * 4. Backend yeni kişi oluşturur ve unique ID atar
 * 5. contactsSlice.js'de state'e eklenir
 */
export const addContact = createAsyncThunk(
  'contacts/addContact',
  async (contact, thunkAPI) => {
    try {
      // Yeni kişi oluştur
      const response = await api.post('/contacts', contact)

      // Backend response: { id, name, number }
      return response.data
    } catch (error) {
      // Muhtemel hatalar:
      // - 400: Validation error (eksik/geçersiz name veya number)
      // - 401: Token geçersiz
      // - 500: Sunucu hatası
      return thunkAPI.rejectWithValue(
        error?.message || 'Failed to add contact'
      )
    }
  }
)

/**
 * -----------------------------------------------------------------------------
 * UPDATE CONTACT - Kişiyi Güncelle
 * -----------------------------------------------------------------------------
 *
 * Mevcut bir kişinin bilgilerini günceller.
 * Sadece kişinin sahibi (kişiyi oluşturan kullanıcı) güncelleyebilir.
 *
 * @async
 * @param {Object} params - Güncelleme parametreleri
 * @param {string} params.id - Güncellenecek kişinin ID'si
 * @param {Object} params.updates - Güncellenecek alanlar
 * @param {string} params.updates.name - Yeni isim (opsiyonel)
 * @param {string} params.updates.number - Yeni telefon numarası (opsiyonel)
 *
 * @returns {Promise<Object>} Güncellenmiş kişi: { id, name, number }
 * @throws {string} Hata mesajı (örn: "Failed to update contact", "Not found")
 *
 * Kullanım:
 * ```js
 * const handleUpdate = async () => {
 *   await dispatch(updateContact({
 *     id: contact.id,
 *     updates: { name: newName, number: newNumber }
 *   }))
 * }
 * ```
 *
 * ÖNEMLİ: PATCH kullanılır (PUT değil), yani sadece değişen alanlar gönderilir
 *
 * Akış:
 * 1. EditModal'da kullanıcı kişi bilgilerini düzenler
 * 2. API'ye PATCH /contacts/:id isteği gönderilir
 * 3. Backend kişinin sahibini kontrol eder (authorization)
 * 4. Backend kişiyi günceller
 * 5. contactsSlice.js'de ilgili kişi güncellenir
 */
export const updateContact = createAsyncThunk(
  'contacts/updateContact',
  async ({ id, updates }, thunkAPI) => {
    try {
      // Kişiyi güncelle (PATCH: partial update)
      const response = await api.patch(`/contacts/${id}`, updates)

      // Backend response: { id, name, number } (güncellenmiş hali)
      return response.data
    } catch (error) {
      // Muhtemel hatalar:
      // - 400: Validation error (geçersiz name/number)
      // - 401: Token geçersiz
      // - 403: Forbidden (başka kullanıcının kişisini güncellemeye çalışıldı)
      // - 404: Kişi bulunamadı
      return thunkAPI.rejectWithValue(
        error?.message || 'Failed to update contact'
      )
    }
  }
)

/**
 * -----------------------------------------------------------------------------
 * DELETE CONTACT - Kişiyi Sil
 * -----------------------------------------------------------------------------
 *
 * Bir kişiyi kalıcı olarak siler.
 * Sadece kişinin sahibi silebilir.
 *
 * @async
 * @param {string} id - Silinecek kişinin ID'si
 *
 * @returns {Promise<string>} Silinen kişinin ID'si
 * @throws {string} Hata mesajı (örn: "Failed to delete contact", "Not found")
 *
 * Kullanım:
 * ```js
 * const handleDelete = async (contactId) => {
 *   if (confirm('Silmek istediğinize emin misiniz?')) {
 *     await dispatch(deleteContact(contactId))
 *   }
 * }
 * ```
 *
 * Akış:
 * 1. ContactList'te kullanıcı silme butonuna basar
 * 2. API'ye DELETE /contacts/:id isteği gönderilir
 * 3. Backend kişinin sahibini kontrol eder (authorization)
 * 4. Backend kişiyi siler
 * 5. contactsSlice.js'de ilgili kişi state'den kaldırılır
 * 6. UI otomatik güncellenir (kişi listeden çıkar)
 */
export const deleteContact = createAsyncThunk(
  'contacts/deleteContact',
  async (id, thunkAPI) => {
    try {
      // Kişiyi sil
      // Backend response: 204 No Content (response body yok)
      await api.delete(`/contacts/${id}`)

      // Silinen kişinin ID'sini döndür
      // contactsSlice.js'de bu ID'yi kullanarak state'den çıkaracağız
      return id
    } catch (error) {
      // Muhtemel hatalar:
      // - 401: Token geçersiz
      // - 403: Forbidden (başka kullanıcının kişisini silmeye çalışıldı)
      // - 404: Kişi bulunamadı (zaten silinmiş olabilir)
      return thunkAPI.rejectWithValue(
        error?.message || 'Failed to delete contact'
      )
    }
  }
)

