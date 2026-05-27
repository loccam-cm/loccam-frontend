'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { Utilisateur, AuthResponse } from '@/types'

// ============================================================
//  HOOK — useAuth
//  Gestion de l'authentification JWT
// ============================================================

export function useAuth() {
  const [user, setUser]       = useState<Utilisateur | null>(null)
  const [loading, setLoading] = useState(true)
  const router                = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) {
      fetchProfil()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchProfil = async () => {
    try {
      const res = await api.get<Utilisateur>('/auth/profil/')
      setUser(res.data)
    } catch {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
    } finally {
      setLoading(false)
    }
  }

  const connexion = async (email: string, password: string) => {
    const res = await api.post<AuthResponse>('/auth/connexion/', {
      email,
      password,
    })
    localStorage.setItem('access_token',  res.data.access_token)
    localStorage.setItem('refresh_token', res.data.refresh_token)
    setUser(res.data.user)

    // Rediriger selon le rôle
    switch (res.data.user.role) {
      case 'bailleur':
        router.push('/bailleur')
        break
      case 'locataire':
        router.push('/locataire')
        break
      case 'admin':
        router.push('/admin')
        break
    }
    return res.data
  }

  const deconnexion = async () => {
    const refresh = localStorage.getItem('refresh_token')
    try {
      await api.post('/auth/deconnexion/', { refresh_token: refresh })
    } catch {}
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setUser(null)
    router.push('/login')
  }

  const inscription = async (data: Record<string, string>) => {
    const res = await api.post<AuthResponse>('/auth/inscription/', data)
    localStorage.setItem('access_token',  res.data.access_token)
    localStorage.setItem('refresh_token', res.data.refresh_token)
    setUser(res.data.user)
    return res.data
  }

  return {
    user,
    loading,
    connexion,
    deconnexion,
    inscription,
    estConnecte: !!user,
    estBailleur : user?.role === 'bailleur',
    estLocataire: user?.role === 'locataire',
    estAdmin    : user?.role === 'admin',
  }
}