'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import {
  IconHome2, IconFileText, IconCreditCard,
  IconBell, IconCircleCheck, IconUsers,
  IconCheck, IconAlertCircle,
} from '@tabler/icons-react'

const TABS = [
  {
    id: 'bailleur',
    label: 'Bailleur',
    steps: [
      { num: '01', title: 'Créez votre compte', desc: 'Inscrivez-vous en 2 minutes. Uploadez votre CNI pour être certifié bailleur LocCam.' },
      { num: '02', title: 'Ajoutez vos biens', desc: 'Renseignez vos logements, photos, loyer, charges. Créez vos structures (immeubles, résidences).' },
      { num: '03', title: 'Invitez vos locataires', desc: 'Envoyez une invitation email. Le locataire crée son compte et signe le contrat en ligne.' },
      { num: '04', title: 'Encaissez & gérez', desc: 'Recevez les paiements Orange Money ou MTN. Quittances générées automatiquement.' },
    ],
    preview: 'bailleur',
  },
  {
    id: 'locataire',
    label: 'Locataire',
    steps: [
      { num: '01', title: 'Recevez l\'invitation', desc: 'Votre bailleur vous envoie une invitation par email pour rejoindre LocCam.' },
      { num: '02', title: 'Créez votre compte', desc: 'Inscription en 1 minute. Consultez votre contrat de bail directement depuis l\'app.' },
      { num: '03', title: 'Payez votre loyer', desc: 'Paiement en 30 secondes via Orange Money ou MTN. Notification immédiate.' },
      { num: '04', title: 'Téléchargez votre quittance', desc: 'PDF généré instantanément après chaque paiement. Toujours disponible.' },
    ],
    preview: 'locataire',
  },
]

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  )
}

