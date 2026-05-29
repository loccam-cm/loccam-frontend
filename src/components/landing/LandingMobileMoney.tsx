'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { IconCreditCard, IconFileText, IconBell, IconClipboardList,IconDeviceMobile } from '@tabler/icons-react'

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

export default function LandingMobileMoney() {
  return (
    <section className="mm-section">
      <div className="mm-inner">

        {/* ── COLONNE GAUCHE ─────────────────────────────── */}
        <Reveal>
          <div className="mm-left">
            {/* Image illustrative */}
            <div className="mm-image-wrap">
              <div className="mm-image-bg" />
              <div className="mm-image-content">
                <IconDeviceMobile size={60} stroke={2.5} />
                <div className="mm-image-text">
                  <div className="mm-image-title">Paiement Mobile Money</div>
                  <div className="mm-image-sub">Cameroun · Orange & MTN</div>
                </div>
              </div>
              {/* Logos opérateurs */}
              <div className="mm-operators">
                <div className="mm-op mm-op-orange">
                  <span className="mm-op-dot" style={{ background: '#FF6600' }} />
                  Orange Money
                </div>
                <div className="mm-op mm-op-mtn">
                  <span className="mm-op-dot" style={{ background: '#FFCC00' }} />
                  MTN MoMo
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* ── COLONNE DROITE ─────────────────────────────── */}
        <Reveal delay={0.15}>
          <div className="mm-right">
            <div className="section-bar-white" />
            <p className="mm-label">PAIEMENTS</p>
            <h2 className="mm-title">
              Sécurisez vos encaissements<br />
              <span className="mm-gradient">avec Mobile Money.</span>
            </h2>
            <p className="mm-sub">
              Le locataire paie en 30 secondes depuis son téléphone. Vous recevez une notification immédiate et la quittance PDF est générée automatiquement.
            </p>

            {/* Features */}
            <div className="mm-features">
              {[
                { ico: <IconCreditCard size={15}/>, t: 'Paiement en 30 secondes', c: '#34D399' },
                { ico: <IconFileText size={15}/>, t: 'Quittance PDF instantanée', c: '#60A5FA' },
                { ico: <IconBell size={15}/>, t: 'Notification immédiate', c: '#FBBF24' },
                { ico: <IconClipboardList size={15}/>, t: 'Historique complet', c: '#C084FC' },
                { ico: <IconDeviceMobile size={15}/>, t: 'Paiement depuis votre téléphone', c: '#8B5CF6' },
              ].map(f => (
                <div key={f.t} className="mm-feature-item">
                  <span style={{ color: f.c }}>{f.ico}</span>
                  <span className="mm-feature-text">{f.t}</span>
                </div>
              ))}
            </div>

            {/* Mockup paiement */}
            <div className="mm-mockup">
              <div className="mm-mockup-header">
                <div>
                  <div className="mm-mockup-label">Prochain paiement</div>
                  <div className="mm-mockup-amount">85 000 XAF</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="mm-mockup-label">Échéance</div>
                  <div className="mm-mockup-date">5 juin 2026</div>
                </div>
              </div>
              {[
                { l: 'Loyer mensuel', v: '85 000 XAF' },
                { l: 'Charges eau', v: '3 125 XAF' },
                { l: 'Charges électricité', v: '4 800 XAF' },
              ].map(r => (
                <div key={r.l} className="mm-row">
                  <span className="mm-row-label">{r.l}</span>
                  <span className="mm-row-value">{r.v}</span>
                </div>
              ))}
              <div className="mm-total-row">
                <span className="mm-total-label">Total</span>
                <span className="mm-total-value">92 925 XAF</span>
              </div>
              <div className="mm-buttons">
                <button className="mm-btn-orange">
                  <span className="mm-btn-dot" style={{ background: '#FF6600' }} />
                  Orange Money
                </button>
                <button className="mm-btn-mtn">
                  <span className="mm-btn-dot" style={{ background: '#FFCC00' }} />
                  MTN MoMo
                </button>
              </div>
            </div>
          </div>
        </Reveal>
      </div>

      <style>{`
        .mm-section {
          background: #060B14; padding: 96px 24px;
          border-top: 1px solid rgba(255,255,255,0.05);
        }
        .mm-inner {
          max-width: 1100px; margin: 0 auto;
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 64px; align-items: center;
        }

        /* Image gauche */
        .mm-image-wrap {
          position: relative; border-radius: 20px; overflow: hidden;
          background: linear-gradient(135deg,#0D1B2E,#0A1525);
          border: 1px solid rgba(255,255,255,0.07);
          padding: 40px; min-height: 280px;
          display: flex; flex-direction: column; justify-content: space-between;
        }
        .mm-image-bg {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse 70% 60% at 30% 40%, rgba(37,99,235,0.12), transparent 60%),
                      radial-gradient(ellipse 50% 50% at 80% 80%, rgba(16,185,129,0.08), transparent 60%);
          pointer-events: none;
        }
        .mm-image-content {
          display: flex; align-items: center; gap: 16px; position: relative;
        }
        .mm-phone-icon { font-size: 48px; }
        .mm-image-title {
          font-family: var(--font-display, sans-serif);
          font-weight: 800; font-size: 20px; color: #F8FAFC; margin-bottom: 4px;
        }
        .mm-image-sub { font-size: 13px; color: rgba(248,250,252,0.4); }
        .mm-operators {
          display: flex; gap: 12px; position: relative;
        }
        .mm-op {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 16px; border-radius: 12px;
          font-size: 13px; font-weight: 700;
        }
        .mm-op-orange {
          background: rgba(255,102,0,0.1); color: #FF8C42;
          border: 1px solid rgba(255,102,0,0.25);
        }
        .mm-op-mtn {
          background: rgba(255,204,0,0.08); color: #FCD34D;
          border: 1px solid rgba(255,204,0,0.2);
        }
        .mm-op-dot {
          width: 8px; height: 8px; border-radius: 50%;
        }

        /* Droite */
        .section-bar-white {
          width: 40px; height: 3px; border-radius: 2px;
          background: linear-gradient(90deg,#10B981,#34D399);
          margin-bottom: 14px;
        }
        .mm-label {
          font-size: 11px; font-weight: 700; letter-spacing: 0.14em;
          color: #34D399; text-transform: uppercase; margin-bottom: 12px;
        }
        .mm-title {
          font-family: var(--font-display, sans-serif);
          font-size: clamp(1.7rem, 3vw, 2.4rem);
          font-weight: 800; line-height: 1.1; letter-spacing: -0.3px;
          color: #F8FAFC; margin-bottom: 16px;
        }
        .mm-gradient {
          background: linear-gradient(90deg,#34D399,#10B981);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .mm-sub {
          font-size: 15px; color: rgba(248,250,252,0.55);
          line-height: 1.65; max-width: 420px; margin-bottom: 24px;
        }
        .mm-features {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 10px; margin-bottom: 24px;
        }
        .mm-feature-item {
          display: flex; align-items: center; gap: 9px;
          padding: 11px 14px; border-radius: 12px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.06);
        }
        .mm-feature-text { font-size: 12px; font-weight: 500; color: rgba(248,250,252,0.75); }

        /* Mockup */
        .mm-mockup {
          background: rgba(4,34,28,0.7); border: 1px solid rgba(16,185,129,0.2);
          border-radius: 18px; padding: 20px;
          box-shadow: 0 0 40px rgba(16,185,129,0.1);
        }
        .mm-mockup-header {
          display: flex; justify-content: space-between; align-items: flex-start;
          margin-bottom: 16px; padding-bottom: 14px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .mm-mockup-label {
          font-size: 10px; color: rgba(255,255,255,0.35);
          text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 4px;
        }
        .mm-mockup-amount {
          font-family: var(--font-display, sans-serif);
          font-weight: 800; font-size: 1.6rem; color: #34D399; line-height: 1;
        }
        .mm-mockup-date {
          font-family: var(--font-display, sans-serif);
          font-weight: 700; font-size: 14px; color: #FBBF24;
        }
        .mm-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 9px 0; border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .mm-row-label { font-size: 13px; color: rgba(255,255,255,0.45); }
        .mm-row-value { font-size: 13px; font-weight: 600; color: #F8FAFC; }
        .mm-total-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 12px 0 16px;
        }
        .mm-total-label { font-weight: 700; color: #F8FAFC; font-size: 14px; }
        .mm-total-value {
          font-family: var(--font-display, sans-serif);
          font-weight: 800; font-size: 1.3rem; color: #34D399;
        }
        .mm-buttons { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .mm-btn-orange, .mm-btn-mtn {
          padding: 12px; border-radius: 11px; border: none;
          font-weight: 700; font-size: 13px; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .mm-btn-orange {
          background: linear-gradient(135deg,#FF6600,#E55A00);
          color: white; box-shadow: 0 4px 14px rgba(255,102,0,0.3);
        }
        .mm-btn-mtn {
          background: linear-gradient(135deg,#FFCC00,#E6B800);
          color: #1C1C1E; box-shadow: 0 4px 14px rgba(255,204,0,0.25);
        }
        .mm-btn-dot { width: 8px; height: 8px; border-radius: 50%; }

        @media (max-width: 900px) {
          .mm-inner { grid-template-columns: 1fr; gap: 40px; }
          .mm-image-wrap { min-height: 200px; }
        }
        @media (max-width: 480px) {
          .mm-section { padding: 60px 20px; }
          .mm-features { grid-template-columns: 1fr; }
        }
      `}</style>
    </section>
  )
}
