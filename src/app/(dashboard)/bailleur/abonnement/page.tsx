'use client'

import { useState, useEffect, useCallback, useRef } from 'react'   // ← useRef ajouté
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import api from '@/lib/api'
import { invalidatePlanCache } from '@/hooks/usePlan'
import {
  IconArrowLeft, IconCheck, IconX, IconCrown, IconRocket,
  IconBuildingStore, IconLoader2, IconRefresh, IconAlertTriangle,
  IconCircleCheck, IconCalendar, IconStar, IconArrowDown,   // ← IconArrowDown ajouté
} from '@tabler/icons-react'

// ── Types ──────────────────────────────────────────────────────
type Plan    = 'gratuit' | 'pro' | 'business'
type Periode = 'mensuel' | 'annuel'

interface AbonnementData {
  plan           : Plan
  plan_display   : string
  periode        : Periode | null
  statut         : string
  statut_display : string
  est_actif      : boolean
  date_debut     : string | null
  date_fin       : string | null
  montant        : number
  jours_restants : number | null
  limites        : Record<string, boolean | number | null>
  plan_suivant   : Plan | null
  tarifs         : Record<string, Record<string, number>>
}

// ── Config des plans ───────────────────────────────────────────
const FEATURES: { key: string; label: string }[] = [
  { key: 'nb_biens',     label: 'Biens gérés'                 },
  { key: 'mobile_money', label: 'Paiement Mobile Money'       },
  { key: 'releves',      label: 'Relevés eau / électricité'   },
  { key: 'quittances',   label: 'Quittances PDF automatiques' },
  { key: 'analytique',   label: 'Analytique & graphiques'     },
  { key: 'signalements', label: 'Signalements techniques'     },
  { key: 'structures',   label: 'Multi-structures'            },
  { key: 'export',       label: 'Export comptable CSV'        },
]

const PLAN_META: Record<Plan, {
  label: string; icon: React.ReactNode
  couleur: string; bg: string; border: string
  gradient: string; recommande?: boolean
}> = {
  gratuit : {
    label: 'Gratuit', icon: <IconBuildingStore size={20}/>,
    couleur:'#64748B', bg:'#F8FAFC', border:'#E2E8F0',
    gradient:'linear-gradient(135deg,#475569,#64748B)',
  },
  pro: {
    label:'Pro', icon:<IconRocket size={20}/>,
    couleur:'#059669', bg:'#ECFDF5', border:'#6EE7B7',
    gradient:'linear-gradient(135deg,#047857,#059669)',
    recommande: true,
  },
  business: {
    label:'Business', icon:<IconCrown size={20}/>,
    couleur:'#7C3AED', bg:'#F5F3FF', border:'#C4B5FD',
    gradient:'linear-gradient(135deg,#6D28D9,#7C3AED)',
  },
}

function featureVal(plan: Plan, key: string): boolean | string | number {
  if (plan === 'gratuit') {
    if (key === 'nb_biens') return 1
    return false
  }
  if (plan === 'pro') {
    if (key === 'nb_biens') return 15
    return key !== 'structures' && key !== 'export'
  }
  if (key === 'nb_biens') return 'Illimité'
  return true
}

function FeatureIcon({ val }: { val: boolean | string | number }) {
  if (val === false) return <IconX     size={15} style={{ color:'#EF4444' }}/>
  if (val === true)  return <IconCheck size={15} style={{ color:'#059669' }}/>
  return <span style={{ fontSize:'12px', fontWeight:700, color:'#0F172A' }}>{val}</span>
}