function BailleurPreview() {
  return (
    <div className="comment-preview">
      {/* Header */}
      <div className="cp-header">
        <div className="cp-dot cp-dot-red" /><div className="cp-dot cp-dot-yellow" /><div className="cp-dot cp-dot-green" />
        <div className="cp-url">
          <div className="cp-url-secure" />
          <span>app.loccam.cm/bailleur</span>
        </div>
      </div>
      {/* Content */}
      <div className="cp-body">
        {/* Mini sidebar */}
        <div className="cp-sidebar">
          {[
            { ico: <IconHome2 size={14}/>, lbl: 'Biens', active: true },
            { ico: <IconFileText size={14}/>, lbl: 'Contrats', active: false },
            { ico: <IconCreditCard size={14}/>, lbl: 'Paiements', active: false },
            { ico: <IconBell size={14}/>, lbl: 'Notifs', active: false },
          ].map(item => (
            <div key={item.lbl} className="cp-sidebar-item" style={{ background: item.active ? 'rgba(37,99,235,0.2)' : 'transparent', color: item.active ? '#60A5FA' : 'rgba(255,255,255,0.35)' }}>
              {item.ico}
              <span>{item.lbl}</span>
            </div>
          ))}
        </div>
        {/* Main */}
        <div className="cp-main">
          <div className="cp-main-title">Mes biens</div>
          <div className="cp-biens">
            {[
              { t: 'Studio 101 — Bonapriso', s: 'Occupé', c: '#34D399', bg: 'rgba(16,185,129,0.12)', v: '85 000 XAF' },
              { t: 'F2 102 — Bonapriso', s: 'Libre', c: '#FBBF24', bg: 'rgba(245,158,11,0.12)', v: '120 000 XAF' },
              { t: 'F3 201 — Mvog-Mbi', s: 'Occupé', c: '#34D399', bg: 'rgba(16,185,129,0.12)', v: '150 000 XAF' },
            ].map(b => (
              <div key={b.t} className="cp-bien-row">
                <div className="cp-bien-icon" style={{ background: b.bg }}>
                  <IconHome2 size={12} style={{ color: b.c }} />
                </div>
                <div className="cp-bien-info">
                  <div className="cp-bien-title">{b.t}</div>
                  <div className="cp-bien-price">{b.v}/mois</div>
                </div>
                <div className="cp-bien-badge" style={{ background: b.bg, color: b.c }}>{b.s}</div>
              </div>
            ))}
          </div>
          {/* Stats row */}
          <div className="cp-stats-row">
            {[
              { l: 'Loyers confirmés', v: '3', c: '#34D399' },
              { l: 'En attente', v: '1', c: '#FBBF24' },
              { l: 'Impayés', v: '0', c: '#F87171' },
            ].map(s => (
              <div key={s.l} className="cp-stat-item">
                <div style={{ fontWeight: 800, fontSize: 18, color: s.c, fontFamily: 'var(--font-display, sans-serif)' }}>{s.v}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function LocatairePreview() {
  return (
    <div className="comment-preview">
      <div className="cp-header">
        <div className="cp-dot cp-dot-red" /><div className="cp-dot cp-dot-yellow" /><div className="cp-dot cp-dot-green" />
        <div className="cp-url">
          <div className="cp-url-secure" />
          <span>app.loccam.cm/locataire</span>
        </div>
      </div>
      <div className="cp-body" style={{ flexDirection: 'column' }}>
        <div style={{ padding: '16px' }}>
          <div className="cp-main-title" style={{ marginBottom: 14 }}>Mon espace locataire</div>
          {/* Contrat */}
          <div style={{ background: 'linear-gradient(135deg,rgba(37,99,235,0.15),rgba(29,78,216,0.08))', border: '1px solid rgba(37,99,235,0.25)', borderRadius: 12, padding: '14px', marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)', marginBottom: 3 }}>Logement actuel</div>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#F8FAFC' }}>Studio 101 — Bonapriso</div>
              </div>
              <div style={{ fontSize: 10, background: 'rgba(16,185,129,0.15)', color: '#34D399', padding: '3px 8px', borderRadius: 6, fontWeight: 700 }}>Actif</div>
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              {[{ l: 'Loyer', v: '85 000 XAF' }, { l: 'Échéance', v: '5 juin' }].map(i => (
                <div key={i.l}>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>{i.l}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#F8FAFC' }}>{i.v}</div>
                </div>
              ))}
            </div>
          </div>
          {/* Payer */}
          <button style={{ width: '100%', padding: '11px', borderRadius: 10, background: 'linear-gradient(135deg,#059669,#047857)', border: 'none', color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, marginBottom: 12 }}>
            <IconCreditCard size={14} />
            Payer 85 000 XAF via Mobile Money
          </button>
          {/* Quittances */}
          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Dernières quittances</div>
          {[
            { m: 'Mai 2026', v: '85 000', ok: true },
            { m: 'Avril 2026', v: '85 000', ok: true },
          ].map(q => (
            <div key={q.m} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <IconCircleCheck size={13} style={{ color: '#34D399' }} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>{q.m}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>{q.v} XAF · Payé</div>
                </div>
              </div>
              <div style={{ fontSize: 10, color: '#60A5FA', fontWeight: 600 }}>PDF ↓</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function LandingComment() {
  const [active, setActive] = useState('bailleur')
  const tab = TABS.find(t => t.id === active)!

  return (
    <section className="comment-section" id="comment">
      <div className="comment-inner">

        {/* Header */}
        <Reveal>
          <div className="comment-header">
            <div className="section-bar" />
            <p className="section-label">COMMENT ÇA MARCHE</p>
            <h2 className="section-title">
              Simplifiez et automatisez<br />
              <span className="grad-blue">votre gestion locative</span>
            </h2>
            <p className="section-sub">
              LocCam est conçu pour les bailleurs et locataires camerounais.<br />
              Chaque fonctionnalité répond à un besoin réel du terrain.
            </p>
          </div>
        </Reveal>

        {/* Tabs */}
        <Reveal delay={0.1}>
          <div className="comment-tabs">
            {TABS.map(t => (
              <button key={t.id} className={`comment-tab ${active === t.id ? 'comment-tab-active' : ''}`}
                onClick={() => setActive(t.id)}>
                {t.id === 'bailleur' ? <IconHome2 size={15} /> : <IconUsers size={15} />}
                {t.label}
              </button>
            ))}
          </div>
        </Reveal>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div key={active}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="comment-content">

            {/* Steps */}
            <div className="comment-steps">
              {tab.steps.map((s, i) => (
                <motion.div key={s.num}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                  className="comment-step">
                  <div className="step-num">{s.num}</div>
                  <div className="step-content">
                    <div className="step-title">{s.title}</div>
                    <div className="step-desc">{s.desc}</div>
                  </div>
                  {i < tab.steps.length - 1 && <div className="step-line" />}
                </motion.div>
              ))}
            </div>

            {/* Preview */}
            <div className="comment-preview-wrap">
              {active === 'bailleur' ? <BailleurPreview /> : <LocatairePreview />}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <style>{`
        .comment-section {
          background: #F8FAFC; padding: 96px 24px;
        }
        .comment-inner { max-width: 1100px; margin: 0 auto; }

        /* Header */
        .comment-header { text-align: center; margin-bottom: 48px; }
        .section-bar {
          width: 40px; height: 3px; border-radius: 2px;
          background: linear-gradient(90deg,#2563EB,#10B981);
          margin: 0 auto 14px;
        }
        .section-label {
          font-size: 11px; font-weight: 700; letter-spacing: 0.14em;
          color: #2563EB; text-transform: uppercase; margin-bottom: 12px;
        }
        .section-title {
          font-family: var(--font-display, sans-serif);
          font-size: clamp(1.9rem, 3.5vw, 2.8rem);
          font-weight: 800; line-height: 1.1; letter-spacing: -0.3px;
          color: #0F172A; margin-bottom: 14px;
        }
        .grad-blue {
          background: linear-gradient(135deg,#2563EB,#10B981);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .section-sub {
          font-size: 15px; color: #64748B; line-height: 1.65;
          max-width: 520px; margin: 0 auto;
        }

        /* Tabs */
        .comment-tabs {
          display: flex; gap: 8px; justify-content: center;
          margin-bottom: 40px;
          background: #F1F5F9; border-radius: 14px;
          padding: 6px; width: fit-content; margin-left: auto; margin-right: auto;
          border: 1px solid #E2E8F0;
        }
        .comment-tab {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 24px; border-radius: 10px;
          font-size: 14px; font-weight: 600; cursor: pointer;
          border: none; background: transparent;
          color: #64748B; transition: all 0.2s;
        }
        .comment-tab:hover { color: #0F172A; }
        .comment-tab-active {
          background: white; color: #0F172A;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        /* Content */
        .comment-content {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 48px; align-items: start;
        }

        /* Steps */
        .comment-steps { display: flex; flex-direction: column; gap: 0; position: relative; }
        .comment-step {
          display: flex; gap: 16px; align-items: flex-start;
          padding-bottom: 28px; position: relative;
        }
        .step-num {
          width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
          background: linear-gradient(135deg,#2563EB,#1D4ED8);
          color: white; font-family: var(--font-display, sans-serif);
          font-weight: 800; font-size: 13px;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 12px rgba(37,99,235,0.3);
        }
        .step-line {
          position: absolute; left: 18px; top: 36px;
          width: 1px; height: calc(100% - 36px);
          background: linear-gradient(to bottom,rgba(37,99,235,0.3),rgba(37,99,235,0.05));
        }
        .step-content { flex: 1; }
        .step-title {
          font-family: var(--font-display, sans-serif);
          font-weight: 700; font-size: 15px; color: #0F172A;
          margin-bottom: 5px;
        }
        .step-desc {
          font-size: 13px; color: #64748B; line-height: 1.6;
        }

        /* Preview */
        .comment-preview-wrap {
          position: sticky; top: 80px;
        }
        .comment-preview {
          background: #0D1B2E;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 18px; overflow: hidden;
          box-shadow: 0 24px 60px rgba(0,0,0,0.25);
        }
        .cp-header {
          padding: 11px 14px; background: rgba(255,255,255,0.02);
          border-bottom: 1px solid rgba(255,255,255,0.05);
          display: flex; align-items: center; gap: 10px;
        }
        .cp-dot { width: 10px; height: 10px; border-radius: 50%; }
        .cp-dot-red { background: #EF4444; opacity: 0.7; }
        .cp-dot-yellow { background: #F59E0B; opacity: 0.7; }
        .cp-dot-green { background: #10B981; opacity: 0.7; }
        .cp-url {
          flex: 1; height: 22px; border-radius: 6px;
          background: rgba(255,255,255,0.04);
          display: flex; align-items: center; gap: 7px; padding: 0 10px;
        }
        .cp-url-secure {
          width: 7px; height: 7px; border-radius: 50%;
          background: rgba(16,185,129,0.5);
        }
        .cp-url span { font-size: 10px; color: rgba(255,255,255,0.2); font-family: monospace; }
        .cp-body { display: flex; }

        /* Sidebar */
        .cp-sidebar {
          width: 80px; padding: 12px 8px;
          border-right: 1px solid rgba(255,255,255,0.05);
          display: flex; flex-direction: column; gap: 4px;
          background: rgba(0,0,0,0.2);
        }
        .cp-sidebar-item {
          display: flex; flex-direction: column; align-items: center; gap: 4px;
          padding: 8px 4px; border-radius: 9px; cursor: pointer;
          transition: background 0.15s;
        }
        .cp-sidebar-item span { font-size: 9px; font-weight: 600; }

        /* Main content */
        .cp-main { flex: 1; padding: 16px; min-width: 0; }
        .cp-main-title {
          font-family: var(--font-display, sans-serif);
          font-weight: 700; font-size: 14px; color: #F8FAFC; margin-bottom: 12px;
        }
        .cp-biens { display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px; }
        .cp-bien-row {
          display: flex; align-items: center; gap: 10px;
          padding: 10px; border-radius: 10px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.05);
        }
        .cp-bien-icon {
          width: 28px; height: 28px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .cp-bien-info { flex: 1; min-width: 0; }
        .cp-bien-title { font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.85); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .cp-bien-price { font-size: 10px; color: rgba(255,255,255,0.35); }
        .cp-bien-badge { font-size: 9px; font-weight: 700; padding: 3px 7px; border-radius: 6px; flex-shrink: 0; }
        .cp-stats-row {
          display: flex; gap: 12px; padding-top: 12px;
          border-top: 1px solid rgba(255,255,255,0.05);
        }
        .cp-stat-item { text-align: center; }

        /* RESPONSIVE */
        @media (max-width: 900px) {
          .comment-content { grid-template-columns: 1fr; }
          .comment-preview-wrap { position: static; }
        }
        @media (max-width: 480px) {
          .comment-section { padding: 60px 20px; }
          .comment-tab { padding: 9px 16px; font-size: 13px; }
        }
      `}</style>
    </section>
  )
}
