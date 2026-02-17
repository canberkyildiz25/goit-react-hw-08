/**
 * ============================================================================
 * MAIN ENTRY POINT - Uygulama Başlangıç Noktası
 * ============================================================================
 *
 * Bu dosya React uygulamasının başlatılma noktasıdır. Vite build tool tarafından
 * ilk yüklenen dosyadır.
 *
 * Görevler:
 * 1. Redux store'u oluştur ve uygulamaya bağla (Provider)
 * 2. Token persistence: localStorage'daki token'ı kontrol et ve otomatik giriş yap
 * 3. React uygulamasını DOM'a render et
 *
 * Token Persistence Akışı:
 * - Sayfa ilk açıldığında localStorage'da token var mı kontrol edilir
 * - Token varsa Redux store'a yüklenir (setCredentials)
 * - refreshUser() çağrılarak token'ın geçerliliği kontrol edilir
 * - Token geçerliyse kullanıcı otomatik giriş yapar (auto-login)
 * - Token geçersizse localStorage temizlenir, kullanıcı login sayfasına yönlendirilir
 * ============================================================================
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import './index.css'
import App from './App.jsx'
import { store } from './store/store'
import { refreshUser } from './redux/authOps'
import { setCredentials } from './store/authSlice'

/**
 * -----------------------------------------------------------------------------
 * TOKEN PERSISTENCE - Otomatik Giriş (Auto-Login) Mekanizması
 * -----------------------------------------------------------------------------
 *
 * Sayfa yenilendiğinde veya tarayıcı kapatılıp açıldığında kullanıcının
 * oturum açık kalması için localStorage'daki token kontrol edilir.
 *
 * Akış:
 * 1. localStorage'dan token okunur
 * 2. Token varsa → otomatik giriş denenecek
 * 3. Token yoksa → kullanıcı giriş yapmamış, hiçbir şey yapma
 *
 * Token varsa:
 * 4. Token store'a yüklenir (setCredentials)
 *    - Bu işlem token'ı Redux state'e kaydeder
 *    - Axios interceptor bu token'ı kullanabilir hale gelir
 * 5. refreshUser() API çağrısı yapılır
 *    - Backend'e GET /users/current isteği gönderilir
 *    - Token Authorization header'ında gönderilir
 *    - Backend token'ı doğrular
 *
 * Token geçerliyse (refreshUser başarılı):
 * 6. Kullanıcı bilgileri (name, email) state'e yüklenir
 * 7. isLoggedIn = true olur
 * 8. Kullanıcı otomatik olarak /contacts sayfasına erişebilir
 * 9. "Hoş geldin, Ali" mesajı gösterilir
 *
 * Token geçersizse (refreshUser başarısız - 401):
 * 6. Token localStorage'dan silinir (authOps.js'de)
 * 7. Redux state temizlenir (authSlice.js refreshUser.rejected)
 * 8. PrivateRoute kullanıcıyı /login'e yönlendirir
 * 9. Kullanıcı tekrar giriş yapmalı
 *
 * Bu mekanizma sayesinde:
 * - Kullanıcı her sayfa yenilemede tekrar giriş yapmak zorunda kalmaz
 * - Ancak token süresi dolmuşsa güvenli şekilde çıkış yapılır
 * - Offline uygulamalar bile token'ı koruyabilir
 */
const token = localStorage.getItem('token')

if (token) {
  // Token'ı Redux store'a yükle
  // Bu işlem senkron, hemen tamamlanır
  store.dispatch(setCredentials({ token }))

  // Token'ın geçerliliğini kontrol et ve kullanıcı bilgilerini yükle
  // Bu işlem asenkron, API çağrısı yapılır
  // Sonuç authSlice.js'de handle edilir (refreshUser.pending/fulfilled/rejected)
  store.dispatch(refreshUser())
}

/**
 * -----------------------------------------------------------------------------
 * REACT APP RENDERING - Uygulamayı DOM'a Yerleştir
 * -----------------------------------------------------------------------------
 *
 * React 18'in createRoot API'si ile uygulamayı render eder.
 *
 * Yapı:
 * - StrictMode: Development'ta double-render yaparak yan etkileri tespit eder
 * - Provider: Redux store'u tüm component ağacına sağlar
 * - App: Ana router component (tüm sayfalar buradan yönetilir)
 *
 * DOM Target: public/index.html'deki <div id="root"></div>
 */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)

