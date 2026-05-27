'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import api from '@/lib/api'
import { AuthResponse } from '@/types'
import {
  IconBuilding,
  IconUser,
  IconMail,
  IconLock,
  IconPhone,
  IconMapPin,
  IconRocket,
  IconHome2,
  IconShieldCheck,
  IconDeviceMobile,
  IconFileText,
  IconBell,
  IconMessage,
  IconIdBadge,
  IconCalendar,
} from '@tabler/icons-react'

const VILLES = [
  'Douala', 'Yaoundé', 'Bafoussam', 'Garoua',
  'Maroua', 'Ngaoundéré', 'Bertoua', 'Ebolowa', 'Buea', 'Autre',
]

export default function RegisterPage() {
  const router = useRouter()
  const [role, setRole]       = useState<'bailleur' | 'locataire'>('bailleur')
  const [loading, setLoading] = useState(false)
  const [form, setForm]       = useState({
    prenom: '', nom: '', email: '',
    telephone: '', ville: '', password: '',
  })

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.post<AuthResponse>('/auth/inscription/', {
        ...form, role, langue: 'fr', password2: form.password,
      })
      localStorage.setItem('access_token',  res.data.access_token)
      localStorage.setItem('refresh_token', res.data.refresh_token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      toast.success('Compte créé avec succès !')
      router.push(role === 'bailleur' ? '/bailleur' : '/locataire')
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

  const passStrength = form.password.length === 0 ? 0
    : form.password.length < 6 ? 1
    : form.password.length < 10 ? 2
    : 3

  return (
    <div className="min-h-screen flex bg-white">

      {/* ══════════════════════════════════
          GAUCHE — FORMULAIRE
      ══════════════════════════════════ */}
      <div className="w-full lg:w-[460px] flex-shrink-0 flex flex-col overflow-y-auto"
           style={{ borderRight: '1px solid #E6EDF4' }}>

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-8 py-5"
             style={{ borderBottom: '1px solid #E6EDF4' }}>
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                 style={{ background: '#1A3C5E' }}>
              <IconBuilding size={16} color="white" />
            </div>
            <div>
              <div className="font-bold text-sm leading-none" style={{ color: '#1A3C5E' }}>
                LocCam
              </div>
              <div className="text-xs" style={{ color: '#8A9BB0' }}>
                Gestion locative camerounaise
              </div>
            </div>
          </Link>
          <div className="flex gap-2">
            <a href="tel:+237699000000"
               className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border"
               style={{ borderColor: '#E6EDF4', color: '#5B6E8C' }}>
              <IconPhone size={13} />
              +237 699 000 000
            </a>
            <a href="#"
               className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border"
               style={{ borderColor: '#E6EDF4', color: '#5B6E8C' }}>
              <IconCalendar size={13} />
              Planifier une démo
            </a>
          </div>
        </div>

        {/* ── Contenu formulaire ── */}
        <div className="flex-1 px-8 py-6">

          <h1 className="text-xl font-bold mb-1" style={{ color: '#1E2A3E' }}>
            Créer mon compte gratuitement
          </h1>
          <p className="text-sm mb-5" style={{ color: '#5B6E8C' }}>
            Déjà inscrit ?{' '}
            <Link href="/login" className="font-semibold hover:underline"
                  style={{ color: '#1A3C5E' }}>
              Connectez-vous
            </Link>
            {' · '}
            <Link href="#" className="hover:underline" style={{ color: '#5B6E8C' }}>
              Voir nos offres
            </Link>
          </p>

          {/* Tabs Je suis bailleur / locataire */}
          <div className="flex gap-2 mb-5">
            <button type="button" onClick={() => setRole('bailleur')}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all"
              style={role === 'bailleur'
                ? { background: '#1A3C5E', color: '#fff' }
                : { background: '#F1F5F9', color: '#5B6E8C', border: '1px solid #E6EDF4' }
              }>
              <IconHome2 size={16} />
              Je suis bailleur
            </button>
            <button type="button" onClick={() => setRole('locataire')}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all"
              style={role === 'locataire'
                ? { background: '#1A3C5E', color: '#fff' }
                : { background: '#F1F5F9', color: '#5B6E8C', border: '1px solid #E6EDF4' }
              }>
              <IconUser size={16} />
              Je suis locataire
            </button>
          </div>

          {/* Notice locataire */}
          {role === 'locataire' && (
            <div className="p-3 rounded-xl mb-4 text-sm leading-relaxed"
                 style={{ background: '#F8FAFD', border: '1px solid #E6EDF4', color: '#5B6E8C' }}>
              Vous êtes <strong>locataire</strong> ? Vous accédez à LocCam uniquement sur{' '}
              <strong>invitation de votre bailleur</strong>. Demandez-lui de vous inviter depuis son
              espace.{' '}
              <Link href="#" className="font-semibold hover:underline" style={{ color: '#1A3C5E' }}>
                En savoir plus →
              </Link>
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* Prénom + Nom */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs font-semibold mb-1"
                       style={{ color: '#1E2A3E' }}>
                  Prénom <span style={{ color: '#A32D2D' }}>*</span>
                </label>
                <div className="relative">
                  <IconUser size={14} className="absolute left-3 top-1/2 -translate-y-1/2"
                            style={{ color: '#8A9BB0' }} />
                  <input type="text" required value={form.prenom}
                    onChange={(e) => set('prenom', e.target.value)}
                    placeholder="Ex : Vicens"
                    className="w-full h-10 pl-8 pr-3 rounded-lg text-sm outline-none"
                    style={{ border: '1.5px solid #E6EDF4', color: '#1E2A3E' }}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1"
                       style={{ color: '#1E2A3E' }}>
                  Nom <span style={{ color: '#A32D2D' }}>*</span>
                </label>
                <div className="relative">
                  <IconUser size={14} className="absolute left-3 top-1/2 -translate-y-1/2"
                            style={{ color: '#8A9BB0' }} />
                  <input type="text" required value={form.nom}
                    onChange={(e) => set('nom', e.target.value)}
                    placeholder="Ex : Kenmatio"
                    className="w-full h-10 pl-8 pr-3 rounded-lg text-sm outline-none"
                    style={{ border: '1.5px solid #E6EDF4', color: '#1E2A3E' }}
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="mb-3">
              <label className="block text-xs font-semibold mb-1"
                     style={{ color: '#1E2A3E' }}>
                Adresse email <span style={{ color: '#A32D2D' }}>*</span>
              </label>
              <div className="relative">
                <IconMail size={14} className="absolute left-3 top-1/2 -translate-y-1/2"
                          style={{ color: '#8A9BB0' }} />
                <input type="email" required value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  placeholder="votre@email.cm"
                  className="w-full h-10 pl-8 pr-3 rounded-lg text-sm outline-none"
                  style={{ border: '1.5px solid #E6EDF4', color: '#1E2A3E' }}
                />
              </div>
            </div>

            {/* Téléphone */}
            <div className="mb-3">
              <label className="block text-xs font-semibold mb-1"
                     style={{ color: '#1E2A3E' }}>
                Votre numéro de téléphone <span style={{ color: '#A32D2D' }}>*</span>
              </label>
              <div className="flex gap-2">
                <div className="h-10 px-3 flex items-center gap-1.5 rounded-lg text-sm font-semibold flex-shrink-0"
                     style={{ background: '#F1F5F9', border: '1.5px solid #E6EDF4', color: '#1E2A3E' }}>
                  🇨🇲 +237
                </div>
                <div className="relative flex-1">
                  <IconPhone size={14} className="absolute left-3 top-1/2 -translate-y-1/2"
                             style={{ color: '#8A9BB0' }} />
                  <input type="tel" required value={form.telephone}
                    onChange={(e) => set('telephone', e.target.value)}
                    placeholder="6XX XXX XXX"
                    className="w-full h-10 pl-8 pr-3 rounded-lg text-sm outline-none"
                    style={{ border: '1.5px solid #E6EDF4', color: '#1E2A3E' }}
                  />
                </div>
              </div>
              <p className="text-xs mt-1" style={{ color: '#8A9BB0' }}>
                Numéro Orange Money ou MTN Money
              </p>
            </div>

            {/* Ville */}
            <div className="mb-3">
              <label className="block text-xs font-semibold mb-1"
                     style={{ color: '#1E2A3E' }}>
                Ville principale <span style={{ color: '#A32D2D' }}>*</span>
              </label>
              <div className="relative">
                <IconMapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2"
                            style={{ color: '#8A9BB0' }} />
                <select required value={form.ville}
                  onChange={(e) => set('ville', e.target.value)}
                  className="w-full h-10 pl-8 pr-3 rounded-lg text-sm outline-none appearance-none"
                  style={{ border: '1.5px solid #E6EDF4', color: form.ville ? '#1E2A3E' : '#8A9BB0', background: '#fff' }}>
                  <option value="" disabled>Sélectionnez votre ville…</option>
                  {VILLES.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
            </div>

            {/* Mot de passe */}
            <div className="mb-3">
              <label className="block text-xs font-semibold mb-1"
                     style={{ color: '#1E2A3E' }}>
                Saisissez un mot de passe <span style={{ color: '#A32D2D' }}>*</span>
              </label>
              <div className="relative">
                <IconLock size={14} className="absolute left-3 top-1/2 -translate-y-1/2"
                          style={{ color: '#8A9BB0' }} />
                <input type="password" required value={form.password}
                  onChange={(e) => set('password', e.target.value)}
                  placeholder="Min. 8 caractères"
                  className="w-full h-10 pl-8 pr-3 rounded-lg text-sm outline-none"
                  style={{ border: '1.5px solid #E6EDF4', color: '#1E2A3E' }}
                />
              </div>
              {/* Barre de force */}
              {form.password.length > 0 && (
                <div>
                  <div className="flex gap-1 mt-2">
                    {[1,2,3,4].map((i) => (
                      <div key={i} className="flex-1 h-1 rounded-full transition-all"
                           style={{
                             background: i <= passStrength
                               ? passStrength === 1 ? '#A32D2D'
                                 : passStrength === 2 ? '#C55A11'
                                 : '#0F6E56'
                               : '#E6EDF4'
                           }} />
                    ))}
                  </div>
                  <p className="text-xs mt-1" style={{ color: '#8A9BB0' }}>
                    Force : {passStrength === 1 ? 'Faible' : passStrength === 2 ? 'Moyen — ajoutez des majuscules et des chiffres' : 'Fort'}
                  </p>
                </div>
              )}
            </div>

            {/* Upload CNI — bailleur uniquement */}
            {role === 'bailleur' && (
              <div className="mb-4">
                <label className="block text-xs font-semibold mb-1"
                       style={{ color: '#1E2A3E' }}>
                  Carte Nationale d&apos;Identité{' '}
                  <span className="font-normal" style={{ color: '#8A9BB0' }}>
                    (requis pour publier des biens)
                  </span>
                </label>
                <div className="border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all"
                     style={{ borderColor: '#E6EDF4', background: '#F8FAFD' }}>
                  <IconIdBadge size={32} className="mx-auto mb-2" style={{ color: '#8A9BB0' }} />
                  <div className="text-sm font-semibold mb-1" style={{ color: '#1E2A3E' }}>
                    Uploadez votre CNI camerounaise
                  </div>
                  <div className="text-xs mb-3" style={{ color: '#8A9BB0' }}>
                    Recto + Verso · JPG, PNG ou PDF · Max 5 Mo
                  </div>
                  <button type="button"
                    className="px-4 py-1.5 rounded-lg text-xs font-semibold border transition-all hover:bg-gray-50"
                    style={{ borderColor: '#E6EDF4', color: '#1A3C5E' }}>
                    Choisir un fichier
                  </button>
                </div>
                <p className="text-xs mt-1" style={{ color: '#8A9BB0' }}>
                  Vérification sous 24h par l&apos;équipe LocCam. Vous pouvez compléter après l&apos;inscription.
                </p>
              </div>
            )}

            {/* CGU */}
            <div className="flex gap-2 mb-3">
              <input type="checkbox" required id="cgu"
                     className="w-4 h-4 mt-0.5 flex-shrink-0 accent-blue-900" />
              <label htmlFor="cgu" className="text-xs leading-relaxed cursor-pointer"
                     style={{ color: '#5B6E8C' }}>
                Je valide les{' '}
                <a href="#" className="font-semibold hover:underline" style={{ color: '#1A3C5E' }}>
                  Conditions Générales d&apos;Utilisation
                </a>{' '}et les{' '}
                <a href="#" className="font-semibold hover:underline" style={{ color: '#1A3C5E' }}>
                  Conditions Générales de Vente
                </a>{' '}de LocCam.
              </label>
            </div>

            {/* reCAPTCHA notice */}
            <p className="text-xs mb-4 text-center" style={{ color: '#8A9BB0' }}>
              Ce site est protégé par reCAPTCHA. La{' '}
              <a href="https://policies.google.com/privacy" target="_blank"
                 className="hover:underline" style={{ color: '#1A3C5E' }}>
                politique de confidentialité
              </a>{' '}et les{' '}
              <a href="https://policies.google.com/terms" target="_blank"
                 className="hover:underline" style={{ color: '#1A3C5E' }}>
                conditions d&apos;utilisation
              </a>{' '}de Google s&apos;appliquent.
            </p>

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="w-full h-12 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all"
              style={{
                background: loading ? '#5B6E8C' : '#1A3C5E',
                boxShadow: '0 4px 14px rgba(26,60,94,0.3)',
              }}>
              <IconRocket size={18} />
              {loading
                ? 'Création...'
                : `Je crée mon compte ${role}`
              }
            </button>

          </form>
        </div>

        {/* Footer formulaire */}
        <div className="px-8 py-4 flex justify-center gap-5"
             style={{ borderTop: '1px solid #E6EDF4' }}>
          {[
            { label: 'Connectez-vous', href: '/login' },
            { label: 'Voir nos offres', href: '#' },
            { label: 'Aide', href: '#' },
          ].map((l) => (
            <Link key={l.label} href={l.href}
                  className="text-xs hover:underline"
                  style={{ color: '#8A9BB0' }}>
              {l.label}
            </Link>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════
          DROITE — MARKETING
      ══════════════════════════════════ */}
      <div className="hidden lg:flex flex-1 flex-col p-12"
           style={{ background: 'linear-gradient(135deg, #0F2438 0%, #1A3C5E 100%)' }}>

        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
               style={{ background: 'rgba(255,255,255,0.15)' }}>
            <IconBuilding size={16} color="white" />
          </div>
          <span className="text-white font-bold">LocCam</span>
        </div>

        {/* Titre */}
        <h2 className="text-3xl font-bold text-white mb-3 leading-tight">
          Inscrivez-vous et gérez<br/>votre bien plus facilement
        </h2>
        <p className="text-sm mb-8 leading-relaxed"
           style={{ color: 'rgba(255,255,255,0.55)' }}>
          LocCam vous donne tous les outils pour gérer seul vos locations
          au Cameroun — documents, paiements Mobile Money, messagerie et
          suivi des impayés.
        </p>

        {/* 3 avantages */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { ico: '🎁', title: 'Essai gratuit\nde 30 jours*', sub: 'Toutes fonctionnalités incluses' },
            { ico: '📋', title: 'Inscription gratuite\net sans CB',  sub: 'Aucune carte bancaire requise' },
            { ico: '✂️', title: 'Résiliable\nà tout moment', sub: 'Sans engagement ni frais' },
          ].map((a) => (
            <div key={a.title} className="rounded-xl p-4 text-center"
                 style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="text-2xl mb-2">{a.ico}</div>
              <div className="text-white font-bold text-xs mb-1 whitespace-pre-line">{a.title}</div>
              <div className="text-xs" style={{ color: 'rgba(255,255,255,0.42)' }}>{a.sub}</div>
            </div>
          ))}
        </div>

        {/* Sur LocCam */}
        <div className="text-xs font-bold uppercase tracking-wider mb-4"
             style={{ color: 'rgba(255,255,255,0.35)' }}>
          Sur LocCam :
        </div>
        <div className="flex flex-col mb-8">
          {[
            {
              icon: <IconFileText size={15} />,
              title: 'Générez vos documents automatiquement',
              desc:  'Contrat de bail, quittances, attestation de location, état des lieux — conformes au droit camerounais',
            },
            {
              icon: <IconDeviceMobile size={15} />,
              title: 'Encaissez via Orange Money & MTN Money',
              desc:  'Paiement en 30 secondes, quittance générée instantanément, notifications bailleur + locataire',
            },
            {
              icon: <IconBell size={15} />,
              title: 'Relances et rappels automatiques',
              desc:  'Rappels loyer J-3, J-7 · Relances impayés J+7, J+15, J+30 · Suivi en temps réel',
            },
            {
              icon: <IconMessage size={15} />,
              title: 'Messagerie & signalements locataires',
              desc:  'Communication directe liée à chaque logement, suivi des pannes et interventions',
            },
          ].map((f, i) => (
            <div key={i} className="flex gap-3 py-4"
                 style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                   style={{ background: 'rgba(255,255,255,0.09)' }}>
                <span style={{ color: 'rgba(255,255,255,0.7)' }}>{f.icon}</span>
              </div>
              <div>
                <div className="text-white font-semibold text-sm mb-0.5">{f.title}</div>
                <div className="text-xs leading-relaxed"
                     style={{ color: 'rgba(255,255,255,0.45)' }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Témoignage */}
        <div className="rounded-xl p-5 mb-6"
             style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="flex gap-0.5 mb-3">
            {[1,2,3,4,5].map(i => (
              <span key={i} className="text-yellow-400 text-sm">★</span>
            ))}
          </div>
          <p className="text-sm italic mb-4" style={{ color: 'rgba(255,255,255,0.65)' }}>
            « Cela fait 2 ans que j&apos;utilise LocCam et c&apos;est génial. La création du bail,
            les quittances, les relances — tout se génère automatiquement. Et le support est
            toujours hyper réactif. »
          </p>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white"
                 style={{ background: 'rgba(255,255,255,0.2)' }}>ML</div>
            <div>
              <div className="text-white font-semibold text-sm">Mbida Lionel</div>
              <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Bailleur · 12 biens · Akwa, Douala
              </div>
            </div>
          </div>
        </div>

        {/* Social proof */}
        <div className="flex items-center gap-0 rounded-xl p-4"
             style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
          {[
            { val: '1200+', lbl: 'Bailleurs' },
            { val: '500+',  lbl: 'Logements' },
            { val: '4,8/5', lbl: 'Satisfaction' },
            { val: '30 min',lbl: 'de gestion/mois' },
          ].map((s, i) => (
            <div key={i} className="flex-1 text-center">
              <div className="text-white font-bold text-lg leading-none">{s.val}</div>
              <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{s.lbl}</div>
            </div>
          ))}
        </div>

        {/* Note légale */}
        <div className="mt-4 text-xs leading-relaxed"
             style={{ color: 'rgba(255,255,255,0.28)' }}>
          *Essai gratuit hors contrat de bail, état des lieux, caution solidaire.<br/>
          Abonnement sans engagement. Résiliable à tout moment et sans frais.
        </div>
      </div>

    </div>
  )
}