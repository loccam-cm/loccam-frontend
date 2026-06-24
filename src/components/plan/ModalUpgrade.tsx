/**
 * ModalUpgrade — Affiché quand un bailleur tente d'accéder
 * à une fonctionnalité non disponible dans son plan.
 */
'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { IconX, IconLock, IconCheck, IconArrowRight, IconSparkles } from '@tabler/icons-react'
import type { PlanId, Fonctionnalite } from '@/hooks/usePlan'

// ── Textes par fonctionnalité ─────────────────────────────────
const DESCRIPTIONS: Record<Fonctionnalite, { titre: string; sub: string; ico: string }> = {
  mobile_money : { titre: 'Paiements Mobile Money',       sub: 'Acceptez Orange Money et MTN Money directement sur LocCam.',     ico: '📱' },
  releves      : { titre: 'Relevés eau & électricité',    sub: 'Saisissez les index mensuels et générez des factures automatiques.', ico: '💧' },
  quittances   : { titre: 'Quittances PDF automatiques',  sub: 'Chaque paiement confirmé génère une quittance PDF téléchargeable.', ico: '📄' },
  analytique   : { titre: 'Analytique & rapports',        sub: 'Suivez vos revenus, taux d'occupation et impayés en temps réel.',   ico: '📊' },
  signalements : { titre: 'Signalements techniques',      sub: 'Vos locataires signalent les problèmes, vous les gérez en ligne.',  ico: '🔧' },
  structures   : { titre: 'Multi-structures',             sub: 'Gérez plusieurs immeubles, résidences et cités depuis un seul compte.', ico: '🏢' },
  export       : { titre: 'Export comptable',             sub: 'Exportez vos données en CSV/Excel pour votre comptabilité.',        ico: '📥' },
}

const PLAN_LABELS: Record<PlanId, string> = {
  gratuit : 'Gratuit',
  pro     : 'Pro — 5 000 XAF/mois',
  business: 'Business — 15 000 XAF/mois',
}

const PLAN_FEATURES: Record<PlanId, string[]> = {
  gratuit : [],
  pro     : ['Jusqu\'à 15 biens', 'Mobile Money', 'Relevés eau & élec', 'Quittances PDF', 'Analytique', 'Signalements'],
  business: ['Biens illimités', 'Multi-structures', 'Export comptable', 'Support prioritaire', 'API accès', 'Account manager'],
}

// ── Composant ─────────────────────────────────────────────────
interface ModalUpgradeProps {
  open           : boolean
  onClose        : () => void
  fonctionnalite : Fonctionnalite
  planRequis     : PlanId
  planActuel     : PlanId
}

export default function ModalUpgrade({
  open, onClose, fonctionnalite, planRequis, planActuel,
}: ModalUpgradeProps) {
  const desc     = DESCRIPTIONS[fonctionnalite]
  const features = PLAN_FEATURES[planRequis]

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(0,0,0,.45)', backdropFilter: 'blur(6px)' }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: .94, y: 20 }}
            animate={{ opacity: 1, scale: 1,   y: 0  }}
            exit   {{ opacity: 0, scale: .94, y: 20  }}
            transition={{ duration: .25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ pointerEvents: 'none' }}>
            <div style={{
              background: '#fff', borderRadius: '24px', width: '100%', maxWidth: '440px',
              boxShadow: '0 24px 80px rgba(0,0,0,.2)', pointerEvents: 'all', overflow: 'hidden',
            }}>

              {/* Header coloré */}
              <div style={{ background: 'linear-gradient(135deg,#0D1B2E,#1E3A5F)', padding: '28px 24px 24px', position: 'relative' }}>
                <button onClick={onClose}
                        style={{ position:'absolute', top:'16px', right:'16px', width:'32px', height:'32px', borderRadius:'10px', background:'rgba(255,255,255,.1)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <IconX size={15} color="white"/>
                </button>

                <div style={{ width:'52px', height:'52px', borderRadius:'16px', background:'rgba(37,99,235,.2)', border:'1px solid rgba(96,165,250,.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px', marginBottom:'16px' }}>
                  {desc.ico}
                </div>

                <div style={{ display:'inline-flex', alignItems:'center', gap:'6px', background:'rgba(124,58,237,.25)', border:'1px solid rgba(167,139,250,.3)', borderRadius:'100px', padding:'4px 12px', marginBottom:'12px' }}>
                  <IconLock size={11} style={{ color:'#A78BFA' }}/>
                  <span style={{ fontSize:'11px', fontWeight:700, color:'#A78BFA', textTransform:'uppercase', letterSpacing:'.06em' }}>
                    Plan {PLAN_LABELS[planRequis].split(' — ')[0]} requis
                  </span>
                </div>

                <h3 style={{ fontSize:'18px', fontWeight:800, color:'#fff', marginBottom:'6px', lineHeight:1.2 }}>
                  {desc.titre}
                </h3>
                <p style={{ fontSize:'13px', color:'rgba(255,255,255,.55)', lineHeight:1.5 }}>
                  {desc.sub}
                </p>
              </div>

              {/* Corps */}
              <div style={{ padding:'24px' }}>

                {/* Plan actuel */}
                <div style={{ display:'flex', alignItems:'center', justify:'space-between', marginBottom:'20px', padding:'12px 16px', borderRadius:'12px', background:'#F8FAFC', border:'1px solid #E2E8F0' }}>
                  <div>
                    <div style={{ fontSize:'11px', color:'#94A3B8', fontWeight:600, marginBottom:'2px' }}>VOTRE PLAN ACTUEL</div>
                    <div style={{ fontSize:'14px', fontWeight:700, color:'#0F172A' }}>{PLAN_LABELS[planActuel]}</div>
                  </div>
                  <IconArrowRight size={16} style={{ color:'#CBD5E1' }}/>
                  <div>
                    <div style={{ fontSize:'11px', color:'#2563EB', fontWeight:600, marginBottom:'2px' }}>PLAN REQUIS</div>
                    <div style={{ fontSize:'14px', fontWeight:700, color:'#2563EB' }}>
                      {PLAN_LABELS[planRequis].split(' — ')[0]}
                    </div>
                  </div>
                </div>

                {/* Fonctionnalités débloquées */}
                <p style={{ fontSize:'12px', fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:'12px' }}>
                  Ce que vous débloquez
                </p>
                <div style={{ display:'flex', flexDirection:'column', gap:'8px', marginBottom:'24px' }}>
                  {features.map(f => (
                    <div key={f} style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                      <div style={{ width:'18px', height:'18px', borderRadius:'50%', background:'rgba(37,99,235,.1)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        <IconCheck size={10} style={{ color:'#2563EB' }}/>
                      </div>
                      <span style={{ fontSize:'13px', color:'#475569' }}>{f}</span>
                    </div>
                  ))}
                </div>

                {/* CTAs */}
                <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                  <Link href="/bailleur/abonnement"
                        style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', padding:'14px', borderRadius:'14px', background:'linear-gradient(135deg,#2563EB,#1D4ED8)', color:'#fff', textDecoration:'none', fontSize:'14px', fontWeight:700, boxShadow:'0 4px 14px rgba(37,99,235,.35)' }}>
                    <IconSparkles size={15}/>
                    Passer au plan {PLAN_LABELS[planRequis].split(' — ')[0]}
                  </Link>
                  <button onClick={onClose}
                          style={{ padding:'12px', borderRadius:'14px', background:'#F1F5F9', border:'none', cursor:'pointer', fontSize:'14px', fontWeight:600, color:'#64748B' }}>
                    Pas maintenant
                  </button>
                </div>

                <p style={{ textAlign:'center', fontSize:'11px', color:'#CBD5E1', marginTop:'12px' }}>
                  Essai 30 jours · Sans engagement · Résiliable à tout moment
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
