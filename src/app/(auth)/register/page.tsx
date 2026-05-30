'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import api from '@/lib/api'
import { AuthResponse } from '@/types'
import {
  IconBuilding, IconUser, IconMail, IconLock, IconPhone,
  IconMapPin, IconRocket, IconIdBadge, IconCalendar,
  IconUsers, IconArrowRight,
} from '@tabler/icons-react'

const VILLES = [
  'Douala', 'Yaoundé', 'Bafoussam', 'Garoua',
  'Maroua', 'Ngaoundéré', 'Bertoua', 'Ebolowa', 'Buea', 'Autre',
]

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    prenom: '', nom: '', email: '',
    telephone: '', ville: '', password: '',
  })

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const passStrength = form.password.length === 0 ? 0
    : form.password.length < 6 ? 1
    : form.password.length < 10 ? 2
    : 3

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
      <div className="reg-root">

        {/* ══ GAUCHE — FORMULAIRE (40%) ══════════════════════════════ */}
        <div className="reg-form-col">

          {/* Header */}
          <div className="reg-form-header">
            <Link href="/landing" className="reg-logo">
              <div className="reg-logo-icon">
                <IconBuilding size={16} color="white" />
              </div>
              <div>
                <div className="reg-logo-name">LocCam</div>
                <div className="reg-logo-sub">Gestion locative camerounaise</div>
              </div>
            </Link>
            <div className="reg-header-actions">
              <a href="tel:+237699000000" className="reg-header-btn">
                <IconPhone size={12} />
                <span>+237 699 000 000</span>
              </a>
              <a href="#" className="reg-header-btn">
                <IconCalendar size={12} />
                <span>Démo</span>
              </a>
            </div>
          </div>

          {/* Body */}
          <div className="reg-form-body">
            <h1 className="reg-title">Créer mon compte bailleur</h1>
            <p className="reg-subtitle">
              Déjà inscrit ?{' '}
              <Link href="/login" className="reg-link-primary">Se connecter</Link>
            </p>

            {/* CTA locataire */}
            <button
              type="button"
              onClick={() => router.push('/je-suis-locataire')}
              className="reg-locataire-cta">
              <div className="reg-locataire-cta-left">
                <IconUsers size={16} style={{ color: '#64748B' }} />
                <div>
                  <div className="reg-locataire-cta-title">Vous êtes locataire ?</div>
                  <div className="reg-locataire-cta-sub">Cliquez ici pour en savoir plus</div>
                </div>
              </div>
              <IconArrowRight size={15} style={{ color: '#94A3B8' }} />
            </button>

            <form onSubmit={handleSubmit} className="reg-form">

              {/* Prénom + Nom */}
              <div className="reg-row-2">
                <div className="reg-field">
                  <label className="reg-label">Prénom <span className="reg-req">*</span></label>
                  <div className="reg-input-wrap">
                    <IconUser size={13} className="reg-input-icon" />
                    <input type="text" required value={form.prenom}
                      onChange={e => set('prenom', e.target.value)}
                      placeholder="Vicens" className="reg-input" />
                  </div>
                </div>
                <div className="reg-field">
                  <label className="reg-label">Nom <span className="reg-req">*</span></label>
                  <div className="reg-input-wrap">
                    <IconUser size={13} className="reg-input-icon" />
                    <input type="text" required value={form.nom}
                      onChange={e => set('nom', e.target.value)}
                      placeholder="Kenmatio" className="reg-input" />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="reg-field">
                <label className="reg-label">Adresse email <span className="reg-req">*</span></label>
                <div className="reg-input-wrap">
                  <IconMail size={13} className="reg-input-icon" />
                  <input type="email" required value={form.email}
                    onChange={e => set('email', e.target.value)}
                    placeholder="votre@email.cm" className="reg-input" />
                </div>
              </div>

              {/* Téléphone */}
              <div className="reg-field">
                <label className="reg-label">Téléphone <span className="reg-req">*</span></label>
                <div className="reg-phone-row">
                  <div className="reg-phone-prefix">🇨🇲 +237</div>
                  <div className="reg-input-wrap" style={{ flex: 1 }}>
                    <IconPhone size={13} className="reg-input-icon" />
                    <input type="tel" required value={form.telephone}
                      onChange={e => set('telephone', e.target.value)}
                      placeholder="6XX XXX XXX" className="reg-input" />
                  </div>
                </div>
                <span className="reg-hint">Numéro Orange Money ou MTN Money</span>
              </div>

              {/* Ville */}
              <div className="reg-field">
                <label className="reg-label">Ville <span className="reg-req">*</span></label>
                <div className="reg-input-wrap">
                  <IconMapPin size={13} className="reg-input-icon" />
                  <select required value={form.ville}
                    onChange={e => set('ville', e.target.value)}
                    className="reg-input reg-select"
                    style={{ color: form.ville ? '#1E2A3E' : '#94A3B8' }}>
                    <option value="" disabled>Sélectionnez votre ville…</option>
                    {VILLES.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
              </div>

              {/* Mot de passe */}
              <div className="reg-field">
                <label className="reg-label">Mot de passe <span className="reg-req">*</span></label>
                <div className="reg-input-wrap">
                  <IconLock size={13} className="reg-input-icon" />
                  <input type="password" required value={form.password}
                    onChange={e => set('password', e.target.value)}
                    placeholder="Min. 8 caractères" className="reg-input" />
                </div>
                {form.password.length > 0 && (
                  <div className="reg-strength">
                    <div className="reg-strength-bars">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="reg-strength-bar"
                          style={{
                            background: i <= passStrength
                              ? passStrength === 1 ? '#EF4444'
                                : passStrength === 2 ? '#F59E0B'
                                : '#10B981'
                              : '#E2E8F0'
                          }} />
                      ))}
                    </div>
                    <span className="reg-strength-label"
                      style={{ color: passStrength <= 1 ? '#EF4444' : passStrength === 2 ? '#F59E0B' : '#10B981' }}>
                      {passStrength <= 1 ? 'Faible' : passStrength === 2 ? 'Moyen' : 'Fort'}
                    </span>
                  </div>
                )}
              </div>

              {/* CNI */}
              <div className="reg-field">
                <label className="reg-label">
                  Carte Nationale d&apos;Identité
                  <span className="reg-optional"> (pour publier des biens)</span>
                </label>
                <div className="reg-cni-zone">
                  <IconIdBadge size={28} style={{ color: '#94A3B8' }} />
                  <div className="reg-cni-title">Uploadez votre CNI camerounaise</div>
                  <div className="reg-cni-sub">Recto + Verso · JPG, PNG, PDF · Max 5 Mo</div>
                  <button type="button" className="reg-cni-btn">Choisir un fichier</button>
                </div>
                <span className="reg-hint">Vérification sous 24h. Peut être complété après l&apos;inscription.</span>
              </div>

              {/* CGU */}
              <label className="reg-cgu">
                <input type="checkbox" required className="reg-checkbox" />
                <span>
                  Je valide les{' '}
                  <a href="#" className="reg-link-primary">CGU</a>{' '}et les{' '}
                  <a href="#" className="reg-link-primary">CGV</a>{' '}de LocCam.
                </span>
              </label>

              {/* Submit */}
              <button type="submit" disabled={loading} className="reg-submit">
                <IconRocket size={16} />
                {loading ? 'Création en cours...' : 'Créer mon compte bailleur'}
              </button>

            </form>
          </div>

          {/* Footer */}
          <div className="reg-form-footer">
            {['Se connecter', 'Voir nos offres', 'Aide'].map(l => (
              <a key={l} href="#" className="reg-footer-link">{l}</a>
            ))}
          </div>
        </div>

        {/* ══ DROITE — MARKETING (60%) ═══════════════════════════════ */}
        <div className="reg-marketing-col">
          <div className="reg-marketing-inner">

            {/* Logo */}
            <div className="reg-mkt-logo">
              <div className="reg-mkt-logo-icon">
                <IconBuilding size={16} color="white" />
              </div>
              <span className="reg-mkt-logo-text">LocCam</span>
            </div>

            {/* Titre */}
            <h2 className="reg-mkt-title">
              Inscrivez-vous et gérez<br />
              vos biens plus facilement
            </h2>
            <p className="reg-mkt-sub">
              LocCam vous donne tous les outils pour gérer seul vos locations au Cameroun — documents, paiements Mobile Money, messagerie et suivi des impayés.
            </p>

            {/* 3 avantages */}
            <div className="reg-advantages">
              {[
                { ico: '🎁', title: 'Essai gratuit 30 jours', sub: 'Toutes fonctionnalités incluses' },
                { ico: '📋', title: 'Sans carte bancaire', sub: 'Aucun moyen de paiement requis' },
                { ico: '✂️', title: 'Sans engagement', sub: 'Résiliable à tout moment' },
              ].map(a => (
                <div key={a.title} className="reg-advantage-card">
                  <div className="reg-advantage-ico">{a.ico}</div>
                  <div className="reg-advantage-title">{a.title}</div>
                  <div className="reg-advantage-sub">{a.sub}</div>
                </div>
              ))}
            </div>

            {/* Features */}
            <div className="reg-mkt-label">Sur LocCam :</div>
            <div className="reg-features">
              {[
                {
                  ico: '📄',
                  title: 'Documents automatiques',
                  desc: 'Contrats de bail, quittances, attestations — conformes au droit camerounais',
                },
                {
                  ico: '📱',
                  title: 'Orange Money & MTN Money',
                  desc: 'Paiement en 30 secondes, quittance générée instantanément',
                },
                {
                  ico: '🔔',
                  title: 'Relances automatiques',
                  desc: 'Rappels J-3, J-7 · Relances impayés J+7, J+15, J+30',
                },
                {
                  ico: '💬',
                  title: 'Messagerie & signalements',
                  desc: 'Communication directe liée à chaque logement',
                },
              ].map((f, i) => (
                <div key={i} className="reg-feature-row">
                  <div className="reg-feature-ico">{f.ico}</div>
                  <div>
                    <div className="reg-feature-title">{f.title}</div>
                    <div className="reg-feature-desc">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Témoignage */}
            <div className="reg-temo">
              <div className="reg-temo-stars">★★★★★</div>
              <p className="reg-temo-txt">
                &laquo;&nbsp;Cela fait 2 ans que j&apos;utilise LocCam et c&apos;est génial. La création du bail, les quittances, les relances — tout se génère automatiquement. Le support est hyper réactif.&nbsp;&raquo;
              </p>
              <div className="reg-temo-author">
                <div className="reg-temo-av">ML</div>
                <div>
                  <div className="reg-temo-name">Mbida Lionel</div>
                  <div className="reg-temo-role">Bailleur · 12 biens · Douala</div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="reg-stats">
              {[
                { v: '1 200+', l: 'Bailleurs' },
                { v: '500+',   l: 'Logements' },
                { v: '4,8/5', l: 'Satisfaction' },
                { v: '30 min', l: 'de gestion/mois' },
              ].map(s => (
                <div key={s.l} className="reg-stat">
                  <div className="reg-stat-val">{s.v}</div>
                  <div className="reg-stat-lbl">{s.l}</div>
                </div>
              ))}
            </div>

            {/* Note légale */}
            <p className="reg-legal">
              *Essai gratuit hors contrat de bail, état des lieux, caution solidaire.<br />
              Sans engagement. Résiliable à tout moment et sans frais.
            </p>
          </div>
        </div>

      </div>

      <style>{`
        /* ── Root ── */
        .reg-root {
          min-height: 100vh; display: flex;
          font-family: 'Plus Jakarta Sans', sans-serif;
          background: #F8FAFC;
        }

        /* ══ COLONNE FORMULAIRE (40%) ══ */
        .reg-form-col {
          width: 40%; flex-shrink: 0;
          display: flex; flex-direction: column;
          background: white;
          border-right: 1px solid #E2E8F0;
          min-height: 100vh;
        }
        .reg-form-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 28px;
          border-bottom: 1px solid #E2E8F0;
          flex-shrink: 0;
        }
        .reg-logo {
          display: flex; align-items: center; gap: 10px; text-decoration: none;
        }
        .reg-logo-icon {
          width: 32px; height: 32px; border-radius: 9px;
          background: linear-gradient(135deg,#1A3C5E,#2563EB);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 12px rgba(37,99,235,0.35);
        }
        .reg-logo-name {
          font-weight: 800; font-size: 15px; color: #0F172A; line-height: 1.1;
        }
        .reg-logo-sub { font-size: 10px; color: #94A3B8; }
        .reg-header-actions { display: flex; gap: 8px; }
        .reg-header-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 6px 12px; border-radius: 8px;
          border: 1px solid #E2E8F0; font-size: 11px;
          color: #64748B; text-decoration: none;
          transition: all 0.15s;
        }
        .reg-header-btn:hover { background: #F1F5F9; color: #0F172A; }

        .reg-form-body {
          flex: 1; padding: 28px 28px 20px; overflow-y: auto;
        }
        .reg-title {
          font-weight: 800; font-size: 1.25rem; color: #0F172A;
          margin-bottom: 6px; letter-spacing: -0.3px;
        }
        .reg-subtitle { font-size: 13px; color: #64748B; margin-bottom: 20px; }
        .reg-link-primary {
          color: #1A3C5E; font-weight: 600; text-decoration: none;
        }
        .reg-link-primary:hover { text-decoration: underline; }

        /* CTA locataire */
        .reg-locataire-cta {
          display: flex; align-items: center; justify-content: space-between;
          width: 100%; padding: 14px 16px; border-radius: 12px;
          background: #F8FAFC; border: 1.5px solid #E2E8F0;
          cursor: pointer; text-align: left; margin-bottom: 20px;
          transition: all 0.2s;
        }
        .reg-locataire-cta:hover {
          background: #F1F5F9; border-color: #CBD5E1;
        }
        .reg-locataire-cta-left {
          display: flex; align-items: center; gap: 12px;
        }
        .reg-locataire-cta-title {
          font-size: 13px; font-weight: 700; color: #0F172A; margin-bottom: 2px;
        }
        .reg-locataire-cta-sub { font-size: 11px; color: #94A3B8; }

        /* Form */
        .reg-form { display: flex; flex-direction: column; gap: 14px; }
        .reg-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .reg-field { display: flex; flex-direction: column; gap: 5px; }
        .reg-label {
          font-size: 12px; font-weight: 700; color: #0F172A;
        }
        .reg-optional { font-weight: 400; color: #94A3B8; }
        .reg-req { color: #EF4444; }
        .reg-hint { font-size: 11px; color: #94A3B8; }

        .reg-input-wrap {
          position: relative; display: flex; align-items: center;
        }
        .reg-input-icon {
          position: absolute; left: 11px; color: #94A3B8;
        }
        .reg-input {
          width: 100%; height: 40px; padding: 0 12px 0 32px;
          border: 1.5px solid #E2E8F0; border-radius: 10px;
          font-size: 13px; color: #0F172A; outline: none;
          transition: border-color 0.15s; background: white;
          font-family: inherit;
        }
        .reg-input:focus { border-color: #1A3C5E; }
        .reg-input::placeholder { color: #94A3B8; }
        .reg-select { appearance: none; cursor: pointer; }

        .reg-phone-row { display: flex; gap: 8px; align-items: center; }
        .reg-phone-prefix {
          height: 40px; padding: 0 12px;
          border: 1.5px solid #E2E8F0; border-radius: 10px;
          font-size: 13px; font-weight: 700; color: #0F172A;
          background: #F8FAFC; display: flex; align-items: center;
          white-space: nowrap; flex-shrink: 0;
        }

        /* Strength */
        .reg-strength { display: flex; align-items: center; gap: 8px; margin-top: 4px; }
        .reg-strength-bars { display: flex; gap: 4px; flex: 1; }
        .reg-strength-bar {
          flex: 1; height: 3px; border-radius: 2px;
          transition: background 0.3s;
        }
        .reg-strength-label { font-size: 11px; font-weight: 600; }

        /* CNI */
        .reg-cni-zone {
          border: 2px dashed #E2E8F0; border-radius: 12px;
          padding: 20px; text-align: center;
          background: #F8FAFC; cursor: pointer;
          transition: all 0.2s;
        }
        .reg-cni-zone:hover { border-color: #CBD5E1; background: #F1F5F9; }
        .reg-cni-title { font-size: 13px; font-weight: 700; color: #0F172A; margin: 8px 0 4px; }
        .reg-cni-sub { font-size: 11px; color: #94A3B8; margin-bottom: 10px; }
        .reg-cni-btn {
          padding: 6px 14px; border-radius: 8px;
          border: 1.5px solid #E2E8F0; background: white;
          font-size: 11px; font-weight: 700; color: #1A3C5E; cursor: pointer;
          transition: all 0.15s;
        }
        .reg-cni-btn:hover { background: #F1F5F9; }

        /* CGU */
        .reg-cgu {
          display: flex; align-items: flex-start; gap: 10px; cursor: pointer;
          font-size: 12px; color: #64748B; line-height: 1.5;
        }
        .reg-checkbox { width: 16px; height: 16px; margin-top: 1px; flex-shrink: 0; accent-color: #1A3C5E; }

        /* Submit */
        .reg-submit {
          width: 100%; height: 46px; border-radius: 12px;
          background: linear-gradient(135deg,#1A3C5E,#2563EB);
          color: white; font-weight: 700; font-size: 14px;
          border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          box-shadow: 0 4px 16px rgba(37,99,235,0.4);
          transition: all 0.2s;
        }
        .reg-submit:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(37,99,235,0.5);
        }
        .reg-submit:disabled { opacity: 0.65; cursor: not-allowed; }

        /* Footer */
        .reg-form-footer {
          padding: 14px 28px; border-top: 1px solid #E2E8F0;
          display: flex; gap: 20px; justify-content: center;
          flex-shrink: 0;
        }
        .reg-footer-link {
          font-size: 12px; color: #94A3B8; text-decoration: none;
          transition: color 0.15s;
        }
        .reg-footer-link:hover { color: #0F172A; }

        /* ══ COLONNE MARKETING (60%) ══ */
        .reg-marketing-col {
          flex: 1;
          background: linear-gradient(160deg,#0F2438 0%,#1A3C5E 55%,#1E4D7A 100%);
          overflow-y: auto;
          position: relative;
        }
        .reg-marketing-col::before {
          content: '';
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 60% 50% at 80% 20%, rgba(37,99,235,0.2), transparent 55%),
            radial-gradient(ellipse 40% 40% at 20% 80%, rgba(16,185,129,0.1), transparent 55%);
          pointer-events: none;
        }
        .reg-marketing-inner {
          padding: 40px 48px;
          position: relative; z-index: 1;
          max-width: 680px;
        }

        .reg-mkt-logo {
          display: flex; align-items: center; gap: 9px; margin-bottom: 28px;
        }
        .reg-mkt-logo-icon {
          width: 32px; height: 32px; border-radius: 9px;
          background: rgba(255,255,255,0.15);
          display: flex; align-items: center; justify-content: center;
        }
        .reg-mkt-logo-text { font-weight: 800; font-size: 17px; color: white; }

        .reg-mkt-title {
          font-weight: 800; font-size: clamp(1.5rem, 2.5vw, 2rem);
          color: white; line-height: 1.2; margin-bottom: 12px;
          letter-spacing: -0.3px;
        }
        .reg-mkt-sub {
          font-size: 14px; color: rgba(255,255,255,0.55);
          line-height: 1.7; margin-bottom: 28px; max-width: 480px;
        }

        /* Avantages */
        .reg-advantages {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 12px; margin-bottom: 28px;
        }
        .reg-advantage-card {
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 14px; padding: 16px 12px; text-align: center;
        }
        .reg-advantage-ico { font-size: 22px; margin-bottom: 8px; }
        .reg-advantage-title {
          font-size: 12px; font-weight: 700; color: white;
          margin-bottom: 4px; line-height: 1.3;
        }
        .reg-advantage-sub { font-size: 11px; color: rgba(255,255,255,0.4); }

        /* Features */
        .reg-mkt-label {
          font-size: 11px; font-weight: 700; letter-spacing: 0.1em;
          text-transform: uppercase; color: rgba(255,255,255,0.3);
          margin-bottom: 12px;
        }
        .reg-features { display: flex; flex-direction: column; margin-bottom: 24px; }
        .reg-feature-row {
          display: flex; align-items: flex-start; gap: 14px;
          padding: 14px 0;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .reg-feature-ico {
          font-size: 20px; flex-shrink: 0;
          width: 36px; height: 36px;
          background: rgba(255,255,255,0.08); border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
        }
        .reg-feature-title {
          font-size: 13px; font-weight: 700; color: white;
          margin-bottom: 3px;
        }
        .reg-feature-desc { font-size: 12px; color: rgba(255,255,255,0.45); line-height: 1.5; }

        /* Temoignage */
        .reg-temo {
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px; padding: 20px; margin-bottom: 20px;
        }
        .reg-temo-stars { color: #FCD34D; font-size: 14px; margin-bottom: 10px; letter-spacing: 2px; }
        .reg-temo-txt {
          font-size: 13px; font-style: italic;
          color: rgba(255,255,255,0.65); line-height: 1.7; margin-bottom: 14px;
        }
        .reg-temo-author { display: flex; align-items: center; gap: 10px; }
        .reg-temo-av {
          width: 34px; height: 34px; border-radius: 50%;
          background: rgba(255,255,255,0.18);
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 800; color: white;
          flex-shrink: 0;
        }
        .reg-temo-name { font-size: 13px; font-weight: 700; color: white; }
        .reg-temo-role { font-size: 11px; color: rgba(255,255,255,0.4); }

        /* Stats */
        .reg-stats {
          display: grid; grid-template-columns: repeat(4, 1fr);
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px; padding: 16px; margin-bottom: 16px;
        }
        .reg-stat { text-align: center; }
        .reg-stat-val {
          font-weight: 800; font-size: 1.1rem; color: white; line-height: 1;
          margin-bottom: 4px;
        }
        .reg-stat-lbl { font-size: 10px; color: rgba(255,255,255,0.38); }

        .reg-legal {
          font-size: 11px; color: rgba(255,255,255,0.22); line-height: 1.6;
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 1024px) {
          .reg-form-col { width: 50%; }
          .reg-marketing-inner { padding: 32px 36px; }
          .reg-stats { grid-template-columns: repeat(2, 1fr); gap: 8px; }
        }
        @media (max-width: 768px) {
          .reg-root { flex-direction: column; }
          .reg-form-col { width: 100%; border-right: none; border-bottom: 1px solid #E2E8F0; }
          .reg-marketing-col { display: none; }
          .reg-form-body { padding: 24px 20px 16px; }
          .reg-form-header { padding: 14px 20px; }
          .reg-header-actions span { display: none; }
        }
        @media (max-width: 480px) {
          .reg-row-2 { grid-template-columns: 1fr; }
          .reg-advantages { grid-template-columns: 1fr; }
        }
      `}</style>
    </>
  )
}
