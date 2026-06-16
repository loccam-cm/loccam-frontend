'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import UploadFichier from '@/components/UploadFichier'
import api from '@/lib/api'
import {
  IconArrowLeft, IconUser, IconMail, IconPhone,
  IconShieldCheck, IconEdit, IconCheck, IconLoader2,
  IconLock, IconAlertCircle, IconCircleCheck,
  IconCamera, IconClock, IconBan,
} from '@tabler/icons-react'

interface FormProfil {
  prenom: string
  nom: string
  telephone: string
}

interface FormPassword {
  ancien: string
  nouveau: string
  confirm: string
}

function StatutCNIBadge({ statut }: { statut: string }) {
  const map: Record<string, { bg: string; col: string; lbl: string; ico: React.ReactNode }> = {
    valide:     { bg:'#ECFDF5', col:'#059669', lbl:'CNI validée',    ico:<IconCircleCheck size={13}/> },
    en_attente: { bg:'#FFFBEB', col:'#D97706', lbl:'En attente',     ico:<IconClock size={13}/> },
    rejete:     { bg:'#FEF2F2', col:'#DC2626', lbl:'CNI rejetée',    ico:<IconBan size={13}/> },
    non_soumis: { bg:'#F1F5F9', col:'#64748B', lbl:'Non soumise',    ico:<IconAlertCircle size={13}/> },
  }
  const s = map[statut] ?? map.non_soumis
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
          style={{ background: s.bg, color: s.col }}>
      {s.ico}{s.lbl}
    </span>
  )
}

