import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
})


api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})


api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (!refreshToken) throw new Error('No refresh token')
        const { data } = await axios.post('/api/v1/auth/refresh', { refreshToken }, {
          baseURL: window.location.origin,
        })
        localStorage.setItem('accessToken', data.data.accessToken)
        localStorage.setItem('refreshToken', data.data.refreshToken)
        original.headers.Authorization = `Bearer ${data.data.accessToken}`
        return api(original)
      } catch {
        localStorage.clear()
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)


export const authApi = {
  login:    (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  logout:   (refreshToken) => api.post('/auth/logout', { refreshToken }),
  me:       () => api.get('/auth/me'),
}


export const dashboardApi = {
  summary:        (params) => api.get('/dashboard/summary', { params }),
  categories:     (params) => api.get('/dashboard/categories', { params }),
  monthlyTrends:  (params) => api.get('/dashboard/trends/monthly', { params }),
  weeklyTrends:   (params) => api.get('/dashboard/trends/weekly', { params }),
  activity:       (params) => api.get('/dashboard/activity', { params }),
  insights:       () => api.get('/dashboard/insights'),
  budgetAnalysis: (params) => api.get('/dashboard/budget-analysis', { params }),
}


export const recordsApi = {
  list:   (params) => api.get('/records', { params }),
  get:    (id) => api.get(`/records/${id}`),
  create: (data) => api.post('/records', data),
  update: (id, data) => api.patch(`/records/${id}`, data),
  delete: (id) => api.delete(`/records/${id}`),
}


export const usersApi = {
  list:           (params) => api.get('/users', { params }),
  get:            (id) => api.get(`/users/${id}`),
  update:         (id, data) => api.patch(`/users/${id}`, data),
  delete:         (id) => api.delete(`/users/${id}`),
  stats:          () => api.get('/users/stats'),
  changePassword: (data) => api.post('/users/change-password', data),
}


export const budgetsApi = {
  list:   () => api.get('/budgets'),
  upsert: (data) => api.put('/budgets', data),
  delete: (category) => api.delete(`/budgets/${category}`),
}


export const auditApi = {
  list: (params) => api.get('/audit-logs', { params }),
}

export default api;