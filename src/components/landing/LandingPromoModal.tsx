'use client'

/**
 * LandingPromoModal — Modal promotionnel de la landing
 *
 * Déclenchement : après 12 s OU 45 % de scroll (le premier atteint).
 * Mémorisation  : localStorage avec expiration — une fois vu, le modal
 *                 ne réapparaît pas pendant EXPIRE_JOURS jours,
 *                 même après fermeture du navigateur.
 * Test rapide   : ajouter ?promo=1 à l'URL force l'affichage immédiat.
 * Fermeture     : X, clic overlay, touche Échap.
 *
 * Responsive :
 *   - Desktop / tablette : carte centrée (max 420px)
 *   - Mobile (≤ 640px)   : bottom-sheet collé en bas, pleine largeur
 */

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { IconX, IconRocket, IconCheck, IconClock } from '@tabler/icons-react'

const STORAGE_KEY    = 'loccam_promo_vu'
const EXPIRE_JOURS   = 7        // ← ne pas re-montrer pendant 7 jours
const DELAY_MS       = 12_000
const SCROLL_TRIGGER = 0.45

const AVANTAGES = [
  "Jusqu'à 15 biens gérés",
  'Paiements Orange & MTN Money',
  'Quittances PDF automatiques',
  'Suivi des impayés en temps réel',
]

/* ── Helpers localStorage avec expiration ── */
function dejaVu(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return false
    const ts = parseInt(raw, 10)
    if (isNaN(ts)) return false
    const ageMs = Date.now() - ts
    if (ageMs > EXPIRE_JOURS * 24 * 60 * 60 * 1000) {
      localStorage.removeItem(STORAGE_KEY)   // expiré → on nettoie
      return false
    }
    return true
  } catch {
    return false   // localStorage indisponible (navigation privée stricte)
  }
}

function marquerVu() {
  try { localStorage.setItem(STORAGE_KEY, Date.now().toString()) } catch {}
}

