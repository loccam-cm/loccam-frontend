'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import api from '@/lib/api'
import {
  IconUser, IconLock, IconShieldCheck, IconShieldX,
  IconCheck, IconLoader2, IconCamera, IconAlertCircle,
  IconEye, IconEyeOff, IconLogout, IconMail, IconPhone,
  IconWorld, IconEdit,
} from '@tabler/icons-react'

interface Props {
  couleur: string        // ex: '#7C3AED'
  couleurBg: string      // ex: '#F5F3FF'
  couleurLight: string   // ex: '#EDE9FE'
}

export default function CompteSettings({ couleur, couleurBg, couleurLight }: Props) {
  const { user, deconnexion } = useAuth()

  // Profil
  const [editProfil, setEditProfil] = useState(false)
  const [savingProfil, setSavingProfil] = useState(false)
  const [profil, setProfil] = useState({
    nom:       user?.nom       ?? '',
    prenom:    user?.prenom    ?? '',
    telephone: user?.telephone ?? '',
    langue:    user?.langue    ?? 'fr',
  })

  // Mot de passe
  const [editMdp, setEditMdp] = useState(false)
  const [savingMdp, setSavingMdp] = useState(false)
  const [mdp, setMdp] = useState({ ancien: '', nouveau: '', confirmation: '' })
  const [showMdp, setShowMdp] = useState({ ancien: false, nouveau: false, confirmation: false })

  // Avatar
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  if (!user) return null

  // ── Sauvegarder profil ──────────────────────────────────
  const sauvegarderProfil = async () => {
    setSavingProfil(true)
    try {
      await api.patch('/auth/profil/', profil)
      toast.success('Profil mis à jour !')
      setEditProfil(false)
      // Rafraîchir le token user dans le contexte
      window.location.reload()
    } catch {
      toast.error('Erreur lors de la mise à jour')
    } finally { setSavingProfil(false) }
  }

  // ── Changer mot de passe ────────────────────────────────
  const changerMotDePasse = async () => {
    if (mdp.nouveau !== mdp.confirmation) {
      toast.error('Les mots de passe ne correspondent pas')
      return
    }
    setSavingMdp(true)
    try {
      await api.post('/auth/changer-mot-de-passe/', {
        ancien_mot_de_passe:   mdp.ancien,
        nouveau_mot_de_passe:  mdp.nouveau,
        confirmation:          mdp.confirmation,
      })
      toast.success('Mot de passe modifié !')
      setMdp({ ancien: '', nouveau: '', confirmation: '' })
      setEditMdp(false)
    } catch (err: any) {
      const msg = err.response?.data?.error
        || err.response?.data?.ancien_mot_de_passe?.[0]
        || 'Erreur lors du changement'
      toast.error(msg)
    } finally { setSavingMdp(false) }
  }

  // ── Upload avatar ───────────────────────────────────────
  const uploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('Image trop grande (max 5 Mo)'); return }

    setUploadingAvatar(true)
    try {
      const fd = new FormData()
      fd.append('file',          file)
      fd.append('type_document', 'avatar')
      await api.post('/documents/upload/', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      toast.success('Photo mise à jour !')
      window.location.reload()
    } catch {
      toast.error("Erreur lors de l'upload")
    } finally { setUploadingAvatar(false) }
  }

  const initiales = `${user.prenom?.[0] ?? ''}${user.nom?.[0] ?? ''}`

  const inputStyle = {
    width: '100%', height: '44px', padding: '0 12px',
    borderRadius: '10px', border: '1.5px solid #E2E8F0',
    fontSize: '14px', color: '#0F172A', outline: 'none',
    background: '#fff', fontFamily: 'inherit',
  }

  const sectionStyle = {
    background: '#fff', borderRadius: '16px',
    border: '1px solid #E2E8F0', overflow: 'hidden',
  }

  return (
    <div className="space-y-4 max-w-2xl mx-auto">

      {/* ── AVATAR + INFOS IDENTITÉ ─────────────────────── */}
      <div style={sectionStyle}>
        {/* Header coloré */}
        <div className="px-6 py-5" style={{ background: `linear-gradient(135deg,${couleur}15,${couleurBg})`, borderBottom: '1px solid #F1F5F9' }}>
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt={initiales}
                     className="w-20 h-20 rounded-2xl object-cover"
                     style={{ border: `3px solid ${couleur}30` }} />
              ) : (
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-black text-white"
                     style={{ background: `linear-gradient(135deg,${couleur},${couleur}aa)` }}>
                  {initiales}
                </div>
              )}
              <label className="absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-xl flex items-center justify-center cursor-pointer"
                     style={{ background: couleur, boxShadow: `0 2px 8px ${couleur}50` }}>
                {uploadingAvatar
                  ? <IconLoader2 size={14} color="white" style={{ animation: 'spin 1s linear infinite' }} />
                  : <IconCamera size={14} color="white" />}
                <input type="file" accept="image/*" className="hidden" onChange={uploadAvatar} />
              </label>
            </div>

            <div>
              <h2 className="text-lg font-black" style={{ color: '#0F172A' }}>{user.nom_complet}</h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs px-2.5 py-1 rounded-full font-bold"
                      style={{ background: `${couleur}15`, color: couleur }}>
                  {user.role === 'bailleur' ? 'Bailleur' : 'Locataire'}
                </span>
              </div>
              <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>
                Membre depuis {new Date(user.date_creation ?? '').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>

        {/* Infos rapides */}
        <div className="px-6 py-4">
          {[
            { ico: <IconMail size={15}/>,  lbl: 'Email',     val: user.email },
            { ico: <IconPhone size={15}/>, lbl: 'Téléphone', val: user.telephone || '—' },
            { ico: <IconWorld size={15}/>, lbl: 'Langue',    val: user.langue === 'fr' ? 'Français' : 'English' },
          ].map(r => (
            <div key={r.lbl} className="flex items-center gap-3 py-2.5"
                 style={{ borderBottom: '1px solid #F8FAFC' }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                   style={{ background: couleurBg, color: couleur }}>
                {r.ico}
              </div>
              <span className="text-xs w-20 flex-shrink-0" style={{ color: '#94A3B8' }}>{r.lbl}</span>
              <span className="text-sm font-semibold truncate" style={{ color: '#0F172A' }}>{r.val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── MODIFIER LE PROFIL ──────────────────────────── */}
      <div style={sectionStyle}>
        <button
          onClick={() => setEditProfil(!editProfil)}
          className="w-full flex items-center justify-between px-6 py-4"
          style={{ background: editProfil ? couleurBg : '#fff' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                 style={{ background: couleurBg, color: couleur }}>
              <IconUser size={17} />
            </div>
            <div className="text-left">
              <div className="text-sm font-bold" style={{ color: '#0F172A' }}>Informations personnelles</div>
              <div className="text-xs" style={{ color: '#94A3B8' }}>Nom, prénom, téléphone, langue</div>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold"
               style={{ background: editProfil ? couleur : couleurBg, color: editProfil ? '#fff' : couleur }}>
            <IconEdit size={13} />
            {editProfil ? 'Fermer' : 'Modifier'}
          </div>
        </button>

        <AnimatePresence>
          {editProfil && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} transition={{ duration: .22 }}
              className="overflow-hidden">
              <div className="px-6 pb-6 pt-2 space-y-4" style={{ borderTop: '1px solid #F1F5F9' }}>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>Prénom</label>
                    <input value={profil.prenom} onChange={e => setProfil(p => ({ ...p, prenom: e.target.value }))}
                           style={inputStyle} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>Nom</label>
                    <input value={profil.nom} onChange={e => setProfil(p => ({ ...p, nom: e.target.value }))}
                           style={inputStyle} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>Téléphone</label>
                  <input value={profil.telephone} onChange={e => setProfil(p => ({ ...p, telephone: e.target.value }))}
                         placeholder="+237 6XX XXX XXX" style={inputStyle} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>Langue</label>
                  <select value={profil.langue} onChange={e => setProfil(p => ({ ...p, langue: e.target.value }))}
                          style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-1">
                  <button onClick={() => setEditProfil(false)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                    style={{ background: '#F1F5F9', color: '#64748B' }}>
                    Annuler
                  </button>
                  <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: .99 }}
                    onClick={sauvegarderProfil} disabled={savingProfil}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white"
                    style={{ background: savingProfil ? '#94A3B8' : couleur }}>
                    {savingProfil
                      ? <><IconLoader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />Sauvegarde...</>
                      : <><IconCheck size={14} />Sauvegarder</>}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── MOT DE PASSE ────────────────────────────────── */}
      <div style={sectionStyle}>
        <button
          onClick={() => setEditMdp(!editMdp)}
          className="w-full flex items-center justify-between px-6 py-4"
          style={{ background: editMdp ? '#FEF2F2' : '#fff' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                 style={{ background: editMdp ? '#FEE2E2' : '#FEF2F2', color: '#DC2626' }}>
              <IconLock size={17} />
            </div>
            <div className="text-left">
              <div className="text-sm font-bold" style={{ color: '#0F172A' }}>Mot de passe</div>
              <div className="text-xs" style={{ color: '#94A3B8' }}>Modifier votre mot de passe</div>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold"
               style={{ background: editMdp ? '#DC2626' : '#FEF2F2', color: editMdp ? '#fff' : '#DC2626' }}>
            <IconEdit size={13} />
            {editMdp ? 'Fermer' : 'Modifier'}
          </div>
        </button>

        <AnimatePresence>
          {editMdp && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} transition={{ duration: .22 }}
              className="overflow-hidden">
              <div className="px-6 pb-6 pt-2 space-y-4" style={{ borderTop: '1px solid #F1F5F9' }}>
                {[
                  { k: 'ancien',        lbl: 'Mot de passe actuel',       show: showMdp.ancien },
                  { k: 'nouveau',       lbl: 'Nouveau mot de passe',       show: showMdp.nouveau },
                  { k: 'confirmation',  lbl: 'Confirmer le nouveau mot de passe', show: showMdp.confirmation },
                ].map(f => (
                  <div key={f.k}>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>{f.lbl}</label>
                    <div className="relative">
                      <input
                        type={f.show ? 'text' : 'password'}
                        value={mdp[f.k as keyof typeof mdp]}
                        onChange={e => setMdp(m => ({ ...m, [f.k]: e.target.value }))}
                        style={{ ...inputStyle, paddingRight: '44px' }} />
                      <button type="button"
                        onClick={() => setShowMdp(s => ({ ...s, [f.k]: !s[f.k as keyof typeof s] }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                        style={{ color: '#94A3B8', background: 'none', border: 'none', cursor: 'pointer' }}>
                        {f.show ? <IconEyeOff size={16}/> : <IconEye size={16}/>}
                      </button>
                    </div>
                  </div>
                ))}

                {mdp.nouveau && mdp.confirmation && mdp.nouveau !== mdp.confirmation && (
                  <div className="flex items-center gap-2 p-3 rounded-xl"
                       style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
                    <IconAlertCircle size={14} style={{ color: '#EF4444', flexShrink: 0 }} />
                    <span className="text-xs" style={{ color: '#DC2626' }}>Les mots de passe ne correspondent pas</span>
                  </div>
                )}

                <div className="flex gap-3 pt-1">
                  <button onClick={() => { setEditMdp(false); setMdp({ ancien: '', nouveau: '', confirmation: '' }) }}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                    style={{ background: '#F1F5F9', color: '#64748B' }}>
                    Annuler
                  </button>
                  <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: .99 }}
                    onClick={changerMotDePasse} disabled={savingMdp || !mdp.ancien || !mdp.nouveau || mdp.nouveau !== mdp.confirmation}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white"
                    style={{ background: savingMdp ? '#94A3B8' : '#DC2626', opacity: (!mdp.ancien || !mdp.nouveau || mdp.nouveau !== mdp.confirmation) ? .5 : 1 }}>
                    {savingMdp
                      ? <><IconLoader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />Modification...</>
                      : <><IconLock size={14} />Modifier</>}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── CNI (si bailleur) ───────────────────────────── */}
      {user.role === 'bailleur' && (
        <div style={sectionStyle}>
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                   style={{ background: user.cni_statut === 'valide' ? '#ECFDF5' : '#FFFBEB', color: user.cni_statut === 'valide' ? '#059669' : '#D97706' }}>
                {user.cni_statut === 'valide' ? <IconShieldCheck size={17}/> : <IconShieldX size={17}/>}
              </div>
              <div>
                <div className="text-sm font-bold" style={{ color: '#0F172A' }}>Vérification CNI</div>
                <div className="text-xs" style={{ color: '#94A3B8' }}>
                  {user.cni_statut === 'valide'   ? 'Identité vérifiée ✓' :
                   user.cni_statut === 'en_attente' ? 'En cours de vérification' :
                   user.cni_statut === 'rejete'     ? 'CNI rejetée — renvoyer' :
                   'CNI non soumise'}
                </div>
              </div>
            </div>
            <span className="text-xs font-bold px-3 py-1.5 rounded-full"
                  style={{
                    background: user.cni_statut === 'valide'     ? '#ECFDF5' :
                                user.cni_statut === 'en_attente' ? '#FFFBEB' : '#FEF2F2',
                    color:      user.cni_statut === 'valide'     ? '#059669' :
                                user.cni_statut === 'en_attente' ? '#D97706' : '#DC2626',
                  }}>
              {user.cni_statut === 'valide'     ? 'Validée' :
               user.cni_statut === 'en_attente' ? 'En attente' :
               user.cni_statut === 'rejete'     ? 'Rejetée' : 'Non soumise'}
            </span>
          </div>
        </div>
      )}

      {/* ── DÉCONNEXION ─────────────────────────────────── */}
      <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: .99 }}
        onClick={deconnexion}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold"
        style={{ background: '#FEF2F2', color: '#DC2626', border: '1.5px solid #FECACA' }}>
        <IconLogout size={16} />
        Se déconnecter
      </motion.button>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
