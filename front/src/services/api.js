import axios from 'axios'

// Utiliser le proxy Vite qui redirige vers le backend
const API_URL = '/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Intercepteur pour ajouter le token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error.response?.data || error.message)
  }
)

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
}

export const spacesAPI = {
  getAll: (params) => api.get('/spaces', { params }),
  getById: (id) => api.get(`/spaces/${id}`),
}

export const reservationsAPI = {
  create: (data) => api.post('/reservations', data),
  getAll: (params) => api.get('/reservations', { params }),
  getById: (id) => api.get(`/reservations/${id}`),
  cancel: (id) => api.post(`/reservations/${id}/cancel`),
}

export const paymentsAPI = {
  create: (data) => api.post('/payments', data),
  getAll: () => api.get('/payments'),
  getById: (id) => api.get(`/payments/${id}`),
}

export const usersAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
}

export default api

