'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import {
  IconCreditCard, IconFileText, IconShieldCheck,
  IconBell, IconMessage, IconDroplet, IconChartBar,
  IconBuildingCommunity, IconCheck, IconArrowRight,
  IconHome2, IconClock, IconAlertTriangle, IconCircleCheck,
} from '@tabler/icons-react'

// ── Reveal animation ───────────────────────────────────────────
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

// ── Stats de la bande dark ─────────────────────────────────────
const STATS = [
  { val: 'N°1',    lbl: 'Gestion locative\nau Cameroun' },
  { val: '4.8/5',  lbl: 'Note moyenne\nde nos utilisateurs' },
  { val: '1200+',  lbl: 'Bailleurs actifs\nchaque mois' },
  { val: '500+',   lbl: 'Logements gérés\nvia LocCam' },
  { val: '15 min', lbl: 'Pour gérer votre\nparc chaque mois' },
  { val: '100%',   lbl: 'Conformes au droit\ncamerounais' },
]

// ── 8 fonctionnalités (grille compacte) ────────────────────────
const FEATURES = [
  { icon: <IconCreditCard size={20}/>,       color:'#F59E0B', bg:'rgba(245,158,11,0.12)', title:'Paiement Mobile Money natif',   desc:'Orange Money & MTN intégrés. Le locataire paie en 30 secondes, quittance générée automatiquement.' },
  { icon: <IconFileText size={20}/>,         color:'#10B981', bg:'rgba(16,185,129,0.12)', title:'Documents automatiques',        desc:'Contrats de bail, quittances, attestations — générés en PDF, conformes au droit camerounais.' },
  { icon: <IconDroplet size={20}/>,          color:'#06B6D4', bg:'rgba(6,182,212,0.12)',  title:'Charges eau & électricité',     desc:'Relevés mensuels d\'index, calcul automatique des charges, inclus dans la quittance.' },
  { icon: <IconChartBar size={20}/>,         color:'#3B82F6', bg:'rgba(59,130,246,0.12)', title:'Tableau de bord analytique',    desc:'Revenus, taux d\'occupation, impayés en temps réel. Prenez les bonnes décisions.' },
  { icon: <IconBell size={20}/>,             color:'#EF4444', bg:'rgba(239,68,68,0.12)',  title:'Relances automatiques',         desc:'Rappels J-3, J-7. Relances impayés J+7, J+15, J+30. Suivi en temps réel.' },
  { icon: <IconMessage size={20}/>,          color:'#8B5CF6', bg:'rgba(139,92,246,0.12)', title:'Messagerie & signalements',     desc:'Communication directe par bien. Signalements de pannes tracés jusqu\'à résolution.' },
  { icon: <IconBuildingCommunity size={20}/>,color:'#EC4899', bg:'rgba(236,72,153,0.12)', title:'Multi-structures',              desc:'Gérez immeubles, résidences et cités. Chaque bien rattaché à sa structure parente.' },
  { icon: <IconShieldCheck size={20}/>,      color:'#14B8A6', bg:'rgba(20,184,166,0.12)', title:'Bailleurs certifiés CNI',       desc:'Chaque bailleur vérifié par photo CNI. Zéro anonymat, locataires protégés.' },
]

