'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import api from '@/lib/api'
import { AuthResponse } from '@/types'
import {
  IconBuilding, IconMail, IconLock, IconEye, IconEyeOff,
  IconArrowRight, IconShieldCheck, IconHome2, IconUsers,
  IconCreditCard, IconCircleCheck, IconTrendingUp,
  IconMapPin, IconAlertCircle,
} from '@tabler/icons-react'

// ── Données mockup ──────────────────────────────────────────
const PAIEMENTS = [
  { n: 'Mbida Jean',  b: 'Studio 101',   m: 'Orange Money', v: '85 000',  ok: true,  delay: 0    },
  { n: 'Ngo Marie',   b: 'F3 Mvog-Mbi',  m: 'MTN Money',    v: '150 000', ok: true,  delay: 0.15 },
  { n: 'Bello Eric',  b: 'Boutique RDC', m: 'Impayé · J+7', v: '95 000',  ok: false, delay: 0.3  },
]

const KPIS = [
  { l: 'Biens',     v: '24',   c: '#60A5FA', bg: 'rgba(59,130,246,0.12)',  ico: <IconHome2 size={13}/> },
  { l: 'Taux occ.', v: '87%',  c: '#34D399', bg: 'rgba(16,185,129,0.12)', ico: <IconTrendingUp size={13}/> },
  { l: 'Revenus',   v: '1.8M', c: '#FBBF24', bg: 'rgba(245,158,11,0.12)', ico: <IconCreditCard size={13}/> },
  { l: 'Impayés',   v: '3',    c: '#F87171', bg: 'rgba(239,68,68,0.12)',   ico: <IconAlertCircle size={13}/> },
]

