'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import api from '@/lib/api'
import { AuthResponse } from '@/types'
import {
  IconBuilding,
  IconMail,
  IconLock,
  IconEye,
  IconEyeOff,
  IconLogin,
  IconMapPin,
  IconHome2,
  IconUser,
} from '@tabler/icons-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [role, setRole]         = useState<'bailleur' | 'locataire'>('bailleur')
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.post<AuthResponse>('/auth/connexion/', {
        email, password,
      })
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

  const tabs = [
    { val: 'bailleur'  as const, label: 'Bailleur',   icon: <IconHome2 size={16} /> },
    { val: 'locataire' as const, label: 'Locataire',  icon: <IconUser  size={16} /> },
  ]

  return (
    <div className="min-h-screen flex">

      {/* ── PANNEAU GAUCHE ── */}
      <div
        className="hidden lg:flex flex-1 flex-col justify-between p-10"
        style={{ background: 'linear-gradient(135deg, #0F2438 0%, #1A3C5E 100%)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
               style={{ background: 'rgba(255,255,255,0.15)' }}>
            <IconBuilding size={22} color="white" />
          </div>
          <div>
            <div className="text-white font-bold text-xl tracking-tight">LocCam</div>
            <div className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Gestion locative camerounaise
            </div>
          </div>
        </div>

        {/* Texte hero */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <IconMapPin size={14} color="rgba(255,255,255,0.6)" />
            <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Douala · Yaoundé · Cameroun 🇨🇲
            </span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
            La gestion locative<br/>
            <span style={{ color: 'rgba(255,255,255,0.55)' }}>simplifiée</span>
          </h1>
          <p className="text-base leading-relaxed mb-8"
             style={{ color: 'rgba(255,255,255,0.6)' }}>
            Gérez vos biens, invitez vos locataires et encaissez
            vos loyers via Orange Money et MTN Money.
          </p>

          {/* Carte démo */}
          <div className="rounded-2xl p-5"
               style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white"
                   style={{ background: 'rgba(255,255,255,0.2)' }}>KV</div>
              <div>
                <div className="text-white font-semibold text-sm">Kenmatio Vicens</div>
                <div className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Bailleur · Douala
                </div>
              </div>
              <div className="ml-auto text-xs font-semibold px-3 py-1 rounded-full"
                   style={{ background: 'rgba(15,110,86,0.3)', color: '#4ADE80' }}>
                ✓ CNI validée
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { val: '24',   lbl: 'Logements gérés' },
                { val: '87%',  lbl: "Taux d'occupation" },
                { val: '1.8M', lbl: 'Revenus XAF/mois' },
                { val: '3',    lbl: 'Loyers en retard' },
              ].map((s) => (
                <div key={s.lbl} className="rounded-xl p-3"
                     style={{ background: 'rgba(255,255,255,0.07)' }}>
                  <div className="text-white font-bold text-lg">{s.val}</div>
                  <div className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    {s.lbl}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Skyline camerounaise */}
          <div className="flex items-end gap-1 mt-6 opacity-15">
            {[30,22,48,18,55,38,44,26,42,32,36,20,50,28,40].map((h, i) => (
              <div key={i} className="bg-white rounded-t flex-1"
                   style={{ height: `${h}px` }} />
            ))}
          </div>
        </div>

        {/* Footer gauche */}
        <div className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
          © 2026 LocCam · Tous droits réservés
        </div>
      </div>

      {/* ── PANNEAU DROIT — FORMULAIRE ── */}
      <div className="w-full lg:w-[480px] flex flex-col bg-white shadow-2xl">
        <div className="flex-1 flex flex-col justify-center px-10 py-12">

          {/* Header */}
          <div className="mb-8">
            <div className="text-xs font-bold tracking-widest uppercase mb-2"
                 style={{ color: '#2E75B6' }}>
              Espace sécurisé
            </div>
            <h2 className="text-3xl font-bold mb-2" style={{ color: '#1E2A3E' }}>
              Bon retour 👋
            </h2>
            <p className="text-sm" style={{ color: '#5B6E8C' }}>
              Connectez-vous à votre espace LocCam.{' '}
              <Link href="/register"
                    className="font-semibold hover:underline"
                    style={{ color: '#1A3C5E' }}>
                S&apos;inscrire gratuitement
              </Link>
            </p>
          </div>

          {/* Tabs rôle — Bailleur / Locataire uniquement */}
          <div className="flex rounded-xl p-1 mb-6 gap-1"
               style={{ background: '#F1F5F9', border: '1px solid #E6EDF4' }}>
            {tabs.map((t) => (
              <button key={t.val}
                type="button"
                onClick={() => setRole(t.val)}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2"
                style={role === t.val
                  ? { background: '#1A3C5E', color: '#fff' }
                  : { color: '#8A9BB0' }
                }>
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold mb-1.5"
                     style={{ color: '#1E2A3E' }}>
                Adresse email <span style={{ color: '#A32D2D' }}>*</span>
              </label>
              <div className="relative">
                <IconMail size={17} className="absolute left-3 top-1/2 -translate-y-1/2"
                          style={{ color: '#8A9BB0' }} />
                <input type="email" required value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.cm"
                  className="w-full h-11 pl-10 pr-4 rounded-xl text-sm outline-none"
                  style={{ border: '1.5px solid #E6EDF4', color: '#1E2A3E', background: '#fff' }}
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label className="block text-xs font-semibold mb-1.5"
                     style={{ color: '#1E2A3E' }}>
                Mot de passe <span style={{ color: '#A32D2D' }}>*</span>
              </label>
              <div className="relative">
                <IconLock size={17} className="absolute left-3 top-1/2 -translate-y-1/2"
                          style={{ color: '#8A9BB0' }} />
                <input type={showPass ? 'text' : 'password'} required value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 pl-10 pr-11 rounded-xl text-sm outline-none"
                  style={{ border: '1.5px solid #E6EDF4', color: '#1E2A3E' }}
                />
                <button type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: '#8A9BB0' }}>
                  {showPass ? <IconEyeOff size={17} /> : <IconEye size={17} />}
                </button>
              </div>
            </div>

            {/* Se souvenir + mot de passe oublié */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm cursor-pointer"
                     style={{ color: '#5B6E8C' }}>
                <input type="checkbox" className="w-4 h-4 rounded accent-blue-800" />
                Se souvenir de moi
              </label>
              <Link href="/forgot-password"
                    className="text-sm font-semibold hover:underline"
                    style={{ color: '#1A3C5E' }}>
                Mot de passe oublié ?
              </Link>
            </div>

            {/* Bouton submit */}
            <button type="submit" disabled={loading}
              className="w-full h-12 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all mt-1"
              style={{
                background: loading ? '#5B6E8C' : '#1A3C5E',
                boxShadow: '0 4px 14px rgba(26,60,94,0.3)',
              }}>
              <IconLogin size={18} />
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>

            {/* Divider OAuth */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px" style={{ background: '#E6EDF4' }} />
              <span className="text-xs" style={{ color: '#8A9BB0' }}>ou continuer avec</span>
              <div className="flex-1 h-px" style={{ background: '#E6EDF4' }} />
            </div>

            {/* Boutons OAuth */}
            <div className="grid grid-cols-2 gap-3">
              <button type="button"
                className="h-11 rounded-xl border flex items-center justify-center gap-2 text-sm font-semibold transition-all hover:bg-gray-50"
                style={{ borderColor: '#E6EDF4', color: '#1E2A3E' }}>
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </button>
              <button type="button"
                className="h-11 rounded-xl border flex items-center justify-center gap-2 text-sm font-semibold transition-all hover:bg-gray-50"
                style={{ borderColor: '#E6EDF4', color: '#1E2A3E' }}>
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <circle cx="12" cy="12" r="10" fill="#1877F2"/>
                  <path d="M16.5 8H14c-.3 0-.5.2-.5.5V10H16l-.4 2H13.5v6h-2.5v-6H9V10h2V8.5C11 6.6 12.2 5.5 14 5.5c.8 0 1.7.1 2.5.2V8z" fill="white"/>
                </svg>
                Facebook
              </button>
            </div>

          </form>

          {/* Lien inscription */}
          <div className="text-center mt-6 pt-6 text-sm"
               style={{ borderTop: '1px solid #E6EDF4', color: '#5B6E8C' }}>
            Nouveau sur LocCam ?{' '}
            <Link href="/register"
                  className="font-bold hover:underline"
                  style={{ color: '#1A3C5E' }}>
              Créer un compte gratuitement
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="px-10 py-4 flex justify-center gap-5"
             style={{ borderTop: '1px solid #E6EDF4' }}>
          {['Confidentialité', 'Conditions', 'Contact', 'Aide'].map((l) => (
            <a key={l} href="#"
               className="text-xs hover:underline"
               style={{ color: '#8A9BB0' }}>
              {l}
            </a>
          ))}
        </div>
      </div>

    </div>
  )
}