'use client'

import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { IconCheck, IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import Link from 'next/link'

const PLANS = [
  {
    label: 'Garage / Studio', price: '2 500', popular: false,
    features: ['1 bien géré', 'Contrat de bail PDF', 'Quittances mensuelles', 'Support email'],
  },
  {
    label: 'Appartement', price: '7 500', popular: true,
    features: ["Jusqu'à 5 biens", 'Mobile Money inclus', 'Rappels automatiques', 'Messagerie & signalements', 'Support prioritaire 24h'],
  },
  {
    label: 'Immeuble / Résidence', price: '15 000', popular: false,
    features: ['Biens illimités', 'Tout Appartement inclus', 'État des lieux', 'Logs système avancés', 'Account manager dédié'],
  },
]

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  )
}

function PlanCard({ p, inCarousel = false }: { p: typeof PLANS[0]; inCarousel?: boolean }) {
  return (
    <div className={`pricing-card ${p.popular ? 'pricing-popular' : ''} ${inCarousel ? 'pricing-card-carousel' : ''}`}>
      {p.popular && <div className="pricing-badge">Plus populaire</div>}
      <div className="pricing-plan-label">{p.label}</div>
      <div className="pricing-price-row">
        <span className="pricing-currency">XAF</span>
        <span className="pricing-amount">{p.price}</span>
        <span className="pricing-period">/mois</span>
      </div>
      <div className="pricing-features">
        {p.features.map(f => (
          <div key={f} className="pricing-feature">
            <div className="pricing-check" style={{ background: p.popular ? 'rgba(37,99,235,0.15)' : 'rgba(16,185,129,0.1)' }}>
              <IconCheck size={10} style={{ color: p.popular ? '#60A5FA' : '#34D399' }} />
            </div>
            <span className="pricing-feature-text" style={{ color: p.popular ? 'rgba(248,250,252,0.8)' : '#475569' }}>
              {f}
            </span>
          </div>
        ))}
      </div>
      <Link href="/register" className={`pricing-cta ${p.popular ? 'pricing-cta-primary' : 'pricing-cta-ghost'}`}>
        Essayer gratuitement
      </Link>
    </div>
  )
}

// ── Carrousel mobile ──────────────────────────────────────
function PricingCarousel() {
  const [active, setActive] = useState(1) // démarre sur "populaire"
  const startX = useRef(0)

  const handleTouchStart = (e: React.TouchEvent) => { startX.current = e.touches[0].clientX }
  const handleTouchEnd   = (e: React.TouchEvent) => {
    const diff = startX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) {
      if (diff > 0 && active < PLANS.length - 1) setActive(a => a + 1)
      if (diff < 0 && active > 0) setActive(a => a - 1)
    }
  }

  return (
    <div className="pricing-carousel-wrap">
      {/* Flèches + dots */}
      <div className="pricing-carousel-nav">
        <button onClick={() => setActive(a => Math.max(0, a - 1))}
          className="pricing-carousel-arrow" disabled={active === 0}>
          <IconChevronLeft size={16} />
        </button>
        <div className="pricing-carousel-dots">
          {PLANS.map((_, i) => (
            <button key={i} onClick={() => setActive(i)}
              className={`pricing-dot ${active === i ? 'pricing-dot-active' : ''}`} />
          ))}
        </div>
        <button onClick={() => setActive(a => Math.min(PLANS.length - 1, a + 1))}
          className="pricing-carousel-arrow" disabled={active === PLANS.length - 1}>
          <IconChevronRight size={16} />
        </button>
      </div>

      {/* Slider */}
      <div className="pricing-carousel-track"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}>
        <motion.div
          className="pricing-carousel-slider"
          animate={{ x: `${-active * 100}%` }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
          {PLANS.map(p => (
            <div key={p.label} className="pricing-carousel-slide">
              <PlanCard p={p} inCarousel />
            </div>
          ))}
        </motion.div>
      </div>

      {/* Label plan actif */}
      <div className="pricing-carousel-label">
        {active + 1} / {PLANS.length} — {PLANS[active].label}
      </div>
    </div>
  )
}

