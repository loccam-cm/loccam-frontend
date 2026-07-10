'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import api from '@/lib/api'
import { Bien, Paiement, Notification, PaginatedResponse } from '@/types'
import { BailleurStats } from '@/types/bailleur'

interface ImpayeAPI {
  contrat_id   : number
  loyer_mensuel: number
  jours_retard : number
  statut       : 'non_initie' | 'en_attente' | 'echoue'
}

interface SignalementAPI {
  id     : number
  statut : 'ouvert' | 'en_cours' | 'resolu' | 'clos'
}

interface ContratAPI {
  id       : number
  statut   : string
  date_fin : string | null
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
      const [biensRes, paiRes, notifsRes] = await Promise.all([
        api.get<PaginatedResponse<Bien>>('/biens/'),
        api.get<PaginatedResponse<Paiement>>('/paiements/'),
        api.get<PaginatedResponse<Notification>>('/notifications/'),
      ])

      const bs = biensRes.data.results
      const ps = paiRes.data.results

      const occupes   = bs.filter(b => b.statut === 'occupe').length
      const libres    = bs.filter(b => b.statut === 'libre').length
      const confirmes = ps.filter(p => p.statut === 'confirme')
      const revenus   = confirmes.reduce((s, p) => s + p.montant_total, 0)

      // ── Impayés (endpoint dédié) ─────────────────────────────
      let impayesCount   = 0
      let montantImpayes = 0
      try {
        const impayesRes = await api.get('/paiements/impayes/')
        const data: ImpayeAPI[] = Array.isArray(impayesRes.data)
          ? impayesRes.data
          : impayesRes.data.results ?? []
        impayesCount   = data.length
        montantImpayes = data.reduce((s, i) => s + (i.loyer_mensuel ?? 0), 0)
      } catch {
        const fb = ps.filter(p =>
          p.statut === 'echoue' || (p.statut === 'en_attente' && p.est_en_retard)
        )
        impayesCount   = fb.length
        montantImpayes = fb.reduce((s, p) => s + p.montant_total, 0)
      }

      // ── Signalements en traitement (ouvert + en_cours) ───────
      let signalementsActifs = 0
      try {
        const sigRes = await api.get('/signalements/')
        const sigs: SignalementAPI[] = Array.isArray(sigRes.data)
          ? sigRes.data
          : sigRes.data.results ?? []
        signalementsActifs = sigs.filter(
          s => s.statut === 'ouvert' || s.statut === 'en_cours'
        ).length
      } catch { signalementsActifs = 0 }

      // ── Baux à renouveler (date_fin dans les 30 prochains jours) ──
      let bauxRenouveler = 0
      try {
        const ctrRes = await api.get('/contrats/')
        const contrats: ContratAPI[] = Array.isArray(ctrRes.data)
          ? ctrRes.data
          : ctrRes.data.results ?? []
        const aujourdhui = new Date()
        const dans30j    = new Date()
        dans30j.setDate(dans30j.getDate() + 30)
        bauxRenouveler = contrats.filter(c => {
          if (c.statut !== 'actif' || !c.date_fin) return false
          const fin = new Date(c.date_fin)
          return fin >= aujourdhui && fin <= dans30j
        }).length
      } catch { bauxRenouveler = 0 }

      setStats({
        total_biens: bs.length, biens_libres: libres, biens_occupes: occupes,
        taux_occupation: bs.length > 0 ? Math.round((occupes / bs.length) * 100) : 0,
        revenus_mois: revenus, revenus_encaisses: revenus,
        impayes: impayesCount,
        montant_impayes: montantImpayes,
        loyers_confirmes: confirmes.length,
        signalements: signalementsActifs,
        baux_renouveler: bauxRenouveler,
      })

      setPaiements(ps.slice(0, 5))
      setNotifs(notifsRes.data.results.slice(0, 8))
    } catch { } finally { setLoading(false) }
  }

  return { stats, paiements, notifs, loading, chargerDonnees }
}