/**
 * ============================================================================
 * AUTHENTICATION STATE SLICE
 * ============================================================================
 *
 * Bu dosya kullanıcı kimlik doğrulama state yönetimini içerir.
 * Redux Toolkit'in createSlice fonksiyonu ile state, reducer'lar ve
 * selector'lar tanımlanır.
 *
 * State Yapısı:
 * - user: Giriş yapmış kullanıcının bilgileri (name, email) veya null
 * - token: JWT authentication token'ı veya null
 * - isLoggedIn: Kullanıcının giriş durumu (boolean)
 * - isRefreshing: Sayfa yenileme sırasında token doğrulama durumu (boolean)
 * - status: Async işlemlerin durumu ('idle' | 'loading' | 'succeeded' | 'failed')
 * - error: Hata mesajları veya null
 *
 * Async Thunk'lar (authOps.js'den import edilir):
 * - register: Yeni kullanıcı kaydı
 * - login: Mevcut kullanıcı girişi
 * - logout: Kullanıcı oturumunu sonlandırma
 * - refreshUser: localStorage token'ı ile otomatik giriş
 * ============================================================================
 */

import { createSlice } from '@reduxjs/toolkit'
import { register, login, logout, refreshUser } from '../redux/authOps'

/**
 * -----------------------------------------------------------------------------
 * INITIAL STATE - Başlangıç State Yapısı
 * -----------------------------------------------------------------------------
 *
 * Uygulama ilk yüklendiğinde authentication state'inin varsayılan değerleri.
 * Kullanıcı giriş yapmadığında veya logout yaptığında bu state'e dönülür.
 */
const initialState = {
  user: null, // { name: string, email: string } | null
  token: null, // JWT token string | null
  isLoggedIn: false, // Kullanıcı giriş yaptı mı?
  isRefreshing: false, // Sayfa yenileme sırasında token kontrol ediliyor mu?
  status: 'idle', // API çağrısı durumu: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null, // Hata mesajı (string) | null
}

/**
 * -----------------------------------------------------------------------------
 * AUTH SLICE - Redux State Yönetimi
 * -----------------------------------------------------------------------------
 */
