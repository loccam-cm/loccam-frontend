/**
 * usePlan — lit le plan d'abonnement du bailleur connecté
 * GET /api/v1/abonnements/mon-abonnement/
 *
 * Usage :
 *   const { plan, peut, nbBiensRestants, loading } = usePlan()
 *   if (!peut('releves')) → bloquer
 */

import { useState, useEffect, useCallback } from 'react'
import api from '@/lib/api'

// ── Types ─────────────────────────────────────────────────────
export interface Limites {
  nb_biens    : number | null   // null = illimité
  mobile_money: boolean
  releves     : boolean
  quittances  : boolean
  analytique  : boolean
  signalements: boolean
  structures  : boolean
  export      : boolean
}

export type PlanId = 'gratuit' | 'pro' | 'business'

export type Fonctionnalite = keyof Omit<Limites, 'nb_biens'>

export interface PlanData {
  plan          : PlanId
  plan_display  : string
  statut        : string
  est_actif     : boolean
  jours_restants: number | null
  date_fin      : string | null
  montant       : number
  limites       : Limites
  plan_suivant  : PlanId | null
  tarifs        : Record<string, Record<string, number>>
}

interface UsePlanResult {
  data          : PlanData | null
  plan          : PlanId
  loading       : boolean
  error         : boolean

  /** Vérifie si une fonctionnalité booléenne est autorisée */
  peut          : (f: Fonctionnalite) => boolean

  /** Nombre de biens restants avant la limite (null = illimité) */
  nbBiensRestants: (nbActuel: number) => number | null

  /** true si la limite de biens est atteinte */
  limiteBiensAtteinte: (nbActuel: number) => boolean

  /** Plan requis pour une fonctionnalité */
  planRequis    : (f: Fonctionnalite) => PlanId

  /** true si plan >= pro */
  estPro        : boolean

  /** true si plan >= business */
  estBusiness   : boolean

  /** Recharge les données */
  refetch       : () => void
}

// ── Cache module-level (évite N appels API sur la même page) ──
let _cache: PlanData | null = null
let _cacheTs = 0
const CACHE_TTL = 60_000 // 1 minute

const PLAN_REQUIS: Record<Fonctionnalite, PlanId> = {
  mobile_money : 'pro',
  releves      : 'pro',
  quittances   : 'pro',
  analytique   : 'pro',
  signalements : 'pro',
  structures   : 'business',
  export       : 'business',
}

const ORDRE_PLANS: PlanId[] = ['gratuit', 'pro', 'business']

// ── Hook ──────────────────────────────────────────────────────
export function usePlan(): UsePlanResult {
  const [data, setData]       = useState<PlanData | null>(_cache)
  const [loading, setLoading] = useState(!_cache)
  const [error, setError]     = useState(false)

  const fetch = useCallback(async (force = false) => {
    // Cache valide
    if (!force && _cache && Date.now() - _cacheTs < CACHE_TTL) {
      setData(_cache); setLoading(false); return
    }
    setLoading(true); setError(false)
    try {
      const res = await api.get<PlanData>('/abonnements/mon-abonnement/')
      _cache   = res.data
      _cacheTs = Date.now()
      setData(res.data)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const plan = data?.plan ?? 'gratuit'

  const peut = (f: Fonctionnalite): boolean => {
    if (!data) return false
    return data.limites[f] === true && data.est_actif
  }

  const nbBiensRestants = (nbActuel: number): number | null => {
    const limite = data?.limites.nb_biens ?? null
    if (limite === null) return null
    return Math.max(0, limite - nbActuel)
  }

  const limiteBiensAtteinte = (nbActuel: number): boolean => {
    const limite = data?.limites.nb_biens ?? null
    if (limite === null) return false
    return nbActuel >= limite
  }

  const planRequis = (f: Fonctionnalite): PlanId => PLAN_REQUIS[f] ?? 'pro'

  const planIdx    = ORDRE_PLANS.indexOf(plan)
  const estPro     = planIdx >= 1 && (data?.est_actif ?? false)
  const estBusiness= planIdx >= 2 && (data?.est_actif ?? false)

  return {
    data, plan, loading, error,
    peut, nbBiensRestants, limiteBiensAtteinte,
    planRequis, estPro, estBusiness,
    refetch: () => fetch(true),
  }
}

// ── Utilitaire statique (hors composant) ──────────────────────
export function invalidatePlanCache() {
  _cache   = null
  _cacheTs = 0
}
