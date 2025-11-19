import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api'

export const httpClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})

httpClient.interceptors.request.use((config) => {
  const authEndpoints = ['/auth/login', '/auth/register', '/v1/auth/register']
  const isAuthEndpoint = authEndpoints.some(endpoint => config.url?.includes(endpoint))
  
  if (!isAuthEndpoint) {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers = config.headers ?? {}
      if (!config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
  }
  
  return config
})

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 401 hatası geldiğinde token'ı temizle ve login sayfasına yönlendir
      const token = localStorage.getItem('accessToken')
      if (token) {
        localStorage.removeItem('accessToken')
        // Sadece zaten login sayfasında değilsek yönlendir
        if (window.location.pathname !== '/auth/sign-in') {
          window.location.href = '/auth/sign-in'
        }
      }
    }
    return Promise.reject(error)
  }
)