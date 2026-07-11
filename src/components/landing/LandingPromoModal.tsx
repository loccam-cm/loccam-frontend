'use client'

/**
 * LandingPromoModal — Modal promotionnel de la landing
 *
 * Déclenchement intelligent :
 *   - après 12 s sur la page, OU après 45 % de scroll (le premier atteint)
 *   - une seule fois par session (sessionStorage)
 * Fermeture : bouton X, clic overlay, touche Échap
 *
 * Intégration : <LandingPromoModal /> en fin de landing/page.tsx
 */

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { IconX, IconRocket, IconCheck, IconClock } from '@tabler/icons-react'

const STORAGE_KEY    = 'loccam_promo_vu'
const DELAY_MS       = 12_000   // 12 secondes
const SCROLL_TRIGGER = 0.45     // 45 % de la page

const AVANTAGES = [
  "Jusqu'à 15 biens gérés",
  'Paiements Orange & MTN Money',
  'Quittances PDF automatiques',
  'Suivi des impayés en temps réel',
]

export default function LandingPromoModal() {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  // ── Déclenchement : délai OU scroll, une fois par session ──
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (sessionStorage.getItem(STORAGE_KEY)) return

    let done = false
    const show = () => {
      if (done) return
      done = true
      sessionStorage.setItem(STORAGE_KEY, '1')
      setOpen(true)
      cleanup()
    }

    const timer = setTimeout(show, DELAY_MS)
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight
      if (h > 0 && window.scrollY / h >= SCROLL_TRIGGER) show()
    }
    const cleanup = () => {
      clearTimeout(timer)
      window.removeEventListener('scroll', onScroll)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return cleanup
  }, [])

  // ── Fermeture par Échap ─────────────────────────────────────
  const close = useCallback(() => setOpen(false), [])
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, close])

  const goRegister = () => {
    close()
    router.push('/register?plan=pro')
  }
  const goTarifs = () => {
    close()
    document.getElementById('tarifs')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={close}
            style={{
              position: 'fixed', inset: 0, zIndex: 200,
              background: 'rgba(3,7,15,0.72)', backdropFilter: 'blur(8px)',
            }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'fixed', zIndex: 201,
              top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              width: 'calc(100% - 32px)', maxWidth: '420px',
              pointerEvents: 'auto',
            }}>
            <div style={{
              background: 'linear-gradient(165deg,#0D1B2E 0%,#0A1525 100%)',
              border: '1px solid rgba(96,165,250,0.25)',
              borderRadius: '22px',
              boxShadow: '0 0 60px rgba(37,99,235,0.25), 0 24px 80px rgba(0,0,0,0.5)',
              overflow: 'hidden',
            }}>

              {/* Bouton fermer */}
              <button onClick={close} aria-label="Fermer"
                style={{
                  position: 'absolute', top: '14px', right: '14px', zIndex: 2,
                  width: '32px', height: '32px', borderRadius: '10px',
                  background: 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                <IconX size={15} style={{ color: 'rgba(248,250,252,0.7)' }}/>
              </button>

              <div style={{ padding: '28px 24px 24px' }}>

                {/* Badge essai */}
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '5px 12px', borderRadius: '100px', marginBottom: '16px',
                  background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(52,211,153,0.3)',
                }}>
                  <IconClock size={12} style={{ color: '#34D399' }}/>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#34D399', letterSpacing: '0.05em' }}>
                    ESSAI 30 JOURS · SANS ENGAGEMENT
                  </span>
                </div>

                {/* Titre */}
                <h3 style={{
                  fontFamily: 'var(--font-display, sans-serif)',
                  fontSize: '1.5rem', fontWeight: 800, lineHeight: 1.2,
                  color: '#F8FAFC', marginBottom: '8px', letterSpacing: '-0.3px',
                }}>
                  Testez LocCam Pro,{' '}
                  <span style={{
                    background: 'linear-gradient(135deg,#60A5FA,#34D399)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}>
                    gratuitement
                  </span>
                </h3>
                <p style={{ fontSize: '13px', color: 'rgba(248,250,252,0.55)', lineHeight: 1.6, marginBottom: '18px' }}>
                  Gérez vos loyers par Mobile Money et suivez vos impayés
                  automatiquement — dès aujourd&apos;hui.
                </p>

                {/* Avantages */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', marginBottom: '22px' }}>
                  {AVANTAGES.map(a => (
                    <div key={a} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0,
                        background: 'rgba(52,211,153,0.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <IconCheck size={11} style={{ color: '#34D399' }}/>
                      </div>
                      <span style={{ fontSize: '13px', color: 'rgba(248,250,252,0.85)' }}>{a}</span>
                    </div>
                  ))}
                </div>

                {/* Prix */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '18px' }}>
                  <span style={{ fontSize: '1.7rem', fontWeight: 800, color: '#34D399' }}>5 000</span>
                  <span style={{ fontSize: '13px', color: 'rgba(248,250,252,0.5)' }}>XAF / mois après l&apos;essai</span>
                </div>

                {/* CTA principal */}
                <button onClick={goRegister}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    width: '100%', padding: '14px', borderRadius: '14px', border: 'none',
                    background: 'linear-gradient(135deg,#2563EB,#1D4ED8)',
                    boxShadow: '0 6px 20px rgba(37,99,235,0.4)',
                    fontSize: '14px', fontWeight: 700, color: '#fff', cursor: 'pointer',
                  }}>
                  <IconRocket size={16}/>
                  Démarrer mon essai Pro
                </button>

                {/* CTA secondaire */}
                <button onClick={goTarifs}
                  style={{
                    display: 'block', width: '100%', marginTop: '10px',
                    padding: '10px', borderRadius: '12px',
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    fontSize: '12.5px', fontWeight: 600, color: 'rgba(248,250,252,0.5)',
                  }}>
                  Comparer tous les plans
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}