'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import api from '@/lib/api'
import { AuthResponse } from '@/types'
import {
  IconBuilding, IconUser, IconMail, IconLock, IconPhone,
  IconMapPin, IconRocket, IconIdBadge, IconCalendar,
  IconUsers, IconArrowRight, IconFileText, IconDeviceMobile,
  IconBell, IconMessage, IconShieldCheck, IconCheck,
  IconGift, IconCut, IconClipboardList, IconCircleCheck,
  IconHome2, IconCreditCard, IconTrendingUp, IconAlertCircle,
} from '@tabler/icons-react'

const VILLES = [
  'Douala', 'Yaoundé', 'Bafoussam', 'Garoua',
  'Maroua', 'Ngaoundéré', 'Bertoua', 'Ebolowa', 'Buea', 'Autre',
]

const KPIS = [
  { l: 'Biens',     v: '24',   c: '#60A5FA', bg: 'rgba(59,130,246,0.12)',  ico: <IconHome2 size={13}/> },
  { l: 'Taux occ.', v: '87%',  c: '#34D399', bg: 'rgba(16,185,129,0.12)', ico: <IconTrendingUp size={13}/> },
  { l: 'Revenus',   v: '1.8M', c: '#FBBF24', bg: 'rgba(245,158,11,0.12)', ico: <IconCreditCard size={13}/> },
  { l: 'Impayés',   v: '3',    c: '#F87171', bg: 'rgba(239,68,68,0.12)',   ico: <IconAlertCircle size={13}/> },
]

const FEATURES = [
  {
    ico: <IconFileText size={16}/>, color: '#34D399',
    title: 'Documents automatiques',
    desc: 'Contrats, quittances, attestations — conformes au droit camerounais',
  },
  {
    ico: <IconDeviceMobile size={16}/>, color: '#60A5FA',
    title: 'Orange Money & MTN Money',
    desc: 'Paiement en 30 secondes, quittance générée instantanément',
  },
  {
    ico: <IconBell size={16}/>, color: '#FBBF24',
    title: 'Relances automatiques',
    desc: 'Rappels J-3, J-7 · Relances impayés J+7, J+15, J+30',
  },
  {
    ico: <IconMessage size={16}/>, color: '#C084FC',
    title: 'Messagerie & signalements',
    desc: 'Communication directe liée à chaque logement',
  },
]

const AVANTAGES = [
  { ico: <IconGift size={18} style={{ color: '#60A5FA' }} />, title: 'Essai gratuit 30 jours', sub: 'Toutes fonctionnalités incluses' },
  { ico: <IconClipboardList size={18} style={{ color: '#34D399' }} />, title: 'Sans carte bancaire', sub: 'Aucun moyen de paiement requis' },
  { ico: <IconCut size={18} style={{ color: '#FBBF24' }} />, title: 'Sans engagement', sub: 'Résiliable à tout moment' },
]

