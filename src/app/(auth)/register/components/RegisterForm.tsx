'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import api from '@/lib/api'
import { AuthResponse } from '@/types'
import {
  IconBuilding, IconUser, IconMail, IconLock, IconPhone,
  IconMapPin, IconRocket, IconCalendar,
  IconUsers, IconArrowRight, IconIdBadge, IconShieldCheck,
  IconUpload, IconCheck, IconPhoto, IconX,
} from '@tabler/icons-react'

const VILLES = [
  'Douala', 'Yaoundé', 'Bafoussam', 'Garoua',
  'Maroua', 'Ngaoundéré', 'Bertoua', 'Ebolowa', 'Buea', 'Autre',
]

export default function RegisterForm() {
  const router  = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading]     = useState(false)
  const [cniFile, setCniFile]     = useState<File | null>(null)
  const [cniPreview, setCniPreview] = useState<string>('')
  const [form, setForm] = useState({
    prenom: '', nom: '', email: '',
    telephone: '', ville: '', password: '',
  })
  const [focuses, setFocuses] = useState<Record<string, boolean>>({})

  const set   = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))
  const focus = (k: string, v: boolean) => setFocuses(f => ({ ...f, [k]: v }))

  const passStrength = form.password.length === 0 ? 0
    : form.password.length < 6  ? 1
    : form.password.length < 10 ? 2 : 3

  // ── Sélection fichier CNI ──────────────────────────────
  const handleCniSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCniFile(file)
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = ev => setCniPreview(ev.target?.result as string)
      reader.readAsDataURL(file)
    } else {
      setCniPreview('')
    }
    e.target.value = ''
  }

  const removeCni = () => { setCniFile(null); setCniPreview('') }

  // ── Soumission ─────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      // 1. Créer le compte
      const res = await api.post<AuthResponse>('/auth/inscription/', {
        ...form, role: 'bailleur', langue: 'fr', password2: form.password,
      })
      localStorage.setItem('access_token', res.data.access_token)
      localStorage.setItem('refresh_token', res.data.refresh_token)
      localStorage.setItem('user', JSON.stringify(res.data.user))

      
      // 2. Uploader la CNI si sélectionnée (on passe le token directement)
if (cniFile) {
  try {
    const formData = new FormData()
    formData.append('fichier', cniFile)
    formData.append('type_document', 'cni')
    await api.post('/upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${res.data.access_token}`,
      },
    })
    toast.success('Bienvenue sur LocCam ! CNI uploadée avec succès.')
  } catch {
    toast.success('Bienvenue sur LocCam !')
    toast.error('CNI non uploadée — vous pourrez la compléter depuis votre profil.')
  }
} else {
  toast.success('Bienvenue sur LocCam !')
}

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
    <motion.div className="rg-right"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}>

      {/* ── Header ── */}
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

      {/* ── Body ── */}
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

        {/* ── Formulaire ── */}
        <motion.form onSubmit={handleSubmit} className="rg-form"
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.46, duration: 0.55 }}>

          {/* Prénom + Nom */}
          <div className="rg-row-2">
            {['prenom', 'nom'].map(k => (
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
                <IconMapPin size={12} style={{ color: '#64748B' }} />+237
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

          {/* ── CNI ── */}
          <div className="rg-field">
            <label className="rg-label">
              Carte Nationale d&apos;Identité
              <span className="rg-optional"> (pour publier des biens)</span>
            </label>

            <div style={{ border: '2px solid #E2E8F0', borderRadius: '14px', overflow: 'hidden', background: '#FAFAFA' }}>
              {/* Header CNI */}
              <div style={{ background: 'linear-gradient(135deg,#1A3C5E,#2563EB)', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <IconIdBadge size={20} color="white" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'white', marginBottom: '1px' }}>CNI camerounaise</div>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)' }}>Recto + Verso · JPG, PNG, PDF · Max 5 Mo</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '100px', background: 'rgba(255,255,255,0.15)', fontSize: '10px', fontWeight: 700, color: 'white' }}>
                  <IconShieldCheck size={10} /> Sécurisé
                </div>
              </div>

              {/* Mockup recto/verso */}
              {!cniFile && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '12px' }}>
                  {['Recto', 'Verso'].map(side => (
                    <div key={side} style={{ background: 'linear-gradient(135deg,#EFF6FF,#DBEAFE)', border: '1.5px dashed #93C5FD', borderRadius: '10px', padding: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                      <IconIdBadge size={18} style={{ color: '#2563EB' }} />
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#1D4ED8' }}>{side}</span>
                      <span style={{ fontSize: '10px', color: '#60A5FA' }}>Face {side === 'Recto' ? 'avant' : 'arrière'}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Preview si fichier sélectionné */}
              {cniFile && (
                <div style={{ padding: '12px' }}>
                  <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                    style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '10px', padding: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {cniPreview ? (
                      <img src={cniPreview} alt="CNI preview" style={{ width: '48px', height: '32px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: '48px', height: '32px', background: '#D1FAE5', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <IconIdBadge size={16} style={{ color: '#059669' }} />
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#059669', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <IconCheck size={12} /> Fichier sélectionné
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {cniFile.name}
                      </div>
                    </div>
                    <button type="button" onClick={removeCni}
                      style={{ background: '#FEF2F2', border: 'none', borderRadius: '8px', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                      <IconX size={13} style={{ color: '#DC2626' }} />
                    </button>
                  </motion.div>
                </div>
              )}

              {/* Bouton choisir */}
              <div style={{ padding: cniFile ? '0 12px 12px' : '0 12px 12px' }}>
                <button type="button" onClick={() => fileRef.current?.click()}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', padding: '9px', borderRadius: '10px', background: cniFile ? '#F0FDF4' : '#F1F5F9', border: `1.5px solid ${cniFile ? '#A7F3D0' : '#E2E8F0'}`, fontSize: '12px', fontWeight: 700, color: cniFile ? '#059669' : '#1A3C5E', cursor: 'pointer', transition: 'all 0.15s' }}>
                  <IconUpload size={13} />
                  {cniFile ? 'Changer le fichier' : 'Choisir ma CNI'}
                </button>
                <input ref={fileRef} type="file"
                  accept="image/jpeg,image/png,application/pdf"
                  onChange={handleCniSelect}
                  style={{ display: 'none' }} />
              </div>

              {/* Footer */}
              <div style={{ borderTop: '1px solid #E2E8F0', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '7px', background: '#F8FAFC' }}>
                <IconLock size={11} style={{ color: '#7C3AED', flexShrink: 0 }} />
                <span style={{ fontSize: '10px', color: '#94A3B8' }}>
                  Uploadée après la création du compte · Vérification sous 24h · Peut être complété plus tard
                </span>
              </div>
            </div>
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
                  {cniFile ? 'Création + upload CNI...' : 'Création en cours...'}
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

      {/* ── Footer ── */}
      <div className="rg-form-footer">
        {['Se connecter', 'Voir nos offres', 'Aide'].map(l => (
          <a key={l} href="#" className="rg-footer-link">{l}</a>
        ))}
      </div>
    </motion.div>
  )
}