const authSlice = createSlice({
  name: 'auth',
  initialState,

  /**
   * ---------------------------------------------------------------------------
   * REDUCERS - Manuel State Güncellemeleri
   * ---------------------------------------------------------------------------
   *
   * Bu reducer'lar doğrudan dispatch ile çağrılabilir.
   * Async işlemler için extraReducers kullanılır (aşağıda).
   */
  reducers: {
    /**
     * setCredentials - Kullanıcı bilgilerini ve token'ı manuel olarak ayarla
     *
     * Kullanım alanları:
     * - Sayfa yenilendiğinde localStorage'daki token'ı state'e yüklemek
     * - Token persistence işlemleri
     *
     * @param {Object} action.payload - { user?, token? }
     * @param {Object} action.payload.user - Kullanıcı bilgileri (opsiyonel)
     * @param {string} action.payload.token - JWT token (opsiyonel)
     *
     * Örnek kullanım:
     * ```js
     * const token = localStorage.getItem('token')
     * if (token) {
     *   dispatch(setCredentials({ token }))
     * }
     * ```
     */
    setCredentials: (state, action) => {
      const { user, token } = action.payload

      // Kullanıcı bilgisi varsa güncelle
      if (user) state.user = user

      // Token varsa kaydet ve giriş durumunu aktif et
      if (token) {
        state.token = token
        state.isLoggedIn = true
      }
    },

    /**
     * clearCredentials - Tüm authentication bilgilerini temizle
     *
     * Kullanım alanları:
     * - Manuel logout işlemi
     * - Token süresi dolduğunda
     * - 401 Unauthorized hatası alındığında
     * - Güvenlik nedeniyle session'ı zorla sonlandırma
     *
     * State'i initialState'e geri döndürür.
     *
     * Örnek kullanım:
     * ```js
     * dispatch(clearCredentials())
     * navigate('/login')
     * ```
     */
    clearCredentials: state => {
      state.user = null
      state.token = null
      state.isLoggedIn = false
      state.error = null
    },
  },

  /**
   * ---------------------------------------------------------------------------
   * EXTRA REDUCERS - Async Thunk Sonuçlarını İşleme
   * ---------------------------------------------------------------------------
   *
   * authOps.js'de tanımlanan async thunk'ların (register, login, logout,
   * refreshUser) başarılı/başarısız/bekleyen durumlarını handle eder.
   *
   * Her thunk için 3 case vardır:
   * - pending: API çağrısı devam ediyor (loading göster)
   * - fulfilled: API çağrısı başarılı (state'i güncelle)
   * - rejected: API çağrısı başarısız oldu (hata göster)
   */
  extraReducers: builder => {
    /**
     * -------------------------------------------------------------------------
     * REGISTER THUNK - Yeni Kullanıcı Kaydı İşlemleri
     * -------------------------------------------------------------------------
     *
     * Akış: RegisterForm → authOps.register() → API → authSlice (burası)
     */
    builder
      // Kayıt isteği gönderildi, API yanıtı bekleniyor
      .addCase(register.pending, state => {
        state.status = 'loading' // Loading spinner göster
        state.error = null // Önceki hataları temizle
      })

      // Kayıt başarılı, kullanıcı otomatik giriş yaptı
      .addCase(register.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.user = action.payload.user // { name, email }
        state.token = action.payload.token // JWT token
        state.isLoggedIn = true // Giriş durumunu aktif et
        state.error = null

        // NOT: Token authOps.js'de localStorage'a kaydedildi
        // Uygulama artık /contacts sayfasına yönlendirebilir
      })

      // Kayıt başarısız (örn: email zaten kullanımda)
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || 'Registration failed' // Hata mesajı göster
        state.user = null
        state.token = null
        state.isLoggedIn = false

        // RegisterForm bu hatayı okur ve kullanıcıya gösterir
        // Örnek hatalar: "409:User already exists", "400:Invalid email"
      })

    /**
     * -------------------------------------------------------------------------
     * LOGIN THUNK - Kullanıcı Girişi İşlemleri
     * -------------------------------------------------------------------------
     *
     * Akış: LoginForm → authOps.login() → API → authSlice (burası)
     */
    builder
      // Giriş isteği gönderildi, API yanıtı bekleniyor
      .addCase(login.pending, state => {
        state.status = 'loading' // Login butonu disabled olacak
        state.error = null // Önceki hataları temizle
      })

      // Giriş başarılı, kullanıcı sisteme girdi
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.user = action.payload.user // { name, email }
        state.token = action.payload.token // JWT token
        state.isLoggedIn = true // Giriş durumunu aktif et
        state.error = null

        // NOT: Token authOps.js'de localStorage'a kaydedildi
        // PrivateRoute artık /contacts'a erişimi sağlayacak
      })

      // Giriş başarısız (yanlış şifre, kullanıcı bulunamadı, vb.)
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || 'Login failed' // Hata mesajı göster
        state.user = null
        state.token = null
        state.isLoggedIn = false

        // LoginForm bu hatayı okur ve "Email veya şifre yanlış" gösterir
      })

    /**
     * -------------------------------------------------------------------------
     * LOGOUT THUNK - Kullanıcı Çıkışı İşlemleri
     * -------------------------------------------------------------------------
     *
     * Akış: UserMenu çıkış butonu → authOps.logout() → API → authSlice (burası)
     *
     * ÖNEMLİ NOT: Logout her durumda başarılı sayılır.
     * API çağrısı başarısız olsa bile (internet yok, sunucu yanıt vermiyor)
     * local state ve localStorage temizlenir.
     */
    builder
      // Logout isteği gönderildi
      .addCase(logout.pending, state => {
        state.status = 'loading'
      })

      // Logout başarılı, kullanıcı oturumu sonlandırıldı
      .addCase(logout.fulfilled, state => {
        state.status = 'idle'
        state.user = null
        state.token = null
        state.isLoggedIn = false
        state.error = null

        // NOT: Token authOps.js'de localStorage'dan silindi
        // Kişi listesi contactsSlice.js'de temizlenecek
        // Uygulama /login sayfasına yönlendirecek
      })

      // Logout API çağrısı başarısız oldu (örn: internet yok)
      // Yine de local state'i temizle (kullanıcı çıkış yapsın)
      .addCase(logout.rejected, state => {
        state.status = 'idle'
        state.user = null
        state.token = null
        state.isLoggedIn = false
        state.error = null

        // Kullanıcı offline olsa bile logout yapabilmeli
        // Bu yüzden rejected case de fulfilled ile aynı şekilde çalışır
      })

    /**
     * -------------------------------------------------------------------------
     * REFRESH USER THUNK - Otomatik Giriş (Token ile Kullanıcı Yenileme)
     * -------------------------------------------------------------------------
     *
     * Akış: main.jsx (uygulama başlangıcı) → authOps.refreshUser() → API → authSlice (burası)
     *
     * Sayfa yenilendiğinde veya uygulama ilk açıldığında localStorage'daki
     * token ile kullanıcı bilgilerini otomatik olarak yükler.
     *
     * Token geçerliyse → otomatik giriş başarılı
     * Token geçersiz/expired → logout, kullanıcı login sayfasına yönlendirilir
     */
    builder
      // Token doğrulama isteği gönderildi, API yanıtı bekleniyor
      .addCase(refreshUser.pending, state => {
        state.isRefreshing = true // Loading spinner göster (tam sayfa)
        state.error = null
      })

      // Token geçerli, kullanıcı bilgileri yüklendi (otomatik giriş başarılı)
      .addCase(refreshUser.fulfilled, (state, action) => {
        state.isRefreshing = false
        state.user = action.payload // { name, email }
        state.isLoggedIn = true
        state.status = 'succeeded'

        // NOT: Token zaten localStorage'da ve state'de mevcut
        // Sadece user bilgilerini API'den çekip güncelledik
        // Kullanıcı otomatik olarak /contacts sayfasına erişebilir
      })

      // Token geçersiz veya süresi dolmuş (otomatik giriş başarısız)
      .addCase(refreshUser.rejected, state => {
        state.isRefreshing = false
        state.user = null
        state.token = null
        state.isLoggedIn = false
        state.error = 'Session expired'

        // NOT: Token authOps.js'de localStorage'dan silindi
        // PrivateRoute kullanıcıyı /login'e yönlendirecek
        // Kullanıcı tekrar giriş yapmalı
      })
  },
})

