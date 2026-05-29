'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import {
  IconCreditCard, IconFileText, IconShieldCheck,
  IconBell, IconMessage, IconDroplet,
} from '@tabler/icons-react'

const STATS = [
  { val: 'N°1',   lbl: 'Gestion locative\nau Cameroun' },
  { val: '4.8/5', lbl: 'Note moyenne\nde nos utilisateurs' },
  { val: '1200+', lbl: 'Bailleurs actifs\nchaque mois' },
  { val: '500+',  lbl: 'Logements gérés\nvia LocCam' },
  { val: '15 min',lbl: 'Pour gérer votre\nparc chaque mois' },
  { val: '100%',  lbl: 'Conformes au droit\ncamerounais' },
]

const FEATURES = [
  {
    icon: <IconCreditCard size={20} />, color: '#F59E0B', bg: 'rgba(245,158,11,0.12)',
    title: 'Paiement Mobile Money natif',
    desc: 'Orange Money & MTN intégrés. Le locataire paie en 30 secondes, la quittance est générée automatiquement.',
  },
  {
    icon: <IconFileText size={20} />, color: '#10B981', bg: 'rgba(16,185,129,0.12)',
    title: 'Documents automatiques',
    desc: 'Contrats de bail, quittances, attestations — générés en PDF, conformes au droit camerounais.',
  },
  {
    icon: <IconShieldCheck size={20} />, color: '#3B82F6', bg: 'rgba(59,130,246,0.12)',
    title: 'Bailleurs certifiés CNI',
    desc: 'Chaque bailleur est vérifié par photo CNI. Zéro anonymat, locataires protégés dès l\'inscription.',
  },
  {
    icon: <IconBell size={20} />, color: '#EF4444', bg: 'rgba(239,68,68,0.12)',
    title: 'Relances automatiques',
    desc: 'Rappels J-3, J-7. Relances impayés J+7, J+15, J+30. Suivi en temps réel.',
  },
  {
    icon: <IconMessage size={20} />, color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)',
    title: 'Messagerie & signalements',
    desc: 'Communication directe par bien. Signalements de pannes tracés et suivis jusqu\'à résolution.',
  },
  {
    icon: <IconDroplet size={20} />, color: '#06B6D4', bg: 'rgba(6,182,212,0.12)',
    title: 'Charges eau & électricité',
    desc: 'Relevés mensuels d\'index, calcul automatique des charges, inclus dans la quittance.',
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

export default function LandingFeatures() {
  return (
    <section className="feat-section">

      {/* ── BANDE DARK AVEC IMAGE + STATS ─────────────────── */}
      <div className="feat-dark">
        <div className="feat-dark-overlay" />

        {/* Contenu stats */}
        <div className="feat-dark-inner">
          <Reveal>
            <p className="feat-label">POURQUOI LOCCAM</p>
            <h2 className="feat-title">
              6 raisons de choisir<br />
              <span className="feat-gradient">LocCam</span>
            </h2>
          </Reveal>

          {/* Grille stats */}
          <div className="feat-stats-grid">
            {STATS.map((s, i) => (
              <Reveal key={s.val} delay={i * 0.07}>
                <div className="feat-stat">
                  <div className="feat-stat-val">{s.val}</div>
                  <div className="feat-stat-lbl">{s.lbl}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* ── 6 FEATURE CARDS ───────────────────────────────── */}
      <div className="feat-cards-section">
        <div className="feat-cards-inner">
          <div className="feat-cards-grid">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 0.07}>
                <div className="feat-card">
                  <div className="feat-card-icon" style={{ background: f.bg, color: f.color }}>
                    {f.icon}
                  </div>
                  <h3 className="feat-card-title">{f.title}</h3>
                  <p className="feat-card-desc">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        /* ── Dark band ── */
        .feat-section { background: #060B14; }

        .feat-dark {
          position: relative; overflow: hidden;
          background:
            linear-gradient(180deg, #060B14 0%, #0D1B2E 40%, #0A1525 100%);
          padding: 80px 24px 72px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .feat-dark-overlay {
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 60% 50% at 80% 50%, rgba(37,99,235,0.1) 0%, transparent 60%),
            radial-gradient(ellipse 40% 40% at 20% 80%, rgba(16,185,129,0.07) 0%, transparent 55%);
          pointer-events: none;
        }
        /* Grille de points */
        .feat-dark::before {
          content: '';
          position: absolute; inset: 0;
          background-image: radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 28px 28px;
          pointer-events: none;
        }
        .feat-dark-inner {
          max-width: 1100px; margin: 0 auto;
          position: relative; z-index: 1;
        }
        .feat-label {
          font-size: 11px; font-weight: 700; letter-spacing: 0.14em;
          color: #60A5FA; text-transform: uppercase; margin-bottom: 12px;
        }
        .feat-title {
          font-family: var(--font-display, sans-serif);
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 800; line-height: 1.1; letter-spacing: -0.4px;
          color: #F8FAFC; margin-bottom: 48px;
        }
        .feat-gradient {
          background: linear-gradient(135deg,#60A5FA,#34D399);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Stats grid */
        .feat-stats-grid {
          display: grid; grid-template-columns: repeat(6, 1fr);
          gap: 16px;
        }
        .feat-stat {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px; padding: 20px 16px;
          text-align: center;
          transition: all 0.25s ease;
        }
        .feat-stat:hover {
          background: rgba(37,99,235,0.1);
          border-color: rgba(59,130,246,0.25);
          transform: translateY(-3px);
        }
        .feat-stat-val {
          font-family: var(--font-display, sans-serif);
          font-weight: 800; font-size: clamp(1.4rem, 2.5vw, 2rem);
          color: #F8FAFC; line-height: 1; margin-bottom: 8px;
        }
        .feat-stat-lbl {
          font-size: 11px; color: rgba(248,250,252,0.4);
          line-height: 1.4; white-space: pre-line;
        }

        /* ── Feature cards ── */
        .feat-cards-section {
          background: #060B14;
          padding: 72px 24px 80px;
        }
        .feat-cards-inner { max-width: 1100px; margin: 0 auto; }
        .feat-cards-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        .feat-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px; padding: 28px 24px;
          transition: all 0.25s ease;
        }
        .feat-card:hover {
          background: rgba(255,255,255,0.05);
          border-color: rgba(99,153,255,0.22);
          transform: translateY(-3px);
          box-shadow: 0 16px 40px rgba(0,0,0,0.3);
        }
        .feat-card-icon {
          width: 46px; height: 46px; border-radius: 13px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 18px;
          transition: transform 0.3s ease;
        }
        .feat-card:hover .feat-card-icon {
          transform: scale(1.1) rotate(4deg);
        }
        .feat-card-title {
          font-family: var(--font-display, sans-serif);
          font-weight: 700; font-size: 16px; color: #F8FAFC;
          margin-bottom: 10px; line-height: 1.3;
        }
        .feat-card-desc {
          font-size: 13px; color: rgba(248,250,252,0.5);
          line-height: 1.65;
        }

        /* RESPONSIVE */
        @media (max-width: 1024px) {
          .feat-stats-grid { grid-template-columns: repeat(3, 1fr); }
          .feat-cards-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 640px) {
          .feat-stats-grid { grid-template-columns: repeat(2, 1fr); }
          .feat-cards-grid { grid-template-columns: 1fr; }
          .feat-dark { padding: 60px 20px 56px; }
          .feat-cards-section { padding: 56px 20px 60px; }
        }
      `}</style>
    </section>
  )
}
