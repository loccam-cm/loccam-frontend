'use client'

import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { IconCheck, IconChevronLeft, IconChevronRight, IconX } from '@tabler/icons-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

// ── Plans alignés sur LIMITES_PLAN du backend ─────────────────
const PLANS = [
  {
    id          : 'gratuit',
    label       : 'Gratuit',
    badge       : null,
    prix_mensuel: 0,
    prix_annuel : 0,
    popular     : false,
    couleur     : '#64748B',
    description : 'Pour débuter avec un seul bien',
    features    : [
      { lbl: '1 bien géré',              ok: true  },
      { lbl: 'Contrat de bail PDF',       ok: true  },
      { lbl: 'Messagerie basique',        ok: true  },
      { lbl: 'Paiement cash uniquement',  ok: true  },
      { lbl: 'Mobile Money',              ok: false },
      { lbl: 'Relevés eau & électricité', ok: false },
      { lbl: 'Quittances PDF auto',       ok: false },
      { lbl: 'Analytique',                ok: false },
      { lbl: 'Signalements',              ok: false },
    ],
    cta        : 'Commencer gratuitement',
    ctaHref    : '/register',
    ctaLoggedIn: '/bailleur',
  },
  {
    id          : 'pro',
    label       : 'Pro',
    badge       : 'Le plus populaire',
    prix_mensuel: 5_000,
    prix_annuel : 50_000,
    popular     : true,
    couleur     : '#2563EB',
    description : "Pour les bailleurs jusqu'à 15 biens",
    features    : [
      { lbl: "Jusqu'à 15 biens",           ok: true  },
      { lbl: 'Contrat de bail PDF',         ok: true  },
      { lbl: 'Messagerie complète',         ok: true  },
      { lbl: 'Mobile Money (Orange / MTN)', ok: true  },
      { lbl: 'Relevés eau & électricité',   ok: true  },
      { lbl: 'Quittances PDF auto',         ok: true  },
      { lbl: 'Analytique & rapports',       ok: true  },
      { lbl: 'Signalements & suivi',        ok: true  },
      { lbl: 'Multi-structures',            ok: false },
      { lbl: 'Export comptable',            ok: false },
    ],
    cta        : 'Essayer 30 jours',
    ctaHref    : '/register?plan=pro',
    ctaLoggedIn: '/bailleur/abonnement?plan=pro',   // ← connecté → direct
  },
  {
    id          : 'business',
    label       : 'Business',
    badge       : null,
    prix_mensuel: 15_000,
    prix_annuel : 150_000,
    popular     : false,
    couleur     : '#7C3AED',
    description : 'Pour les grands propriétaires et agences',
    features    : [
      { lbl: 'Biens illimités',          ok: true },
      { lbl: 'Tout le plan Pro inclus',  ok: true },
      { lbl: 'Multi-structures',         ok: true },
      { lbl: 'Export comptable',         ok: true },
      { lbl: 'Accès API',                ok: true },
      { lbl: 'Support prioritaire 24h',  ok: true },
      { lbl: 'Account manager dédié',    ok: true },
    ],
    cta        : "Contacter l'équipe",
    ctaHref    : '/contact',
    ctaLoggedIn: '/bailleur/abonnement?plan=business', // ← connecté → direct
  },
]

// ── Helpers ───────────────────────────────────────────────────
function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  )
}

