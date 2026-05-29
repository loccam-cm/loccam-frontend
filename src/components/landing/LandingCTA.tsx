'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { IconRocket, IconLock } from '@tabler/icons-react'

export default function LandingCTA() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section className="cta-section">
      <div className="cta-bg" />
      <div className="cta-grid" />

      <motion.div ref={ref}
        initial={{ opacity: 0, y: 32 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="cta-inner">

        <div className="cta-badge">
          <IconLock size={13} />
          Aucune carte bancaire requise
        </div>

        <h2 className="cta-title">
          Essayez LocCam<br />
          <span className="cta-gradient">gratuitement !</span>
        </h2>

        <p className="cta-sub">
          Rejoignez 1 200+ bailleurs camerounais. 30 jours d&apos;essai complet, sans engagement.
        </p>

        <div className="cta-actions">
          <Link href="/register" className="cta-btn-primary">
            <IconRocket size={16} />
            Créer mon compte gratuitement
          </Link>
          <Link href="/login" className="cta-btn-ghost">
            Se connecter
          </Link>
        </div>
      </motion.div>

      <style>{`
        .cta-section {
          background: #060B14; padding: 100px 24px;
          position: relative; overflow: hidden;
          border-top: 1px solid rgba(255,255,255,0.06);
        }
        .cta-bg {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse 70% 65% at 50% 50%, rgba(37,99,235,0.14) 0%, transparent 65%);
          pointer-events: none;
        }
        .cta-grid {
          position: absolute; inset: 0;
          background-image: radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 28px 28px; pointer-events: none;
        }
        .cta-inner {
          max-width: 600px; margin: 0 auto; text-align: center;
          position: relative; z-index: 1;
        }
        .cta-badge {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 7px 16px; border-radius: 100px;
          background: rgba(37,99,235,0.1); border: 1px solid rgba(59,130,246,0.22);
          font-size: 12px; font-weight: 600; color: #93C5FD;
          margin-bottom: 28px;
        }
        .cta-title {
          font-family: var(--font-display, sans-serif);
          font-size: clamp(2rem, 5vw, 3.4rem);
          font-weight: 800; line-height: 1.1; letter-spacing: -0.4px;
          color: #F8FAFC; margin-bottom: 18px;
        }
        .cta-gradient {
          background: linear-gradient(135deg,#60A5FA,#34D399);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .cta-sub {
          font-size: 16px; color: rgba(248,250,252,0.5);
          line-height: 1.65; max-width: 380px; margin: 0 auto 36px;
        }
        .cta-actions {
          display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;
        }
        .cta-btn-primary {
          display: flex; align-items: center; gap: 9px;
          padding: 15px 32px; border-radius: 14px;
          background: linear-gradient(135deg,#2563EB,#1D4ED8);
          color: white; font-weight: 700; font-size: 15px;
          text-decoration: none;
          box-shadow: 0 6px 24px rgba(37,99,235,0.5);
          transition: all 0.2s;
        }
        .cta-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 36px rgba(37,99,235,0.6);
        }
        .cta-btn-ghost {
          display: flex; align-items: center;
          padding: 15px 24px; border-radius: 14px;
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.12);
          color: rgba(248,250,252,0.65); font-weight: 600; font-size: 14px;
          text-decoration: none; transition: all 0.2s;
        }
        .cta-btn-ghost:hover {
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.22);
          color: #F8FAFC;
        }
        @media (max-width: 480px) {
          .cta-section { padding: 72px 20px; }
          .cta-btn-primary, .cta-btn-ghost { width: 100%; justify-content: center; }
        }
      `}</style>
    </section>
  )
}
