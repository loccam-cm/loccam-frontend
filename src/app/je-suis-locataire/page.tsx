'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import {
  IconHome2, IconMail, IconCreditCard, IconFileText,
  IconBell, IconMessage, IconArrowRight, IconCheck,
  IconUsers, IconAlertTriangle, IconChevronLeft, IconChevronRight,
} from '@tabler/icons-react'
import LandingNav from '@/components/landing/LandingNav'
import LandingFooter from '@/components/landing/LandingFooter'

const STEPS = [
  {
    num: '01', title: 'Votre bailleur s\'inscrit sur LocCam',
    desc: 'Le propriétaire de votre logement crée un compte bailleur et ajoute votre bien.',
    ico: <IconHome2 size={20} />, color: '#3B82F6',
  },
  {
    num: '02', title: 'Il vous envoie une invitation',
    desc: 'Votre bailleur vous invite par email directement depuis son tableau de bord.',
    ico: <IconMail size={20} />, color: '#10B981',
  },
  {
    num: '03', title: 'Vous créez votre compte locataire',
    desc: 'En cliquant sur le lien d\'invitation, vous créez votre espace en 1 minute.',
    ico: <IconUsers size={20} />, color: '#8B5CF6',
  },
  {
    num: '04', title: 'Vous accédez à toutes les fonctionnalités',
    desc: 'Paiement Mobile Money, quittances PDF, messagerie avec votre bailleur.',
    ico: <IconCreditCard size={20} />, color: '#F59E0B',
  },
]

const LOCATAIRE_FEATURES = [
  {
    ico: <IconCreditCard size={18} />, color: '#10B981', bg: 'rgba(16,185,129,0.1)',
    title: 'Payez votre loyer en 30 secondes',
    desc: 'Orange Money ou MTN Mobile Money — depuis votre téléphone, sans déplacement.',
  },
  {
    ico: <IconFileText size={18} />, color: '#3B82F6', bg: 'rgba(59,130,246,0.1)',
    title: 'Quittances PDF instantanées',
    desc: 'Générées automatiquement après chaque paiement, disponibles à tout moment.',
  },
  {
    ico: <IconBell size={18} />, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)',
    title: 'Rappels avant échéance',
    desc: 'Vous recevez des rappels J-3 et J-7 avant la date limite de paiement.',
  },
  {
    ico: <IconMessage size={18} />, color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)',
    title: 'Messagerie avec votre bailleur',
    desc: 'Signalez une panne, posez une question — tout est tracé et documenté.',
  },
]

const CARDS = [
  {
    id: 'bailleur',
    badge: 'Bailleur — Compte principal',
    badgeBg: 'linear-gradient(135deg,#2563EB,#1D4ED8)',
    badgeColor: 'white',
    border: '1.5px solid rgba(59,130,246,0.3)',
    bg: 'linear-gradient(160deg,rgba(37,99,235,0.12),rgba(29,78,216,0.06))',
    icon: <IconHome2 size={20} style={{ color: '#60A5FA' }} />,
    iconBg: 'rgba(59,130,246,0.15)',
    title: 'Propriétaire bailleur',
    sub: 'Accès complet à LocCam',
    items: [
      'Création de biens et structures',
      'Génération de contrats de bail PDF',
      'Invitations des locataires',
      'Suivi des paiements Mobile Money',
      'Relances automatiques des impayés',
      'Tableau de bord analytique',
      'Validation des CNI locataires',
    ],
    itemColor: '#60A5FA',
    cta: true,
    warning: null,
  },
  {
    id: 'locataire',
    badge: 'Locataire — Accès sur invitation',
    badgeBg: 'rgba(255,255,255,0.1)',
    badgeColor: 'rgba(248,250,252,0.6)',
    border: '1px solid rgba(255,255,255,0.08)',
    bg: 'rgba(255,255,255,0.03)',
    icon: <IconUsers size={20} style={{ color: 'rgba(248,250,252,0.5)' }} />,
    iconBg: 'rgba(255,255,255,0.07)',
    title: 'Locataire',
    sub: 'Accès via invitation bailleur',
    items: [
      'Paiement loyer Mobile Money',
      'Téléchargement des quittances PDF',
      'Consultation du contrat de bail',
      'Messagerie avec le bailleur',
      'Signalement de pannes',
    ],
    itemColor: 'rgba(248,250,252,0.38)',
    cta: false,
    warning: 'Vous ne pouvez pas créer un compte locataire par vous-même. Votre bailleur doit vous inviter depuis son espace LocCam.',
  },
]

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  )
}