// ── 3 fonctionnalités mises en avant (alternance texte/mockup) ─
const HIGHLIGHTS = [
  {
    label: 'GESTION DU PARC',
    title: 'Tout votre parc immobilier',
    gradient: 'en un seul endroit.',
    desc: 'Ajoutez vos biens en quelques clics, rattachez-les à leurs structures, suivez leur statut d\'occupation en temps réel. Photos, tarifs eau/électricité, géolocalisation — tout est centralisé.',
    points: [
      { ico:<IconHome2 size={15}/>,   t:'Biens illimités (plan Business)', c:'#34D399' },
      { ico:<IconBuildingCommunity size={15}/>, t:'Immeubles, résidences, cités', c:'#60A5FA' },
      { ico:<IconCheck size={15}/>,   t:'Statut d\'occupation temps réel', c:'#FBBF24' },
    ],
    mockup: 'parc',
  },
  {
    label: 'SUIVI DES PAIEMENTS',
    title: 'Ne perdez plus jamais',
    gradient: 'un loyer de vue.',
    desc: 'Chaque loyer attendu est tracé. Les impayés remontent automatiquement sur votre tableau de bord avec le nombre de jours de retard. Relancez en un clic par Mobile Money.',
    points: [
      { ico:<IconAlertTriangle size={15}/>, t:'Impayés détectés automatiquement', c:'#F87171' },
      { ico:<IconClock size={15}/>,   t:'Compteur de jours de retard', c:'#FBBF24' },
      { ico:<IconBell size={15}/>,    t:'Relance en un clic', c:'#60A5FA' },
    ],
    mockup: 'impayes',
  },
  {
    label: 'ANALYTIQUE',
    title: 'Pilotez vos revenus',
    gradient: 'avec des données claires.',
    desc: 'Visualisez vos revenus mensuels, votre taux d\'occupation et la répartition de votre parc. Des graphiques simples pour prendre les bonnes décisions et optimiser votre rentabilité.',
    points: [
      { ico:<IconChartBar size={15}/>, t:'Revenus mensuels sur 12 mois', c:'#34D399' },
      { ico:<IconHome2 size={15}/>,    t:'Taux d\'occupation du parc', c:'#60A5FA' },
      { ico:<IconCircleCheck size={15}/>, t:'Répartition par type de bien', c:'#C084FC' },
    ],
    mockup: 'analytique',
  },
]

