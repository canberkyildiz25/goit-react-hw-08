/**
 * ============================================================================
 * AUTHENTICATION OPERATIONS
 * ============================================================================
 *
 * Bu dosya kullanıcı kimlik doğrulama ile ilgili tüm asenkron işlemleri içerir.
 * Redux Toolkit'in createAsyncThunk fonksiyonu ile API çağrıları yapılır.
 *
 * API: https://connections-api.goit.global
 *
 * İşlemler:
 * - register: Yeni kullanıcı kaydı oluşturma
 * - login: Mevcut kullanıcı girişi
 * - logout: Kullanıcı oturumunu sonlandırma
 * - refreshUser: localStorage token'ı ile otomatik giriş (sayfa yenileme)
 *
 * Her thunk başarılı/başarısız durumları authSlice.js'de handle edilir.
 * ============================================================================
 */

import { createAsyncThunk } from '@reduxjs/toolkit'
import api from '../api/axios'

/**
 * -----------------------------------------------------------------------------
 * REGISTER - Yeni Kullanıcı Kaydı
 * -----------------------------------------------------------------------------
 *
 * Yeni bir kullanıcı hesabı oluşturur. Başarılı olursa JWT token localStorage'a
 * kaydedilir ve kullanıcı otomatik giriş yapar.
 *
 * @async
 * @param {Object} credentials - Kullanıcı kayıt bilgileri
 * @param {string} credentials.name - Kullanıcının tam adı
 * @param {string} credentials.email - Kullanıcının email adresi (benzersiz)
 * @param {string} credentials.password - Kullanıcının şifresi (minimum 6 karakter)
 *
 * @returns {Promise<Object>} { user: {name, email}, token: string }
 * @throws {string} HTTP status code + hata mesajı (örn: "409:User already exists")
 *
 * Kullanım:
 * ```js
 * const result = await dispatch(register({ name, email, password }))
 * if (result.type.endsWith('/fulfilled')) {
 *   // Başarılı - kullanıcı giriş yaptı
 * }
 * ```
 */
export const register = createAsyncThunk(
  'auth/register',
  async (credentials, thunkAPI) => {
    try {
      // GoIT Connections API'ye POST isteği gönder
      const response = await api.post('/users/signup', credentials)
      const { user, token } = response.data

      // JWT token'ı localStorage'a kaydet (persistence için)
      // Sayfa yenilendiğinde kullanıcı oturum açık kalacak
      localStorage.setItem('token', token)

      return { user, token }
    } catch (error) {
      // HTTP status code'unu yakala
      const statusCode = error.response?.status

      // API'den gelen hata mesajını al
      const message =
        error.response?.data?.message ||
        error.message ||
        'Registration failed'

      // Özel durumlar için status code'u mesaja ekle
      // Bu sayede RegisterForm'da "kullanıcı zaten kayıtlı" hatası yakalanabilir
      // 400: Bad Request (geçersiz veri), 409: Conflict (duplicate user)
      const errorMessage = statusCode === 400 || statusCode === 409
        ? `${statusCode}:${message}`
        : message

      // Redux'a hata mesajını döndür (authSlice.js'de yakalanır)
      return thunkAPI.rejectWithValue(errorMessage)
    }
  }
)

/**
 * -----------------------------------------------------------------------------
 * LOGIN - Kullanıcı Girişi
 * -----------------------------------------------------------------------------
 *
 * Mevcut kullanıcının sisteme giriş yapmasını sağlar. Başarılı olursa JWT token
 * localStorage'a kaydedilir.
 *
 * @async
 * @param {Object} credentials - Kullanıcı giriş bilgileri
 * @param {string} credentials.email - Kullanıcının kayıtlı email adresi
 * @param {string} credentials.password - Kullanıcının şifresi
 *
 * @returns {Promise<Object>} { user: {name, email}, token: string }
 * @throws {string} Hata mesajı (örn: "Invalid credentials", "Login failed")
 *
 * Kullanım:
 * ```js
 * const result = await dispatch(login({ email, password }))
 * if (result.type.endsWith('/fulfilled')) {
 *   toast.success('Welcome back!')
 *   navigate('/contacts')
 * }
 * ```
 */
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, thunkAPI) => {
    try {
      // GoIT Connections API'ye POST isteği gönder
      const response = await api.post('/users/login', credentials)
      const { user, token } = response.data

      // JWT token'ı localStorage'a kaydet
      localStorage.setItem('token', token)

      return { user, token }
    } catch (error) {
      // API'den gelen hata mesajını al
      const message =
        error.response?.data?.message ||
        error.message ||
        'Login failed'

      return thunkAPI.rejectWithValue(message)
    }
  }
)