/**
 * =============================================================================
 * EXPORTS - Action Creator'lar ve Reducer
 * =============================================================================
 */

// Manuel reducer action'ları export et (component'lerden çağrılabilir)
export const { setCredentials, clearCredentials } = authSlice.actions

/**
 * =============================================================================
 * SELECTORS - State Okuma Fonksiyonları
 * =============================================================================
 *
 * Bu selector'lar component'lerde useSelector hook'u ile kullanılır.
 * Redux state'inden auth bilgilerini okumak için.
 *
 * Örnek kullanım:
 * ```js
 * import { useSelector } from 'react-redux'
 * import { selectIsLoggedIn, selectUser } from './store/authSlice'
 *
 * function MyComponent() {
 *   const isLoggedIn = useSelector(selectIsLoggedIn)
 *   const user = useSelector(selectUser)
 *
 *   if (!isLoggedIn) return <Navigate to="/login" />
 *   return <h1>Hoş geldin, {user.name}</h1>
 * }
 * ```
 */

// Kullanıcı giriş yapmış mı? (boolean)
// PrivateRoute'da kullanılır
export const selectIsLoggedIn = state => state.auth.isLoggedIn

// Giriş yapmış kullanıcının bilgileri ({ name, email } | null)
// UserMenu'de kullanıcı adını göstermek için
export const selectUser = state => state.auth.user

// JWT token (string | null)
// Nadiren doğrudan kullanılır (axios interceptor otomatik ekler)
export const selectToken = state => state.auth.token

// Sayfa yenileme sırasında token doğrulanıyor mu? (boolean)
// Loading spinner göstermek için (tam sayfa loading)
export const selectIsRefreshing = state => state.auth.isRefreshing

// Async işlemlerin durumu ('idle' | 'loading' | 'succeeded' | 'failed')
// Form butonlarını disable etmek için
export const selectAuthStatus = state => state.auth.status

// Hata mesajı (string | null)
// Form'larda hata göstermek için
export const selectAuthError = state => state.auth.error

// Default export: reducer (store.js'de kullanılır)
export default authSlice.reducer