// ── Panneau gauche (marketing) ──────────────────────────────
function LeftPanel() {
  return (
    <div className="rg-left">
      <div className="rg-left-bg" />
      <div className="rg-left-grid" />
      <motion.div className="rg-orb rg-orb-1"
        animate={{ scale: [1, 1.12, 1], opacity: [0.2, 0.3, 0.2] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }} />
      <motion.div className="rg-orb rg-orb-2"
        animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.18, 0.1] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 2 }} />

      <div className="rg-left-inner">
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
        
        {/* Titre */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}>
          <h2 className="rg-mkt-title">
            Inscrivez-vous et gérez<br />
            vos biens plus facilement
          </h2>
          <p className="rg-mkt-sub">
            LocCam vous donne tous les outils pour gérer seul vos locations au Cameroun — documents, paiements Mobile Money, messagerie et suivi des impayés.
          </p>
        </motion.div>

        {/* Avantages */}
        <motion.div className="rg-advantages"
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.6 }}>
          {AVANTAGES.map((a, i) => (
            <motion.div key={a.title} className="rg-advantage-card"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 + i * 0.08, duration: 0.5 }}>
              <div className="rg-advantage-ico">{a.ico}</div>
              <div className="rg-advantage-title">{a.title}</div>
              <div className="rg-advantage-sub">{a.sub}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Features */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}>
          <div className="rg-mkt-label">Sur LocCam :</div>
          <div className="rg-features">
            {FEATURES.map((f, i) => (
              <motion.div key={f.title} className="rg-feature-row"
                initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.55 + i * 0.09, duration: 0.45 }}>
                <div className="rg-feature-ico" style={{ background: `${f.color}18`, color: f.color }}>
                  {f.ico}
                </div>
                <div>
                  <div className="rg-feature-title">{f.title}</div>
                  <div className="rg-feature-desc">{f.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Témoignage */}
        <motion.div className="rg-temo"
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}>
          <div className="rg-temo-stars">
            {[1,2,3,4,5].map(i => <IconCheck key={i} size={12} style={{ color: '#FCD34D' }} />)}
          </div>
          <p className="rg-temo-txt">
            &laquo;&nbsp;Cela fait 2 ans que j&apos;utilise LocCam et c&apos;est génial. La création du bail, les quittances, les relances — tout se génère automatiquement.&nbsp;&raquo;
          </p>
          <div className="rg-temo-author">
            <div className="rg-temo-av">ML</div>
            <div>
              <div className="rg-temo-name">Mbida Lionel</div>
              <div className="rg-temo-role">Bailleur · 12 biens · Douala</div>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div className="rg-stats"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 0.95, duration: 0.6 }}>
          {[
            { v: '1 200+', l: 'Bailleurs' },
            { v: '500+',   l: 'Logements' },
            { v: '4,8/5', l: 'Satisfaction' },
            { v: '30 min', l: 'par mois' },
          ].map((s, i) => (
            <div key={s.l} className="rg-stat">
              <div className="rg-stat-val">{s.v}</div>
              <div className="rg-stat-lbl">{s.l}</div>
            </div>
          ))}
        </motion.div>

        <motion.p className="rg-legal"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 1.05, duration: 0.5 }}>
          *Essai gratuit hors contrat de bail, état des lieux, caution solidaire.<br />
          Sans engagement. Résiliable à tout moment et sans frais.
        </motion.p>
      </div>
    </div>
  )
}

