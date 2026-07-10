import { useEffect, useState } from 'react'
import api from '@/lib/api'

export function useLocale() {
  const [locale, setLocaleState] = useState<'fr' | 'en'>('fr')

  useEffect(() => {
    // Lire la langue depuis le cookie au montage
    const cookie = document.cookie
      .split(';')
      .find(c => c.trim().startsWith('locale='))
    if (cookie) {
      const val = cookie.split('=')[1]?.trim()
      if (val === 'fr' || val === 'en') setLocaleState(val)
    }
  }, [])

  /**
   * Change la langue.
   * - Écrit toujours le cookie + recharge (marche sur la landing publique)
   * - Sauvegarde en base UNIQUEMENT si l'utilisateur est connecté
   *   (l'échec 401 sur la landing est ignoré silencieusement)
   */
  const changerLangue = async (nouvelle: 'fr' | 'en') => {
    // 1. Cookie (toujours, fonctionne sans connexion)
    document.cookie = `locale=${nouvelle};path=/;max-age=31536000`

    // 2. Sauvegarde en base — best effort, seulement si connecté
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('access_token')
        : null
    if (token) {
      try {
        await api.patch('/auth/preferences/', { langue: nouvelle })
      } catch {
        // Visiteur non connecté ou erreur réseau → on ignore,
        // le cookie suffit pour la landing
      }
    }

    // 3. Appliquer
    setLocaleState(nouvelle)
    window.location.reload()
  }

  // Alias setLocale pour compatibilité avec LanguageSwitch
  const setLocale = changerLangue

  return { locale, changerLangue, setLocale }
}