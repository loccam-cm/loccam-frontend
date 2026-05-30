'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  IconHome2, IconMail, IconCreditCard, IconFileText,
  IconBell, IconMessage, IconArrowRight, IconCheck,
  IconUsers, IconAlertTriangle,
} from '@tabler/icons-react'
import LandingNav from '@/components/landing/LandingNav'
import LandingFooter from '@/components/landing/LandingFooter'

const STEPS = [
  {
    num: '01',
    title: 'Votre bailleur s\'inscrit sur LocCam',
    desc: 'Le propriétaire de votre logement crée un compte bailleur et ajoute votre bien.',
    ico: <IconHome2 size={20} />, color: '#3B82F6',
  },
  {
    num: '02',
    title: 'Il vous envoie une invitation',
    desc: 'Votre bailleur vous invite par email directement depuis son tableau de bord LocCam.',
    ico: <IconMail size={20} />, color: '#10B981',
  },
  {
    num: '03',
    title: 'Vous créez votre compte locataire',
    desc: 'En cliquant sur le lien d\'invitation, vous créez votre espace locataire en 1 minute.',
    ico: <IconUsers size={20} />, color: '#8B5CF6',
  },
  {
    num: '04',
    title: 'Vous accédez à toutes les fonctionnalités',
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

export default function JeSuisLocatairePage() {
  return (
    <div style={{ background: '#060B14', minHeight: '100vh', color: '#F8FAFC' }}>
      <LandingNav />

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section style={{ paddingTop: '100px', paddingBottom: '80px', padding: '100px 24px 80px', position: 'relative', overflow: 'hidden' }}>
        {/* Bg */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 55% at 50% 40%, rgba(239,68,68,0.08) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 20% 80%, rgba(37,99,235,0.06) 0%, transparent 55%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize: '28px 28px', pointerEvents: 'none' }} />

        <div style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center', position: 'relative' }}>

          {/* Alerte */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 18px', borderRadius: '100px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', marginBottom: '28px' }}>
            <IconAlertTriangle size={14} style={{ color: '#FBBF24' }} />
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#FBBF24' }}>
              LocCam est principalement conçu pour les bailleurs
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            style={{ fontFamily: 'var(--font-display, sans-serif)', fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.4px', marginBottom: '20px' }}>
            Vous êtes locataire ?<br />
            <span style={{ background: 'linear-gradient(135deg,#60A5FA,#34D399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Voici comment accéder à LocCam.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            style={{ fontSize: '17px', lineHeight: 1.7, color: 'rgba(248,250,252,0.55)', marginBottom: '36px' }}>
            LocCam est un outil pensé pour les <strong style={{ color: 'rgba(248,250,252,0.85)', fontWeight: 700 }}>propriétaires bailleurs</strong> camerounais. En tant que locataire, vous pouvez y accéder, mais <strong style={{ color: 'rgba(248,250,252,0.85)', fontWeight: 700 }}>uniquement sur invitation de votre bailleur</strong>.
          </motion.p>

          {/* Action principale */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '13px 28px', borderRadius: '14px', background: 'linear-gradient(135deg,#2563EB,#1D4ED8)', color: 'white', fontWeight: 700, fontSize: '15px', textDecoration: 'none', boxShadow: '0 6px 22px rgba(37,99,235,0.45)' }}>
              <IconHome2 size={16} />
              Je suis bailleur — m&apos;inscrire
            </Link>
            <a href="mailto:contact@loccam.cm"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '13px 24px', borderRadius: '14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(248,250,252,0.7)', fontWeight: 600, fontSize: '14px', textDecoration: 'none' }}>
              <IconMail size={15} />
              Contacter mon bailleur
            </a>
          </motion.div>
        </div>
      </section>

      {/* ── EXPLICATION ───────────────────────────────────────── */}
      <section style={{ background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '80px 24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>

          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <div style={{ width: '40px', height: '3px', borderRadius: '2px', background: 'linear-gradient(90deg,#2563EB,#10B981)', margin: '0 auto 14px' }} />
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em', color: '#60A5FA', textTransform: 'uppercase', marginBottom: '12px' }}>POURQUOI LocCam EST RÉSERVÉ AUX BAILLEURS</p>
            <h2 style={{ fontFamily: 'var(--font-display, sans-serif)', fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.3px', marginBottom: '14px' }}>
              LocCam, c&apos;est l&apos;outil du propriétaire.
            </h2>
            <p style={{ fontSize: '16px', color: 'rgba(248,250,252,0.5)', lineHeight: 1.7, maxWidth: '560px', margin: '0 auto' }}>
              LocCam gère le cycle de vie complet d&apos;une location — de la création du contrat au suivi des paiements. Ces responsabilités appartiennent au bailleur. Le locataire, lui, bénéficie d&apos;un accès simplifié pour payer son loyer et suivre ses quittances.
            </p>
          </div>

          {/* Comparaison bailleur vs locataire */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

            {/* Bailleur */}
            <div style={{ background: 'linear-gradient(160deg,rgba(37,99,235,0.12),rgba(29,78,216,0.06))', border: '1.5px solid rgba(59,130,246,0.25)', borderRadius: '20px', padding: '28px', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '-12px', left: '20px', padding: '4px 14px', borderRadius: '100px', background: 'linear-gradient(135deg,#2563EB,#1D4ED8)', fontSize: '11px', fontWeight: 700, color: 'white' }}>
                Bailleur — Compte principal
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', marginTop: '8px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IconHome2 size={20} style={{ color: '#60A5FA' }} />
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-display, sans-serif)', fontWeight: 800, fontSize: '16px', color: '#F8FAFC' }}>Propriétaire bailleur</div>
                  <div style={{ fontSize: '12px', color: 'rgba(248,250,252,0.4)' }}>Accès complet à LocCam</div>
                </div>
              </div>
              {[
                'Création de biens et structures',
                'Génération de contrats de bail PDF',
                'Invitations des locataires',
                'Suivi des paiements Mobile Money',
                'Relances automatiques des impayés',
                'Tableau de bord analytique',
                'Validation des CNI locataires',
              ].map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'rgba(37,99,235,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <IconCheck size={10} style={{ color: '#60A5FA' }} />
                  </div>
                  <span style={{ fontSize: '13px', color: 'rgba(248,250,252,0.75)' }}>{f}</span>
                </div>
              ))}
              <Link href="/register"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '20px', padding: '12px', borderRadius: '12px', background: 'linear-gradient(135deg,#2563EB,#1D4ED8)', color: 'white', fontWeight: 700, fontSize: '14px', textDecoration: 'none', boxShadow: '0 4px 14px rgba(37,99,235,0.4)' }}>
                <IconArrowRight size={15} />
                M&apos;inscrire comme bailleur
              </Link>
            </div>

            {/* Locataire */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '28px', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '-12px', left: '20px', padding: '4px 14px', borderRadius: '100px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', fontSize: '11px', fontWeight: 700, color: 'rgba(248,250,252,0.6)' }}>
                Locataire — Accès sur invitation
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', marginTop: '8px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IconUsers size={20} style={{ color: 'rgba(248,250,252,0.5)' }} />
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-display, sans-serif)', fontWeight: 800, fontSize: '16px', color: '#F8FAFC' }}>Locataire</div>
                  <div style={{ fontSize: '12px', color: 'rgba(248,250,252,0.4)' }}>Accès via invitation bailleur</div>
                </div>
              </div>
              {[
                'Paiement loyer Mobile Money',
                'Téléchargement des quittances PDF',
                'Consultation du contrat de bail',
                'Messagerie avec le bailleur',
                'Signalement de pannes',
              ].map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <IconCheck size={10} style={{ color: 'rgba(248,250,252,0.4)' }} />
                  </div>
                  <span style={{ fontSize: '13px', color: 'rgba(248,250,252,0.55)' }}>{f}</span>
                </div>
              ))}
              {/* Pas d'auto-inscription */}
              <div style={{ marginTop: '16px', padding: '12px', borderRadius: '10px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', fontSize: '12px', color: 'rgba(248,250,252,0.55)', lineHeight: 1.6 }}>
                <strong style={{ color: '#FBBF24' }}>⚠️ Important :</strong> Vous ne pouvez pas créer un compte locataire par vous-même. Votre bailleur doit vous inviter depuis son espace LocCam.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── COMMENT ACCÉDER ───────────────────────────────────── */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{ width: '40px', height: '3px', borderRadius: '2px', background: 'linear-gradient(90deg,#2563EB,#10B981)', margin: '0 auto 14px' }} />
            <h2 style={{ fontFamily: 'var(--font-display, sans-serif)', fontSize: 'clamp(1.7rem, 3vw, 2.3rem)', fontWeight: 800, letterSpacing: '-0.3px' }}>
              Comment accéder à LocCam en tant que locataire ?
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {STEPS.map((s, i) => (
              <div key={s.num} style={{ display: 'flex', gap: '20px', paddingBottom: '32px', position: 'relative' }}>
                {/* Ligne verticale */}
                {i < STEPS.length - 1 && (
                  <div style={{ position: 'absolute', left: '22px', top: '44px', width: '2px', height: 'calc(100% - 44px)', background: 'linear-gradient(to bottom, rgba(255,255,255,0.15), rgba(255,255,255,0.02))' }} />
                )}
                {/* Numéro */}
                <div style={{ width: '44px', height: '44px', borderRadius: '13px', background: `${s.color}20`, border: `1.5px solid ${s.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: s.color }}>
                  {s.ico}
                </div>
                <div style={{ paddingTop: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: s.color, letterSpacing: '0.08em' }}>ÉTAPE {s.num}</span>
                  </div>
                  <div style={{ fontFamily: 'var(--font-display, sans-serif)', fontWeight: 700, fontSize: '16px', color: '#F8FAFC', marginBottom: '6px' }}>{s.title}</div>
                  <div style={{ fontSize: '14px', color: 'rgba(248,250,252,0.5)', lineHeight: 1.65 }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FONCTIONNALITÉS LOCATAIRE ─────────────────────────── */}
      <section style={{ background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '80px 24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontFamily: 'var(--font-display, sans-serif)', fontSize: 'clamp(1.7rem, 3vw, 2.3rem)', fontWeight: 800, letterSpacing: '-0.3px', marginBottom: '12px' }}>
              Ce que vous aurez accès en tant que locataire
            </h2>
            <p style={{ fontSize: '15px', color: 'rgba(248,250,252,0.45)', maxWidth: '500px', margin: '0 auto' }}>
              Dès que votre bailleur vous invite, vous disposez d&apos;un espace locataire complet.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            {LOCATAIRE_FEATURES.map(f => (
              <div key={f.title} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '18px', padding: '24px', display: 'flex', gap: '16px', alignItems: 'flex-start', transition: 'all 0.2s' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: f.color, flexShrink: 0 }}>
                  {f.ico}
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-display, sans-serif)', fontWeight: 700, fontSize: '15px', color: '#F8FAFC', marginBottom: '6px' }}>{f.title}</div>
                  <div style={{ fontSize: '13px', color: 'rgba(248,250,252,0.45)', lineHeight: 1.6 }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ──────────────────────────────────────────── */}
      <section style={{ padding: '80px 24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 65% 60% at 50% 50%, rgba(37,99,235,0.1), transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <h2 style={{ fontFamily: 'var(--font-display, sans-serif)', fontSize: 'clamp(1.7rem, 4vw, 2.6rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.3px', marginBottom: '16px' }}>
            Vous êtes bailleur ?<br />
            <span style={{ background: 'linear-gradient(135deg,#60A5FA,#34D399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Commencez dès maintenant.
            </span>
          </h2>
          <p style={{ fontSize: '15px', color: 'rgba(248,250,252,0.45)', lineHeight: 1.65, marginBottom: '32px', maxWidth: '400px', margin: '0 auto 32px' }}>
            Inscrivez-vous gratuitement, invitez vos locataires et gérez vos biens en moins de 30 minutes par mois.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register"
              style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '14px 28px', borderRadius: '14px', background: 'linear-gradient(135deg,#2563EB,#1D4ED8)', color: 'white', fontWeight: 700, fontSize: '15px', textDecoration: 'none', boxShadow: '0 6px 22px rgba(37,99,235,0.45)' }}>
              <IconHome2 size={16} />
              M&apos;inscrire comme bailleur
            </Link>
            <Link href="/landing"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 22px', borderRadius: '14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(248,250,252,0.65)', fontWeight: 600, fontSize: '14px', textDecoration: 'none' }}>
              En savoir plus
            </Link>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  )
}