// ── Page principale ─────────────────────────────────────────
export default function RegisterPage() {
  const router  = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    prenom: '', nom: '', email: '',
    telephone: '', ville: '', password: '',
  })
  const [focuses, setFocuses] = useState<Record<string, boolean>>({})

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))
  const focus = (k: string, v: boolean) => setFocuses(f => ({ ...f, [k]: v }))

  const passStrength = form.password.length === 0 ? 0
    : form.password.length < 6 ? 1
    : form.password.length < 10 ? 2 : 3

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.post<AuthResponse>('/auth/inscription/', {
        ...form, role: 'bailleur', langue: 'fr', password2: form.password,
      })
      localStorage.setItem('access_token', res.data.access_token)
      localStorage.setItem('refresh_token', res.data.refresh_token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      toast.success('Bienvenue sur LocCam !')
      router.push('/bailleur')
    } catch (err: unknown) {
      const error = err as { response?: { data?: Record<string, string[]> } }
      const msg = error.response?.data
        ? Object.values(error.response.data).flat()[0]
        : "Erreur lors de l'inscription."
      toast.error(String(msg))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="rg-root">

        {/* ══ PANNEAU GAUCHE — MARKETING (60%) ══ */}
        <LeftPanel />

        {/* ══ PANNEAU DROIT — FORMULAIRE (40%) ══ */}
        <motion.div className="rg-right"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}>

          {/* Header */}
          <div className="rg-form-header">
            <Link href="/landing" className="rg-logo">
              <div className="rg-logo-icon"><IconBuilding size={15} color="white" /></div>
              <div>
                <div className="rg-logo-name">LocCam</div>
                <div className="rg-logo-sub">Gestion locative camerounaise</div>
              </div>
            </Link>
            <div className="rg-header-actions">
              <a href="tel:+237699000000" className="rg-header-btn">
                <IconPhone size={12} /><span>+237 699 000 000</span>
              </a>
              <a href="#" className="rg-header-btn">
                <IconCalendar size={12} /><span>Démo</span>
              </a>
            </div>
          </div>

          {/* Body */}
          <div className="rg-form-body">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.55 }}>
              <h1 className="rg-title">Créer mon compte bailleur</h1>
              <p className="rg-subtitle">
                Déjà inscrit ?{' '}
                <Link href="/login" className="rg-link">Se connecter</Link>
              </p>
            </motion.div>

            {/* CTA locataire */}
            <motion.button type="button"
              onClick={() => router.push('/je-suis-locataire')}
              className="rg-locataire-cta"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.38, duration: 0.5 }}
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              <div className="rg-locataire-left">
                <div className="rg-locataire-icon">
                  <IconUsers size={15} style={{ color: '#64748B' }} />
                </div>
                <div>
                  <div className="rg-locataire-title">Vous êtes locataire ?</div>
                  <div className="rg-locataire-sub">Cliquez ici pour en savoir plus</div>
                </div>
              </div>
              <IconArrowRight size={15} style={{ color: '#94A3B8' }} />
            </motion.button>

            <motion.form onSubmit={handleSubmit} className="rg-form"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.46, duration: 0.55 }}>

              {/* Prénom + Nom */}
              <div className="rg-row-2">
                {['prenom', 'nom'].map((k, i) => (
                  <div key={k} className="rg-field">
                    <label className="rg-label">
                      {k === 'prenom' ? 'Prénom' : 'Nom'} <span className="rg-req">*</span>
                    </label>
                    <div className="rg-input-wrap" style={{ borderColor: focuses[k] ? '#1A3C5E' : '#E2E8F0' }}>
                      <IconUser size={13} className="rg-input-icon"
                        style={{ color: focuses[k] ? '#1A3C5E' : '#94A3B8' }} />
                      <input type="text" required value={form[k as keyof typeof form]}
                        onChange={e => set(k, e.target.value)}
                        onFocus={() => focus(k, true)} onBlur={() => focus(k, false)}
                        placeholder={k === 'prenom' ? 'Vicens' : 'Kenmatio'}
                        className="rg-input" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Email */}
              <div className="rg-field">
                <label className="rg-label">Email <span className="rg-req">*</span></label>
                <div className="rg-input-wrap" style={{ borderColor: focuses['email'] ? '#1A3C5E' : '#E2E8F0' }}>
                  <IconMail size={13} className="rg-input-icon"
                    style={{ color: focuses['email'] ? '#1A3C5E' : '#94A3B8' }} />
                  <input type="email" required value={form.email}
                    onChange={e => set('email', e.target.value)}
                    onFocus={() => focus('email', true)} onBlur={() => focus('email', false)}
                    placeholder="votre@email.cm" className="rg-input" />
                </div>
              </div>

              {/* Téléphone */}
              <div className="rg-field">
                <label className="rg-label">Téléphone <span className="rg-req">*</span></label>
                <div className="rg-phone-row">
                  <div className="rg-phone-prefix">
                    <IconMapPin size={12} style={{ color: '#64748B' }} />
                    +237
                  </div>
                  <div className="rg-input-wrap" style={{ flex: 1, borderColor: focuses['tel'] ? '#1A3C5E' : '#E2E8F0' }}>
                    <IconPhone size={13} className="rg-input-icon"
                      style={{ color: focuses['tel'] ? '#1A3C5E' : '#94A3B8' }} />
                    <input type="tel" required value={form.telephone}
                      onChange={e => set('telephone', e.target.value)}
                      onFocus={() => focus('tel', true)} onBlur={() => focus('tel', false)}
                      placeholder="6XX XXX XXX" className="rg-input" />
                  </div>
                </div>
                <span className="rg-hint">Numéro Orange Money ou MTN Money</span>
              </div>

              {/* Ville */}
              <div className="rg-field">
                <label className="rg-label">Ville <span className="rg-req">*</span></label>
                <div className="rg-input-wrap" style={{ borderColor: focuses['ville'] ? '#1A3C5E' : '#E2E8F0' }}>
                  <IconMapPin size={13} className="rg-input-icon"
                    style={{ color: focuses['ville'] ? '#1A3C5E' : '#94A3B8' }} />
                  <select required value={form.ville}
                    onChange={e => set('ville', e.target.value)}
                    onFocus={() => focus('ville', true)} onBlur={() => focus('ville', false)}
                    className="rg-input rg-select"
                    style={{ color: form.ville ? '#0F172A' : '#94A3B8' }}>
                    <option value="" disabled>Sélectionnez votre ville…</option>
                    {VILLES.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
              </div>

              {/* Mot de passe */}
              <div className="rg-field">
                <label className="rg-label">Mot de passe <span className="rg-req">*</span></label>
                <div className="rg-input-wrap" style={{ borderColor: focuses['pass'] ? '#1A3C5E' : '#E2E8F0' }}>
                  <IconLock size={13} className="rg-input-icon"
                    style={{ color: focuses['pass'] ? '#1A3C5E' : '#94A3B8' }} />
                  <input type="password" required value={form.password}
                    onChange={e => set('password', e.target.value)}
                    onFocus={() => focus('pass', true)} onBlur={() => focus('pass', false)}
                    placeholder="Min. 8 caractères" className="rg-input" />
                </div>
                <AnimatePresence>
                  {form.password.length > 0 && (
                    <motion.div className="rg-strength"
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}>
                      <div className="rg-strength-bars">
                        {[1,2,3,4].map(i => (
                          <motion.div key={i} className="rg-strength-bar"
                            animate={{ background: i <= passStrength
                              ? passStrength === 1 ? '#EF4444'
                                : passStrength === 2 ? '#F59E0B' : '#10B981'
                              : '#E2E8F0' }}
                            transition={{ duration: 0.3 }} />
                        ))}
                      </div>
                      <span className="rg-strength-label"
                        style={{ color: passStrength <= 1 ? '#EF4444' : passStrength === 2 ? '#F59E0B' : '#10B981' }}>
                        {passStrength <= 1 ? 'Faible' : passStrength === 2 ? 'Moyen' : 'Fort'}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* CNI */}
              <div className="rg-field">
                <label className="rg-label">
                  Carte Nationale d&apos;Identité{' '}
                  <span className="rg-optional">(pour publier des biens)</span>
                </label>
                <motion.div className="rg-cni-zone" whileHover={{ borderColor: '#CBD5E1', background: '#F1F5F9' }}>
                  <IconIdBadge size={26} style={{ color: '#94A3B8' }} />
                  <div className="rg-cni-title">Uploadez votre CNI camerounaise</div>
                  <div className="rg-cni-sub">Recto + Verso · JPG, PNG, PDF · Max 5 Mo</div>
                  <button type="button" className="rg-cni-btn">
                    <IconClipboardList size={12} />
                    Choisir un fichier
                  </button>
                </motion.div>
                <span className="rg-hint">Vérification sous 24h. Peut être complété après l&apos;inscription.</span>
              </div>

              {/* CGU */}
              <label className="rg-cgu">
                <input type="checkbox" required className="rg-checkbox" />
                <span>
                  Je valide les{' '}
                  <a href="#" className="rg-link">CGU</a>{' '}et les{' '}
                  <a href="#" className="rg-link">CGV</a>{' '}de LocCam.
                </span>
              </label>

              {/* Submit */}
              <motion.button type="submit" disabled={loading}
                className="rg-submit"
                whileHover={loading ? {} : { scale: 1.01 }}
                whileTap={loading ? {} : { scale: 0.99 }}>
                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.div key="loading"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="rg-submit-content">
                      <div className="rg-spinner" />
                      Création en cours...
                    </motion.div>
                  ) : (
                    <motion.div key="idle"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="rg-submit-content">
                      <IconRocket size={15} />
                      Créer mon compte bailleur
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>

            </motion.form>
          </div>

          {/* Footer */}
          <div className="rg-form-footer">
            {['Se connecter', 'Voir nos offres', 'Aide'].map(l => (
              <a key={l} href="#" className="rg-footer-link">{l}</a>
            ))}
          </div>
        </motion.div>
      </div>

      <style>{`
        .rg-root {
          min-height: 100vh; display: flex;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        /* ══ PANNEAU GAUCHE — MARKETING (60%) ══ */


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

        
        .rg-left {
          flex: 1; position: relative; overflow: hidden;
        }
        .rg-left-bg {
          position: absolute; inset: 0;
          background: linear-gradient(160deg,#0A1628 0%,#0F2438 40%,#0D1F38 70%,#091422 100%);
        }
        .rg-left-grid {
          position: absolute; inset: 0;
          background-image: radial-gradient(rgba(255,255,255,0.028) 1px, transparent 1px);
          background-size: 26px 26px;
        }
        .rg-orb {
          position: absolute; border-radius: 50%; filter: blur(64px);
        }
        .rg-orb-1 {
          top: -5%; right: -5%; width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(37,99,235,0.22), transparent 70%);
        }
        .rg-orb-2 {
          bottom: -8%; left: -8%; width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(16,185,129,0.15), transparent 70%);
        }
        .rg-left-inner {
          position: relative; z-index: 1;
          padding: 40px 52px; height: 100%;
          display: flex; flex-direction: column; gap: 24px;
          overflow-y: auto;
        }

        .rg-mkt-logo { display: flex; align-items: center; gap: 10px; }
        .rg-mkt-logo-icon {
          width: 36px; height: 36px; border-radius: 10px;
          background: linear-gradient(135deg,#2563EB,#1D4ED8);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 14px rgba(37,99,235,0.45);
        }
        .rg-mkt-logo-text { font-weight: 800; font-size: 19px; color: white; letter-spacing: -0.3px; }

        .rg-mkt-title {
          font-weight: 800; font-size: clamp(1.5rem, 2.4vw, 2rem);
          color: white; line-height: 1.15; letter-spacing: -0.3px; margin-bottom: 10px;
        }
        .rg-mkt-sub {
          font-size: 14px; color: rgba(255,255,255,0.5);
          line-height: 1.7; max-width: 460px;
        }

        /* Avantages */
        .rg-advantages {
          display: grid; grid-template-columns: repeat(3,1fr); gap: 10px;
        }
        .rg-advantage-card {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 14px; padding: 14px 12px; text-align: center;
          transition: all 0.2s;
        }
        .rg-advantage-card:hover {
          background: rgba(255,255,255,0.09);
          border-color: rgba(255,255,255,0.15);
        }
        .rg-advantage-ico {
          width: 36px; height: 36px; border-radius: 10px;
          background: rgba(255,255,255,0.08);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 10px;
        }
        .rg-advantage-title { font-size: 12px; font-weight: 700; color: white; margin-bottom: 4px; line-height: 1.3; }
        .rg-advantage-sub { font-size: 11px; color: rgba(255,255,255,0.38); }

        /* Features */
        .rg-mkt-label {
          font-size: 10px; font-weight: 700; letter-spacing: 0.12em;
          text-transform: uppercase; color: rgba(255,255,255,0.28);
        }
        .rg-features { display: flex; flex-direction: column; }
        .rg-feature-row {
          display: flex; align-items: flex-start; gap: 12px;
          padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .rg-feature-ico {
          width: 34px; height: 34px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .rg-feature-title { font-size: 13px; font-weight: 700; color: white; margin-bottom: 2px; }
        .rg-feature-desc { font-size: 11px; color: rgba(255,255,255,0.4); line-height: 1.5; }

        /* Temoignage */
        .rg-temo {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 14px; padding: 18px;
        }
        .rg-temo-stars { display: flex; gap: 3px; margin-bottom: 10px; }
        .rg-temo-txt {
          font-size: 13px; font-style: italic;
          color: rgba(255,255,255,0.62); line-height: 1.65; margin-bottom: 14px;
        }
        .rg-temo-author { display: flex; align-items: center; gap: 10px; }
        .rg-temo-av {
          width: 32px; height: 32px; border-radius: 50%;
          background: rgba(255,255,255,0.16);
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 800; color: white; flex-shrink: 0;
        }
        .rg-temo-name { font-size: 13px; font-weight: 700; color: white; }
        .rg-temo-role { font-size: 11px; color: rgba(255,255,255,0.38); }

        /* Stats */
        .rg-stats {
          display: grid; grid-template-columns: repeat(4,1fr);
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px; padding: 14px;
        }
        .rg-stat { text-align: center; }
        .rg-stat-val { font-weight: 800; font-size: 1rem; color: white; line-height: 1; margin-bottom: 4px; }
        .rg-stat-lbl { font-size: 10px; color: rgba(255,255,255,0.35); }
        .rg-legal { font-size: 11px; color: rgba(255,255,255,0.2); line-height: 1.6; }

        /* ══ PANNEAU DROIT — FORMULAIRE (40%) ══ */
        .rg-right {
          width: 40%; flex-shrink: 0;
          background: white; display: flex; flex-direction: column;
          box-shadow: -8px 0 40px rgba(0,0,0,0.18);
          overflow-y: auto;
        }
        .rg-form-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 28px; border-bottom: 1px solid #E2E8F0; flex-shrink: 0;
        }
        .rg-logo { display: flex; align-items: center; gap: 9px; text-decoration: none; }
        .rg-logo-icon {
          width: 30px; height: 30px; border-radius: 8px;
          background: linear-gradient(135deg,#1A3C5E,#2563EB);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 3px 10px rgba(37,99,235,0.35);
        }
        .rg-logo-name { font-weight: 800; font-size: 14px; color: #0F172A; line-height: 1.1; }
        .rg-logo-sub { font-size: 10px; color: #94A3B8; }
        .rg-header-actions { display: flex; gap: 7px; }
        .rg-header-btn {
          display: flex; align-items: center; gap: 5px;
          padding: 5px 10px; border-radius: 8px;
          border: 1px solid #E2E8F0; font-size: 11px; color: #64748B;
          text-decoration: none; transition: all 0.15s;
        }
        .rg-header-btn:hover { background: #F1F5F9; color: #0F172A; }

        .rg-form-body { flex: 1; padding: 24px 28px 16px; overflow-y: auto; }
        .rg-title { font-weight: 800; font-size: 1.2rem; color: #0F172A; margin-bottom: 5px; letter-spacing: -0.3px; }
        .rg-subtitle { font-size: 13px; color: #64748B; margin-bottom: 18px; }
        .rg-link { color: #1A3C5E; font-weight: 700; text-decoration: none; }
        .rg-link:hover { text-decoration: underline; }

        /* CTA locataire */
        .rg-locataire-cta {
          display: flex; align-items: center; justify-content: space-between;
          width: 100%; padding: 12px 14px; border-radius: 12px;
          background: #F8FAFC; border: 1.5px solid #E2E8F0;
          cursor: pointer; text-align: left; margin-bottom: 18px;
          transition: border-color 0.2s;
        }
        .rg-locataire-left { display: flex; align-items: center; gap: 10px; }
        .rg-locataire-icon {
          width: 32px; height: 32px; border-radius: 9px;
          background: #F1F5F9; border: 1px solid #E2E8F0;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .rg-locataire-title { font-size: 13px; font-weight: 700; color: #0F172A; margin-bottom: 2px; }
        .rg-locataire-sub { font-size: 11px; color: #94A3B8; }

        /* Form */
        .rg-form { display: flex; flex-direction: column; gap: 13px; }
        .rg-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .rg-field { display: flex; flex-direction: column; gap: 5px; }
        .rg-label { font-size: 12px; font-weight: 700; color: #0F172A; }
        .rg-optional { font-weight: 400; color: #94A3B8; }
        .rg-req { color: #EF4444; }
        .rg-hint { font-size: 11px; color: #94A3B8; }

        .rg-input-wrap {
          position: relative; display: flex; align-items: center;
          border: 1.5px solid #E2E8F0; border-radius: 10px;
          background: white; transition: border-color 0.2s;
          overflow: hidden;
        }
        .rg-input-icon { position: absolute; left: 10px; flex-shrink: 0; transition: color 0.2s; }
        .rg-input {
          width: 100%; height: 38px; padding: 0 10px 0 30px;
          border: none; outline: none; background: transparent;
          font-size: 13px; color: #0F172A; font-family: inherit;
        }
        .rg-input::placeholder { color: #CBD5E1; }
        .rg-select { appearance: none; cursor: pointer; }

        .rg-phone-row { display: flex; gap: 8px; }
        .rg-phone-prefix {
          height: 38px; padding: 0 11px;
          border: 1.5px solid #E2E8F0; border-radius: 10px;
          font-size: 13px; font-weight: 700; color: #0F172A;
          background: #F8FAFC; display: flex; align-items: center; gap: 6px;
          white-space: nowrap; flex-shrink: 0;
        }

        /* Strength */
        .rg-strength { display: flex; align-items: center; gap: 8px; margin-top: 4px; overflow: hidden; }
        .rg-strength-bars { display: flex; gap: 4px; flex: 1; }
        .rg-strength-bar { flex: 1; height: 3px; border-radius: 2px; }
        .rg-strength-label { font-size: 11px; font-weight: 600; white-space: nowrap; }

        /* CNI */
        .rg-cni-zone {
          border: 2px dashed #E2E8F0; border-radius: 12px;
          padding: 18px; text-align: center; background: #F8FAFC;
          cursor: pointer; transition: all 0.2s;
        }
        .rg-cni-title { font-size: 13px; font-weight: 700; color: #0F172A; margin: 7px 0 3px; }
        .rg-cni-sub { font-size: 11px; color: #94A3B8; margin-bottom: 9px; }
        .rg-cni-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 6px 13px; border-radius: 8px;
          border: 1.5px solid #E2E8F0; background: white;
          font-size: 11px; font-weight: 700; color: #1A3C5E; cursor: pointer;
          transition: all 0.15s;
        }
        .rg-cni-btn:hover { background: #F1F5F9; }

        /* CGU */
        .rg-cgu {
          display: flex; align-items: flex-start; gap: 9px; cursor: pointer;
          font-size: 12px; color: #64748B; line-height: 1.5;
        }
        .rg-checkbox { width: 15px; height: 15px; margin-top: 1px; flex-shrink: 0; accent-color: #1A3C5E; }

        /* Submit */
        .rg-submit {
          height: 44px; border-radius: 12px;
          background: linear-gradient(135deg,#1A3C5E,#2563EB);
          color: white; border: none; cursor: pointer;
          font-family: inherit; font-size: 14px; font-weight: 700;
          box-shadow: 0 5px 18px rgba(37,99,235,0.4);
        }
        .rg-submit:disabled { opacity: 0.65; cursor: not-allowed; }
        .rg-submit-content {
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .rg-spinner {
          width: 15px; height: 15px; border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Footer */
        .rg-form-footer {
          padding: 12px 28px; border-top: 1px solid #E2E8F0;
          display: flex; gap: 18px; justify-content: center;
          flex-shrink: 0;
        }
        .rg-footer-link { font-size: 12px; color: #94A3B8; text-decoration: none; transition: color 0.15s; }
        .rg-footer-link:hover { color: #0F172A; }

        /* RESPONSIVE */
        @media (max-width: 1100px) {
          .rg-right { width: 45%; }
        }
        @media (max-width: 900px) {
          .rg-left { display: none; }
          .rg-right { width: 100%; box-shadow: none; }
        }
        @media (max-width: 480px) {
          .rg-form-body { padding: 20px 18px 14px; }
          .rg-form-header { padding: 13px 18px; }
          .rg-row-2 { grid-template-columns: 1fr; }
        }
      `}</style>
    </>
  )
}
