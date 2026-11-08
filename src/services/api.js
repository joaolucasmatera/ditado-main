import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

// Usa proxy em desenvolvimento, URL completa em produção
const baseURL = import.meta.env.DEV 
  ? '/api' 
  : 'https://api-ditado.azurewebsites.net/api'

const api = axios.create({
  baseURL
})

// Interceptor para adicionar token em todas as requisições
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`
      console.log('[API] Token enviado para:', config.url)
    } else {
      console.warn('[API] ⚠️ Nenhum token disponível para:', config.url)
    }
    
    // O Axios define o boundary automaticamente para FormData.
    if (!config.headers['Content-Type'] && !(typeof FormData !== 'undefined' && config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json'
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const authStore = useAuthStore()
      authStore.logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
