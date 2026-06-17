'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import api from '@/lib/api'
import { PaginatedResponse } from '@/types'
import {
  IconTool, IconArrowLeft, IconRefresh, IconSearch,
  IconX, IconCheck, IconLoader2, IconFilter,
  IconAlertTriangle, IconHome2, IconUser,
  IconClock, IconChevronRight, IconCircleCheck,
} from '@tabler/icons-react'

// ── Types ──────────────────────────────────────────────────
interface Signalement {
  id: number
  locataire: { id: number; nom_complet: string; email: string; telephone: string }
  bien: { id: number; titre: string; adresse: string }
  type_panne: string
  description: string
  urgence: 'basse' | 'moyenne' | 'elevee' | 'critique'
  statut: 'ouvert' | 'en_cours' | 'resolu' | 'clos'
  commentaire_resolution: string
  date_creation: string
  date_resolution: string | null
}

const URGENCE_MAP = {
  basse:    { bg: '#F0FDF4', col: '#059669', lbl: 'Basse' },
  moyenne:  { bg: '#FFFBEB', col: '#D97706', lbl: 'Moyenne' },
  elevee:   { bg: '#FEF2F2', col: '#DC2626', lbl: 'Élevée' },
  critique: { bg: '#FFF1F2', col: '#BE123C', lbl: 'Critique' },
}

const STATUT_MAP = {
  ouvert:   { bg: '#EFF6FF', col: '#2563EB', lbl: 'Ouvert',    ico: <IconClock size={11}/> },
  en_cours: { bg: '#FFFBEB', col: '#D97706', lbl: 'En cours',  ico: <IconTool size={11}/> },
  resolu:   { bg: '#ECFDF5', col: '#059669', lbl: 'Résolu',    ico: <IconCheck size={11}/> },
  clos:     { bg: '#F1F5F9', col: '#64748B', lbl: 'Clos',      ico: <IconCircleCheck size={11}/> },
}

const TYPE_MAP: Record<string, string> = {
  panne_elec: '⚡ Panne électrique',
  fuite_eau:  '💧 Fuite d\'eau',
  plomberie:  '🔧 Plomberie',
  clim:       '❄️ Climatisation',
  menuiserie: '🚪 Menuiserie',
  autre:      '🔨 Autre',
}

