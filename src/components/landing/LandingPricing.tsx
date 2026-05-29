'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { IconCheck } from '@tabler/icons-react'
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
            <p className="pricing-sub">
              Sans engagement · Essai 30 jours · Résiliable à tout moment
            </p>
          </div>
        </Reveal>

        {/* Plans */}
        <div className="pricing-grid">
          {PLANS.map((p, i) => (
            <Reveal key={p.label} delay={i * 0.1}>
              <div className={`pricing-card ${p.popular ? 'pricing-popular' : ''}`}>
                {p.popular && (
                  <div className="pricing-badge">Plus populaire</div>
                )}
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
                <Link href="/register"
                  className={`pricing-cta ${p.popular ? 'pricing-cta-primary' : 'pricing-cta-ghost'}`}>
                  Essayer gratuitement
                </Link>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.3}>
          <p className="pricing-note">
            * Essai 30 jours sans carte bancaire. Sans engagement. Résiliable à tout moment.
          </p>
        </Reveal>

        {/* Découvrir toutes les offres */}
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

        .pricing-grid {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 16px; align-items: start;
        }
        .pricing-card {
          background: white; border: 1px solid #E2E8F0;
          border-radius: 20px; padding: 28px 24px;
          display: flex; flex-direction: column; gap: 0;
          position: relative; transition: all 0.25s ease;
        }
        .pricing-card:hover:not(.pricing-popular) {
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
        .pricing-popular:hover {
          transform: translateY(-12px);
          box-shadow: 0 0 70px rgba(37,99,235,0.28), 0 24px 56px rgba(0,0,0,0.25);
        }
        .pricing-badge {
          position: absolute; top: -12px; left: 50%; transform: translateX(-50%);
          padding: 4px 16px; border-radius: 100px;
          background: linear-gradient(135deg,#2563EB,#7C3AED);
          font-size: 11px; font-weight: 700; color: white; white-space: nowrap;
        }
        .pricing-plan-label {
          font-size: 13px; font-weight: 700; margin-bottom: 10px;
          color: inherit;
        }
        .pricing-card:not(.pricing-popular) .pricing-plan-label { color: #64748B; }
        .pricing-popular .pricing-plan-label { color: #93C5FD; }

        .pricing-price-row {
          display: flex; align-items: baseline; gap: 4px; margin-bottom: 20px;
        }
        .pricing-currency { font-size: 12px; color: inherit; opacity: 0.45; }
        .pricing-amount {
          font-family: var(--font-display, sans-serif);
          font-weight: 800; font-size: 2.2rem; line-height: 1;
        }
        .pricing-card:not(.pricing-popular) .pricing-amount { color: #0F172A; }
        .pricing-popular .pricing-amount { color: #60A5FA; }
        .pricing-period { font-size: 13px; color: inherit; opacity: 0.35; }

        .pricing-features {
          display: flex; flex-direction: column; gap: 10px;
          margin-bottom: 24px; flex: 1;
        }
        .pricing-feature {
          display: flex; align-items: center; gap: 10px;
        }
        .pricing-check {
          width: 18px; height: 18px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .pricing-feature-text { font-size: 13px; }
        .pricing-card:not(.pricing-popular) .pricing-feature-text { color: #475569; }

        .pricing-cta {
          display: block; text-align: center; padding: 13px;
          border-radius: 12px; font-size: 14px; font-weight: 700;
          text-decoration: none; transition: all 0.2s;
        }
        .pricing-cta-primary {
          background: linear-gradient(135deg,#2563EB,#1D4ED8);
          color: white;
          box-shadow: 0 4px 16px rgba(37,99,235,0.4);
        }
        .pricing-cta-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(37,99,235,0.55);
        }
        .pricing-cta-ghost {
          background: transparent; color: #64748B;
          border: 1.5px solid #E2E8F0;
        }
        .pricing-cta-ghost:hover {
          background: #F1F5F9; border-color: #CBD5E1; color: #0F172A;
        }

        .pricing-note {
          text-align: center; font-size: 12px; color: #94A3B8; margin-top: 20px;
        }
        .pricing-all-link {
          font-size: 14px; font-weight: 600; color: #2563EB; text-decoration: none;
          transition: color 0.15s;
        }
        .pricing-all-link:hover { color: #1D4ED8; }

        @media (max-width: 900px) {
          .pricing-grid { grid-template-columns: 1fr; max-width: 400px; margin: 0 auto; }
          .pricing-popular { transform: translateY(0); }
        }
        @media (max-width: 480px) {
          .pricing-section { padding: 60px 20px; }
        }
      `}</style>
    </section>
  )
}