/**
 * -----------------------------------------------------------------------------
 * LOGOUT - Kullanıcı Çıkışı
 * -----------------------------------------------------------------------------
 *
 * Kullanıcının oturumunu sonlandırır. API'ye logout isteği gönderilir ve
 * localStorage'daki token silinir.
 *
 * NOT: API çağrısı başarısız olsa bile local token her durumda silinir.
 * Bu sayede offline durumda bile logout yapılabilir.
 *
 * @async
 * @returns {Promise<null>}
 *
 * Kullanım:
 * ```js
 * await dispatch(logout())
 * navigate('/login')
 * ```
 */
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, thunkAPI) => {
    try {
      // GoIT Connections API'ye logout isteği gönder
      // Bu API çağrısı sunucu tarafında token'ı invalidate eder
      await api.post('/users/logout')
    } catch (error) {
      // API çağrısı başarısız olsa bile devam et
      // Örnek: internet bağlantısı yok, sunucu yanıt vermiyor
      console.warn('Logout API call failed:', error.message)
    } finally {
      // Token'ı HER DURUMDA localStorage'dan sil
      // Bu kritik çünkü kullanıcının oturumu sonlandırılmalı
      localStorage.removeItem('token')
    }

    // authSlice.js'de state temizlenecek
    return null
  }
)

/**
 * -----------------------------------------------------------------------------
 * REFRESH USER - Otomatik Giriş (Token ile Kullanıcı Yenileme)
 * -----------------------------------------------------------------------------
 *
 * Sayfa yenilendiğinde veya uygulama başlatıldığında localStorage'daki token
 * ile kullanıcı bilgilerini otomatik olarak yükler. Token geçersiz veya süresi
 * dolmuşsa hata döner ve localStorage temizlenir.
 *
 * Bu işlem main.jsx'de uygulama başlatılırken çağrılır.
 *
 * @async
 * @returns {Promise<Object>} user - Kullanıcı bilgileri {name, email}
 * @throws {string} Hata mesajı (örn: "Token not found", "Session expired")
 *
 * Akış:
 * 1. localStorage'dan token kontrol edilir
 * 2. Token yoksa → hata (kullanıcı giriş yapmamış)
 * 3. Token varsa → API'ye GET /users/current isteği
 * 4. Token geçerliyse → kullanıcı bilgileri döner (otomatik giriş)
 * 5. Token geçersizse → localStorage temizlenir, hata döner
 *
 * Kullanım (main.jsx):
 * ```js
 * const token = localStorage.getItem('token')
 * if (token) {
 *   store.dispatch(setCredentials({ token }))
 *   store.dispatch(refreshUser())  // ← Otomatik giriş
 * }
 * ```
 */
export const refreshUser = createAsyncThunk(
  'auth/refresh',
  async (_, thunkAPI) => {
    // localStorage'dan token'ı kontrol et
    const token = localStorage.getItem('token')

    // Token yoksa hata döndür (kullanıcı giriş yapmamış)
    if (!token) {
      return thunkAPI.rejectWithValue('Token not found')
    }

    try {
      // Token ile mevcut kullanıcı bilgilerini al
      // Axios interceptor otomatik olarak Authorization header'ı ekler
      const response = await api.get('/users/current')

      // Başarılı → kullanıcı bilgileri döndür (otomatik giriş tamamlandı)
      return response.data
    } catch (error) {
      // Token geçersiz veya süresi dolmuş
      // localStorage'dan temizle (eski/geçersiz token'ları tutmamak için)
      localStorage.removeItem('token')

      const message =
        error.response?.data?.message ||
        error.message ||
        'Session expired'

      // Hata döndür → authSlice.js'de logout yapılacak
      return thunkAPI.rejectWithValue(message)
    }
  }
)