export default function ComptePage() {
  const { user, deconnexion } = useAuth()
  const [editProfil, setEditProfil] = useState(false)
  const [editPassword, setEditPassword] = useState(false)
  const [savingProfil, setSavingProfil] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [successProfil, setSuccessProfil] = useState(false)
  const [successPassword, setSuccessPassword] = useState(false)
  const [errorPassword, setErrorPassword] = useState('')
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url ?? '')

  const [formProfil, setFormProfil] = useState<FormProfil>({
    prenom: user?.prenom ?? '',
    nom: user?.nom ?? '',
    telephone: user?.telephone ?? '',
  })

  const [formPassword, setFormPassword] = useState<FormPassword>({
    ancien: '', nouveau: '', confirm: '',
  })

  if (!user) return null

  const initiales = `${user.prenom?.[0] ?? ''}${user.nom?.[0] ?? ''}`
  const isBailleur = user.role === 'bailleur'

  const saveProfil = async () => {
    setSavingProfil(true)
    try {
      const res = await api.patch(`/users/${user.id}/`, {
        prenom: formProfil.prenom,
        nom: formProfil.nom,
        telephone: formProfil.telephone,
      })
      // Mettre à jour le localStorage
      const stored = JSON.parse(localStorage.getItem('user') ?? '{}')
      localStorage.setItem('user', JSON.stringify({ ...stored, ...res.data }))
      setSuccessProfil(true)
      setEditProfil(false)
      setTimeout(() => setSuccessProfil(false), 2500)
    } catch { } finally { setSavingProfil(false) }
  }

  const savePassword = async () => {
    setErrorPassword('')
    if (formPassword.nouveau !== formPassword.confirm) {
      setErrorPassword('Les mots de passe ne correspondent pas')
      return
    }
    if (formPassword.nouveau.length < 8) {
      setErrorPassword('Le mot de passe doit contenir au moins 8 caractères')
      return
    }
    setSavingPassword(true)
    try {
      await api.post('/auth/changer-password/', {
        ancien_password: formPassword.ancien,
        nouveau_password: formPassword.nouveau,
      })
      setSuccessPassword(true)
      setEditPassword(false)
      setFormPassword({ ancien: '', nouveau: '', confirm: '' })
      setTimeout(() => setSuccessPassword(false), 2500)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      setErrorPassword(e.response?.data?.error ?? 'Mot de passe actuel incorrect')
    } finally { setSavingPassword(false) }
  }

  return (
    <>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        .input-f{width:100%;height:42px;padding:0 12px;border-radius:10px;border:1.5px solid #E2E8F0;font-size:14px;color:#0F172A;outline:none;background:#fff;transition:border-color .15s;font-family:inherit}
        .input-f:focus{border-color:#2563EB;box-shadow:0 0 0 3px rgba(37,99,235,.08)}
        .input-f:disabled{background:#F8FAFC;color:#94A3B8}
      `}</style>

      <div className="min-h-screen" style={{ background:'#F1F5F9', fontFamily:"'DM Sans','Helvetica Neue',sans-serif" }}>

        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center gap-3 px-4 sm:px-6 h-14 sm:h-16 bg-white"
                style={{ borderBottom:'1px solid #E2E8F0', boxShadow:'0 1px 3px rgba(0,0,0,.04)' }}>
          <Link href={`/${user.role}`} className="flex items-center gap-1.5 text-sm font-medium"
                style={{ color:'#64748B', textDecoration:'none' }}>
            <IconArrowLeft size={16}/>
            <span className="hidden sm:inline">Tableau de bord</span>
          </Link>
          <div className="h-5 w-px" style={{ background:'#E2E8F0' }}/>
          <div className="flex items-center gap-2 flex-1">
            <IconUser size={17} style={{ color:'#2563EB' }}/>
            <h1 className="text-sm font-bold" style={{ color:'#0F172A' }}>Mon compte</h1>
          </div>
        </header>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-5 sm:py-6 space-y-4">

          {/* ── CARTE PROFIL ─────────────────────────────── */}
          <motion.div initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }}
            className="bg-white rounded-2xl overflow-hidden"
            style={{ border:'1px solid #E2E8F0' }}>

            {/* Bandeau */}
            <div className="h-20 relative"
                 style={{ background:'linear-gradient(135deg,#0C1F35,#1E3A5F,#2563EB)' }}>
              <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-10"
                   style={{ background:'radial-gradient(circle,#60A5FA,transparent)' }}/>
            </div>

            <div className="px-5 pb-5">
              {/* Avatar */}
              <div className="flex items-end justify-between -mt-10 mb-4">
                <div className="relative">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar"
                         className="w-20 h-20 rounded-2xl object-cover"
                         style={{ border:'3px solid #fff', boxShadow:'0 4px 12px rgba(0,0,0,.1)' }}/>
                  ) : (
                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center font-bold text-2xl text-white"
                         style={{ background:'linear-gradient(135deg,#2563EB,#7C3AED)', border:'3px solid #fff', boxShadow:'0 4px 12px rgba(0,0,0,.1)' }}>
                      {initiales}
                    </div>
                  )}
                  {/* Bouton changer avatar */}
                  <UploadFichier
                    typeDocument="avatar"
                    compact={true}
                    previewActuel={avatarUrl}
                    onSuccess={(doc) => {
                      setAvatarUrl(doc.url_publique)  // ← url_publique pas url
                      const stored = JSON.parse(localStorage.getItem('user') ?? '{}')
                      localStorage.setItem('user', JSON.stringify({ ...stored, avatar_url: doc.url_publique }))
                    }}
                    className="absolute -bottom-1 -right-1"
                  />
                </div>

                <div className="flex items-center gap-2">
                  {isBailleur && <StatutCNIBadge statut={user.cni_statut ?? 'non_soumis'}/>}
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={{ background:'#EFF6FF', color:'#2563EB' }}>
                    {user.role === 'bailleur' ? 'Bailleur' : user.role === 'locataire' ? 'Locataire' : 'Admin'}
                  </span>
                </div>
              </div>

              <h2 className="text-lg font-bold mb-0.5" style={{ color:'#0F172A' }}>{user.nom_complet}</h2>
              <p className="text-sm" style={{ color:'#64748B' }}>{user.email}</p>
            </div>
          </motion.div>

          {/* ── INFORMATIONS PERSONNELLES ──────────────────── */}
          <motion.div initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }}
            transition={{ delay:.08 }}
            className="bg-white rounded-2xl overflow-hidden"
            style={{ border:'1px solid #E2E8F0' }}>

            <div className="flex items-center justify-between px-5 py-4"
                 style={{ borderBottom:'1px solid #F1F5F9' }}>
              <div className="flex items-center gap-2">
                <IconUser size={16} style={{ color:'#2563EB' }}/>
                <h3 className="text-sm font-bold" style={{ color:'#0F172A' }}>Informations personnelles</h3>
              </div>
              {!editProfil ? (
                <button onClick={() => setEditProfil(true)}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg"
                  style={{ background:'#EFF6FF', color:'#2563EB' }}>
                  <IconEdit size={13}/>Modifier
                </button>
              ) : (
                <button onClick={() => setEditProfil(false)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                  style={{ background:'#F1F5F9', color:'#64748B' }}>
                  Annuler
                </button>
              )}
            </div>

            <div className="px-5 py-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color:'#374151' }}>Prénom</label>
                  <input value={formProfil.prenom}
                         onChange={e => setFormProfil(p => ({ ...p, prenom: e.target.value }))}
                         disabled={!editProfil}
                         className="input-f" placeholder="Prénom"/>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color:'#374151' }}>Nom</label>
                  <input value={formProfil.nom}
                         onChange={e => setFormProfil(p => ({ ...p, nom: e.target.value }))}
                         disabled={!editProfil}
                         className="input-f" placeholder="Nom"/>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color:'#374151' }}>Email</label>
                <div className="relative">
                  <IconMail size={15} style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', color:'#94A3B8' }}/>
                  <input value={user.email} disabled
                         className="input-f" style={{ paddingLeft:'36px' }}/>
                </div>
                <p className="text-xs mt-1" style={{ color:'#94A3B8' }}>L&apos;email ne peut pas être modifié</p>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color:'#374151' }}>Téléphone</label>
                <div className="relative">
                  <IconPhone size={15} style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', color:'#94A3B8' }}/>
                  <input value={formProfil.telephone}
                         onChange={e => setFormProfil(p => ({ ...p, telephone: e.target.value }))}
                         disabled={!editProfil}
                         className="input-f" style={{ paddingLeft:'36px' }}
                         placeholder="+237 6XX XXX XXX"/>
                </div>
              </div>

              <AnimatePresence>
                {editProfil && (
                  <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }}
                              exit={{ opacity:0, y:-8 }}>
                    <motion.button whileHover={{ scale:1.01 }} whileTap={{ scale:.99 }}
                      onClick={saveProfil} disabled={savingProfil}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white"
                      style={{ background: successProfil ? '#059669' : 'linear-gradient(135deg,#2563EB,#1D4ED8)', boxShadow:'0 2px 10px rgba(37,99,235,.3)' }}>
                      {savingProfil ? <><IconLoader2 size={15} style={{ animation:'spin 1s linear infinite' }}/>Enregistrement...</>
                        : successProfil ? <><IconCheck size={15}/>Enregistré !</>
                        : <><IconCheck size={15}/>Sauvegarder les modifications</>}
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* ── CNI (bailleurs seulement) ──────────────────── */}
          {isBailleur && (
            <motion.div initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }}
              transition={{ delay:.12 }}
              className="bg-white rounded-2xl overflow-hidden"
              style={{ border:'1px solid #E2E8F0' }}>

              <div className="flex items-center gap-2 px-5 py-4"
                   style={{ borderBottom:'1px solid #F1F5F9' }}>
                <IconShieldCheck size={16} style={{ color:'#7C3AED' }}/>
                <h3 className="text-sm font-bold flex-1" style={{ color:'#0F172A' }}>Vérification CNI</h3>
                <StatutCNIBadge statut={user.cni_statut ?? 'non_soumis'}/>
              </div>

              <div className="px-5 py-5">
                {user.cni_statut === 'valide' ? (
                  <div className="flex items-center gap-3 p-4 rounded-2xl"
                       style={{ background:'#ECFDF5', border:'1px solid #A7F3D0' }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                         style={{ background:'#059669' }}>
                      <IconCircleCheck size={20} color="white"/>
                    </div>
                    <div>
                      <div className="text-sm font-bold" style={{ color:'#059669' }}>CNI validée par l&apos;administration</div>
                      <div className="text-xs" style={{ color:'#64748B' }}>Votre identité a été vérifiée. Vous êtes bailleur certifié LocCam.</div>
                    </div>
                  </div>
                ) : user.cni_statut === 'en_attente' ? (
                  <div className="flex items-center gap-3 p-4 rounded-2xl"
                       style={{ background:'#FFFBEB', border:'1px solid #FDE68A' }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                         style={{ background:'#D97706' }}>
                      <IconClock size={20} color="white"/>
                    </div>
                    <div>
                      <div className="text-sm font-bold" style={{ color:'#92400E' }}>CNI en cours de vérification</div>
                      <div className="text-xs" style={{ color:'#B45309' }}>L&apos;administration validera votre CNI sous 24h ouvrables.</div>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm mb-4" style={{ color:'#64748B' }}>
                      Uploadez une photo de votre CNI pour être certifié bailleur LocCam.
                      Ce document est <strong style={{ color:'#7C3AED' }}>strictement privé</strong> et ne sera visible que par l&apos;administration.
                    </p>
                    <UploadFichier
                      typeDocument="cni"
                      label="Photo CNI (recto)"
                      description="JPG, PNG ou PDF · Max 5 MB · Fichier privé et sécurisé"
                      onSuccess={() => {
                        // Recharger le profil
                        window.location.reload()
                      }}
                    />
                    {user.cni_statut === 'rejete' && (
                      <div className="flex items-center gap-2 mt-3 p-3 rounded-xl"
                           style={{ background:'#FEF2F2', border:'1px solid #FECACA' }}>
                        <IconAlertCircle size={14} style={{ color:'#DC2626' }}/>
                        <p className="text-xs" style={{ color:'#DC2626' }}>
                          Votre CNI a été rejetée. Uploadez une nouvelle photo plus lisible.
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          )}

          {/* ── SÉCURITÉ ──────────────────────────────────── */}
          <motion.div initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }}
            transition={{ delay:.16 }}
            className="bg-white rounded-2xl overflow-hidden"
            style={{ border:'1px solid #E2E8F0' }}>

            <div className="flex items-center justify-between px-5 py-4"
                 style={{ borderBottom:'1px solid #F1F5F9' }}>
              <div className="flex items-center gap-2">
                <IconLock size={16} style={{ color:'#DC2626' }}/>
                <h3 className="text-sm font-bold" style={{ color:'#0F172A' }}>Sécurité</h3>
              </div>
              {!editPassword ? (
                <button onClick={() => setEditPassword(true)}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg"
                  style={{ background:'#FEF2F2', color:'#DC2626' }}>
                  <IconEdit size={13}/>Changer le mot de passe
                </button>
              ) : (
                <button onClick={() => { setEditPassword(false); setErrorPassword('') }}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                  style={{ background:'#F1F5F9', color:'#64748B' }}>
                  Annuler
                </button>
              )}
            </div>

            <AnimatePresence>
              {editPassword ? (
                <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }}
                            exit={{ height:0, opacity:0 }} transition={{ duration:.22 }}
                            className="overflow-hidden">
                  <div className="px-5 py-4 space-y-3">
                    {[
                      { key:'ancien', lbl:'Mot de passe actuel', ph:'••••••••' },
                      { key:'nouveau', lbl:'Nouveau mot de passe', ph:'Min. 8 caractères' },
                      { key:'confirm', lbl:'Confirmer le nouveau', ph:'••••••••' },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="block text-xs font-semibold mb-1.5" style={{ color:'#374151' }}>{f.lbl}</label>
                        <input type="password"
                               value={formPassword[f.key as keyof FormPassword]}
                               onChange={e => setFormPassword(p => ({ ...p, [f.key]: e.target.value }))}
                               className="input-f" placeholder={f.ph}/>
                      </div>
                    ))}

                    <AnimatePresence>
                      {errorPassword && (
                        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl"
                          style={{ background:'#FEF2F2', border:'1px solid #FECACA' }}>
                          <IconAlertCircle size={13} style={{ color:'#DC2626' }}/>
                          <span className="text-xs" style={{ color:'#DC2626' }}>{errorPassword}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <motion.button whileHover={{ scale:1.01 }} whileTap={{ scale:.99 }}
                      onClick={savePassword} disabled={savingPassword}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white"
                      style={{ background: successPassword ? '#059669' : '#DC2626', boxShadow:'0 2px 10px rgba(220,38,38,.25)' }}>
                      {savingPassword ? <><IconLoader2 size={15} style={{ animation:'spin 1s linear infinite' }}/>Modification...</>
                        : successPassword ? <><IconCheck size={15}/>Mot de passe modifié !</>
                        : <><IconLock size={15}/>Modifier le mot de passe</>}
                    </motion.button>
                  </div>
                </motion.div>
              ) : (
                <div className="px-5 py-4">
                  <p className="text-sm" style={{ color:'#94A3B8' }}>
                    Dernière modification : jamais · Utilisez un mot de passe fort de 8+ caractères.
                  </p>
                </div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* ── ZONE DANGER ───────────────────────────────── */}
          <motion.div initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }}
            transition={{ delay:.2 }}
            className="bg-white rounded-2xl p-5"
            style={{ border:'1px solid #FECACA' }}>
            <h3 className="text-sm font-bold mb-1" style={{ color:'#DC2626' }}>Zone de danger</h3>
            <p className="text-xs mb-4" style={{ color:'#94A3B8' }}>
              La déconnexion vous redirigera vers la page de connexion.
            </p>
            <button onClick={deconnexion}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background:'#FEF2F2', color:'#DC2626', border:'1px solid #FECACA' }}>
              Se déconnecter
            </button>
          </motion.div>

        </div>
      </div>
    </>
  )
}