// ── Carte plan ────────────────────────────────────────────────
function PlanCard({
  p, annuel, inCarousel = false,
  onCta,
}: {
  p           : typeof PLANS[0]
  annuel      : boolean
  inCarousel? : boolean
  onCta       : (plan: typeof PLANS[0]) => void
}) {
  const prix = annuel ? p.prix_annuel : p.prix_mensuel
  const eco  = annuel && p.prix_mensuel > 0
    ? p.prix_mensuel * 12 - p.prix_annuel
    : 0

  return (
    <div style={{
      background   : p.popular ? 'linear-gradient(160deg,#0D1B2E,#1E3A5F)' : '#fff',
      border       : p.popular ? '1.5px solid rgba(59,130,246,.4)' : p.id === 'business' ? '1.5px solid rgba(124,58,237,.25)' : '1px solid #E2E8F0',
      borderRadius : '20px',
      padding      : '28px 24px',
      display      : 'flex',
      flexDirection: 'column' as const,
      position     : 'relative' as const,
      transform    : !inCarousel && p.popular ? 'translateY(-10px)' : 'none',
      boxShadow    : p.popular ? '0 0 50px rgba(37,99,235,.18),0 16px 48px rgba(0,0,0,.2)' : p.id === 'business' ? '0 4px 20px rgba(124,58,237,.08)' : 'none',
      transition   : 'all .25s ease',
      height       : '100%',
    }}>

      {/* Badge */}
      {p.badge && (
        <div style={{
          position: 'absolute', top: '-13px', left: '50%', transform: 'translateX(-50%)',
          padding: '4px 16px', borderRadius: '100px',
          background: 'linear-gradient(135deg,#2563EB,#7C3AED)',
          fontSize: '11px', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap',
        }}>
          {p.badge}
        </div>
      )}

      {/* Label + description */}
      <div style={{ marginBottom: '6px' }}>
        <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: p.popular ? '#93C5FD' : p.id === 'business' ? '#A78BFA' : '#64748B' }}>
          {p.label}
        </span>
      </div>
      <p style={{ fontSize: '13px', color: p.popular ? 'rgba(248,250,252,.55)' : '#94A3B8', marginBottom: '20px', lineHeight: 1.4 }}>
        {p.description}
      </p>

      {/* Prix */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: eco ? '6px' : '24px' }}>
        {p.prix_mensuel > 0 && (
          <span style={{ fontSize: '12px', opacity: .45, color: p.popular ? '#fff' : '#0F172A' }}>XAF</span>
        )}
        <span style={{ fontWeight: 800, fontSize: '2.2rem', lineHeight: 1, color: p.popular ? '#60A5FA' : p.id === 'business' ? '#7C3AED' : '#0F172A' }}>
          {prix === 0 ? 'Gratuit' : prix.toLocaleString('fr-FR')}
        </span>
        {p.prix_mensuel > 0 && (
          <span style={{ fontSize: '13px', opacity: .4, color: p.popular ? '#fff' : '#0F172A' }}>
            /{annuel ? 'an' : 'mois'}
          </span>
        )}
      </div>

      {/* Économie annuelle */}
      {eco > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <span style={{
            fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '100px',
            background: p.popular ? 'rgba(16,185,129,.2)' : '#ECFDF5',
            color: p.popular ? '#34D399' : '#059669',
          }}>
            Économie de {eco.toLocaleString('fr-FR')} XAF/an
          </span>
        </div>
      )}

      {/* Fonctionnalités */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px', flex: 1 }}>
        {p.features.map(f => (
          <div key={f.lbl} style={{ display: 'flex', alignItems: 'center', gap: '10px', opacity: f.ok ? 1 : .35 }}>
            <div style={{
              width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: f.ok
                ? p.popular ? 'rgba(37,99,235,.18)' : p.id === 'business' ? 'rgba(124,58,237,.12)' : 'rgba(16,185,129,.1)'
                : 'rgba(148,163,184,.1)',
            }}>
              {f.ok
                ? <IconCheck size={10} style={{ color: p.popular ? '#60A5FA' : p.id === 'business' ? '#A78BFA' : '#34D399' }}/>
                : <IconX    size={9}  style={{ color: '#94A3B8' }}/>}
            </div>
            <span style={{ fontSize: '13px', color: p.popular ? 'rgba(248,250,252,.8)' : '#475569' }}>
              {f.lbl}
            </span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <button
        onClick={() => onCta(p)}
        style={{
          display   : 'block', width: '100%', textAlign: 'center',
          padding   : '13px', borderRadius: '12px',
          fontSize  : '14px', fontWeight: 700,
          cursor    : 'pointer', transition: 'all .2s',
          background: p.popular
            ? 'linear-gradient(135deg,#2563EB,#1D4ED8)'
            : p.id === 'business'
              ? 'linear-gradient(135deg,#7C3AED,#6D28D9)'
              : 'transparent',
          color : p.popular || p.id === 'business' ? '#fff' : '#64748B',
          border: p.popular || p.id === 'business' ? 'none' : '1.5px solid #E2E8F0',
          boxShadow: p.popular ? '0 4px 16px rgba(37,99,235,.4)' : p.id === 'business' ? '0 4px 16px rgba(124,58,237,.3)' : 'none',
        }}>
        {p.cta}
      </button>
    </div>
  )
}

// ── Carrousel mobile ──────────────────────────────────────────
function PricingCarousel({
  annuel, onCta,
}: {
  annuel : boolean
  onCta  : (plan: typeof PLANS[0]) => void
}) {
  const [active, setActive] = useState(1)
  const startX = useRef(0)

  const handleTouchStart = (e: React.TouchEvent) => { startX.current = e.touches[0].clientX }
  const handleTouchEnd   = (e: React.TouchEvent) => {
    const diff = startX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) {
      if (diff > 0 && active < PLANS.length - 1) setActive(a => a + 1)
      if (diff < 0 && active > 0)                setActive(a => a - 1)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
        <button onClick={() => setActive(a => Math.max(0, a - 1))}
                disabled={active === 0}
                style={{ width:'36px', height:'36px', borderRadius:'10px', background:'#fff', border:'1.5px solid #E2E8F0', display:'flex', alignItems:'center', justifyContent:'center', cursor: active === 0 ? 'not-allowed' : 'pointer', color:'#64748B', opacity: active === 0 ? .35 : 1 }}>
          <IconChevronLeft size={16}/>
        </button>
        <div style={{ display: 'flex', gap: '7px' }}>
          {PLANS.map((_, i) => (
            <button key={i} onClick={() => setActive(i)}
                    style={{ width: i === active ? '22px' : '8px', height:'8px', borderRadius: i === active ? '4px' : '50%', background: i === active ? '#2563EB' : '#E2E8F0', border:'none', cursor:'pointer', padding:0, transition:'all .2s' }}/>
          ))}
        </div>
        <button onClick={() => setActive(a => Math.min(PLANS.length - 1, a + 1))}
                disabled={active === PLANS.length - 1}
                style={{ width:'36px', height:'36px', borderRadius:'10px', background:'#fff', border:'1.5px solid #E2E8F0', display:'flex', alignItems:'center', justifyContent:'center', cursor: active === PLANS.length - 1 ? 'not-allowed' : 'pointer', color:'#64748B', opacity: active === PLANS.length - 1 ? .35 : 1 }}>
          <IconChevronRight size={16}/>
        </button>
      </div>

      <div style={{ overflow: 'hidden', borderRadius: '20px' }}
           onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        <motion.div style={{ display: 'flex' }}
          animate={{ x: `${-active * 100}%` }}
          transition={{ duration: .35, ease: [0.22, 1, 0.36, 1] }}>
          {PLANS.map(p => (
            <div key={p.label} style={{ width: '100%', flexShrink: 0, padding: '20px 4px 4px' }}>
              <PlanCard p={p} annuel={annuel} inCarousel onCta={onCta}/>
            </div>
          ))}
        </motion.div>
      </div>

      <p style={{ textAlign: 'center', fontSize: '12px', color: '#94A3B8', fontWeight: 500 }}>
        {active + 1} / {PLANS.length} — {PLANS[active].label}
      </p>
    </div>
  )
}

// ── Section principale ────────────────────────────────────────
export default function LandingPricing() {
  const [annuel, setAnnuel] = useState(false)
  const router = useRouter()

  // ── Lecture de l'état de connexion ────────────────────────
  let isLoggedIn = false
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { user } = useAuth()
    isLoggedIn = !!user
  } catch {
    // useAuth non disponible hors du provider → landing publique
    isLoggedIn = false
  }

  // ── Handler CTA intelligent ───────────────────────────────
  const handleCta = (plan: typeof PLANS[0]) => {
    if (isLoggedIn) {
      // Bailleur connecté → page abonnement du dashboard
      router.push(plan.ctaLoggedIn)
    } else {
      // Visiteur → inscription (avec plan pré-sélectionné)
      router.push(plan.ctaHref)
    }
  }

  return (
    <section id="tarifs" style={{ background: '#F8FAFC', padding: '96px 24px', borderTop: '1px solid #E2E8F0' }}>
      <div style={{ maxWidth: '1040px', margin: '0 auto' }}>

        {/* Header */}
        <Reveal>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{ width:'40px', height:'3px', borderRadius:'2px', background:'linear-gradient(90deg,#2563EB,#10B981)', margin:'0 auto 14px' }}/>
            <p style={{ fontSize:'11px', fontWeight:700, letterSpacing:'0.14em', color:'#2563EB', textTransform:'uppercase', marginBottom:'12px' }}>
              TARIFS
            </p>
            <h2 style={{ fontFamily:"var(--font-display,sans-serif)", fontSize:'clamp(1.9rem,3.5vw,2.8rem)', fontWeight:800, lineHeight:1.1, letterSpacing:'-0.3px', color:'#0F172A', marginBottom:'12px' }}>
              Un prix simple qui s&apos;adapte<br/>
              <span style={{ background:'linear-gradient(135deg,#2563EB,#10B981)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
                à vos besoins
              </span>
            </h2>
            <p style={{ fontSize:'14px', color:'#94A3B8', marginBottom:'28px' }}>
              Sans engagement · Essai 30 jours · Résiliable à tout moment
            </p>

            {/* Toggle mensuel / annuel */}
            <div style={{ display:'inline-flex', alignItems:'center', gap:'12px', background:'#fff', border:'1px solid #E2E8F0', borderRadius:'100px', padding:'6px 8px' }}>
              <button onClick={() => setAnnuel(false)}
                      style={{ padding:'7px 18px', borderRadius:'100px', fontSize:'13px', fontWeight:600, border:'none', cursor:'pointer', transition:'all .2s', background: !annuel ? '#0F172A' : 'transparent', color: !annuel ? '#fff' : '#64748B' }}>
                Mensuel
              </button>
              <button onClick={() => setAnnuel(true)}
                      style={{ padding:'7px 18px', borderRadius:'100px', fontSize:'13px', fontWeight:600, border:'none', cursor:'pointer', transition:'all .2s', background: annuel ? '#0F172A' : 'transparent', color: annuel ? '#fff' : '#64748B', display:'flex', alignItems:'center', gap:'8px' }}>
                Annuel
                <span style={{ fontSize:'10px', fontWeight:700, padding:'2px 8px', borderRadius:'100px', background:'#ECFDF5', color:'#059669' }}>
                  2 mois offerts
                </span>
              </button>
            </div>
          </div>
        </Reveal>

        {/* Desktop — 3 colonnes */}
        <div className="pricing-desktop" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'16px', alignItems:'start' }}>
          {PLANS.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.1}>
              <PlanCard p={p} annuel={annuel} onCta={handleCta}/>
            </Reveal>
          ))}
        </div>

        {/* Mobile — carrousel */}
        <div className="pricing-mobile" style={{ display:'none' }}>
          <PricingCarousel annuel={annuel} onCta={handleCta}/>
        </div>

        {/* Comparaison rapide */}
        <Reveal delay={0.3}>
          <div style={{ marginTop:'48px', background:'#fff', border:'1px solid #E2E8F0', borderRadius:'16px', padding:'24px', overflowX:'auto' }}>
            <p style={{ fontSize:'12px', fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:'16px' }}>
              Comparaison rapide
            </p>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'13px' }}>
              <thead>
                <tr>
                  <th style={{ textAlign:'left', padding:'8px 12px', color:'#64748B', fontWeight:600, width:'40%' }}>Fonctionnalité</th>
                  {PLANS.map(p => (
                    <th key={p.id} style={{ textAlign:'center', padding:'8px 12px', color: p.popular ? '#2563EB' : '#0F172A', fontWeight:700 }}>
                      {p.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { lbl: 'Nombre de biens',  vals: ['1', '15', '∞']           },
                  { lbl: 'Mobile Money',      vals: [false, true,  true]        },
                  { lbl: 'Relevés eau/élec',  vals: [false, true,  true]        },
                  { lbl: 'Quittances PDF',    vals: [false, true,  true]        },
                  { lbl: 'Analytique',         vals: [false, true,  true]        },
                  { lbl: 'Signalements',      vals: [false, true,  true]        },
                  { lbl: 'Multi-structures',  vals: [false, false, true]        },
                  { lbl: 'Export comptable',  vals: [false, false, true]        },
                ].map((row, ri) => (
                  <tr key={row.lbl} style={{ background: ri % 2 === 0 ? '#F8FAFC' : '#fff' }}>
                    <td style={{ padding:'10px 12px', color:'#475569', borderRadius:'8px 0 0 8px' }}>{row.lbl}</td>
                    {row.vals.map((v, vi) => (
                      <td key={vi} style={{ textAlign:'center', padding:'10px 12px' }}>
                        {typeof v === 'boolean'
                          ? v
                            ? <IconCheck size={15} style={{ color: vi === 1 ? '#2563EB' : '#059669', margin:'0 auto' }}/>
                            : <IconX    size={14} style={{ color: '#CBD5E1', margin:'0 auto' }}/>
                          : <span style={{ fontWeight:700, color: vi === 1 ? '#2563EB' : '#0F172A' }}>{v}</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>

        <Reveal delay={0.35}>
          <p style={{ textAlign:'center', fontSize:'12px', color:'#94A3B8', marginTop:'24px' }}>
            * Essai 30 jours sans carte bancaire sur le plan Pro. Sans engagement. Résiliable à tout moment.
          </p>
        </Reveal>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .pricing-desktop { display: none !important; }
          .pricing-mobile  { display: block !important; }
        }
      `}</style>
    </section>
  )
}