// ── Mockups SVG/HTML par type ──────────────────────────────────
function Mockup({ type }: { type: string }) {
  if (type === 'parc') {
    return (
      <div className="hl-mockup">
        <div className="hl-mockup-head">
          <span className="hl-mockup-title">Mes biens</span>
          <span className="hl-mockup-badge" style={{ background:'rgba(52,211,153,.15)', color:'#34D399' }}>4 biens</span>
        </div>
        {[
          { t:'Studio A2 · Logbessou', s:'Occupé', c:'#60A5FA', bg:'rgba(96,165,250,.15)' },
          { t:'Appartement B1 · Bonapriso', s:'Libre', c:'#34D399', bg:'rgba(52,211,153,.15)' },
          { t:'Villa C · Bonanjo', s:'Occupé', c:'#60A5FA', bg:'rgba(96,165,250,.15)' },
        ].map(b => (
          <div key={b.t} className="hl-mockup-row">
            <div className="hl-mockup-icon"><IconHome2 size={14} style={{ color:'#94A3B8' }}/></div>
            <span className="hl-mockup-label">{b.t}</span>
            <span className="hl-mockup-tag" style={{ background:b.bg, color:b.c }}>{b.s}</span>
          </div>
        ))}
      </div>
    )
  }

  if (type === 'impayes') {
    return (
      <div className="hl-mockup">
        <div className="hl-mockup-head">
          <span className="hl-mockup-title" style={{ display:'flex', alignItems:'center', gap:'6px' }}>
            <IconAlertTriangle size={14} style={{ color:'#F87171' }}/> Impayés en cours
          </span>
          <span className="hl-mockup-badge" style={{ background:'rgba(248,113,113,.15)', color:'#F87171' }}>1</span>
        </div>
        <div className="hl-mockup-impaye">
          <div className="hl-mockup-av">KV</div>
          <div style={{ flex:1 }}>
            <div className="hl-mockup-name">Kenmatio Vicens</div>
            <div className="hl-mockup-sub">Studio A2 · Juillet 2026</div>
          </div>
          <div style={{ textAlign:'right' }}>
            <div className="hl-mockup-amount">90 000 XAF</div>
            <div className="hl-mockup-relance">Relancer →</div>
          </div>
        </div>
        <div className="hl-mockup-note">
          <IconClock size={12} style={{ color:'#FBBF24' }}/>
          Détecté automatiquement — aucun paiement ce mois
        </div>
      </div>
    )
  }

  // analytique
  return (
    <div className="hl-mockup">
      <div className="hl-mockup-head">
        <span className="hl-mockup-title">Revenus mensuels</span>
        <span className="hl-mockup-badge" style={{ background:'rgba(52,211,153,.15)', color:'#34D399' }}>+12%</span>
      </div>
      <div className="hl-chart">
        {[45, 62, 50, 70, 58, 82, 75, 90].map((h, i) => (
          <div key={i} className="hl-bar-wrap">
            <div className="hl-bar" style={{
              height: `${h}%`,
              background: i === 7 ? 'linear-gradient(180deg,#34D399,#10B981)' : 'rgba(96,165,250,.4)',
            }}/>
          </div>
        ))}
      </div>
      <div className="hl-chart-labels">
        <span>Déc</span><span>Jan</span><span>Fév</span><span>Mar</span>
        <span>Avr</span><span>Mai</span><span>Jun</span><span>Jui</span>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
export default function LandingFeatures() {
  return (
    <section className="feat-section" id="fonctionnalites">

      {/* ── BANDE DARK AVEC STATS ─────────────────────────── */}
      <div className="feat-dark">
        <div className="feat-dark-overlay" />
        <div className="feat-dark-inner">
          <Reveal>
            <p className="feat-label">L'OUTIL COMPLET</p>
            <h2 className="feat-title">
              Tout ce qu'un bailleur<br />
              <span className="feat-gradient">camerounais</span> attend.
            </h2>
            <p className="feat-intro">
              LocCam réunit dans une seule plateforme la gestion des biens, les paiements Mobile Money,
              les documents légaux et le suivi des impayés. Conçu pour le contexte camerounais.
            </p>
          </Reveal>

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

      {/* ── 8 FEATURE CARDS ───────────────────────────────── */}
      <div className="feat-cards-section">
        <div className="feat-cards-inner">
          <Reveal>
            <div className="feat-cards-head">
              <p className="feat-label" style={{ color:'#34D399' }}>FONCTIONNALITÉS</p>
              <h3 className="feat-cards-title">8 outils pour gérer sans effort</h3>
            </div>
          </Reveal>
          <div className="feat-cards-grid">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 0.05}>
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

      {/* ── 3 HIGHLIGHTS ALTERNÉS (texte + mockup) ────────── */}
      <div className="feat-highlights">
        <div className="feat-highlights-inner">
          {HIGHLIGHTS.map((h, i) => (
            <div key={h.label} className={`hl-row ${i % 2 === 1 ? 'hl-reverse' : ''}`}>
              {/* Texte */}
              <Reveal delay={0.1}>
                <div className="hl-text">
                  <div className="section-bar-white" />
                  <p className="hl-label">{h.label}</p>
                  <h3 className="hl-title">
                    {h.title}<br />
                    <span className="hl-gradient">{h.gradient}</span>
                  </h3>
                  <p className="hl-desc">{h.desc}</p>
                  <div className="hl-points">
                    {h.points.map(p => (
                      <div key={p.t} className="hl-point">
                        <span style={{ color: p.c }}>{p.ico}</span>
                        <span>{p.t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>

              {/* Mockup */}
              <Reveal delay={0.2}>
                <div className="hl-visual">
                  <Mockup type={h.mockup} />
                </div>
              </Reveal>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .feat-section { background: #060B14; }

        /* ── Dark band ── */
        .feat-dark {
          position: relative; overflow: hidden;
          background: linear-gradient(180deg, #060B14 0%, #0D1B2E 40%, #0A1525 100%);
          padding: 90px 24px 72px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .feat-dark-overlay {
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 60% 50% at 80% 50%, rgba(37,99,235,0.1) 0%, transparent 60%),
            radial-gradient(ellipse 40% 40% at 20% 80%, rgba(16,185,129,0.07) 0%, transparent 55%);
          pointer-events: none;
        }
        .feat-dark::before {
          content: ''; position: absolute; inset: 0;
          background-image: radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 28px 28px; pointer-events: none;
        }
        .feat-dark-inner { max-width: 1100px; margin: 0 auto; position: relative; z-index: 1; }
        .feat-label {
          font-size: 11px; font-weight: 700; letter-spacing: 0.14em;
          color: #60A5FA; text-transform: uppercase; margin-bottom: 12px;
        }
        .feat-title {
          font-family: var(--font-display, sans-serif);
          font-size: clamp(2rem, 4vw, 3rem); font-weight: 800;
          line-height: 1.1; letter-spacing: -0.4px; color: #F8FAFC; margin-bottom: 18px;
        }
        .feat-gradient {
          background: linear-gradient(135deg,#60A5FA,#34D399);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .feat-intro {
          font-size: 15px; color: rgba(248,250,252,0.5);
          line-height: 1.7; max-width: 620px; margin-bottom: 48px;
        }
        .feat-stats-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 16px; }
        .feat-stat {
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px; padding: 20px 16px; text-align: center; transition: all 0.25s ease;
        }
        .feat-stat:hover {
          background: rgba(37,99,235,0.1); border-color: rgba(59,130,246,0.25); transform: translateY(-3px);
        }
        .feat-stat-val {
          font-family: var(--font-display, sans-serif); font-weight: 800;
          font-size: clamp(1.4rem, 2.5vw, 2rem); color: #F8FAFC; line-height: 1; margin-bottom: 8px;
        }
        .feat-stat-lbl { font-size: 11px; color: rgba(248,250,252,0.4); line-height: 1.4; white-space: pre-line; }

        /* ── Feature cards ── */
        .feat-cards-section { background: #060B14; padding: 80px 24px; }
        .feat-cards-inner { max-width: 1100px; margin: 0 auto; }
        .feat-cards-head { text-align: center; margin-bottom: 48px; }
        .feat-cards-head .feat-label { margin-bottom: 10px; }
        .feat-cards-title {
          font-family: var(--font-display, sans-serif);
          font-size: clamp(1.5rem, 3vw, 2.2rem); font-weight: 800;
          color: #F8FAFC; letter-spacing: -0.3px;
        }
        .feat-cards-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .feat-card {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px; padding: 26px 22px; transition: all 0.25s ease; height: 100%;
        }
        .feat-card:hover {
          background: rgba(255,255,255,0.05); border-color: rgba(99,153,255,0.22);
          transform: translateY(-3px); box-shadow: 0 16px 40px rgba(0,0,0,0.3);
        }
        .feat-card-icon {
          width: 46px; height: 46px; border-radius: 13px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 16px; transition: transform 0.3s ease;
        }
        .feat-card:hover .feat-card-icon { transform: scale(1.1) rotate(4deg); }
        .feat-card-title {
          font-family: var(--font-display, sans-serif); font-weight: 700;
          font-size: 15px; color: #F8FAFC; margin-bottom: 9px; line-height: 1.3;
        }
        .feat-card-desc { font-size: 12.5px; color: rgba(248,250,252,0.5); line-height: 1.6; }

        /* ── Highlights alternés ── */
        .feat-highlights {
          background: linear-gradient(180deg, #060B14 0%, #0A1525 100%);
          padding: 40px 24px 90px;
        }
        .feat-highlights-inner {
          max-width: 1080px; margin: 0 auto;
          display: flex; flex-direction: column; gap: 80px;
        }
        .hl-row {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 56px; align-items: center;
        }
        .hl-reverse .hl-text  { order: 2; }
        .hl-reverse .hl-visual { order: 1; }
        .section-bar-white {
          width: 36px; height: 3px; border-radius: 2px;
          background: linear-gradient(90deg,#60A5FA,#34D399); margin-bottom: 16px;
        }
        .hl-label {
          font-size: 11px; font-weight: 700; letter-spacing: 0.14em;
          color: #60A5FA; text-transform: uppercase; margin-bottom: 12px;
        }
        .hl-title {
          font-family: var(--font-display, sans-serif);
          font-size: clamp(1.6rem, 3vw, 2.3rem); font-weight: 800;
          line-height: 1.15; letter-spacing: -0.3px; color: #F8FAFC; margin-bottom: 16px;
        }
        .hl-gradient {
          background: linear-gradient(135deg,#60A5FA,#34D399);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .hl-desc { font-size: 14.5px; color: rgba(248,250,252,0.55); line-height: 1.7; margin-bottom: 24px; }
        .hl-points { display: flex; flex-direction: column; gap: 12px; }
        .hl-point {
          display: flex; align-items: center; gap: 10px;
          font-size: 14px; color: rgba(248,250,252,0.8);
        }

        /* Mockups */
        .hl-visual { display: flex; justify-content: center; }
        .hl-mockup {
          width: 100%; max-width: 380px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 20px; padding: 20px;
          box-shadow: 0 24px 60px rgba(0,0,0,0.4);
        }
        .hl-mockup-head {
          display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;
        }
        .hl-mockup-title { font-size: 13px; font-weight: 700; color: #F8FAFC; }
        .hl-mockup-badge {
          font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 100px;
        }
        .hl-mockup-row {
          display: flex; align-items: center; gap: 10px;
          padding: 11px 12px; margin-bottom: 8px;
          background: rgba(255,255,255,0.03); border-radius: 12px;
        }
        .hl-mockup-icon {
          width: 28px; height: 28px; border-radius: 8px;
          background: rgba(255,255,255,0.05);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .hl-mockup-label { flex: 1; font-size: 12.5px; color: rgba(248,250,252,0.75); }
        .hl-mockup-tag { font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 100px; }

        /* Impayé mockup */
        .hl-mockup-impaye {
          display: flex; align-items: center; gap: 12px;
          padding: 14px; border-radius: 14px;
          background: rgba(248,113,113,0.06); border: 1px solid rgba(248,113,113,0.15);
        }
        .hl-mockup-av {
          width: 38px; height: 38px; border-radius: 10px; flex-shrink: 0;
          background: linear-gradient(135deg,#DC2626,#B91C1C);
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 800; color: #fff;
        }
        .hl-mockup-name { font-size: 13px; font-weight: 700; color: #F8FAFC; }
        .hl-mockup-sub { font-size: 11px; color: rgba(248,250,252,0.45); margin-top: 2px; }
        .hl-mockup-amount { font-size: 14px; font-weight: 800; color: #F87171; }
        .hl-mockup-relance { font-size: 11px; font-weight: 600; color: #F87171; margin-top: 2px; }
        .hl-mockup-note {
          display: flex; align-items: center; gap: 6px;
          font-size: 11px; color: rgba(248,250,252,0.4);
          margin-top: 12px; padding-top: 12px;
          border-top: 1px solid rgba(255,255,255,0.05);
        }

        /* Chart mockup */
        .hl-chart {
          display: flex; align-items: flex-end; justify-content: space-between;
          gap: 6px; height: 120px; margin: 8px 0;
        }
        .hl-bar-wrap { flex: 1; height: 100%; display: flex; align-items: flex-end; }
        .hl-bar { width: 100%; border-radius: 6px 6px 0 0; min-height: 8px; transition: height 0.4s ease; }
        .hl-chart-labels {
          display: flex; justify-content: space-between; gap: 6px; margin-top: 8px;
        }
        .hl-chart-labels span {
          flex: 1; text-align: center; font-size: 9px; color: rgba(248,250,252,0.35);
        }

        /* RESPONSIVE */
        @media (max-width: 1024px) {
          .feat-stats-grid { grid-template-columns: repeat(3, 1fr); }
          .feat-cards-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 860px) {
          .hl-row { grid-template-columns: 1fr; gap: 32px; }
          .hl-reverse .hl-text { order: 1; }
          .hl-reverse .hl-visual { order: 2; }
        }
        @media (max-width: 640px) {
          .feat-stats-grid { grid-template-columns: repeat(2, 1fr); }
          .feat-cards-grid { grid-template-columns: 1fr; }
          .feat-dark { padding: 70px 20px 56px; }
          .feat-cards-section { padding: 60px 20px; }
          .feat-highlights { padding: 30px 20px 70px; }
          .feat-highlights-inner { gap: 60px; }
        }
      `}</style>
    </section>
  )
}