// ════════════════════════════════════════════════════════════════
export default function AbonnementPage() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const plansRef     = useRef<HTMLDivElement>(null)   // ← ref section cartes

  const [abo,        setAbo]       = useState<AbonnementData | null>(null)
  const [loading,    setLoading]   = useState(true)
  const [periode,    setPeriode]   = useState<Periode>('mensuel')
  const [paying,     setPaying]    = useState<Plan | null>(null)
  const [cancelling, setCancelling]= useState(false)
  const [planSugge,  setPlanSugge] = useState<Plan | null>(null)  // ← plan suggéré depuis URL

  // ── 1. Lecture ?plan= depuis la landing ou LandingPricing ────
  useEffect(() => {
    const planParam = searchParams.get('plan') as Plan | null
    if (planParam && ['pro','business'].includes(planParam)) {
      setPlanSugge(planParam)
      // Scroll vers les cartes après chargement
      setTimeout(() => {
        plansRef.current?.scrollIntoView({ behavior:'smooth', block:'start' })
      }, 600)
    }
  }, [searchParams])

  // ── 2. Lecture retour PayDunya (?succes=1 / ?annule=1) ───────
  useEffect(() => {
    const succes = searchParams.get('succes')
    const annule = searchParams.get('annule')
    if (succes === '1') {
      invalidatePlanCache()
      toast.success('🎉 Abonnement activé avec succès !')
      router.replace('/bailleur/abonnement')
    }
    if (annule === '1') {
      toast.error('Paiement annulé.')
      router.replace('/bailleur/abonnement')
    }
  }, [searchParams, router])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get<AbonnementData>('/abonnements/mon-abonnement/')
      setAbo(res.data)
      if (res.data.periode) setPeriode(res.data.periode)
    } catch {
      toast.error("Impossible de charger l'abonnement.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  // ── Souscrire ────────────────────────────────────────────────
  const souscrire = async (plan: 'pro' | 'business') => {
    setPaying(plan)
    try {
      const res  = await api.post('/abonnements/souscrire/', { plan, periode })
      const data = res.data

      if (data.mode === 'test') {
        invalidatePlanCache()
        toast.success(`✅ Plan ${plan} activé (mode test)`)
        setPlanSugge(null)
        load()
        return
      }

      if (data.paydunya_url) {
        window.location.href = data.paydunya_url
      } else {
        toast.error('URL de paiement manquante.')
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.error || err?.response?.data?.message || 'Erreur réseau.')
    } finally {
      setPaying(null)
    }
  }

  // ── Annuler ──────────────────────────────────────────────────
  const annuler = async () => {
    if (!confirm("Confirmer l'annulation ? Votre accès reste actif jusqu'à la fin de la période.")) return
    setCancelling(true)
    try {
      const res = await api.post('/abonnements/annuler/')
      toast.success(res.data.message || 'Abonnement annulé.')
      invalidatePlanCache()
      load()
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Erreur annulation.')
    } finally {
      setCancelling(false)
    }
  }

  const tarif = (plan: 'pro' | 'business') => {
    if (!abo?.tarifs) {
      return plan === 'pro'
        ? (periode === 'mensuel' ? 5000  : 50000)
        : (periode === 'mensuel' ? 15000 : 150000)
    }
    return abo.tarifs[plan]?.[periode] ?? 0
  }

  const economie = (plan: 'pro' | 'business') => {
    const mensuel = abo?.tarifs?.[plan]?.mensuel ?? (plan === 'pro' ? 5000  : 15000)
    const annuel  = abo?.tarifs?.[plan]?.annuel  ?? (plan === 'pro' ? 50000 : 150000)
    return Math.round(100 - (annuel / (mensuel * 12)) * 100)
  }

  const planActuel = abo?.plan ?? 'gratuit'

  return (
    <>
      <style>{`
        @keyframes spin  { to { transform:rotate(360deg) } }
        @keyframes pulse { 0%,100%{box-shadow:0 0 0 0 rgba(5,150,105,.4)} 50%{box-shadow:0 0 0 8px rgba(5,150,105,0)} }
        .plan-card { transition:transform .2s,box-shadow .2s }
        .plan-card:hover { transform:translateY(-3px); box-shadow:0 12px 32px rgba(0,0,0,.1) }
        .plan-sugge { animation:pulse 2s ease-in-out 3 }
      `}</style>

      <div style={{ minHeight:'100vh', background:'#F1F5F9', fontFamily:"'DM Sans','Helvetica Neue',sans-serif" }}>

        {/* ── HEADER ── */}
        <header style={{ position:'sticky', top:0, zIndex:30, background:'#fff', borderBottom:'1px solid #E2E8F0', boxShadow:'0 1px 3px rgba(0,0,0,.04)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'12px', padding:'0 24px', height:'56px' }}>
            <Link href="/bailleur" style={{ display:'flex', alignItems:'center', gap:'6px', color:'#64748B', textDecoration:'none', fontSize:'14px', fontWeight:500 }}>
              <IconArrowLeft size={16}/> Retour
            </Link>
            <div style={{ width:'1px', height:'20px', background:'#E2E8F0' }}/>
            <IconStar size={17} style={{ color:'#059669' }}/>
            <span style={{ fontSize:'14px', fontWeight:700, color:'#0F172A' }}>Mon abonnement</span>
            <div style={{ flex:1 }}/>
            <button onClick={load} style={{ width:'36px', height:'36px', borderRadius:'10px', background:'#F1F5F9', border:'1px solid #E2E8F0', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <IconRefresh size={15} style={{ color:'#64748B', animation: loading ? 'spin 1s linear infinite' : 'none' }}/>
            </button>
          </div>
        </header>

        <div style={{ maxWidth:'860px', margin:'0 auto', padding:'24px 16px', display:'flex', flexDirection:'column', gap:'20px' }}>

          {/* ── BANDEAU PLAN SUGGÉRÉ (vient de la landing) ── */}
          {planSugge && !loading && planActuel !== planSugge && (
            <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }}
              style={{
                background: PLAN_META[planSugge].gradient,
                borderRadius:'14px', padding:'14px 18px',
                display:'flex', alignItems:'center', justifyContent:'space-between',
                color:'#fff', gap:'12px',
              }}>
              <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                {PLAN_META[planSugge].icon}
                <div>
                  <div style={{ fontSize:'13px', fontWeight:700 }}>
                    Plan {PLAN_META[planSugge].label} sélectionné
                  </div>
                  <div style={{ fontSize:'12px', opacity:.8 }}>
                    Choisissez votre période ci-dessous et souscrivez
                  </div>
                </div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                <IconArrowDown size={16} style={{ opacity:.8 }}/>
                <button onClick={() => setPlanSugge(null)}
                  style={{ background:'rgba(255,255,255,.2)', border:'none', color:'#fff', width:'24px', height:'24px', borderRadius:'6px', cursor:'pointer', fontSize:'14px', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  ×
                </button>
              </div>
            </motion.div>
          )}

          {/* ── PLAN ACTUEL ── */}
          {!loading && abo && (
            <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}>
              <div style={{
                background: planActuel === 'gratuit' ? '#fff' : PLAN_META[planActuel].gradient,
                border:`1px solid ${PLAN_META[planActuel].border}`,
                borderRadius:'16px', padding:'20px',
                color: planActuel === 'gratuit' ? '#0F172A' : '#fff',
              }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'12px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                    <div style={{ width:'44px', height:'44px', borderRadius:'12px', background:'rgba(255,255,255,.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      {PLAN_META[planActuel].icon}
                    </div>
                    <div>
                      <div style={{ fontSize:'12px', opacity:.7, marginBottom:'2px' }}>Plan actuel</div>
                      <div style={{ fontSize:'20px', fontWeight:800 }}>{abo.plan_display}</div>
                      <div style={{ fontSize:'12px', opacity:.7 }}>
                        Statut : {abo.statut_display}
                        {abo.est_actif && <IconCircleCheck size={12} style={{ marginLeft:'4px', display:'inline' }}/>}
                      </div>
                    </div>
                  </div>
                  {abo.date_fin && (
                    <div style={{ textAlign:'right' }}>
                      <div style={{ fontSize:'11px', opacity:.7, display:'flex', alignItems:'center', gap:'4px', justifyContent:'flex-end' }}>
                        <IconCalendar size={11}/> Expire le
                      </div>
                      <div style={{ fontSize:'14px', fontWeight:700 }}>
                        {new Date(abo.date_fin).toLocaleDateString('fr-FR',{ day:'numeric', month:'long', year:'numeric' })}
                      </div>
                      {abo.jours_restants !== null && (
                        <div style={{ fontSize:'12px', opacity:.8 }}>
                          {abo.jours_restants} jour{abo.jours_restants !== 1 ? 's':''} restant{abo.jours_restants !== 1 ? 's':''}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {abo.jours_restants !== null && abo.jours_restants <= 7 && planActuel !== 'gratuit' && (
                  <div style={{ marginTop:'12px', display:'flex', alignItems:'center', gap:'8px', background:'rgba(255,255,255,.2)', borderRadius:'10px', padding:'10px 14px', fontSize:'13px', fontWeight:600 }}>
                    <IconAlertTriangle size={15}/>
                    Abonnement expirant dans {abo.jours_restants} jour{abo.jours_restants !== 1 ? 's':''} — Renouvelez dès maintenant
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ── TOGGLE MENSUEL / ANNUEL ── */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}>
            {(['mensuel','annuel'] as Periode[]).map(p => (
              <button key={p} onClick={() => setPeriode(p)}
                style={{
                  padding:'8px 20px', borderRadius:'12px', fontSize:'13px', fontWeight:600,
                  cursor:'pointer', border:`1px solid ${periode === p ? '#059669' : '#E2E8F0'}`,
                  background: periode === p ? '#059669' : '#fff',
                  color: periode === p ? '#fff' : '#64748B',
                  display:'flex', alignItems:'center', gap:'8px',
                }}>
                {p === 'mensuel' ? 'Mensuel' : 'Annuel'}
                {p === 'annuel' && (
                  <span style={{ fontSize:'10px', fontWeight:700, padding:'2px 6px', borderRadius:'100px', background: periode==='annuel' ? 'rgba(255,255,255,.25)' : '#ECFDF5', color: periode==='annuel' ? '#fff' : '#059669' }}>
                    2 mois offerts
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ── CARTES DES PLANS ── */}
          <div ref={plansRef}   
               style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:'16px' }}>
            {(['gratuit','pro','business'] as Plan[]).map((plan, i) => {
              const meta      = PLAN_META[plan]
              const estActuel = planActuel === plan
              const estSugge  = planSugge  === plan   // ← plan suggéré
              const prixVal   = plan === 'gratuit' ? 0 : tarif(plan as 'pro'|'business')
              const isLoading = paying === plan

              return (
                <motion.div key={plan}
                  className={`plan-card${estSugge ? ' plan-sugge' : ''}`} 
                  initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
                  transition={{ delay: i * 0.07 }}
                  style={{
                    background  : meta.recommande ? '#F0FDF4' : '#fff',
                    border      : estSugge
                      ? `2px solid ${meta.couleur}`   // ← bordure colorée si suggéré
                      : `${meta.recommande ? 2 : 1}px solid ${meta.border}`,
                    borderRadius:'16px', padding:'20px', position:'relative',
                    boxShadow   : estSugge ? `0 0 0 4px ${meta.couleur}22` : 'none',  // ← halo
                  }}>

                  {/* Badge "Recommandé" ou "Suggéré" */}
                  {(meta.recommande || estSugge) && (
                    <div style={{
                      position:'absolute', top:'-12px', left:'50%', transform:'translateX(-50%)',
                      background: estSugge ? meta.gradient : '#059669',
                      color:'#fff', fontSize:'11px', fontWeight:700,
                      padding:'3px 12px', borderRadius:'100px', whiteSpace:'nowrap',
                    }}>
                      {estSugge ? `✦ Plan recommandé pour vous` : 'Recommandé'}
                    </div>
                  )}

                  {/* En-tête */}
                  <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px' }}>
                    <div style={{ width:'36px', height:'36px', borderRadius:'10px', background:meta.bg, color:meta.couleur, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      {meta.icon}
                    </div>
                    <span style={{ fontSize:'16px', fontWeight:700, color:'#0F172A' }}>{meta.label}</span>
                  </div>

                  {/* Prix */}
                  <div style={{ marginBottom:'16px' }}>
                    <span style={{ fontSize:'28px', fontWeight:800, color:meta.couleur }}>
                      {prixVal.toLocaleString('fr-FR')}
                    </span>
                    <span style={{ fontSize:'13px', color:'#94A3B8', marginLeft:'4px' }}>
                      XAF / {periode === 'mensuel' ? 'mois' : 'an'}
                    </span>
                    {plan !== 'gratuit' && periode === 'annuel' && (
                      <div style={{ fontSize:'11px', color:'#059669', fontWeight:600, marginTop:'2px' }}>
                        Économisez {economie(plan as 'pro'|'business')}%
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <div style={{ display:'flex', flexDirection:'column', gap:'8px', marginBottom:'20px' }}>
                    {FEATURES.map(f => (
                      <div key={f.key} style={{ display:'flex', alignItems:'center', gap:'8px', fontSize:'12px', color:'#475569' }}>
                        <FeatureIcon val={featureVal(plan, f.key)}/>
                        {f.label}
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  {estActuel ? (
                    <div style={{ padding:'10px', borderRadius:'12px', textAlign:'center', fontSize:'13px', fontWeight:700, background:meta.bg, color:meta.couleur, border:`1px solid ${meta.border}` }}>
                      <IconCircleCheck size={14} style={{ display:'inline', marginRight:'6px' }}/>
                      Plan actuel
                    </div>
                  ) : plan === 'gratuit' ? (
                    <div style={{ padding:'10px', borderRadius:'12px', textAlign:'center', fontSize:'13px', color:'#94A3B8', background:'#F8FAFC' }}>
                      Toujours disponible
                    </div>
                  ) : (
                    <button
                      onClick={() => souscrire(plan as 'pro'|'business')}
                      disabled={!!paying}
                      style={{
                        width:'100%', padding:'10px', borderRadius:'12px', border:'none',
                        background: paying ? '#E2E8F0' : meta.gradient,
                        color: paying ? '#94A3B8' : '#fff',
                        fontSize:'13px', fontWeight:700, cursor: paying ? 'not-allowed' : 'pointer',
                        display:'flex', alignItems:'center', justifyContent:'center', gap:'8px',
                      }}>
                      {isLoading
                        ? <><IconLoader2 size={14} style={{ animation:'spin 1s linear infinite' }}/>Redirection PayDunya...</>
                        : planActuel !== 'gratuit' && planActuel !== plan
                          ? `Passer au ${meta.label}`
                          : `Souscrire au ${meta.label}`
                      }
                    </button>
                  )}
                </motion.div>
              )
            })}
          </div>

          {/* ── TABLEAU COMPARATIF ── */}
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:.25 }}
            style={{ background:'#fff', borderRadius:'16px', border:'1px solid #E2E8F0', overflow:'hidden' }}>
            <div style={{ padding:'16px 20px', borderBottom:'1px solid #F1F5F9' }}>
              <div style={{ fontSize:'13px', fontWeight:700, color:'#0F172A' }}>Comparaison détaillée des plans</div>
            </div>
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ background:'#F8FAFC' }}>
                    <th style={{ padding:'10px 20px', textAlign:'left', fontSize:'11px', fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'.05em' }}>Fonctionnalité</th>
                    {(['gratuit','pro','business'] as Plan[]).map(p => (
                      <th key={p} style={{ padding:'10px 16px', textAlign:'center', fontSize:'12px', fontWeight:700, color: PLAN_META[p].couleur }}>
                        {PLAN_META[p].label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {FEATURES.map((f, i) => (
                    <tr key={f.key} style={{ borderTop:'1px solid #F8FAFC', background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                      <td style={{ padding:'9px 20px', fontSize:'13px', color:'#475569' }}>{f.label}</td>
                      {(['gratuit','pro','business'] as Plan[]).map(p => (
                        <td key={p} style={{ padding:'9px 16px', textAlign:'center' }}>
                          <FeatureIcon val={featureVal(p, f.key)}/>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* ── ANNULER ── */}
          {planActuel !== 'gratuit' && abo?.statut === 'actif' && (
            <div style={{ textAlign:'center', paddingBottom:'8px' }}>
              <button onClick={annuler} disabled={cancelling}
                style={{ background:'none', border:'1px solid #FEE2E2', color:'#DC2626', padding:'8px 20px', borderRadius:'10px', fontSize:'12px', fontWeight:600, cursor: cancelling ? 'not-allowed' : 'pointer' }}>
                {cancelling
                  ? <><IconLoader2 size={12} style={{ animation:'spin 1s linear infinite', display:'inline', marginRight:'6px' }}/>Annulation...</>
                  : 'Annuler mon abonnement'
                }
              </button>
              <p style={{ fontSize:'12px', color:'#94A3B8', marginTop:'6px' }}>
                L'accès reste actif jusqu'au {abo.date_fin ? new Date(abo.date_fin).toLocaleDateString('fr-FR') : '—'}
              </p>
            </div>
          )}

        </div>
      </div>
    </>
  )
}