// ── Composant panel gauche ──────────────────────────────────
function LeftPanel() {
  return (
    <div className="lp-left">
      {/* Fond animé */}
      <div className="lp-left-bg" />
      <div className="lp-left-grid" />
      <motion.div className="lp-orb lp-orb-1"
        animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.3, 0.2] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} />
      <motion.div className="lp-orb lp-orb-2"
        animate={{ scale: [1, 1.1, 1], opacity: [0.12, 0.2, 0.12] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }} />

      <div className="lp-left-inner">
        {/* Logo */}
        <Link href="/landing" className="rg-logo">
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="lp-logo">
          <div className="lp-logo-icon">
            <IconBuilding size={18} color="white" />
          </div>
          <div>
            
                <div className="lp-logo-name">LocCam</div>
                <div className="lp-logo-sub">Gestion locative camerounaise</div>
          
          </div>
        </motion.div>
        </Link>

        {/* Hero text */}
        <div className="lp-hero">
          <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="lp-location-tag">
            <IconMapPin size={13} />
            <span>Douala · Yaoundé · Cameroun</span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="lp-hero-title">
            La gestion locative<br />
            <span className="lp-hero-accent">simplifiée</span> au Cameroun
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6 }}
            className="lp-hero-sub">
            Gérez vos biens, invitez vos locataires et encaissez vos loyers via Orange Money et MTN Money — tout en un seul endroit.
          </motion.p>
        </div>

        {/* Dashboard mockup */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="lp-mockup">

          {/* Header mockup */}
          <div className="lp-mockup-header">
            <div className="lp-mockup-profile">
              <div className="lp-mockup-av">KV</div>
              <div>
                <div className="lp-mockup-name">Kenmatio Vicens</div>
                <div className="lp-mockup-role">Bailleur · Douala</div>
              </div>
            </div>
            <div className="lp-cni-badge">
              <IconShieldCheck size={11} />
              CNI validée
            </div>
          </div>

          {/* KPIs */}
          <div className="lp-kpis">
            {KPIS.map((k, i) => (
              <motion.div key={k.l}
                initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.55 + i * 0.07, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="lp-kpi" style={{ background: k.bg, border: `1px solid ${k.c}22` }}>
                <div className="lp-kpi-top">
                  <span style={{ color: k.c }}>{k.ico}</span>
                  <span className="lp-kpi-label">{k.l}</span>
                </div>
                <div className="lp-kpi-val" style={{ color: k.c }}>{k.v}</div>
              </motion.div>
            ))}
          </div>

          {/* Liste paiements */}
          <div className="lp-list">
            <div className="lp-list-header">
              <span>Paiements récents</span>
              <span className="lp-list-more">Voir tout</span>
            </div>
            {PAIEMENTS.map((r, i) => (
              <motion.div key={r.n}
                initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + r.delay, duration: 0.45 }}
                className="lp-row" style={{ borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                <div className="lp-row-av" style={{ background: r.ok ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: r.ok ? '#34D399' : '#F87171' }}>
                  {r.n[0]}
                </div>
                <div className="lp-row-info">
                  <div className="lp-row-name">{r.n}</div>
                  <div className="lp-row-sub">{r.b} · {r.m}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="lp-row-amount" style={{ color: r.ok ? '#34D399' : '#F87171' }}>{r.v} XAF</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'flex-end', marginTop: 2 }}>
                    {r.ok
                      ? <><IconCircleCheck size={9} style={{ color: '#34D399' }} /><span style={{ fontSize: 9, color: '#34D399' }}>Confirmé</span></>
                      : <span style={{ fontSize: 9, color: '#F87171' }}>En retard</span>}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Skyline */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="lp-skyline">
          {[30,22,48,18,55,38,44,26,42,32,36,20,50,28,40].map((h, i) => (
            <motion.div key={i} className="lp-skyline-bar"
              initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
              transition={{ delay: 0.9 + i * 0.04, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              style={{ height: `${h}px` }} />
          ))}
        </motion.div>
      </div>
    </div>
  )
}

// ── Page principale ─────────────────────────────────────────
export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [focusEmail, setFocusEmail] = useState(false)
  const [focusPass, setFocusPass]   = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.post<AuthResponse>('/auth/connexion/', { email, password })
      localStorage.setItem('access_token',  res.data.access_token)
      localStorage.setItem('refresh_token', res.data.refresh_token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      toast.success(`Bienvenue, ${res.data.user.prenom} !`)
      switch (res.data.user.role) {
        case 'bailleur':  router.push('/bailleur');  break
        case 'locataire': router.push('/locataire'); break
        case 'admin':     router.push('/admin');     break
      }
    } catch {
      toast.error('Email ou mot de passe incorrect.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="lp-root">
        <LeftPanel />

        {/* ── PANNEAU DROIT — FORMULAIRE ──────────────────── */}
        <motion.div className="lp-right"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}>

          <div className="lp-form-wrap">

            {/* Header */}
            <div className="lp-form-header">
              <Link href="/landing" className="rg-logo">
              <div className="rg-logo-icon"><IconBuilding size={15} color="white" /></div>
              <div>
                <div className="rg-logo-name">LocCam</div>
                <div className="rg-logo-sub">Gestion locative camerounaise</div>
              </div>
            </Link>
            <div className="mb-10"></div>
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="lp-form-secure">
                <IconShieldCheck size={12} />
                Espace sécurisé
              </motion.div>

              <motion.h2 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.38, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="lp-form-title">
                Bon retour
              </motion.h2>

              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: 0.46, duration: 0.5 }}
                className="lp-form-sub">
                Connectez-vous à votre espace LocCam.{' '}
                <Link href="/register" className="lp-link">S&apos;inscrire</Link>
              </motion.p>
            </div>

            {/* Formulaire */}
            <motion.form onSubmit={handleSubmit} className="lp-form"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.55 }}>

              {/* Email */}
              <div className="lp-field">
                <label className="lp-label">
                  Adresse email <span className="lp-req">*</span>
                </label>
                <div className="lp-input-wrap" style={{ borderColor: focusEmail ? '#1A3C5E' : '#E2E8F0' }}>
                  <IconMail size={16} className="lp-input-icon"
                    style={{ color: focusEmail ? '#1A3C5E' : '#94A3B8' }} />
                  <input type="email" required value={email}
                    onChange={e => setEmail(e.target.value)}
                    onFocus={() => setFocusEmail(true)}
                    onBlur={() => setFocusEmail(false)}
                    placeholder="votre@email.cm"
                    className="lp-input" />
                </div>
              </div>

              {/* Mot de passe */}
              <div className="lp-field">
                <div className="lp-label-row">
                  <label className="lp-label">
                    Mot de passe <span className="lp-req">*</span>
                  </label>
                  <Link href="/forgot-password" className="lp-forgot">
                    Mot de passe oublié ?
                  </Link>
                </div>
                <div className="lp-input-wrap" style={{ borderColor: focusPass ? '#1A3C5E' : '#E2E8F0' }}>
                  <IconLock size={16} className="lp-input-icon"
                    style={{ color: focusPass ? '#1A3C5E' : '#94A3B8' }} />
                  <input type={showPass ? 'text' : 'password'} required value={password}
                    onChange={e => setPassword(e.target.value)}
                    onFocus={() => setFocusPass(true)}
                    onBlur={() => setFocusPass(false)}
                    placeholder="••••••••"
                    className="lp-input lp-input-pass" />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="lp-eye-btn">
                    <AnimatePresence mode="wait">
                      <motion.div key={showPass ? 'eye' : 'eyeoff'}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.15 }}>
                        {showPass ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                      </motion.div>
                    </AnimatePresence>
                  </button>
                </div>
              </div>

              {/* Se souvenir */}
              <label className="lp-remember">
                <input type="checkbox" className="lp-checkbox" />
                <span>Se souvenir de moi</span>
              </label>

              {/* Submit */}
              <motion.button type="submit" disabled={loading}
                whileHover={loading ? {} : { scale: 1.01 }}
                whileTap={loading ? {} : { scale: 0.99 }}
                className="lp-submit">
                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.div key="loading"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="lp-submit-loading">
                      <div className="lp-spinner" />
                      Connexion...
                    </motion.div>
                  ) : (
                    <motion.div key="idle"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="lp-submit-idle">
                      Se connecter
                      <IconArrowRight size={16} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Divider */}
              <div className="lp-divider">
                <div className="lp-divider-line" />
                <span className="lp-divider-text">ou continuer avec</span>
                <div className="lp-divider-line" />
              </div>

              {/* OAuth */}
              <div className="lp-oauth">
                <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="lp-oauth-btn">
                  <svg viewBox="0 0 24 24" width="17" height="17">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Google
                </motion.button>
                <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="lp-oauth-btn">
                  <svg viewBox="0 0 24 24" width="17" height="17">
                    <circle cx="12" cy="12" r="10" fill="#1877F2"/>
                    <path d="M16.5 8H14c-.3 0-.5.2-.5.5V10H16l-.4 2H13.5v6h-2.5v-6H9V10h2V8.5C11 6.6 12.2 5.5 14 5.5c.8 0 1.7.1 2.5.2V8z" fill="white"/>
                  </svg>
                  Facebook
                </motion.button>
              </div>
            </motion.form>

            {/* Footer */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="lp-form-footer">
              <div className="lp-form-footer-links">
                {['Confidentialité', 'Conditions', 'Contact', 'Aide'].map(l => (
                  <a key={l} href="#" className="lp-footer-link">{l}</a>
                ))}
              </div>
              <div className="lp-footer-copy">© 2026 LocCam</div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <style>{`
        /* ── Root ── */
        .lp-root {
          min-height: 100vh; display: flex;
          font-family: 'Plus Jakarta Sans', sans-serif;
          background: #060B14;
        }

        /* ══ PANNEAU GAUCHE ══ */
        .lp-left {
          flex: 1; position: relative; overflow: hidden;
          display: flex; align-items: stretch;
        }
        .lp-left-bg {
          position: absolute; inset: 0;
          background: linear-gradient(160deg,#0A1628 0%,#0F2438 40%,#0D1F38 70%,#091422 100%);
        }
        .lp-left-grid {
          position: absolute; inset: 0;
          background-image: radial-gradient(rgba(255,255,255,0.028) 1px, transparent 1px);
          background-size: 26px 26px;
        }
        .lp-orb {
          position: absolute; border-radius: 50%; filter: blur(64px);
        }
        .lp-orb-1 {
          top: -10%; right: -5%; width: 480px; height: 480px;
          background: radial-gradient(circle, rgba(37,99,235,0.22), transparent 70%);
        }
        .lp-orb-2 {
          bottom: -5%; left: -8%; width: 380px; height: 380px;
          background: radial-gradient(circle, rgba(16,185,129,0.15), transparent 70%);
        }
        .lp-left-inner {
          position: relative; z-index: 1; width: 100%;
          padding: 40px 48px 36px;
          display: flex; flex-direction: column; gap: 32px;
        }

        /* Logo */
        .lp-logo {
          display: flex; align-items: center; gap: 12px;
        }
        .lp-logo-icon {
          width: 40px; height: 40px; border-radius: 12px;
          background: linear-gradient(135deg,#2563EB,#1D4ED8);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 6px 20px rgba(37,99,235,0.5);
          flex-shrink: 0;
        }
        .lp-logo-name {
          font-weight: 800; font-size: 20px; color: #F8FAFC;
          letter-spacing: -0.3px; line-height: 1.1;
        }
        .lp-logo-sub { font-size: 11px; color: rgba(248,250,252,0.38); margin-top: 2px; }

        /* Hero */
        .lp-hero { flex: 0; }
        .lp-location-tag {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 12px; font-weight: 500; color: rgba(248,250,252,0.5);
          margin-bottom: 14px;
        }
        .lp-hero-title {
          font-weight: 800; font-size: clamp(1.6rem, 2.8vw, 2.4rem);
          color: #F8FAFC; line-height: 1.12; letter-spacing: -0.4px;
          margin-bottom: 12px;
        }
        .lp-hero-accent { color: rgba(248,250,252,0.42); }
        .lp-hero-sub {
          font-size: 14px; color: rgba(248,250,252,0.48);
          line-height: 1.7; max-width: 440px;
        }

        /* Mockup */
        .lp-mockup {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 18px; overflow: hidden;
          box-shadow: 0 24px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04);
        }
        .lp-mockup-header {
          padding: 14px 16px; background: rgba(255,255,255,0.03);
          border-bottom: 1px solid rgba(255,255,255,0.05);
          display: flex; align-items: center; justify-content: space-between;
        }
        .lp-mockup-profile { display: flex; align-items: center; gap: 10px; }
        .lp-mockup-av {
          width: 32px; height: 32px; border-radius: 10px;
          background: linear-gradient(135deg,#2563EB,#1D4ED8);
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 800; color: white; flex-shrink: 0;
        }
        .lp-mockup-name { font-size: 13px; font-weight: 700; color: rgba(255,255,255,0.88); }
        .lp-mockup-role { font-size: 10px; color: rgba(255,255,255,0.35); margin-top: 1px; }
        .lp-cni-badge {
          display: flex; align-items: center; gap: 5px;
          padding: 4px 10px; border-radius: 100px;
          background: rgba(16,185,129,0.12); border: 1px solid rgba(16,185,129,0.25);
          font-size: 10px; font-weight: 700; color: #34D399;
        }

        /* KPIs */
        .lp-kpis {
          display: grid; grid-template-columns: repeat(4,1fr);
          gap: 8px; padding: 14px;
        }
        .lp-kpi { border-radius: 10px; padding: 11px; }
        .lp-kpi-top {
          display: flex; align-items: center; gap: 5px; margin-bottom: 7px;
        }
        .lp-kpi-label { font-size: 10px; color: rgba(255,255,255,0.38); font-weight: 500; }
        .lp-kpi-val {
          font-weight: 800; font-size: 16px; line-height: 1;
        }

        /* Liste */
        .lp-list {
          background: rgba(255,255,255,0.02);
          border-top: 1px solid rgba(255,255,255,0.04);
        }
        .lp-list-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 10px 14px; border-bottom: 1px solid rgba(255,255,255,0.04);
          font-size: 10px; font-weight: 700;
          color: rgba(255,255,255,0.3); letter-spacing: 0.07em; text-transform: uppercase;
        }
        .lp-list-more { color: #60A5FA; font-weight: 600; font-size: 10px; }
        .lp-row {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 14px;
        }
        .lp-row-av {
          width: 30px; height: 30px; border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 800; flex-shrink: 0;
        }
        .lp-row-info { flex: 1; min-width: 0; }
        .lp-row-name { font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.82); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .lp-row-sub { font-size: 10px; color: rgba(255,255,255,0.28); margin-top: 1px; }
        .lp-row-amount { font-size: 12px; font-weight: 700; }

        /* Skyline */
        .lp-skyline {
          display: flex; align-items: flex-end; gap: 3px;
          opacity: 0.12; height: 55px; flex-shrink: 0;
        }
        .lp-skyline-bar {
          flex: 1; background: white; border-radius: 2px 2px 0 0;
          transform-origin: bottom;
        }

        /* ══ PANNEAU DROIT ══ */

        .rg-logo { display: flex; align-items: center; gap: 9px; text-decoration: none; }
        .rg-logo-icon {
          width: 30px; height: 30px; border-radius: 8px;
          background: linear-gradient(135deg,#1A3C5E,#2563EB);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 3px 10px rgba(37,99,235,0.35);
        }
        .rg-logo-name { font-weight: 800; font-size: 14px; color: #0F172A; line-height: 1.1; }
        .rg-logo-sub { font-size: 10px; color: #94A3B8; }
        .lp-right {
          width: 420px; flex-shrink: 0;
          background: white; display: flex; flex-direction: column;
          box-shadow: -8px 0 48px rgba(0,0,0,0.25);
        }
        .lp-form-wrap {
          flex: 1; display: flex; flex-direction: column;
          padding: 0;
        }

        /* Form header */
        .lp-form-header { padding: 44px 40px 0; }
        .lp-form-secure {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 11px; font-weight: 700; letter-spacing: 0.1em;
          text-transform: uppercase; color: #2563EB; margin-bottom: 14px;
        }
        .lp-form-title {
          font-weight: 800; font-size: 2rem; color: #0F172A;
          letter-spacing: -0.5px; margin-bottom: 8px; line-height: 1;
        }
        .lp-form-sub { font-size: 14px; color: #64748B; }
        .lp-link { color: #1A3C5E; font-weight: 700; text-decoration: none; }
        .lp-link:hover { text-decoration: underline; }

        /* Form */
        .lp-form {
          padding: 28px 40px 0;
          display: flex; flex-direction: column; gap: 16px; flex: 1;
        }
        .lp-field { display: flex; flex-direction: column; gap: 6px; }
        .lp-label {
          font-size: 12px; font-weight: 700; color: #0F172A;
        }
        .lp-label-row { display: flex; justify-content: space-between; align-items: center; }
        .lp-req { color: #EF4444; }
        .lp-forgot { font-size: 12px; font-weight: 600; color: #1A3C5E; text-decoration: none; }
        .lp-forgot:hover { text-decoration: underline; }

        .lp-input-wrap {
          display: flex; align-items: center; position: relative;
          border: 1.5px solid #E2E8F0; border-radius: 12px;
          background: white; transition: border-color 0.2s;
          overflow: hidden;
        }
        .lp-input-icon { position: absolute; left: 13px; flex-shrink: 0; transition: color 0.2s; }
        .lp-input {
          width: 100%; height: 46px; padding: 0 14px 0 40px;
          border: none; outline: none; background: transparent;
          font-size: 14px; color: #0F172A; font-family: inherit;
        }
        .lp-input::placeholder { color: #CBD5E1; }
        .lp-input-pass { padding-right: 44px; }
        .lp-eye-btn {
          position: absolute; right: 13px;
          background: transparent; border: none; cursor: pointer;
          color: #94A3B8; padding: 4px; display: flex;
          align-items: center; justify-content: center;
          transition: color 0.15s;
        }
        .lp-eye-btn:hover { color: #0F172A; }

        .lp-remember {
          display: flex; align-items: center; gap: 9px;
          font-size: 13px; color: #64748B; cursor: pointer;
        }
        .lp-checkbox { width: 15px; height: 15px; accent-color: #1A3C5E; }

        /* Submit */
        .lp-submit {
          height: 48px; border-radius: 14px;
          background: linear-gradient(135deg,#1A3C5E,#2563EB);
          color: white; border: none; cursor: pointer;
          font-family: inherit; font-size: 15px; font-weight: 700;
          box-shadow: 0 6px 20px rgba(37,99,235,0.4);
          position: relative; overflow: hidden;
        }
        .lp-submit:disabled { opacity: 0.65; cursor: not-allowed; }
        .lp-submit-idle {
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .lp-submit-loading {
          display: flex; align-items: center; justify-content: center; gap: 10px;
        }
        .lp-spinner {
          width: 16px; height: 16px; border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Divider */
        .lp-divider {
          display: flex; align-items: center; gap: 12px;
        }
        .lp-divider-line { flex: 1; height: 1px; background: #E2E8F0; }
        .lp-divider-text { font-size: 12px; color: #94A3B8; white-space: nowrap; }

        /* OAuth */
        .lp-oauth { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .lp-oauth-btn {
          height: 44px; border-radius: 12px;
          border: 1.5px solid #E2E8F0; background: white;
          display: flex; align-items: center; justify-content: center; gap: 9px;
          font-family: inherit; font-size: 13px; font-weight: 700;
          color: #0F172A; cursor: pointer; transition: all 0.2s;
        }
        .lp-oauth-btn:hover { background: #F8FAFC; border-color: #CBD5E1; }

        /* Footer */
        .lp-form-footer {
          padding: 20px 40px 28px;
          border-top: 1px solid #F1F5F9;
          display: flex; flex-direction: column; gap: 8px; align-items: center;
          margin-top: auto;
        }
        .lp-form-footer-links { display: flex; gap: 18px; }
        .lp-footer-link {
          font-size: 12px; color: #94A3B8; text-decoration: none; transition: color 0.15s;
        }
        .lp-footer-link:hover { color: #0F172A; }
        .lp-footer-copy { font-size: 11px; color: #CBD5E1; }

        /* ── RESPONSIVE ── */
        @media (max-width: 1024px) {
          .lp-left { display: none; }
          .lp-right { width: 100%; box-shadow: none; }
          .lp-form-header { padding: 36px 28px 0; }
          .lp-form { padding: 24px 28px 0; }
          .lp-form-footer { padding: 20px 28px 24px; }
        }
        @media (max-width: 480px) {
          .lp-form-header { padding: 28px 20px 0; }
          .lp-form { padding: 20px 20px 0; }
          .lp-form-footer { padding: 16px 20px 20px; }
          .lp-form-title { font-size: 1.6rem; }
        }
      `}</style>
    </>
  )
}
