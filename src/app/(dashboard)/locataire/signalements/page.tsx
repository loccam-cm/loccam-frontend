'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import api from '@/lib/api'
import { Contrat, PaginatedResponse } from '@/types'
import {
  IconTool, IconArrowLeft, IconRefresh, IconPlus,
  IconX, IconCheck, IconLoader2, IconHome2,
  IconClock, IconCircleCheck, IconAlertTriangle,
  IconChevronDown,
} from '@tabler/icons-react'

// ── Types ──────────────────────────────────────────────────
interface Signalement {
  id: number
  bien: { id: number; titre: string; adresse: string }
  type_panne: string
  description: string
  urgence: 'basse' | 'moyenne' | 'elevee' | 'critique'
  statut: 'ouvert' | 'en_cours' | 'resolu' | 'clos'
  commentaire_resolution: string
  date_creation: string
  date_resolution: string | null
}

interface FormData {
  bien: string
  type_panne: string
  urgence: string
  description: string
}

const TYPES_PANNE = [
  { val: 'panne_elec', lbl: '⚡ Panne électrique' },
  { val: 'fuite_eau',  lbl: '💧 Fuite d\'eau' },
  { val: 'plomberie',  lbl: '🔧 Plomberie' },
  { val: 'clim',       lbl: '❄️ Climatisation' },
  { val: 'menuiserie', lbl: '🚪 Menuiserie' },
  { val: 'autre',      lbl: '🔨 Autre' },
]

const URGENCES = [
  { val: 'basse',    lbl: 'Basse',    col: '#059669', bg: '#ECFDF5' },
  { val: 'moyenne',  lbl: 'Moyenne',  col: '#D97706', bg: '#FFFBEB' },
  { val: 'elevee',   lbl: 'Élevée',   col: '#DC2626', bg: '#FEF2F2' },
  { val: 'critique', lbl: 'Critique', col: '#BE123C', bg: '#FFF1F2' },
]

const STATUT_MAP = {
  ouvert:   { bg: '#EFF6FF', col: '#2563EB', lbl: 'Ouvert',   ico: <IconClock size={11}/> },
  en_cours: { bg: '#FFFBEB', col: '#D97706', lbl: 'En cours', ico: <IconTool size={11}/> },
  resolu:   { bg: '#ECFDF5', col: '#059669', lbl: 'Résolu',   ico: <IconCheck size={11}/> },
  clos:     { bg: '#F1F5F9', col: '#64748B', lbl: 'Clos',     ico: <IconCircleCheck size={11}/> },
}

function StatutBadge({ statut }: { statut: Signalement['statut'] }) {
  const s = STATUT_MAP[statut]
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
      style={{ background: s.bg, color: s.col }}>
      {s.ico}{s.lbl}
    </span>
  )
}

