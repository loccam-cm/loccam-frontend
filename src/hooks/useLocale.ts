import { useEffect, useState } from 'react'
import api from '@/lib/api'

export function useLocale() {
  const [locale, setLocale] = useState<'fr' | 'en'>('fr')

  useEffect(() => {
    // Lire depuis le cookie
    const cookie = document.cookie.split(';').find(c => c.trim().startsWith('locale='))
    if (cookie) setLocale(cookie.split('=')[1] as 'fr' | 'en')
  }, [])

  const changerLangue = async (nouvelle: 'fr' | 'en') => {
    // 1. Sauvegarder en base
    await api.patch('/auth/preferences/', { langue: nouvelle })
    // 2. Mettre à jour le cookie
    document.cookie = `locale=${nouvelle};path=/;max-age=31536000`
    setLocale(nouvelle)
    // 3. Recharger la page pour appliquer les traductions
    window.location.reload()
  }

  return { locale, changerLangue }
}