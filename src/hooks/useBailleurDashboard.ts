'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import api from '@/lib/api'
import { Bien, Paiement, Notification, PaginatedResponse } from '@/types'
import { BailleurStats } from '@/types/bailleur'

// ── Type impayé (format /paiements/impayes/) ──────────────────
interface ImpayeAPI {
  contrat_id   : number
  loyer_mensuel: number
  jours_retard : number
  statut       : 'non_initie' | 'en_attente' | 'echoue'
}

export function useBailleurDashboard() {
  const { user } = useAuth()
  const [stats, setStats]         = useState<BailleurStats | null>(null)
  const [paiements, setPaiements] = useState<Paiement[]>([])
  const [notifs, setNotifs]       = useState<Notification[]>([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => { if (user) chargerDonnees() }, [user])

  const chargerDonnees = async () => {
    setLoading(true)
    try {
      const [biensRes, paiRes, notifsRes, impayesRes] = await Promise.all([
        api.get<PaginatedResponse<Bien>>('/biens/'),
        api.get<PaginatedResponse<Paiement>>('/paiements/'),
        api.get<PaginatedResponse<Notification>>('/notifications/'),
        // Source de vérité des impayés : parcourt les contrats,
        // détecte l'absence de paiement (même non initié)
        api.get('/paiements/impayes/'),
      ])

      const bs = biensRes.data.results
      const ps = paiRes.data.results

      const occupes   = bs.filter(b => b.statut === 'occupe').length
      const libres    = bs.filter(b => b.statut === 'libre').length
      const confirmes = ps.filter(p => p.statut === 'confirme')
      const revenus   = confirmes.reduce((s, p) => s + p.montant_total, 0)

      // ── Impayés depuis l'endpoint dédié (cohérent avec /bailleur/impayes) ──
      const impayesData: ImpayeAPI[] = Array.isArray(impayesRes.data)
        ? impayesRes.data
        : impayesRes.data.results ?? []

      const montantImpayes = impayesData.reduce(
        (s, i) => s + (i.loyer_mensuel ?? 0), 0
      )

      setStats({
        total_biens: bs.length, biens_libres: libres, biens_occupes: occupes,
        taux_occupation: bs.length > 0 ? Math.round((occupes / bs.length) * 100) : 0,
        revenus_mois: revenus, revenus_encaisses: revenus,
        impayes: impayesData.length,            // ← count depuis /paiements/impayes/
        montant_impayes: montantImpayes,        // ← montant total réel
        loyers_confirmes: confirmes.length, signalements: 0, baux_renouveler: 0,
      })

      setPaiements(ps.slice(0, 5))
      setNotifs(notifsRes.data.results.slice(0, 8))
    } catch { } finally { setLoading(false) }
  }

  return { stats, paiements, notifs, loading, chargerDonnees }
}