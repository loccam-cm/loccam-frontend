'use client'

import {
  createContext, useContext, useEffect,
  useState, ReactNode
} from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { Utilisateur, AuthResponse } from '@/types'

interface AuthContextType {
  user         : Utilisateur | null
  loading      : boolean
  connexion    : (email: string, password: string) => Promise<void>
  inscription  : (data: Record<string, string>) => Promise<void>
  deconnexion  : () => void
  estConnecte  : boolean
  estBailleur  : boolean
  estLocataire : boolean
  estAdmin     : boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const router                = useRouter()
  const [user, setUser]       = useState<Utilisateur | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token    = localStorage.getItem('access_token')
    const userData = localStorage.getItem('user')
    if (token && userData) {
      try {
        setUser(JSON.parse(userData))
        api.get<Utilisateur>('/auth/profil/')
          .then(res => {
            setUser(res.data)
            localStorage.setItem('user', JSON.stringify(res.data))
          })
          .catch(() => {
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            localStorage.removeItem('user')
            setUser(null)
          })
          .finally(() => setLoading(false))
      } catch {
        setLoading(false)
      }
    } else {
      setLoading(false)
    }
  }, [])

  const connexion = async (email: string, password: string) => {
    const res = await api.post<AuthResponse>('/auth/connexion/', { email, password })
    localStorage.setItem('access_token',  res.data.access_token)
    localStorage.setItem('refresh_token', res.data.refresh_token)
    localStorage.setItem('user', JSON.stringify(res.data.user))
    setUser(res.data.user)
    switch (res.data.user.role) {
      case 'bailleur':  router.push('/bailleur');  break
      case 'locataire': router.push('/locataire'); break
      case 'admin':     router.push('/admin');     break
    }
  }

  const inscription = async (data: Record<string, string>) => {
    const res = await api.post<AuthResponse>('/auth/inscription/', data)
    localStorage.setItem('access_token',  res.data.access_token)
    localStorage.setItem('refresh_token', res.data.refresh_token)
    localStorage.setItem('user', JSON.stringify(res.data.user))
    setUser(res.data.user)
    router.push(res.data.user.role === 'bailleur' ? '/bailleur' : '/locataire')
  }

  const deconnexion = () => {
    const refresh = localStorage.getItem('refresh_token')
    if (refresh) api.post('/auth/deconnexion/', { refresh_token: refresh }).catch(() => {})
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    setUser(null)
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{
      user, loading, connexion, inscription, deconnexion,
      estConnecte : !!user,
      estBailleur : user?.role === 'bailleur',
      estLocataire: user?.role === 'locataire',
      estAdmin    : user?.role === 'admin',
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}