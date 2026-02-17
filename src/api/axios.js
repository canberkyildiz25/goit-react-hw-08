/**
 * ============================================================================
 * AXIOS API CLIENT - Merkezi HTTP İstemci Yapılandırması
 * ============================================================================
 *
 * Bu dosya tüm backend API çağrıları için merkezi axios instance'ını oluşturur
 * ve yapılandırır.
 *
 * API Base URL: https://connections-api.goit.global
 *
 * Özellikler:
 * 1. Request Interceptor: Her API çağrısına otomatik JWT token ekleme
 * 2. Response Interceptor: 401 Unauthorized hatalarını global yakalama
 *
 * Kullanım:
 * ```js
 * import api from './api/axios'
 *
 * // GET isteği (token otomatik eklenir)
 * const response = await api.get('/contacts')
 *
 * // POST isteği
 * await api.post('/contacts', { name, number })
 *
 * // PATCH isteği
 * await api.patch('/contacts/123', { name: 'Yeni İsim' })
 *
 * // DELETE isteği
 * await api.delete('/contacts/123')
 * ```
 *
 * Bu instance authOps.js ve contactsOps.js'de kullanılır.
 * ============================================================================
 */

import axios from 'axios'

/**
 * -----------------------------------------------------------------------------
 * API INSTANCE - Merkezi Axios Yapılandırması
 * -----------------------------------------------------------------------------
 *
 * Tüm API çağrıları bu instance üzerinden yapılır. Böylece:
 * - baseURL tek bir yerde tanımlanır (DRY principle)
 * - Interceptor'lar tüm isteklere otomatik uygulanır
 * - Test ve development ortamları için kolay yapılandırma
 */
const api = axios.create({
  baseURL: 'https://connections-api.goit.global',
  // Diğer global axios ayarları buraya eklenebilir:
  // timeout: 10000,
  // headers: { 'Content-Type': 'application/json' }
})

/**
 * -----------------------------------------------------------------------------
 * REQUEST INTERCEPTOR - Giden İsteklere Token Ekleme
 * -----------------------------------------------------------------------------
 *
 * Her API çağrısından ÖNCE çalışır. localStorage'dan JWT token'ı okur ve
 * Authorization header'ına ekler. Backend bu token ile kullanıcıyı doğrular.
 *
 * Akış:
 * 1. Component'te dispatch(fetchContacts()) çağrılır
 * 2. authOps.js'de api.get('/contacts') çalıştırılır
 * 3. Request interceptor devreye girer (burası)
 * 4. localStorage'dan token okunur
 * 5. Token varsa Authorization header'ı eklenir
 * 6. İstek backend'e gönderilir
 *
 * Authorization Header Format: "Bearer <token>"
 * Örnek: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 */
api.interceptors.request.use(
  config => {
    // localStorage'dan JWT token'ı al
    const token = localStorage.getItem('token')

    // Token varsa Authorization header'ına ekle
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Değiştirilmiş config'i döndür (istek bu config ile gönderilir)
    return config
  },
  error => {
    // İstek gönderilemeden hata oluştu (çok nadir)
    // Örnek: network kapalı, tarayıcı isteği bloke etti
    return Promise.reject(error)
  }
)

/**
 * -----------------------------------------------------------------------------
 * RESPONSE INTERCEPTOR - 401 Unauthorized Hatalarını Global Yakalama
 * -----------------------------------------------------------------------------
 *
 * Her API yanıtından SONRA çalışır. 401 (Unauthorized) hatalarını yakalar ve
 * localStorage'daki geçersiz token'ı temizler.
 *
 * 401 Unauthorized ne zaman oluşur?
 * - Token süresi dolmuş (expired)
 * - Token geçersiz (manipüle edilmiş, silinmiş, yanlış format)
 * - Kullanıcı backend'de silinmiş
 *
 * Akış:
 * 1. Backend API yanıtı döner
 * 2. Response interceptor devreye girer (burası)
 * 3. Status code 401 mi kontrol edilir
 * 4. 401 ise localStorage'dan token temizlenir
 * 5. Hata component'e geri döner
 * 6. Component refreshUser.rejected veya login.rejected handle eder
 * 7. Kullanıcı /login sayfasına yönlendirilir
 *
 * NOT: Burada dispatch(logout()) çağrılamaz çünkü circular dependency yaratır.
 * (api -> store -> api döngüsü). Bu yüzden sadece localStorage temizlenir.
 * Redux state authOps.js'de handleRejectedCase ile temizlenir.
 */
api.interceptors.response.use(
  response => {
    // Başarılı yanıt (2xx status code)
    // Doğrudan döndür, değişiklik yok
    return response
  },
  error => {
    // Hatalı yanıt (4xx, 5xx status codes)

    // 401 Unauthorized - token geçersiz veya süresi dolmuş
    if (error.response?.status === 401) {
      // Geçersiz token'ı localStorage'dan temizle
      localStorage.removeItem('token')

      // Redux state temizliği authOps.js ve authSlice.js'de yapılacak
      // Component'ler rejected action'ı handle edecek
      // PrivateRoute kullanıcıyı /login'e yönlendirecek
    }

    // Hatayı component'e ilet (catch bloğunda yakalanacak)
    return Promise.reject(error)
  }
)

/**
 * -----------------------------------------------------------------------------
 * EXPORT - Merkezi API Instance
 * -----------------------------------------------------------------------------
 *
 * Bu instance'ı authOps.js ve contactsOps.js import eder.
 * Tüm API çağrıları bu yapılandırılmış instance üzerinden yapılır.
 */
export default api

