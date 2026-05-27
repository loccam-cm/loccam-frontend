import axios from 'axios'

// ============================================================
//  CLIENT API — LocCam
//  Connexion à l'API Django REST
// ============================================================

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Intercepteur requête — ajoute le token JWT automatiquement
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Intercepteur réponse — gère l'expiration du token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config

    // Token expiré → essayer de le rafraîchir
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      const refresh = localStorage.getItem('refresh_token')

      if (refresh) {
        try {
          const res = await axios.post(`${API_URL}/auth/token/refresh/`, {
            refresh,
          })
          const newToken = res.data.access
          localStorage.setItem('access_token', newToken)
          original.headers.Authorization = `Bearer ${newToken}`
          return api(original)
        } catch {
          // Refresh échoué → déconnecter
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

export default api