function UrgenceBadge({ urgence }: { urgence: Signalement['urgence'] }) {
  const s = URGENCE_MAP[urgence]
  return (
    <span className="text-xs font-bold px-2 py-1 rounded-full"
      style={{ background: s.bg, color: s.col }}>{s.lbl}</span>
  )
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

// ── Drawer traitement ──────────────────────────────────────
function DrawerTraitement({ sig, onClose, onSuccess }: {
  sig: Signalement; onClose: () => void; onSuccess: () => void
}) {
  const [statut, setStatut]         = useState(sig.statut)
  const [commentaire, setCommentaire] = useState(sig.commentaire_resolution ?? '')
  const [saving, setSaving]         = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.patch(`/signalements/${sig.id}/`, { statut, commentaire_resolution: commentaire })
      toast.success('Signalement mis à jour !')
      onSuccess(); onClose()
    } catch { toast.error('Erreur lors de la mise à jour') }
    finally { setSaving(false) }
  }

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(0,0,0,.35)', backdropFilter: 'blur(4px)' }}
        onClick={onClose} />
      <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        className="fixed right-0 top-0 bottom-0 z-50 overflow-y-auto"
        style={{ width: 'min(440px,100vw)', background: '#fff', boxShadow: '-8px 0 40px rgba(0,0,0,.15)', fontFamily: "'DM Sans',sans-serif" }}>

        <div className="flex items-center justify-between px-5 py-4 sticky top-0 bg-white z-10"
          style={{ borderBottom: '1px solid #F1F5F9' }}>
          <h2 className="text-sm font-bold" style={{ color: '#0F172A' }}>Traiter le signalement</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: '#F1F5F9' }}>
            <IconX size={15} style={{ color: '#64748B' }} />
          </button>
        </div>

        <div className="px-5 py-5 space-y-5">
          {/* Infos signalement */}
          <div className="p-4 rounded-2xl" style={{ background: '#F8FAFC', border: '1px solid #F1F5F9' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold" style={{ color: '#0F172A' }}>
                {TYPE_MAP[sig.type_panne] ?? sig.type_panne}
              </span>
              <UrgenceBadge urgence={sig.urgence} />
            </div>
            <p className="text-sm mb-3" style={{ color: '#475569', lineHeight: 1.6 }}>{sig.description}</p>
            <div className="flex items-center gap-2 text-xs" style={{ color: '#94A3B8' }}>
              <IconHome2 size={12}/> {sig.bien.titre}
              <span>·</span>
              <IconUser size={12}/> {sig.locataire.nom_complet}
              <span>·</span>
              {tempsRelatif(sig.date_creation)}
            </div>
          </div>

          {/* Changer statut */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#94A3B8' }}>
              Statut
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(Object.entries(STATUT_MAP) as [Signalement['statut'], typeof STATUT_MAP[keyof typeof STATUT_MAP]][]).map(([val, s]) => (
                <button key={val} onClick={() => setStatut(val)}
                  className="flex items-center gap-2 p-3 rounded-xl text-xs font-semibold transition-all"
                  style={{
                    background: statut === val ? s.bg : '#F8FAFC',
                    color: statut === val ? s.col : '#64748B',
                    border: `1.5px solid ${statut === val ? s.col : '#E2E8F0'}`,
                  }}>
                  {s.ico} {s.lbl}
                </button>
              ))}
            </div>
          </div>

          {/* Commentaire résolution */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#94A3B8' }}>
              Commentaire de résolution
            </div>
            <textarea value={commentaire} onChange={e => setCommentaire(e.target.value)}
              placeholder="Décrivez la solution apportée..."
              rows={4}
              style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #E2E8F0', borderRadius: '10px', fontSize: '13px', color: '#0F172A', outline: 'none', background: '#fff', fontFamily: 'inherit', resize: 'vertical', lineHeight: 1.6 }} />
          </div>

          {/* Contact locataire */}
          <div className="flex gap-2">
            <a href={`tel:${sig.locataire.telephone}`}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold"
              style={{ background: '#EFF6FF', color: '#2563EB', textDecoration: 'none' }}>
              📞 Appeler {sig.locataire.nom_complet.split(' ')[0]}
            </a>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white px-5 py-4 flex gap-3"
          style={{ borderTop: '1px solid #F1F5F9', boxShadow: '0 -4px 16px rgba(0,0,0,.06)' }}>
          <button onClick={onClose} className="flex-1 py-3 rounded-xl text-sm font-semibold"
            style={{ background: '#F1F5F9', color: '#64748B' }}>Annuler</button>
          <motion.button onClick={handleSave} disabled={saving}
            whileHover={saving ? {} : { scale: 1.01 }} whileTap={saving ? {} : { scale: .99 }}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg,#2563EB,#1D4ED8)', boxShadow: '0 2px 10px rgba(37,99,235,.3)' }}>
            {saving
              ? <><IconLoader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />Enregistrement...</>
              : <><IconCheck size={15} />Enregistrer</>}
          </motion.button>
        </div>
      </motion.div>
    </>
  )
}

// ── Page principale ────────────────────────────────────────
export default function BailleurSignalementsPage() {
  const { user } = useAuth()
  const [signalements, setSignalements] = useState<Signalement[]>([])
  const [loading, setLoading]           = useState(true)
  const [search, setSearch]             = useState('')
  const [filterStatut, setFilter]       = useState('tous')
  const [filterUrgence, setFilterUrg]   = useState('tous')
  const [selected, setSelected]         = useState<Signalement | null>(null)

  useEffect(() => { const init = async () => { await load() }; init() }, [])

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get<PaginatedResponse<Signalement>>('/signalements/')
      setSignalements(res.data.results)
    } catch { toast.error('Erreur lors du chargement') }
    finally { setLoading(false) }
  }

  const filtered = signalements.filter(s => {
    const matchSearch = !search ||
      s.locataire.nom_complet.toLowerCase().includes(search.toLowerCase()) ||
      s.bien.titre.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase())
    const matchStatut  = filterStatut === 'tous' || s.statut === filterStatut
    const matchUrgence = filterUrgence === 'tous' || s.urgence === filterUrgence
    return matchSearch && matchStatut && matchUrgence
  })

  const stats = {
    total:    signalements.length,
    ouverts:  signalements.filter(s => s.statut === 'ouvert').length,
    en_cours: signalements.filter(s => s.statut === 'en_cours').length,
    resolus:  signalements.filter(s => s.statut === 'resolu' || s.statut === 'clos').length,
  }

  if (!user) return null

  return (
    <>
      <style>{`
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes spin{to{transform:rotate(360deg)}}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:#E2E8F0;border-radius:4px}
        .row-h{transition:background .12s;cursor:pointer}.row-h:hover{background:#F8FAFC}
      `}</style>

      <div className="flex h-screen overflow-hidden"
        style={{ background: '#F1F5F9', fontFamily: "'DM Sans','Helvetica Neue',sans-serif" }}>
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">

          {/* Header */}
          <header className="flex items-center gap-3 px-4 sm:px-6 h-14 sm:h-16 flex-shrink-0 bg-white"
            style={{ borderBottom: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}>
            <Link href="/bailleur" className="flex items-center gap-1.5 text-sm font-medium flex-shrink-0"
              style={{ color: '#64748B', textDecoration: 'none' }}>
              <IconArrowLeft size={16} />
              <span className="hidden sm:inline">Retour</span>
            </Link>
            <div className="h-5 w-px flex-shrink-0" style={{ background: '#E2E8F0' }} />
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <IconTool size={17} style={{ color: '#D97706', flexShrink: 0 }} />
              <h1 className="text-sm font-bold truncate" style={{ color: '#0F172A' }}>Signalements</h1>
              {!loading && stats.ouverts > 0 && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{ background: '#FEF2F2', color: '#DC2626' }}>
                  {stats.ouverts} ouvert{stats.ouverts > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <button onClick={load} className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: '#F1F5F9', border: '1px solid #E2E8F0' }}>
              <IconRefresh size={15} style={{ color: '#64748B', animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto">
            <div className="px-4 sm:px-6 pt-4 pb-6 space-y-4">

              {/* Stats */}
              {!loading && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { lbl: 'Total',    val: stats.total,    col: '#D97706', bg: '#FFFBEB' },
                    { lbl: 'Ouverts',  val: stats.ouverts,  col: '#DC2626', bg: '#FEF2F2' },
                    { lbl: 'En cours', val: stats.en_cours, col: '#2563EB', bg: '#EFF6FF' },
                    { lbl: 'Résolus',  val: stats.resolus,  col: '#059669', bg: '#ECFDF5' },
                  ].map(s => (
                    <div key={s.lbl} className="bg-white rounded-2xl p-4 flex items-center gap-3"
                      style={{ border: '1px solid #E2E8F0' }}>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: s.bg }}>
                        <span className="text-base font-bold" style={{ color: s.col }}>{s.val}</span>
                      </div>
                      <span className="text-xs" style={{ color: '#64748B' }}>{s.lbl}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Filtres */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <IconSearch size={14} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
                  <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Locataire, bien, description..."
                    style={{ width: '100%', height: '40px', paddingLeft: '32px', border: '1.5px solid #E2E8F0', borderRadius: '10px', fontSize: '13px', color: '#0F172A', outline: 'none', background: 'white', fontFamily: 'inherit' }} />
                </div>
                {/* Filtre statut */}
                <div className="flex gap-1 p-1 rounded-xl" style={{ background: '#F1F5F9' }}>
                  {[
                    { val: 'tous', lbl: 'Tous' },
                    { val: 'ouvert', lbl: 'Ouverts' },
                    { val: 'en_cours', lbl: 'En cours' },
                    { val: 'resolu', lbl: 'Résolus' },
                  ].map(f => (
                    <button key={f.val} onClick={() => setFilter(f.val)}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
                      style={filterStatut === f.val
                        ? { background: '#fff', color: '#0F172A', boxShadow: '0 1px 3px rgba(0,0,0,.1)' }
                        : { color: '#64748B', background: 'transparent' }}>
                      {f.lbl}
                    </button>
                  ))}
                </div>
                {/* Filtre urgence */}
                <div className="flex gap-1 p-1 rounded-xl" style={{ background: '#F1F5F9' }}>
                  {[
                    { val: 'tous', lbl: '⚡ Tous' },
                    { val: 'critique', lbl: 'Critique' },
                    { val: 'elevee', lbl: 'Élevée' },
                  ].map(f => (
                    <button key={f.val} onClick={() => setFilterUrg(f.val)}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
                      style={filterUrgence === f.val
                        ? { background: '#fff', color: '#0F172A', boxShadow: '0 1px 3px rgba(0,0,0,.1)' }
                        : { color: '#64748B', background: 'transparent' }}>
                      {f.lbl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Liste */}
              {loading ? (
                <div className="space-y-3">
                  {Array(4).fill(0).map((_, i) => (
                    <div key={i} className="h-20 rounded-2xl"
                      style={{ background: 'linear-gradient(90deg,#E2E8F0 25%,#F1F5F9 50%,#E2E8F0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl"
                  style={{ border: '1px solid #E2E8F0' }}>
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                    style={{ background: '#ECFDF5' }}>
                    <IconCircleCheck size={28} style={{ color: '#6EE7B7' }} />
                  </div>
                  <h3 className="text-base font-bold mb-2" style={{ color: '#0F172A' }}>
                    {search || filterStatut !== 'tous' ? 'Aucun résultat' : 'Aucun signalement'}
                  </h3>
                  <p className="text-sm" style={{ color: '#64748B' }}>
                    {search || filterStatut !== 'tous' ? 'Modifiez vos filtres' : 'Aucune panne signalée pour l\'instant'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filtered.map((s, i) => (
                    <motion.div key={s.id}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="row-h bg-white flex items-center gap-3 p-4 rounded-2xl"
                      style={{ border: '1px solid #E2E8F0' }}
                      onClick={() => setSelected(s)}>

                      {/* Icône urgence */}
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
                        style={{ background: URGENCE_MAP[s.urgence].bg }}>
                        {s.urgence === 'critique' ? '🚨' : s.urgence === 'elevee' ? '⚠️' : '🔧'}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <span className="text-sm font-bold truncate" style={{ color: '#0F172A' }}>
                            {TYPE_MAP[s.type_panne] ?? s.type_panne}
                          </span>
                          <UrgenceBadge urgence={s.urgence} />
                          <StatutBadge statut={s.statut} />
                        </div>
                        <p className="text-xs truncate mb-0.5" style={{ color: '#64748B' }}>
                          {s.description}
                        </p>
                        <div className="flex items-center gap-2 text-xs" style={{ color: '#94A3B8' }}>
                          <IconHome2 size={11}/> <span className="truncate">{s.bien.titre}</span>
                          <span>·</span>
                          <IconUser size={11}/> <span className="truncate">{s.locataire.nom_complet}</span>
                          <span>·</span>
                          {tempsRelatif(s.date_creation)}
                        </div>
                      </div>

                      <IconChevronRight size={15} style={{ color: '#CBD5E1', flexShrink: 0 }} />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Drawer */}
        <AnimatePresence>
          {selected && (
            <DrawerTraitement sig={selected} onClose={() => setSelected(null)} onSuccess={load} />
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