function tempsRelatif(date: string): string {
  const diff = Date.now() - new Date(date).getTime()
  const j = Math.floor(diff / 86400000)
  if (j === 0) return "Aujourd'hui"
  if (j === 1) return 'Hier'
  if (j < 7)   return `Il y a ${j} jours`
  return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

// ── Modal nouveau signalement ──────────────────────────────
function ModalNouveauSignalement({ bienId, onClose, onSuccess }: {
  bienId: number | null; onClose: () => void; onSuccess: () => void
}) {
  const [biens, setBiens] = useState<{ id: number; titre: string }[]>([])
  const [form, setForm]   = useState<FormData>({ bien: bienId?.toString() ?? '', type_panne: '', urgence: 'moyenne', description: '' })
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    api.get<PaginatedResponse<Contrat>>('/contrats/')
      .then(r => {
        const bs = r.data.results
          .filter(c => c.statut === 'actif' && c.bien)
          .map(c => ({ id: c.bien!.id, titre: c.bien!.titre }))
        setBiens(bs)
        if (bs.length === 1 && !form.bien) setForm(f => ({ ...f, bien: bs[0].id.toString() }))
      })
      .catch(() => {})
  }, [])

  const set = (k: keyof FormData, v: string) => setForm(f => ({ ...f, [k]: v }))

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.bien)        e.bien        = 'Choisissez un logement'
    if (!form.type_panne)  e.type_panne  = 'Choisissez un type de panne'
    if (!form.description.trim()) e.description = 'Décrivez le problème'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    try {
      await api.post('/signalements/', {
        bien:        Number(form.bien),
        type_panne:  form.type_panne,
        urgence:     form.urgence,
        description: form.description.trim(),
      })
      toast.success('Signalement envoyé à votre bailleur !')
      onSuccess(); onClose()
    } catch (err: unknown) {
      const ex = err as { response?: { data?: Record<string, string[]> } }
      if (ex.response?.data) {
        const apiErrors: Record<string, string> = {}
        Object.entries(ex.response.data).forEach(([k, v]) => {
          apiErrors[k] = Array.isArray(v) ? v[0] : String(v)
        })
        setErrors(apiErrors)
      } else {
        toast.error('Erreur lors de l\'envoi')
      }
    } finally { setSaving(false) }
  }

  const fieldStyle = { border: '1.5px solid #E2E8F0', borderRadius: '10px', fontSize: '13px', color: '#0F172A', outline: 'none', background: '#fff', fontFamily: 'inherit', width: '100%' }

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(0,0,0,.45)', backdropFilter: 'blur(6px)' }}
        onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: .96, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: .96, y: 16 }} transition={{ duration: .2 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden"
          style={{ boxShadow: '0 24px 60px rgba(0,0,0,.2)', fontFamily: "'DM Sans',sans-serif" }}
          onClick={e => e.stopPropagation()}>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5"
            style={{ background: 'linear-gradient(135deg,#78350F,#D97706)' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,.15)' }}>
                <IconTool size={18} color="white" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Déclarer une panne</h2>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,.6)' }}>
                  Votre bailleur sera notifié
                </p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,.15)', color: 'white' }}>
              <IconX size={15} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

            {/* Logement */}
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: '#374151' }}>
                Logement <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <div className="relative">
                <select value={form.bien} onChange={e => set('bien', e.target.value)}
                  style={{ ...fieldStyle, height: '42px', padding: '0 12px', cursor: 'pointer', appearance: 'none', color: form.bien ? '#0F172A' : '#94A3B8' }}>
                  <option value="">-- Choisir un logement --</option>
                  {biens.map(b => <option key={b.id} value={b.id}>{b.titre}</option>)}
                </select>
                <IconChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
              </div>
              {errors.bien && <p className="text-xs mt-1" style={{ color: '#EF4444' }}>{errors.bien}</p>}
            </div>

            {/* Type de panne */}
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: '#374151' }}>
                Type de panne <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {TYPES_PANNE.map(t => (
                  <button key={t.val} type="button" onClick={() => set('type_panne', t.val)}
                    className="flex flex-col items-center gap-1 p-2.5 rounded-xl text-xs font-semibold transition-all"
                    style={{
                      border: `1.5px solid ${form.type_panne === t.val ? '#D97706' : '#E2E8F0'}`,
                      background: form.type_panne === t.val ? '#FFFBEB' : '#fff',
                      color: form.type_panne === t.val ? '#D97706' : '#64748B',
                    }}>
                    <span style={{ fontSize: '18px' }}>{t.lbl.split(' ')[0]}</span>
                    <span style={{ fontSize: '10px', textAlign: 'center', lineHeight: 1.2 }}>
                      {t.lbl.split(' ').slice(1).join(' ')}
                    </span>
                  </button>
                ))}
              </div>
              {errors.type_panne && <p className="text-xs mt-1" style={{ color: '#EF4444' }}>{errors.type_panne}</p>}
            </div>

            {/* Urgence */}
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: '#374151' }}>Niveau d&apos;urgence</label>
              <div className="grid grid-cols-4 gap-1.5">
                {URGENCES.map(u => (
                  <button key={u.val} type="button" onClick={() => set('urgence', u.val)}
                    className="py-2 rounded-lg text-xs font-semibold transition-all"
                    style={{
                      border: `1.5px solid ${form.urgence === u.val ? u.col : '#E2E8F0'}`,
                      background: form.urgence === u.val ? u.bg : '#fff',
                      color: form.urgence === u.val ? u.col : '#64748B',
                    }}>
                    {u.lbl}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: '#374151' }}>
                Description <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)}
                placeholder="Décrivez le problème en détail : où est la panne, depuis quand, symptômes observés..."
                rows={4}
                style={{ ...fieldStyle, padding: '10px 12px', resize: 'vertical', minHeight: '90px', lineHeight: 1.6, border: errors.description ? '1.5px solid #EF4444' : '1.5px solid #E2E8F0' }} />
              {errors.description && <p className="text-xs mt-1" style={{ color: '#EF4444' }}>{errors.description}</p>}
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: '#F1F5F9', color: '#64748B' }}>Annuler</button>
              <motion.button type="submit" disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg,#D97706,#B45309)', boxShadow: '0 3px 12px rgba(217,119,6,.4)' }}
                whileHover={saving ? {} : { scale: 1.01 }} whileTap={saving ? {} : { scale: .99 }}>
                {saving
                  ? <><IconLoader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />Envoi...</>
                  : <><IconAlertTriangle size={14} />Déclarer la panne</>}
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </>
  )
}