export default function LandingPromoModal() {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  /* ── Déclenchement ── */
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Test rapide : ?promo=1 force l'affichage (sans marquer comme vu)
    if (new URLSearchParams(window.location.search).get('promo') === '1') {
      setOpen(true)
      return
    }

    if (dejaVu()) return

    let done = false
    const show = () => {
      if (done) return
      done = true
      marquerVu()
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

  /* ── Échap + blocage du scroll de fond ── */
  const close = useCallback(() => setOpen(false), [])
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, close])

  const goRegister = () => { close(); router.push('/register?plan=pro') }
  const goTarifs   = () => {
    close()
    document.getElementById('tarifs')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={close}
            style={{
              position: 'fixed', inset: 0, zIndex: 200,
              background: 'rgba(3,7,15,0.72)',
              backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
            }}
          />

          <div className="lpm-wrap" onClick={close}>
            <motion.div
              className="lpm-card"
              onClick={e => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 30 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}>

              <button onClick={close} aria-label="Fermer" className="lpm-close">
                <IconX size={15} style={{ color: 'rgba(248,250,252,0.7)' }}/>
              </button>

              <div className="lpm-body">
                <div className="lpm-badge">
                  <IconClock size={12} style={{ color: '#34D399', flexShrink: 0 }}/>
                  <span>ESSAI 30 JOURS · SANS ENGAGEMENT</span>
                </div>

                <h3 className="lpm-title">
                  Testez LocCam Pro,{' '}
                  <span className="lpm-gradient">gratuitement</span>
                </h3>
                <p className="lpm-desc">
                  Gérez vos loyers par Mobile Money et suivez vos impayés
                  automatiquement — dès aujourd&apos;hui.
                </p>

                <div className="lpm-list">
                  {AVANTAGES.map(a => (
                    <div key={a} className="lpm-item">
                      <div className="lpm-check">
                        <IconCheck size={11} style={{ color: '#34D399' }}/>
                      </div>
                      <span>{a}</span>
                    </div>
                  ))}
                </div>

                <div className="lpm-price">
                  <span className="lpm-price-val">5 000</span>
                  <span className="lpm-price-sub">XAF / mois après l&apos;essai</span>
                </div>

                <button onClick={goRegister} className="lpm-cta">
                  <IconRocket size={16}/>
                  Démarrer mon essai Pro
                </button>

                <button onClick={goTarifs} className="lpm-cta-ghost">
                  Comparer tous les plans
                </button>
              </div>
            </motion.div>
          </div>

          <style>{`
            /* ═══ MOBILE FIRST — bottom-sheet ═══ */
            .lpm-wrap {
              position: fixed; inset: 0; z-index: 201;
              display: flex; justify-content: center;
              align-items: flex-end;
              padding: 0;
            }
            .lpm-card {
              width: 100%;
              max-width: 100%;
              max-height: calc(100dvh - 48px);
              overflow-y: auto;
              background: linear-gradient(165deg, #0D1B2E 0%, #0A1525 100%);
              border: 1px solid rgba(96,165,250,0.25);
              border-bottom: none;
              border-radius: 22px 22px 0 0;
              box-shadow: 0 -12px 60px rgba(37,99,235,0.2), 0 -8px 40px rgba(0,0,0,0.5);
              position: relative;
              -webkit-overflow-scrolling: touch;
            }
            .lpm-body { padding: 24px 20px calc(20px + env(safe-area-inset-bottom, 0px)); }

            .lpm-close {
              position: absolute; top: 12px; right: 12px; z-index: 2;
              width: 32px; height: 32px; border-radius: 10px;
              background: rgba(255,255,255,0.08); border: none; cursor: pointer;
              display: flex; align-items: center; justify-content: center;
            }

            .lpm-badge {
              display: inline-flex; align-items: center; gap: 6px;
              padding: 5px 12px; border-radius: 100px; margin-bottom: 14px;
              background: rgba(16,185,129,0.12);
              border: 1px solid rgba(52,211,153,0.3);
            }
            .lpm-badge span {
              font-size: 10px; font-weight: 700; color: #34D399; letter-spacing: 0.05em;
            }

            .lpm-title {
              font-family: var(--font-display, sans-serif);
              font-size: 1.3rem; font-weight: 800; line-height: 1.2;
              color: #F8FAFC; margin-bottom: 8px; letter-spacing: -0.3px;
              padding-right: 36px;
            }
            .lpm-gradient {
              background: linear-gradient(135deg, #60A5FA, #34D399);
              -webkit-background-clip: text; -webkit-text-fill-color: transparent;
              background-clip: text;
            }
            .lpm-desc {
              font-size: 12.5px; color: rgba(248,250,252,0.55);
              line-height: 1.55; margin-bottom: 16px;
            }

            .lpm-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 18px; }
            .lpm-item { display: flex; align-items: center; gap: 10px; }
            .lpm-item span { font-size: 13px; color: rgba(248,250,252,0.85); }
            .lpm-check {
              width: 18px; height: 18px; border-radius: 50%; flex-shrink: 0;
              background: rgba(52,211,153,0.15);
              display: flex; align-items: center; justify-content: center;
            }

            .lpm-price { display: flex; align-items: baseline; gap: 6px; margin-bottom: 16px; }
            .lpm-price-val { font-size: 1.55rem; font-weight: 800; color: #34D399; }
            .lpm-price-sub { font-size: 12px; color: rgba(248,250,252,0.5); }

            .lpm-cta {
              display: flex; align-items: center; justify-content: center; gap: 8px;
              width: 100%; padding: 14px; border-radius: 14px; border: none;
              background: linear-gradient(135deg, #2563EB, #1D4ED8);
              box-shadow: 0 6px 20px rgba(37,99,235,0.4);
              font-size: 14px; font-weight: 700; color: #fff; cursor: pointer;
            }
            .lpm-cta-ghost {
              display: block; width: 100%; margin-top: 8px; padding: 10px;
              border-radius: 12px; background: transparent; border: none; cursor: pointer;
              font-size: 12.5px; font-weight: 600; color: rgba(248,250,252,0.5);
            }

            /* ═══ ≥ 640px — carte centrée ═══ */
            @media (min-width: 640px) {
              .lpm-wrap { align-items: center; padding: 24px; }
              .lpm-card {
                max-width: 420px;
                max-height: calc(100dvh - 64px);
                border-radius: 22px;
                border-bottom: 1px solid rgba(96,165,250,0.25);
                box-shadow: 0 0 60px rgba(37,99,235,0.25), 0 24px 80px rgba(0,0,0,0.5);
              }
              .lpm-body { padding: 28px 24px 24px; }
              .lpm-title { font-size: 1.5rem; }
              .lpm-desc { font-size: 13px; margin-bottom: 18px; }
              .lpm-badge span { font-size: 11px; }
              .lpm-price-val { font-size: 1.7rem; }
              .lpm-list { gap: 9px; margin-bottom: 22px; }
            }
          `}</style>
        </>
      )}
    </AnimatePresence>
  )
}