export default function LandingPricing() {
  return (
    <section className="pricing-section" id="tarifs">
      <div className="pricing-inner">

        {/* Header */}
        <Reveal>
          <div className="pricing-header">
            <div className="section-bar-center" />
            <p className="pricing-label">TARIFS</p>
            <h2 className="pricing-title">
              Un prix simple qui s&apos;adapte<br />
              <span className="pricing-gradient">à vos besoins</span>
            </h2>
            <p className="pricing-sub">Sans engagement · Essai 30 jours · Résiliable à tout moment</p>
          </div>
        </Reveal>

        {/* Desktop : 3 colonnes */}
        <div className="pricing-grid-desktop">
          {PLANS.map((p, i) => (
            <Reveal key={p.label} delay={i * 0.1}>
              <PlanCard p={p} />
            </Reveal>
          ))}
        </div>

        {/* Mobile : carrousel */}
        <div className="pricing-grid-mobile">
          <PricingCarousel />
        </div>

        <Reveal delay={0.3}>
          <p className="pricing-note">
            * Essai 30 jours sans carte bancaire. Sans engagement. Résiliable à tout moment.
          </p>
        </Reveal>
        <Reveal delay={0.35}>
          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <a href="#" className="pricing-all-link">Découvrir toutes les offres →</a>
          </div>
        </Reveal>
      </div>

      <style>{`
        .pricing-section {
          background: #F8FAFC; padding: 96px 24px;
          border-top: 1px solid #E2E8F0;
        }
        .pricing-inner { max-width: 960px; margin: 0 auto; }
        .pricing-header { text-align: center; margin-bottom: 56px; }
        .section-bar-center {
          width: 40px; height: 3px; border-radius: 2px;
          background: linear-gradient(90deg,#2563EB,#10B981);
          margin: 0 auto 14px;
        }
        .pricing-label {
          font-size: 11px; font-weight: 700; letter-spacing: 0.14em;
          color: #2563EB; text-transform: uppercase; margin-bottom: 12px;
        }
        .pricing-title {
          font-family: var(--font-display, sans-serif);
          font-size: clamp(1.9rem, 3.5vw, 2.8rem);
          font-weight: 800; line-height: 1.1; letter-spacing: -0.3px;
          color: #0F172A; margin-bottom: 12px;
        }
        .pricing-gradient {
          background: linear-gradient(135deg,#2563EB,#10B981);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .pricing-sub { font-size: 14px; color: #94A3B8; }

        /* ── Desktop grid ── */
        .pricing-grid-desktop {
          display: grid; grid-template-columns: repeat(3,1fr);
          gap: 16px; align-items: start;
        }
        .pricing-grid-mobile { display: none; }

        /* ── Cards ── */
        .pricing-card {
          background: white; border: 1px solid #E2E8F0;
          border-radius: 20px; padding: 28px 24px;
          display: flex; flex-direction: column; gap: 0;
          position: relative; transition: all 0.25s ease;
        }
        .pricing-card-carousel { transform: none !important; }
        .pricing-card:hover:not(.pricing-popular):not(.pricing-card-carousel) {
          border-color: #CBD5E1;
          box-shadow: 0 8px 28px rgba(0,0,0,0.07);
          transform: translateY(-2px);
        }
        .pricing-popular {
          background: linear-gradient(160deg,#0D1B2E,#1E3A5F);
          border: 1.5px solid rgba(59,130,246,0.4);
          box-shadow: 0 0 50px rgba(37,99,235,0.18), 0 16px 48px rgba(0,0,0,0.2);
          transform: translateY(-8px);
        }
        .pricing-popular.pricing-card-carousel { transform: none; }
        .pricing-badge {
          position: absolute; top: -12px; left: 50%; transform: translateX(-50%);
          padding: 4px 16px; border-radius: 100px;
          background: linear-gradient(135deg,#2563EB,#7C3AED);
          font-size: 11px; font-weight: 700; color: white; white-space: nowrap;
        }
        .pricing-plan-label { font-size: 13px; font-weight: 700; margin-bottom: 10px; }
        .pricing-card:not(.pricing-popular) .pricing-plan-label { color: #64748B; }
        .pricing-popular .pricing-plan-label { color: #93C5FD; }

        .pricing-price-row { display: flex; align-items: baseline; gap: 4px; margin-bottom: 20px; }
        .pricing-currency { font-size: 12px; opacity: 0.45; }
        .pricing-amount { font-weight: 800; font-size: 2.2rem; line-height: 1; }
        .pricing-card:not(.pricing-popular) .pricing-amount { color: #0F172A; }
        .pricing-popular .pricing-amount { color: #60A5FA; }
        .pricing-period { font-size: 13px; opacity: 0.35; }

        .pricing-features { display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px; flex: 1; }
        .pricing-feature { display: flex; align-items: center; gap: 10px; }
        .pricing-check { width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .pricing-feature-text { font-size: 13px; }
        .pricing-card:not(.pricing-popular) .pricing-feature-text { color: #475569; }

        .pricing-cta {
          display: block; text-align: center; padding: 13px;
          border-radius: 12px; font-size: 14px; font-weight: 700;
          text-decoration: none; transition: all 0.2s;
        }
        .pricing-cta-primary {
          background: linear-gradient(135deg,#2563EB,#1D4ED8); color: white;
          box-shadow: 0 4px 16px rgba(37,99,235,0.4);
        }
        .pricing-cta-primary:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(37,99,235,0.55); }
        .pricing-cta-ghost { background: transparent; color: #64748B; border: 1.5px solid #E2E8F0; }
        .pricing-cta-ghost:hover { background: #F1F5F9; border-color: #CBD5E1; color: #0F172A; }

        .pricing-note { text-align: center; font-size: 12px; color: #94A3B8; margin-top: 20px; }
        .pricing-all-link { font-size: 14px; font-weight: 600; color: #2563EB; text-decoration: none; }
        .pricing-all-link:hover { color: #1D4ED8; }

        /* ── Carrousel mobile ── */
        .pricing-carousel-wrap { display: flex; flex-direction: column; gap: 16px; }
        .pricing-carousel-nav { display: flex; align-items: center; justify-content: center; gap: 16px; }
        .pricing-carousel-arrow {
          width: 36px; height: 36px; border-radius: 10px;
          background: white; border: 1.5px solid #E2E8F0;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #64748B; transition: all 0.15s;
        }
        .pricing-carousel-arrow:hover:not(:disabled) { background: #F1F5F9; border-color: #CBD5E1; }
        .pricing-carousel-arrow:disabled { opacity: 0.35; cursor: not-allowed; }
        .pricing-carousel-dots { display: flex; gap: 7px; }
        .pricing-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: #E2E8F0; border: none; cursor: pointer; padding: 0;
          transition: all 0.2s;
        }
        .pricing-dot-active { background: #2563EB; width: 22px; border-radius: 4px; }
        .pricing-carousel-track { overflow: hidden; border-radius: 20px; }
        .pricing-carousel-slider { display: flex; }
        .pricing-carousel-slide { width: 100%; flex-shrink: 0; padding: 20px 4px 4px; }
        .pricing-carousel-label {
          text-align: center; font-size: 12px; color: #94A3B8; font-weight: 500;
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 768px) {
          .pricing-grid-desktop { display: none; }
          .pricing-grid-mobile { display: block; }
          .pricing-section { padding: 56px 20px; }
          .pricing-header { margin-bottom: 36px; }
        }
        @media (max-width: 480px) {
          .pricing-section { padding: 44px 16px; }
        }
      `}</style>
    </section>
  )
}