// ── Page principale ────────────────────────────────────────
export default function LocataireSignalementsPage() {
  const { user }        = useAuth()
  const [signalements, setSignalements] = useState<Signalement[]>([])
  const [loading, setLoading]           = useState(true)
  const [showModal, setShowModal]       = useState(false)
  const [selected, setSelected]         = useState<Signalement | null>(null)
  const [bienIdPrefill, setBienIdPrefill] = useState<number | null>(null)

  useEffect(() => { const init = async () => { await load() }; init() }, [])

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get<PaginatedResponse<Signalement>>('/signalements/')
      setSignalements(res.data.results)
    } catch { toast.error('Erreur lors du chargement') }
    finally { setLoading(false) }
  }

  const stats = {
    total:   signalements.length,
    ouverts: signalements.filter(s => s.statut === 'ouvert').length,
    resolus: signalements.filter(s => s.statut === 'resolu' || s.statut === 'clos').length,
  }

  if (!user) return null

  return (
    <>
      <style>{`
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes spin{to{transform:rotate(360deg)}}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:#D1FAE5;border-radius:4px}
      `}</style>

      <div className="min-h-screen" style={{ background: '#F0FDF4', fontFamily: "'DM Sans','Helvetica Neue',sans-serif" }}>

        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center gap-3 px-4 sm:px-6 h-14 sm:h-16 bg-white"
          style={{ borderBottom: '1px solid #D1FAE5', boxShadow: '0 1px 4px rgba(5,150,105,.05)' }}>
          <Link href="/locataire" className="flex items-center gap-1.5 text-sm font-medium flex-shrink-0"
            style={{ color: '#64748B', textDecoration: 'none' }}>
            <IconArrowLeft size={16} />
            <span className="hidden sm:inline">Retour</span>
          </Link>
          <div className="h-5 w-px flex-shrink-0" style={{ background: '#D1FAE5' }} />
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <IconTool size={17} style={{ color: '#D97706', flexShrink: 0 }} />
            <h1 className="text-sm font-bold truncate" style={{ color: '#0F172A' }}>Mes signalements</h1>
            {!loading && stats.ouverts > 0 && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                style={{ background: '#FEF2F2', color: '#DC2626' }}>
                {stats.ouverts} en attente
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={load} className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: '#F0FDF4', border: '1px solid #D1FAE5' }}>
              <IconRefresh size={15} style={{ color: '#059669', animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            </button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: .98 }}
              onClick={() => { setBienIdPrefill(null); setShowModal(true) }}
              className="flex items-center gap-1.5 px-3 sm:px-4 h-9 rounded-xl text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg,#D97706,#B45309)', boxShadow: '0 2px 8px rgba(217,119,6,.35)' }}>
              <IconPlus size={15} />
              <span className="hidden sm:inline">Déclarer une panne</span>
            </motion.button>
          </div>
        </header>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-5 space-y-4">

          {/* Stats */}
          {!loading && (
            <div className="grid grid-cols-3 gap-3">
              {[
                { lbl: 'Total',   val: stats.total,   col: '#D97706', bg: '#FFFBEB' },
                { lbl: 'Ouverts', val: stats.ouverts, col: '#DC2626', bg: '#FEF2F2' },
                { lbl: 'Résolus', val: stats.resolus, col: '#059669', bg: '#ECFDF5' },
              ].map(s => (
                <div key={s.lbl} className="bg-white rounded-2xl p-4 text-center"
                  style={{ border: '1px solid #E2E8F0' }}>
                  <div className="text-2xl font-bold mb-0.5" style={{ color: s.col }}>{s.val}</div>
                  <div className="text-xs" style={{ color: '#94A3B8' }}>{s.lbl}</div>
                </div>
              ))}
            </div>
          )}

          {/* Liste */}
          {loading ? (
            <div className="space-y-3">
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="h-24 rounded-2xl"
                  style={{ background: 'linear-gradient(90deg,#D1FAE5 25%,#ECFDF5 50%,#D1FAE5 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
              ))}
            </div>
          ) : signalements.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl"
              style={{ border: '1px solid #E2E8F0' }}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: '#ECFDF5' }}>
                <IconCircleCheck size={28} style={{ color: '#6EE7B7' }} />
              </div>
              <h3 className="text-base font-bold mb-2" style={{ color: '#0F172A' }}>Aucun signalement</h3>
              <p className="text-sm mb-5" style={{ color: '#64748B' }}>
                Signalez une panne à votre bailleur en appuyant sur le bouton ci-dessous.
              </p>
              <button onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg,#D97706,#B45309)' }}>
                <IconPlus size={15} />Déclarer une panne
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {signalements.map((s, i) => (
                <motion.div key={s.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-white rounded-2xl overflow-hidden cursor-pointer"
                  style={{ border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}
                  onClick={() => setSelected(s)}>

                  {/* Bande urgence */}
                  <div style={{ height: '3px', background: URGENCES.find(u => u.val === s.urgence)?.col ?? '#E2E8F0' }} />

                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-sm font-bold" style={{ color: '#0F172A' }}>
                            {TYPES_PANNE.find(t => t.val === s.type_panne)?.lbl ?? s.type_panne}
                          </span>
                          <StatutBadge statut={s.statut} />
                        </div>
                        <p className="text-xs" style={{ color: '#64748B', lineHeight: 1.5 }}>
                          {s.description.length > 80 ? s.description.slice(0, 80) + '...' : s.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2.5"
                      style={{ borderTop: '1px solid #F1F5F9' }}>
                      <div className="flex items-center gap-1.5 text-xs" style={{ color: '#94A3B8' }}>
                        <IconHome2 size={11}/> {s.bien.titre}
                      </div>
                      <span className="text-xs" style={{ color: '#94A3B8' }}>
                        {tempsRelatif(s.date_creation)}
                      </span>
                    </div>

                    {/* Commentaire résolution */}
                    {s.commentaire_resolution && (
                      <div className="mt-3 p-3 rounded-xl"
                        style={{ background: '#ECFDF5', border: '1px solid #A7F3D0' }}>
                        <div className="flex items-center gap-1.5 mb-1">
                          <IconCircleCheck size={12} style={{ color: '#059669' }} />
                          <span className="text-xs font-semibold" style={{ color: '#059669' }}>
                            Réponse du bailleur
                          </span>
                        </div>
                        <p className="text-xs" style={{ color: '#065F46', lineHeight: 1.5 }}>
                          {s.commentaire_resolution}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Détail modal */}
          <AnimatePresence>
            {selected && (
              <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="fixed inset-0 z-40"
                  style={{ background: 'rgba(0,0,0,.45)', backdropFilter: 'blur(6px)' }}
                  onClick={() => setSelected(null)} />
                <motion.div initial={{ opacity: 0, scale: .96, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: .96, y: 16 }} transition={{ duration: .2 }}
                  className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden"
                    style={{ boxShadow: '0 24px 60px rgba(0,0,0,.2)' }}
                    onClick={e => e.stopPropagation()}>

                    <div style={{ height: '4px', background: URGENCES.find(u => u.val === selected.urgence)?.col ?? '#E2E8F0' }} />

                    <div className="flex items-center justify-between px-5 py-4"
                      style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <h2 className="text-sm font-bold" style={{ color: '#0F172A' }}>Détail du signalement</h2>
                      <button onClick={() => setSelected(null)}
                        className="w-8 h-8 rounded-xl flex items-center justify-center"
                        style={{ background: '#F1F5F9' }}>
                        <IconX size={14} style={{ color: '#64748B' }} />
                      </button>
                    </div>

                    <div className="px-5 py-5 space-y-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold" style={{ color: '#0F172A' }}>
                          {TYPES_PANNE.find(t => t.val === selected.type_panne)?.lbl}
                        </span>
                        <StatutBadge statut={selected.statut} />
                        <span className="text-xs font-bold px-2 py-1 rounded-full"
                          style={{ background: URGENCES.find(u => u.val === selected.urgence)?.bg, color: URGENCES.find(u => u.val === selected.urgence)?.col }}>
                          {URGENCES.find(u => u.val === selected.urgence)?.lbl}
                        </span>
                      </div>

                      <p className="text-sm" style={{ color: '#475569', lineHeight: 1.6 }}>{selected.description}</p>

                      <div className="flex items-center gap-1.5 text-xs" style={{ color: '#94A3B8' }}>
                        <IconHome2 size={12}/> {selected.bien.titre}
                        <span>·</span>
                        Déclaré {tempsRelatif(selected.date_creation)}
                      </div>

                      {selected.commentaire_resolution && (
                        <div className="p-4 rounded-xl" style={{ background: '#ECFDF5', border: '1px solid #A7F3D0' }}>
                          <div className="flex items-center gap-1.5 mb-2">
                            <IconCircleCheck size={14} style={{ color: '#059669' }} />
                            <span className="text-xs font-bold" style={{ color: '#059669' }}>Réponse de votre bailleur</span>
                          </div>
                          <p className="text-sm" style={{ color: '#065F46', lineHeight: 1.6 }}>
                            {selected.commentaire_resolution}
                          </p>
                        </div>
                      )}

                      {selected.date_resolution && (
                        <div className="text-xs text-center" style={{ color: '#94A3B8' }}>
                          Résolu le {new Date(selected.date_resolution).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Modal nouveau signalement */}
      <AnimatePresence>
        {showModal && (
          <ModalNouveauSignalement
            bienId={bienIdPrefill}
            onClose={() => setShowModal(false)}
            onSuccess={load}
          />
        )}
      </AnimatePresence>
    </>
  )
}