// Carrousel swipeable pour mobile
function SwipeCards() {
  const [active, setActive] = useState(0)
  const startX = useRef(0)

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = startX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) {
      if (diff > 0 && active < CARDS.length - 1) setActive(a => a + 1)
      if (diff < 0 && active > 0) setActive(a => a - 1)
    }
  }

  return (
    <div className="swipe-wrap">
      {/* Indicateurs */}
      <div className="swipe-dots">
        {CARDS.map((_, i) => (
          <button key={i} onClick={() => setActive(i)}
            className={`swipe-dot ${active === i ? 'swipe-dot-active' : ''}`} />
        ))}
      </div>

      {/* Flèches */}
      <div className="swipe-arrows">
        <button onClick={() => setActive(a => Math.max(0, a - 1))}
          className="swipe-arrow" disabled={active === 0}>
          <IconChevronLeft size={18} />
        </button>
        <span className="swipe-count">{active + 1} / {CARDS.length}</span>
        <button onClick={() => setActive(a => Math.min(CARDS.length - 1, a + 1))}
          className="swipe-arrow" disabled={active === CARDS.length - 1}>
          <IconChevronRight size={18} />
        </button>
      </div>

      {/* Cards */}
      <div className="swipe-track"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}>
        <motion.div
          className="swipe-slider"
          animate={{ x: `${-active * 100}%` }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
          {CARDS.map(c => (
            <div key={c.id} className="swipe-card">
              <CardContent card={c} />
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}

function CardContent({ card: c }: { card: typeof CARDS[0] }) {
  return (
    <div className="card-inner" style={{ background: c.bg, border: c.border }}>
      <div className="card-badge" style={{ background: c.badgeBg, color: c.badgeColor }}>
        {c.badge}
      </div>
      <div className="card-profile">
        <div className="card-icon" style={{ background: c.iconBg }}>{c.icon}</div>
        <div>
          <div className="card-title">{c.title}</div>
          <div className="card-sub">{c.sub}</div>
        </div>
      </div>
      <div className="card-items">
        {c.items.map(f => (
          <div key={f} className="card-item">
            <div className="card-check" style={{ background: `${c.itemColor}22` }}>
              <IconCheck size={9} style={{ color: c.itemColor }} />
            </div>
            <span className="card-item-text">{f}</span>
          </div>
        ))}
      </div>
      {c.warning && (
        <div className="card-warning">
          <IconAlertTriangle size={13} style={{ color: '#FBBF24', flexShrink: 0, marginTop: 1 }} />
          <span>{c.warning}</span>
        </div>
      )}
      {c.cta && (
        <Link href="/register" className="card-cta">
          <IconArrowRight size={14} />
          M&apos;inscrire comme bailleur
        </Link>
      )}
    </div>
  )
}

export default function JeSuisLocatairePage() {
  return (
    <div style={{ background: '#060B14', minHeight: '100vh', color: '#F8FAFC' }}>
      <LandingNav />

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="jsl-hero">
        <div className="jsl-hero-bg" />
        <div className="jsl-hero-grid" />
        <div className="jsl-hero-inner">
          <motion.div className="jsl-badge"
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}>
            <IconAlertTriangle size={13} style={{ color: '#FBBF24' }} />
            LocCam est principalement conçu pour les bailleurs
          </motion.div>

          <motion.h1 className="jsl-title"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
            Vous êtes locataire ?<br />
            <span className="jsl-gradient">Voici comment accéder à LocCam.</span>
          </motion.h1>

          <motion.p className="jsl-sub"
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.55 }}>
            LocCam est un outil pensé pour les <strong style={{ color: 'rgba(248,250,252,0.9)', fontWeight: 700 }}>propriétaires bailleurs</strong> camerounais. En tant que locataire, vous pouvez y accéder, mais <strong style={{ color: 'rgba(248,250,252,0.9)', fontWeight: 700 }}>uniquement sur invitation de votre bailleur</strong>.
          </motion.p>

          <motion.div className="jsl-hero-actions"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}>
            <Link href="/register" className="jsl-btn-primary">
              <IconHome2 size={15} />
              Je suis bailleur — m&apos;inscrire
            </Link>
            <a href="mailto:contact@loccam.cm" className="jsl-btn-ghost">
              <IconMail size={14} />
              Contacter mon bailleur
            </a>
          </motion.div>
        </div>
      </section>

      {/* ── EXPLICATION ───────────────────────────────────────── */}
      <section className="jsl-section jsl-section-alt">
        <div className="jsl-container">
          <Reveal>
            <div className="jsl-section-header">
              <div className="jsl-bar" />
              <p className="jsl-label">POURQUOI LOCCAM EST RÉSERVÉ AUX BAILLEURS</p>
              <h2 className="jsl-section-title">LocCam, c&apos;est l&apos;outil du propriétaire.</h2>
              <p className="jsl-section-sub">
                LocCam gère le cycle de vie complet d&apos;une location — de la création du contrat au suivi des paiements. Ces responsabilités appartiennent au bailleur. Le locataire bénéficie d&apos;un accès simplifié pour payer son loyer et suivre ses quittances.
              </p>
            </div>
          </Reveal>

          {/* Desktop : 2 colonnes | Mobile : carrousel */}
          <div className="jsl-cards-desktop">
            {CARDS.map((c, i) => (
              <Reveal key={c.id} delay={i * 0.1}>
                <CardContent card={c} />
              </Reveal>
            ))}
          </div>
          <div className="jsl-cards-mobile">
            <SwipeCards />
          </div>
        </div>
      </section>

      {/* ── COMMENT ACCÉDER ───────────────────────────────────── */}
      <section className="jsl-section">
        <div className="jsl-container jsl-container-sm">
          <Reveal>
            <div className="jsl-section-header">
              <div className="jsl-bar" />
              <h2 className="jsl-section-title">Comment accéder à LocCam en tant que locataire ?</h2>
            </div>
          </Reveal>

          <div className="jsl-steps">
            {STEPS.map((s, i) => (
              <Reveal key={s.num} delay={i * 0.09}>
                <div className="jsl-step">
                  {i < STEPS.length - 1 && <div className="jsl-step-line" />}
                  <div className="jsl-step-icon" style={{ background: `${s.color}18`, border: `1.5px solid ${s.color}38`, color: s.color }}>
                    {s.ico}
                  </div>
                  <div className="jsl-step-body">
                    <span className="jsl-step-num" style={{ color: s.color }}>ÉTAPE {s.num}</span>
                    <div className="jsl-step-title">{s.title}</div>
                    <div className="jsl-step-desc">{s.desc}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FONCTIONNALITÉS LOCATAIRE ─────────────────────────── */}
      <section className="jsl-section jsl-section-alt">
        <div className="jsl-container">
          <Reveal>
            <div className="jsl-section-header">
              <h2 className="jsl-section-title">Ce que vous aurez accès en tant que locataire</h2>
              <p className="jsl-section-sub">
                Dès que votre bailleur vous invite, vous disposez d&apos;un espace locataire complet.
              </p>
            </div>
          </Reveal>
          <div className="jsl-features-grid">
            {LOCATAIRE_FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 0.08}>
                <div className="jsl-feature-card">
                  <div className="jsl-feature-icon" style={{ background: f.bg, color: f.color }}>
                    {f.ico}
                  </div>
                  <div>
                    <div className="jsl-feature-title">{f.title}</div>
                    <div className="jsl-feature-desc">{f.desc}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ──────────────────────────────────────────── */}
      <section className="jsl-cta-section">
        <div className="jsl-cta-bg" />
        <Reveal>
          <div className="jsl-cta-inner">
            <h2 className="jsl-cta-title">
              Vous êtes bailleur ?<br />
              <span className="jsl-gradient">Commencez dès maintenant.</span>
            </h2>
            <p className="jsl-cta-sub">
              Inscrivez-vous gratuitement, invitez vos locataires et gérez vos biens en moins de 30 minutes par mois.
            </p>
            <div className="jsl-cta-actions">
              <Link href="/register" className="jsl-btn-primary">
                <IconHome2 size={15} />
                M&apos;inscrire comme bailleur
              </Link>
              <Link href="/landing" className="jsl-btn-ghost">
                En savoir plus
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      <LandingFooter />

      <style>{`
        /* ── Variables & Base ── */
        .jsl-gradient {
          background: linear-gradient(135deg,#60A5FA,#34D399);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* ── Hero ── */
        .jsl-hero {
          padding: 88px 20px 64px; position: relative; overflow: hidden;
          text-align: center;
        }
        .jsl-hero-bg {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse 70% 55% at 50% 40%, rgba(239,68,68,0.07) 0%, transparent 60%),
                      radial-gradient(ellipse 50% 40% at 20% 80%, rgba(37,99,235,0.05) 0%, transparent 55%);
          pointer-events: none;
        }
        .jsl-hero-grid {
          position: absolute; inset: 0;
          background-image: radial-gradient(rgba(255,255,255,0.022) 1px, transparent 1px);
          background-size: 26px 26px; pointer-events: none;
        }
        .jsl-hero-inner {
          max-width: 680px; margin: 0 auto; position: relative;
          display: flex; flex-direction: column; align-items: center; gap: 20px;
        }
        .jsl-badge {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 7px 16px; border-radius: 100px;
          background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.28);
          font-size: 12px; font-weight: 700; color: #FBBF24;
        }
        .jsl-title {
          font-family: var(--font-display, sans-serif);
          font-size: clamp(1.8rem, 5vw, 3rem);
          font-weight: 800; line-height: 1.12; letter-spacing: -0.4px;
          color: #F8FAFC; margin: 0;
        }
        .jsl-sub {
          font-size: clamp(14px, 2.5vw, 16px); line-height: 1.7;
          color: rgba(248,250,252,0.52); max-width: 560px; margin: 0;
        }
        .jsl-hero-actions {
          display: flex; gap: 10px; flex-wrap: wrap; justify-content: center;
        }

        /* Buttons */
        .jsl-btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 12px 24px; border-radius: 13px;
          background: linear-gradient(135deg,#2563EB,#1D4ED8);
          color: white; font-weight: 700; font-size: 14px;
          text-decoration: none;
          box-shadow: 0 5px 18px rgba(37,99,235,0.42);
          transition: all 0.2s;
        }
        .jsl-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 10px 28px rgba(37,99,235,0.55); }
        .jsl-btn-ghost {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 12px 20px; border-radius: 13px;
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.12);
          color: rgba(248,250,252,0.65); font-weight: 600; font-size: 14px;
          text-decoration: none; transition: all 0.2s;
        }
        .jsl-btn-ghost:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.22); }

        /* ── Sections ── */
        .jsl-section { padding: 64px 20px; }
        .jsl-section-alt {
          background: rgba(255,255,255,0.02);
          border-top: 1px solid rgba(255,255,255,0.05);
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .jsl-container { max-width: 900px; margin: 0 auto; }
        .jsl-container-sm { max-width: 700px; }

        .jsl-section-header { text-align: center; margin-bottom: 44px; }
        .jsl-bar {
          width: 36px; height: 3px; border-radius: 2px;
          background: linear-gradient(90deg,#2563EB,#10B981);
          margin: 0 auto 12px;
        }
        .jsl-label {
          font-size: 10px; font-weight: 700; letter-spacing: 0.14em;
          color: #60A5FA; text-transform: uppercase; margin-bottom: 10px;
        }
        .jsl-section-title {
          font-family: var(--font-display, sans-serif);
          font-size: clamp(1.5rem, 4vw, 2.3rem);
          font-weight: 800; line-height: 1.12; letter-spacing: -0.3px;
          color: #F8FAFC; margin-bottom: 12px;
        }
        .jsl-section-sub {
          font-size: 15px; color: rgba(248,250,252,0.48);
          line-height: 1.7; max-width: 540px; margin: 0 auto;
        }

        /* ── Cards desktop ── */
        .jsl-cards-desktop {
          display: grid; grid-template-columns: 1fr 1fr; gap: 18px;
        }
        .jsl-cards-mobile { display: none; }

        /* Card content */
        .card-inner {
          border-radius: 18px; padding: 24px;
          position: relative; height: 100%;
          display: flex; flex-direction: column; gap: 0;
        }
        .card-badge {
          display: inline-block; padding: 4px 12px; border-radius: 100px;
          font-size: 10px; font-weight: 700; margin-bottom: 18px; width: fit-content;
        }
        .card-profile {
          display: flex; align-items: center; gap: 12px; margin-bottom: 18px;
        }
        .card-icon {
          width: 40px; height: 40px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .card-title {
          font-family: var(--font-display, sans-serif);
          font-weight: 800; font-size: 15px; color: #F8FAFC; margin-bottom: 3px;
        }
        .card-sub { font-size: 12px; color: rgba(248,250,252,0.38); }
        .card-items { display: flex; flex-direction: column; gap: 9px; flex: 1; }
        .card-item { display: flex; align-items: center; gap: 10px; }
        .card-check {
          width: 17px; height: 17px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .card-item-text { font-size: 13px; color: rgba(248,250,252,0.72); }
        .card-warning {
          display: flex; align-items: flex-start; gap: 8px;
          margin-top: 14px; padding: 11px 13px; border-radius: 10px;
          background: rgba(245,158,11,0.08); border: 1px solid rgba(245,158,11,0.2);
          font-size: 12px; color: rgba(248,250,252,0.52); line-height: 1.6;
        }
        .card-cta {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          margin-top: 18px; padding: 12px; border-radius: 12px;
          background: linear-gradient(135deg,#2563EB,#1D4ED8);
          color: white; font-weight: 700; font-size: 14px; text-decoration: none;
          box-shadow: 0 4px 14px rgba(37,99,235,0.38);
          transition: all 0.2s;
        }
        .card-cta:hover { transform: translateY(-1px); box-shadow: 0 8px 22px rgba(37,99,235,0.5); }

        /* ── Carrousel mobile ── */
        .swipe-wrap { display: flex; flex-direction: column; gap: 14px; }
        .swipe-dots { display: flex; justify-content: center; gap: 7px; }
        .swipe-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: rgba(255,255,255,0.2); border: none; cursor: pointer; padding: 0;
          transition: all 0.2s;
        }
        .swipe-dot-active { background: #60A5FA; width: 20px; border-radius: 4px; }
        .swipe-arrows {
          display: flex; align-items: center; justify-content: center; gap: 16px;
        }
        .swipe-arrow {
          width: 36px; height: 36px; border-radius: 10px;
          background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.1);
          color: rgba(248,250,252,0.7); cursor: pointer; display: flex;
          align-items: center; justify-content: center; transition: all 0.2s;
        }
        .swipe-arrow:hover:not(:disabled) { background: rgba(255,255,255,0.12); }
        .swipe-arrow:disabled { opacity: 0.3; cursor: not-allowed; }
        .swipe-count { font-size: 13px; font-weight: 600; color: rgba(248,250,252,0.45); }
        .swipe-track { overflow: hidden; border-radius: 18px; }
        .swipe-slider { display: flex; width: 100%; }
        .swipe-card { width: 100%; flex-shrink: 0; }

        /* ── Steps ── */
        .jsl-steps { display: flex; flex-direction: column; }
        .jsl-step {
          display: flex; gap: 18px; padding-bottom: 28px; position: relative;
        }
        .jsl-step-line {
          position: absolute; left: 21px; top: 44px;
          width: 2px; height: calc(100% - 44px);
          background: linear-gradient(to bottom, rgba(255,255,255,0.12), rgba(255,255,255,0.01));
        }
        .jsl-step-icon {
          width: 44px; height: 44px; border-radius: 13px;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .jsl-step-body { padding-top: 8px; }
        .jsl-step-num {
          font-size: 10px; font-weight: 800; letter-spacing: 0.09em; display: block; margin-bottom: 5px;
        }
        .jsl-step-title {
          font-family: var(--font-display, sans-serif);
          font-weight: 700; font-size: 15px; color: #F8FAFC; margin-bottom: 5px;
        }
        .jsl-step-desc { font-size: 13px; color: rgba(248,250,252,0.48); line-height: 1.65; }

        /* ── Features ── */
        .jsl-features-grid {
          display: grid; grid-template-columns: repeat(2,1fr); gap: 14px;
        }
        .jsl-feature-card {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px; padding: 20px; display: flex; gap: 14px;
          align-items: flex-start; transition: all 0.2s;
        }
        .jsl-feature-card:hover { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.12); }
        .jsl-feature-icon {
          width: 40px; height: 40px; border-radius: 11px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
        }
        .jsl-feature-title {
          font-family: var(--font-display, sans-serif);
          font-weight: 700; font-size: 14px; color: #F8FAFC; margin-bottom: 5px;
        }
        .jsl-feature-desc { font-size: 12px; color: rgba(248,250,252,0.43); line-height: 1.6; }

        /* ── CTA final ── */
        .jsl-cta-section {
          padding: 72px 20px; position: relative; overflow: hidden; text-align: center;
        }
        .jsl-cta-bg {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse 65% 60% at 50% 50%, rgba(37,99,235,0.1), transparent 65%);
          pointer-events: none;
        }
        .jsl-cta-inner { max-width: 560px; margin: 0 auto; position: relative; }
        .jsl-cta-title {
          font-family: var(--font-display, sans-serif);
          font-size: clamp(1.6rem, 4vw, 2.5rem);
          font-weight: 800; line-height: 1.12; letter-spacing: -0.3px;
          color: #F8FAFC; margin-bottom: 14px;
        }
        .jsl-cta-sub {
          font-size: 15px; color: rgba(248,250,252,0.45);
          line-height: 1.65; max-width: 380px; margin: 0 auto 28px;
        }
        .jsl-cta-actions {
          display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 720px) {
          .jsl-cards-desktop { display: none; }
          .jsl-cards-mobile { display: block; }
          .jsl-features-grid { grid-template-columns: 1fr; }
          .jsl-section { padding: 52px 18px; }
          .jsl-hero { padding: 80px 18px 52px; }
        }
        @media (max-width: 480px) {
          .jsl-title { font-size: 1.75rem; }
          .jsl-btn-primary, .jsl-btn-ghost { width: 100%; justify-content: center; }
          .jsl-hero-actions { flex-direction: column; width: 100%; }
          .jsl-cta-actions { flex-direction: column; }
          .jsl-cta-actions .jsl-btn-primary,
          .jsl-cta-actions .jsl-btn-ghost { width: 100%; justify-content: center; }
        }
      `}</style>
    </div>
  )
}
