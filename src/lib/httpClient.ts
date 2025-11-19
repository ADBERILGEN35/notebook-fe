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
      console.warn('Yetkisiz istek - tekrar oturum açılması gerekiyor.')
    }
    return Promise.reject(error)
  }
)