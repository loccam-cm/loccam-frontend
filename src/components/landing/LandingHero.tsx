'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  IconRocket, IconStar, IconShieldCheck, IconCircleCheck,
  IconHome2, IconCreditCard, IconUsers, IconAlertCircle,
} from '@tabler/icons-react'

export default function LandingHero() {
  return (
    <section className="hero-section">
      {/* Fond */}
      <div className="hero-bg" />
      <div className="hero-grid" />
      <div className="hero-orb hero-orb-1" />
      <div className="hero-orb hero-orb-2" />

      <div className="hero-inner">
        {/* ── COLONNE GAUCHE ─────────────────────────────── */}
        <motion.div className="hero-left"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>

          {/* Badge */}
          <div className="hero-badge">
            <motion.div className="hero-badge-dot"
              animate={{ scale: [1, 1.6, 1], opacity: [0.7, 0, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }} />
            <span>Solution N°1 de gestion locative au Cameroun</span>
          </div>

          {/* Titre */}
          <h1 className="hero-title">
            Tout pour gérer<br />
            vos locations au<br />
            <span className="hero-gradient">Cameroun.</span>
          </h1>

          {/* Sous-titre */}
          <p className="hero-sub">
            Simple, rapide, efficace !<br />
            LocCam centralise tout ce dont un bailleur camerounais a besoin — contrats, paiements Mobile Money, quittances et relances automatiques.
          </p>

          {/* CTA */}
          <Link href="/register" className="hero-cta">
            <IconRocket size={16} />
            Démarrer gratuitement
          </Link>

          {/* Social proof */}
          <div className="hero-proof">
            <div className="hero-proof-item">
              <div className="hero-proof-val">4.8/5</div>
              <div className="hero-proof-stars">
                {[1,2,3,4,5].map(i => <IconStar key={i} size={10} style={{ color: '#FCD34D' }} fill="#FCD34D" />)}
              </div>
            </div>
            <div className="hero-proof-sep" />
            <div className="hero-proof-item">
              <div className="hero-proof-val">1200+</div>
              <div className="hero-proof-label">Bailleurs</div>
            </div>
            <div className="hero-proof-sep" />
            <div className="hero-proof-item">
              <div className="hero-proof-val">500+</div>
              <div className="hero-proof-label">Logements</div>
            </div>
          </div>
        </motion.div>

        {/* ── COLONNE DROITE — Mockup ─────────────────────── */}
        <motion.div className="hero-right"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>

          {/* Fenêtre dashboard */}
          <div className="mockup-window">
            {/* Chrome */}
            <div className="mockup-chrome">
              <div className="mockup-dots">
                {['#EF4444','#F59E0B','#10B981'].map((c,i) => (
                  <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
                ))}
              </div>
              <div className="mockup-url">
                <div className="mockup-url-dot" />
                <span>app.loccam.cm/bailleur</span>
              </div>
            </div>

            {/* Dashboard body */}
            <div className="mockup-body">
              {/* KPIs */}
              <div className="mockup-kpis">
                {[
                  { l: 'Biens', v: '24', c: '#60A5FA', bg: 'rgba(59,130,246,0.12)', ico: <IconHome2 size={13}/> },
                  { l: 'Occupation', v: '87%', c: '#34D399', bg: 'rgba(16,185,129,0.12)', ico: <IconUsers size={13}/> },
                  { l: 'Revenus', v: '1.8M', c: '#FBBF24', bg: 'rgba(245,158,11,0.12)', ico: <IconCreditCard size={13}/> },
                  { l: 'Impayés', v: '3', c: '#F87171', bg: 'rgba(239,68,68,0.12)', ico: <IconAlertCircle size={13}/> },
                ].map(k => (
                  <div key={k.l} className="mockup-kpi" style={{ background: k.bg, border: `1px solid ${k.c}22` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
                      <span style={{ color: k.c }}>{k.ico}</span>
                      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>{k.l}</span>
                    </div>
                    <div style={{ fontFamily: 'var(--font-display, sans-serif)', fontWeight: 800, fontSize: 17, color: k.c, lineHeight: 1 }}>{k.v}</div>
                  </div>
                ))}
              </div>

              {/* Liste paiements */}
              <div className="mockup-list">
                <div className="mockup-list-header">
                  <span>Paiements récents</span>
                  <span style={{ color: '#60A5FA', fontSize: 10 }}>Voir tout →</span>
                </div>
                {[
                  { n: 'Mbida Jean', b: 'Studio 101', m: 'Orange Money', v: '85 000', ok: true },
                  { n: 'Ngo Marie',  b: 'F3 Mvog-Mbi', m: 'MTN Money', v: '150 000', ok: true },
                  { n: 'Bello Eric', b: 'Boutique RDC', m: 'Impayé · J+7', v: '95 000', ok: false },
                ].map((r, i) => (
                  <div key={r.n} className="mockup-row" style={{ borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}>
                    <div className="mockup-row-av" style={{ background: r.ok ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: r.ok ? '#34D399' : '#F87171' }}>
                      {r.n[0]}
                    </div>
                    <div className="mockup-row-info">
                      <div className="mockup-row-name">{r.n}</div>
                      <div className="mockup-row-sub">{r.b} · {r.m}</div>
                    </div>
                    <div className="mockup-row-amount" style={{ color: r.ok ? '#34D399' : '#F87171' }}>
                      {r.v} XAF
                      <div style={{ display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'flex-end', marginTop: 2 }}>
                        {r.ok
                          ? <><IconCircleCheck size={9} style={{ color: '#34D399' }} /><span style={{ fontSize: 9, color: '#34D399' }}>Confirmé</span></>
                          : <span style={{ fontSize: 9, color: '#F87171' }}>En retard</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Badge bas gauche */}
          <motion.div className="hero-badge-float hero-badge-float-bl"
            initial={{ opacity: 0, x: -16, y: 16 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}>
            <div className="hero-badge-float-icon" style={{ background: 'rgba(16,185,129,0.15)' }}>
              <IconCircleCheck size={18} style={{ color: '#34D399' }} />
            </div>
            <div>
              <div className="hero-badge-float-title">Quittance générée</div>
              <div className="hero-badge-float-sub">Orange Money · 85 000 XAF</div>
            </div>
          </motion.div>

          {/* Badge haut droit */}
          <motion.div className="hero-badge-float hero-badge-float-tr"
            initial={{ opacity: 0, x: 16, y: -16 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}>
            <IconShieldCheck size={14} style={{ color: '#60A5FA' }} />
            <span>CNI vérifiée ✓</span>
          </motion.div>
        </motion.div>
      </div>

      <style>{`
        .hero-section {
          min-height: 100dvh;
          display: flex; align-items: center;
          position: relative; overflow: hidden;
          padding-top: 60px;
        }
        .hero-bg {
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 75% 60% at 15% 55%, rgba(37,99,235,0.14) 0%, transparent 55%),
            radial-gradient(ellipse 50% 45% at 82% 22%, rgba(16,185,129,0.09) 0%, transparent 50%),
            radial-gradient(ellipse 40% 50% at 50% 100%, rgba(139,92,246,0.07) 0%, transparent 50%);
          pointer-events: none;
        }
        .hero-grid {
          position: absolute; inset: 0;
          background-image: radial-gradient(rgba(255,255,255,0.032) 1px, transparent 1px);
          background-size: 28px 28px;
          pointer-events: none;
        }
        .hero-orb {
          position: absolute; border-radius: 50%;
          filter: blur(60px); pointer-events: none;
        }
        .hero-orb-1 {
          top: 8%; right: -4%; width: 480px; height: 480px;
          background: radial-gradient(circle, rgba(37,99,235,0.18), transparent 70%);
          animation: orbFloat 9s ease-in-out infinite;
        }
        .hero-orb-2 {
          bottom: 5%; left: -6%; width: 380px; height: 380px;
          background: radial-gradient(circle, rgba(16,185,129,0.13), transparent 70%);
          animation: orbFloat 11s ease-in-out infinite 2s;
        }
        @keyframes orbFloat {
          0%,100%{transform:scale(1) translate(0,0)}
          50%{transform:scale(1.12) translate(10px,-10px)}
        }
        .hero-inner {
          max-width: 1200px; margin: 0 auto;
          padding: 72px 24px 80px;
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 56px; align-items: center;
          width: 100%;
        }
        .hero-left { display: flex; flex-direction: column; gap: 0; }

        /* Badge */
        .hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 6px 14px; border-radius: 100px;
          background: rgba(37,99,235,0.1);
          border: 1px solid rgba(59,130,246,0.25);
          margin-bottom: 24px; width: fit-content;
          font-size: 12px; font-weight: 700; color: #93C5FD;
          letter-spacing: 0.2px;
        }
        .hero-badge-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #3B82F6; flex-shrink: 0;
        }

        /* Titre */
        .hero-title {
          font-family: var(--font-display, sans-serif);
          font-size: clamp(2.2rem, 4.5vw, 3.6rem);
          font-weight: 800; line-height: 1.08;
          letter-spacing: -0.5px; color: #F8FAFC;
          margin-bottom: 20px;
        }
        .hero-gradient {
          background: linear-gradient(135deg,#60A5FA 0%,#34D399 55%,#FBBF24 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Sous-titre */
        .hero-sub {
          font-size: 16px; line-height: 1.7;
          color: rgba(248,250,252,0.55);
          max-width: 460px; margin-bottom: 32px;
        }

        /* CTA */
        .hero-cta {
          display: inline-flex; align-items: center; gap: 9px;
          padding: 14px 28px; border-radius: 14px;
          background: linear-gradient(135deg,#2563EB,#1D4ED8);
          color: white; font-weight: 700; font-size: 15px;
          text-decoration: none;
          box-shadow: 0 6px 24px rgba(37,99,235,0.48);
          transition: all 0.2s ease; width: fit-content;
          margin-bottom: 32px;
        }
        .hero-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 36px rgba(37,99,235,0.6);
        }

        /* Social proof */
        .hero-proof {
          display: flex; align-items: center; gap: 20px; flex-wrap: wrap;
        }
        .hero-proof-item { text-align: center; }
        .hero-proof-val {
          font-family: var(--font-display, sans-serif);
          font-weight: 800; font-size: 20px; color: #F8FAFC; line-height: 1;
          margin-bottom: 4px;
        }
        .hero-proof-stars { display: flex; gap: 2px; justify-content: center; }
        .hero-proof-label { font-size: 11px; color: rgba(248,250,252,0.38); }
        .hero-proof-sep {
          width: 1px; height: 32px;
          background: rgba(255,255,255,0.1);
        }

        /* MOCKUP */
        .hero-right { position: relative; }
        .mockup-window {
          border-radius: 18px; overflow: hidden;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow:
            0 32px 80px rgba(0,0,0,0.55),
            0 0 0 1px rgba(255,255,255,0.04),
            inset 0 1px 0 rgba(255,255,255,0.06);
        }
        .mockup-chrome {
          padding: 12px 16px;
          background: rgba(255,255,255,0.025);
          border-bottom: 1px solid rgba(255,255,255,0.05);
          display: flex; align-items: center; gap: 12px;
        }
        .mockup-dots { display: flex; gap: 6px; }
        .mockup-url {
          flex: 1; height: 22px; border-radius: 6px;
          background: rgba(255,255,255,0.04);
          display: flex; align-items: center; gap: 7px;
          padding: 0 10px;
        }
        .mockup-url-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: rgba(16,185,129,0.55);
        }
        .mockup-url span {
          font-size: 11px; color: rgba(255,255,255,0.22);
          font-family: monospace;
        }
        .mockup-body {
          padding: 20px;
          background: linear-gradient(180deg,rgba(6,11,20,0.75),rgba(8,15,30,0.88));
        }
        .mockup-kpis {
          display: grid; grid-template-columns: repeat(4,1fr);
          gap: 10px; margin-bottom: 16px;
        }
        .mockup-kpi {
          border-radius: 11px; padding: 12px;
        }
        .mockup-list {
          background: rgba(255,255,255,0.025);
          border-radius: 12px; overflow: hidden;
          border: 1px solid rgba(255,255,255,0.06);
        }
        .mockup-list-header {
          padding: 10px 14px; display: flex; align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          font-size: 11px; font-weight: 700;
          color: rgba(255,255,255,0.35);
          letter-spacing: 0.06em; text-transform: uppercase;
        }
        .mockup-row {
          display: flex; align-items: center; gap: 10px;
          padding: 11px 14px;
        }
        .mockup-row-av {
          width: 32px; height: 32px; border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 800; flex-shrink: 0;
        }
        .mockup-row-info { flex: 1; min-width: 0; }
        .mockup-row-name {
          font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.85);
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .mockup-row-sub { font-size: 10px; color: rgba(255,255,255,0.3); }
        .mockup-row-amount {
          font-size: 12px; font-weight: 700; flex-shrink: 0; text-align: right;
        }

        /* Floating badges */
        .hero-badge-float {
          position: absolute;
          background: rgba(4,18,32,0.92);
          border-radius: 14px; padding: 10px 14px;
          display: flex; align-items: center; gap: 10px;
          backdrop-filter: blur(16px);
          box-shadow: 0 12px 32px rgba(0,0,0,0.45);
        }
        .hero-badge-float-bl {
          bottom: -18px; left: -18px;
          border: 1px solid rgba(16,185,129,0.28);
        }
        .hero-badge-float-tr {
          top: 18px; right: -14px;
          border: 1px solid rgba(59,130,246,0.28);
          font-size: 12px; font-weight: 700; color: #93C5FD;
        }
        .hero-badge-float-icon {
          width: 36px; height: 36px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .hero-badge-float-title {
          font-size: 13px; font-weight: 700; color: #F8FAFC; line-height: 1.2;
        }
        .hero-badge-float-sub {
          font-size: 11px; color: rgba(248,250,252,0.4); margin-top: 2px;
        }

        /* RESPONSIVE */
        @media (max-width: 900px) {
          .hero-inner {
            grid-template-columns: 1fr;
            padding-bottom: 60px;
          }
          .hero-right { margin-top: 0; }
          .hero-badge-float { display: none; }
          .mockup-kpis { grid-template-columns: repeat(2,1fr); }
        }
        @media (max-width: 480px) {
          .hero-title { font-size: 2rem; }
          .hero-sub { font-size: 15px; }
          .hero-cta { width: 100%; justify-content: center; }
          .mockup-kpis { grid-template-columns: repeat(2,1fr); }
        }
      `}</style>
    </section>
  )
}
