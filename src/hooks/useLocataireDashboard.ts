'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import api from '@/lib/api'
import { Contrat, Paiement, Notification, Message, PaginatedResponse } from '@/types'
import { LocataireDashboardData, SignalementLocal } from '@/types/locataire'

export function useLocataireDashboard() {
  const { user } = useAuth()
  const [data, setData]     = useState<LocataireDashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  const now           = new Date()
  const joursDansMois = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const joursRestants = joursDansMois - now.getDate()
  const progressMois  = Math.round((now.getDate() / joursDansMois) * 100)
  const dateEcheance  = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    .toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })

  useEffect(() => { if (user) load() }, [user])

  const load = async () => {
    setLoading(true)
    try {
      const [cRes, pRes, nRes, mRes, sRes] = await Promise.all([
        api.get<PaginatedResponse<Contrat>>('/contrats/'),
        api.get<PaginatedResponse<Paiement>>('/paiements/'),
        api.get<PaginatedResponse<Notification>>('/notifications/'),
        api.get<PaginatedResponse<Message>>('/messages/'),
        api.get<{ results: SignalementLocal[] }>('/signalements/'),
      ])
      const contrat   = cRes.data.results.find(c => c.statut === 'actif') ?? cRes.data.results[0] ?? null
      const paiements = pRes.data.results
      const confirmes = paiements.filter(p => p.statut === 'confirme')
      setData({
        contrat,
        paiements: paiements.slice(0, 5),
        notifications: nRes.data.results.slice(0, 6),
        messages: mRes.data.results.slice(0, 4),
        signalements: sRes.data.results.slice(0, 4),
        totalPaye: confirmes.reduce((s, p) => s + p.montant_total, 0),
        paiementsEffectues: confirmes.length,
        moisSansRetard: confirmes.length,
      })
    } catch(e) { console.error(e) }
    finally { setLoading(false) }
  }

  return { data, loading, load, joursRestants, progressMois, dateEcheance }
}
