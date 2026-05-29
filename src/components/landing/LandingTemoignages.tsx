'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { IconStar } from '@tabler/icons-react'

const TEMOIGNAGES = [
  {
    stars: 5, av: 'NP', col: '#3B82F6',
    txt: 'Depuis LocCam, je gère mes 8 appartements en moins de 30 minutes par mois. Les paiements Orange Money arrivent directement et les quittances se génèrent seules.',
    name: 'Ngo Pauline', role: 'Bailleur · 8 biens · Douala',
  },
  {
    stars: 5, av: 'TK', col: '#10B981',
    txt: 'LocCam m\'a permis de formaliser toutes mes locations. Contrats, quittances, relances — tout est automatisé. Je recommande à tous les bailleurs camerounais.',
    name: 'Tamba Kossé', role: 'Bailleur · 15 biens · Yaoundé',
  },
  {
    stars: 4, av: 'MF', col: '#F59E0B',
    txt: 'En tant que locataire, je reçois ma quittance instantanément après chaque paiement MTN Money. Très pratique pour mes démarches administratives.',
    name: 'Mbida Fernande', role: 'Locataire · Studio 101 · Douala',
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

export default function LandingTemoignages() {
  return (
    <section className="temo-section" id="temoignages">
      <div className="temo-inner">

        {/* Header */}
        <Reveal>
          <div className="temo-header">
            <div className="temo-left-header">
              <p className="temo-label">Plus de <strong>1 200 bailleurs</strong> nous font confiance</p>
            </div>
            <div className="temo-right-header">
              <div className="temo-rating">
                <div className="temo-rating-val">4.8/5</div>
                <div className="temo-stars">
                  {[1,2,3,4,5].map(i => <IconStar key={i} size={14} style={{ color: '#F59E0B' }} fill="#F59E0B" />)}
                </div>
                <div className="temo-rating-sub">Note moyenne</div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Cards */}
        <div className="temo-grid">
          {TEMOIGNAGES.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.1}>
              <div className="temo-card">
                <div className="temo-card-stars">
                  {Array(t.stars).fill(0).map((_, j) => (
                    <IconStar key={j} size={13} style={{ color: '#F59E0B' }} fill="#F59E0B" />
                  ))}
                </div>
                <p className="temo-card-txt">&ldquo;{t.txt}&rdquo;</p>
                <div className="temo-card-author">
                  <div className="temo-card-av" style={{ background: `${t.col}20`, border: `1px solid ${t.col}35`, color: t.col }}>
                    {t.av}
                  </div>
                  <div>
                    <div className="temo-card-name">{t.name}</div>
                    <div className="temo-card-role">{t.role}</div>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      <style>{`
        .temo-section {
          background: white; padding: 96px 24px;
          border-top: 1px solid #E2E8F0;
        }
        .temo-inner { max-width: 1100px; margin: 0 auto; }
        .temo-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 48px; flex-wrap: wrap; gap: 20px;
        }
        .temo-label {
          font-family: var(--font-display, sans-serif);
          font-size: clamp(1.5rem, 3vw, 2.2rem);
          font-weight: 800; color: #0F172A; line-height: 1.2;
        }
        .temo-rating {
          display: flex; flex-direction: column; align-items: center; gap: 4px;
        }
        .temo-rating-val {
          font-family: var(--font-display, sans-serif);
          font-weight: 800; font-size: 2rem; color: #0F172A; line-height: 1;
        }
        .temo-stars { display: flex; gap: 3px; }
        .temo-rating-sub { font-size: 12px; color: #64748B; }

        .temo-grid {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        .temo-card {
          background: #F8FAFC; border: 1px solid #E2E8F0;
          border-radius: 20px; padding: 28px 24px;
          display: flex; flex-direction: column; gap: 0;
          transition: all 0.25s ease;
        }
        .temo-card:hover {
          background: white; border-color: #CBD5E1;
          box-shadow: 0 12px 36px rgba(0,0,0,0.08);
          transform: translateY(-3px);
        }
        .temo-card-stars {
          display: flex; gap: 3px; margin-bottom: 14px;
        }
        .temo-card-txt {
          font-size: 14px; line-height: 1.7; color: #475569;
          font-style: italic; flex: 1; margin-bottom: 20px;
        }
        .temo-card-author {
          display: flex; align-items: center; gap: 12px;
          padding-top: 16px; border-top: 1px solid #E2E8F0;
        }
        .temo-card-av {
          width: 40px; height: 40px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-family: var(--font-display, sans-serif);
          font-weight: 800; font-size: 14px; flex-shrink: 0;
        }
        .temo-card-name {
          font-family: var(--font-display, sans-serif);
          font-weight: 700; font-size: 14px; color: #0F172A;
        }
        .temo-card-role { font-size: 12px; color: #94A3B8; margin-top: 2px; }

        @media (max-width: 900px) {
          .temo-grid { grid-template-columns: 1fr; }
          .temo-header { flex-direction: column; align-items: flex-start; }
        }
        @media (max-width: 480px) {
          .temo-section { padding: 60px 20px; }
        }
      `}</style>
    </section>
  )
}
