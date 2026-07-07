'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import api from '@/lib/api'
import { PaginatedResponse } from '@/types'
import { usePlan } from '@/hooks/usePlan'
import { BanniereUpgrade } from '@/components/plan/PlanGate'
import {
  IconTool, IconArrowLeft, IconRefresh, IconSearch, IconX,
  IconCheck, IconLoader2, IconAlertTriangle, IconHome2, IconUser,
  IconClock, IconChevronRight, IconCircleCheck, IconBolt, IconDroplet,
  IconDoor, IconWind, IconBuildingFactory, IconPhone, IconMail,
  IconCalendar, IconMessage, IconLock,
} from '@tabler/icons-react'

// ── Types ─────────────────────────────────────────────────────
interface Signalement {
  id: number
  locataire: { id: number; nom_complet: string; email: string; telephone: string }
  bien: { id: number; titre: string; adresse: string }
  type_panne: string
  type_display: string
  description: string
  urgence: 'basse' | 'moyenne' | 'elevee' | 'critique'
  urgence_display: string
  statut: 'ouvert' | 'en_cours' | 'resolu' | 'clos'
  statut_display: string
  commentaire_resolution: string
  date_creation: string
  date_resolution: string | null
}

// ── Constantes design ─────────────────────────────────────────
const URGENCE = {
  basse   : { bg: '#F0FDF4', col: '#059669', border: '#A7F3D0', dot: '#10B981' },
  moyenne : { bg: '#FFFBEB', col: '#D97706', border: '#FDE68A', dot: '#F59E0B' },
  elevee  : { bg: '#FEF2F2', col: '#DC2626', border: '#FECACA', dot: '#EF4444' },
  critique: { bg: '#FFF1F2', col: '#BE123C', border: '#FECDD3', dot: '#F43F5E' },
}

const STATUT = {
  ouvert  : { bg: '#EFF6FF', col: '#2563EB', border: '#BFDBFE', ico: <IconClock size={11}/> },
  en_cours: { bg: '#FFFBEB', col: '#D97706', border: '#FDE68A', ico: <IconTool size={11}/> },
  resolu  : { bg: '#ECFDF5', col: '#059669', border: '#A7F3D0', ico: <IconCheck size={11}/> },
  clos    : { bg: '#F1F5F9', col: '#64748B', border: '#E2E8F0', ico: <IconCircleCheck size={11}/> },
}

const TYPE_ICON: Record<string, React.ReactNode> = {
  panne_elec : <IconBolt size={18}/>,
  fuite_eau  : <IconDroplet size={18}/>,
  plomberie  : <IconTool size={18}/>,
  clim       : <IconWind size={18}/>,
  menuiserie : <IconDoor size={18}/>,
  autre      : <IconBuildingFactory size={18}/>,
}

// ── Helpers ───────────────────────────────────────────────────
function tempsRelatif(date: string): string {
  const diff = Date.now() - new Date(date).getTime()
  const j = Math.floor(diff / 86400000)
  const h = Math.floor(diff / 3600000)
  const m = Math.floor(diff / 60000)
  if (m < 60)  return `Il y a ${m} min`
  if (h < 24)  return `Il y a ${h}h`
  if (j === 1) return 'Hier'
  if (j < 7)   return `Il y a ${j} jours`
  return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

// ── Badges ────────────────────────────────────────────────────
function BadgeUrgence({ urgence, display }: { urgence: Signalement['urgence']; display: string }) {
  const s = URGENCE[urgence]
  return (
    <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full"
          style={{ background: s.bg, color: s.col }}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: s.dot }}/>
      {display}
    </span>
  )
}

function BadgeStatut({ statut, display }: { statut: Signalement['statut']; display: string }) {
  const s = STATUT[statut]
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full"
          style={{ background: s.bg, color: s.col, border: `1px solid ${s.border}` }}>
      {s.ico}{display}
    </span>
  )
}

// ── Drawer traitement ─────────────────────────────────────────
function DrawerTraitement({ sig, onClose, onSuccess }: {
  sig: Signalement; onClose: () => void; onSuccess: () => void
}) {
  const [statut, setStatut]         = useState<Signalement['statut']>(sig.statut)
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

  const statutOptions: Array<{ val: Signalement['statut']; lbl: string }> = [
    { val: 'ouvert',   lbl: 'Ouvert'   },
    { val: 'en_cours', lbl: 'En cours' },
    { val: 'resolu',   lbl: 'Résolu'   },
    { val: 'clos',     lbl: 'Clos'     },
  ]

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(0,0,0,.4)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}/>

      <motion.aside
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        className="fixed right-0 top-0 bottom-0 z-50 flex flex-col overflow-hidden"
        style={{ width: 'min(480px,100vw)', background: '#fff', boxShadow: '-8px 0 48px rgba(0,0,0,.16)', fontFamily: "'DM Sans',sans-serif" }}>

        {/* En-tête */}
        <div className="flex items-center justify-between px-5 py-4 flex-shrink-0"
             style={{ borderBottom: '1px solid #F1F5F9' }}>
          <div>
            <h2 className="text-sm font-bold" style={{ color: '#0F172A' }}>Traiter le signalement</h2>
            <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>#{sig.id} · {tempsRelatif(sig.date_creation)}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: '#F1F5F9', border: 'none', cursor: 'pointer' }}>
            <IconX size={15} style={{ color: '#64748B' }}/>
          </button>
        </div>

        {/* Corps */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-5 space-y-5">

            {/* Carte signalement */}
            <div className="rounded-2xl overflow-hidden"
                 style={{ border: `2px solid ${URGENCE[sig.urgence].border}` }}>
              <div className="px-4 py-3 flex items-center gap-3"
                   style={{ background: URGENCE[sig.urgence].bg }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                     style={{ background: '#fff', color: URGENCE[sig.urgence].col }}>
                  {TYPE_ICON[sig.type_panne] ?? <IconTool size={18}/>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold truncate" style={{ color: '#0F172A' }}>{sig.type_display}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <BadgeUrgence urgence={sig.urgence} display={sig.urgence_display}/>
                    <BadgeStatut  statut={sig.statut}   display={sig.statut_display}/>
                  </div>
                </div>
              </div>
              <div className="px-4 py-3" style={{ background: '#FAFAFA' }}>
                <p className="text-sm leading-relaxed" style={{ color: '#475569' }}>{sig.description}</p>
              </div>
              <div className="px-4 py-3 grid grid-cols-1 gap-2" style={{ borderTop: '1px solid #F1F5F9' }}>
                <div className="flex items-center gap-2 text-xs" style={{ color: '#64748B' }}>
                  <IconHome2 size={13} style={{ flexShrink: 0 }}/>
                  <span className="truncate font-medium">{sig.bien.titre}</span>
                </div>
                {sig.bien.adresse && (
                  <div className="flex items-center gap-2 text-xs" style={{ color: '#94A3B8' }}>
                    <span style={{ width: 13, flexShrink: 0 }}/>
                    <span className="truncate">{sig.bien.adresse}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs" style={{ color: '#64748B' }}>
                  <IconUser size={13} style={{ flexShrink: 0 }}/>
                  <span className="font-medium">{sig.locataire.nom_complet}</span>
                </div>
                <div className="flex items-center gap-2 text-xs" style={{ color: '#64748B' }}>
                  <IconCalendar size={13} style={{ flexShrink: 0 }}/>
                  <span>{new Date(sig.date_creation).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                {sig.date_resolution && (
                  <div className="flex items-center gap-2 text-xs" style={{ color: '#059669' }}>
                    <IconCircleCheck size={13} style={{ flexShrink: 0 }}/>
                    <span>Résolu le {new Date(sig.date_resolution).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Contact locataire */}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#94A3B8' }}>
                Contacter le locataire
              </div>
              <div className="grid grid-cols-2 gap-2">
                {sig.locataire.telephone && (
                  <a href={`tel:${sig.locataire.telephone}`}
                     className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold"
                     style={{ background: '#EFF6FF', color: '#2563EB', textDecoration: 'none', border: '1px solid #BFDBFE' }}>
                    <IconPhone size={13}/> {sig.locataire.telephone}
                  </a>
                )}
                <a href={`mailto:${sig.locataire.email}`}
                   className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold"
                   style={{ background: '#F5F3FF', color: '#7C3AED', textDecoration: 'none', border: '1px solid #DDD6FE' }}>
                  <IconMail size={13}/> Email
                </a>
              </div>
            </div>

            {/* Changer statut */}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#94A3B8' }}>
                Mettre à jour le statut
              </div>
              <div className="grid grid-cols-2 gap-2">
                {statutOptions.map(opt => {
                  const s = STATUT[opt.val]
                  const isActive = statut === opt.val
                  return (
                    <button key={opt.val} onClick={() => setStatut(opt.val)}
                            className="flex items-center gap-2 p-3 rounded-xl text-xs font-semibold transition-all"
                            style={{ background: isActive ? s.bg : '#F8FAFC', color: isActive ? s.col : '#64748B', border: `2px solid ${isActive ? s.col : '#E2E8F0'}`, cursor: 'pointer' }}>
                      {s.ico} {opt.lbl}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Commentaire résolution */}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#94A3B8' }}>
                Commentaire de résolution
              </div>
              <textarea
                value={commentaire}
                onChange={e => setCommentaire(e.target.value)}
                placeholder="Décrivez les travaux effectués, la solution apportée..."
                rows={4}
                style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #E2E8F0', borderRadius: '12px', fontSize: '13px', color: '#0F172A', outline: 'none', background: '#fff', fontFamily: 'inherit', resize: 'vertical', lineHeight: 1.6, boxSizing: 'border-box' }}/>
              {sig.commentaire_resolution && commentaire !== sig.commentaire_resolution && (
                <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>
                  Commentaire précédent : {sig.commentaire_resolution}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Pied */}
        <div className="flex gap-3 px-5 py-4 flex-shrink-0"
             style={{ borderTop: '1px solid #F1F5F9', boxShadow: '0 -4px 16px rgba(0,0,0,.06)' }}>
          <button onClick={onClose} className="flex-1 py-3 rounded-xl text-sm font-semibold"
                  style={{ background: '#F1F5F9', color: '#64748B', border: 'none', cursor: 'pointer' }}>
            Annuler
          </button>
          <motion.button onClick={handleSave} disabled={saving}
            whileHover={saving ? {} : { scale: 1.01 }} whileTap={saving ? {} : { scale: 0.99 }}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg,#2563EB,#1D4ED8)', boxShadow: '0 2px 12px rgba(37,99,235,.3)', border: 'none', cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
            {saving
              ? <><IconLoader2 size={15} style={{ animation: 'spin 1s linear infinite' }}/> Enregistrement...</>
              : <><IconCheck size={15}/> Enregistrer</>}
          </motion.button>
        </div>
      </motion.aside>
    </>
  )
}

// ── Page principale ───────────────────────────────────────────
export default function BailleurSignalementsPage() {
  const { user }                          = useAuth()
  const { peut, loading: planLoading }    = usePlan()   // ← hook plan
  const [signalements, setSignalements]   = useState<Signalement[]>([])
  const [loading, setLoading]             = useState(true)
  const [search, setSearch]               = useState('')
  const [filterStatut, setFilterStatut]   = useState('tous')
  const [filterUrgence, setFilterUrg]     = useState('tous')
  const [selected, setSelected]           = useState<Signalement | null>(null)

  const planOk = peut('signalements')     // true si Pro ou Business

  useEffect(() => { if (planOk) { load() } else { setLoading(false) } }, [planOk])

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get<PaginatedResponse<Signalement>>('/signalements/')
      setSignalements(res.data.results)
    } catch { toast.error('Erreur lors du chargement') }
    finally  { setLoading(false) }
  }

  const filtered = signalements.filter(s => {
    const q = search.toLowerCase()
    const matchSearch  = !search || s.locataire.nom_complet.toLowerCase().includes(q) || s.bien.titre.toLowerCase().includes(q) || s.type_display.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)
    const matchStatut  = filterStatut  === 'tous' || s.statut  === filterStatut
    const matchUrgence = filterUrgence === 'tous' || s.urgence === filterUrgence
    return matchSearch && matchStatut && matchUrgence
  })

  const stats = {
    total   : signalements.length,
    ouverts : signalements.filter(s => s.statut === 'ouvert').length,
    en_cours: signalements.filter(s => s.statut === 'en_cours').length,
    resolus : signalements.filter(s => s.statut === 'resolu' || s.statut === 'clos').length,
  }

  if (!user) return null

  return (
    <>
      <style>{`
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes spin{to{transform:rotate(360deg)}}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:#E2E8F0;border-radius:4px}
        .row-h{transition:all .15s ease;cursor:pointer}
        .row-h:hover{background:#F8FAFC;transform:translateY(-1px);box-shadow:0 4px 12px rgba(0,0,0,.06)}
        .filter-btn{transition:all .15s ease}
        .filter-btn:hover{background:rgba(37,99,235,.06)}
      `}</style>

      <div className="flex flex-col h-screen overflow-hidden"
           style={{ background: '#F1F5F9', fontFamily: "'DM Sans','Helvetica Neue',sans-serif" }}>

        {/* ── Header ── */}
        <header className="flex items-center gap-3 px-4 sm:px-6 h-14 flex-shrink-0 bg-white"
                style={{ borderBottom: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}>
          <Link href="/bailleur" className="flex items-center gap-1.5 text-sm font-medium flex-shrink-0"
                style={{ color: '#64748B', textDecoration: 'none' }}>
            <IconArrowLeft size={16}/><span className="hidden sm:inline">Retour</span>
          </Link>
          <div className="h-5 w-px flex-shrink-0" style={{ background: '#E2E8F0' }}/>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                 style={{ background: '#FFFBEB' }}>
              <IconTool size={15} style={{ color: '#D97706' }}/>
            </div>
            <h1 className="text-sm font-bold truncate" style={{ color: '#0F172A' }}>Signalements</h1>
            {!loading && planOk && stats.ouverts > 0 && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: '#FEF2F2', color: '#DC2626' }}>
                {stats.ouverts} ouvert{stats.ouverts > 1 ? 's' : ''}
              </span>
            )}
          </div>
          {planOk && (
            <button onClick={load} className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: '#F1F5F9', border: '1px solid #E2E8F0', cursor: 'pointer' }}>
              <IconRefresh size={14} style={{ color: '#64748B', animation: loading ? 'spin 1s linear infinite' : 'none' }}/>
            </button>
          )}
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="px-4 sm:px-6 pt-4 pb-8 max-w-5xl mx-auto space-y-4">

            {/* ── Bandeau upgrade (plan insuffisant) ── */}
            <BanniereUpgrade fonctionnalite="signalements" />

            {/* ── Stats ── */}
            {!loading && planOk && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { lbl: 'Total',    val: stats.total,    col: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
                  { lbl: 'Ouverts',  val: stats.ouverts,  col: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
                  { lbl: 'En cours', val: stats.en_cours, col: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' },
                  { lbl: 'Résolus',  val: stats.resolus,  col: '#059669', bg: '#ECFDF5', border: '#A7F3D0' },
                ].map(s => (
                  <div key={s.lbl} className="bg-white rounded-2xl p-4 flex items-center gap-3"
                       style={{ border: `1px solid ${s.border}`, boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                         style={{ background: s.bg }}>
                      <span className="text-lg font-bold" style={{ color: s.col }}>{s.val}</span>
                    </div>
                    <span className="text-xs font-medium" style={{ color: '#64748B' }}>{s.lbl}</span>
                  </div>
                ))}
              </div>
            )}

            {/* ── Filtres ── */}
            {planOk && (
              <div className="flex flex-col sm:flex-row gap-2">
                {/* Recherche */}
                <div className="relative flex-1">
                  <IconSearch size={14} style={{ position:'absolute', left:'11px', top:'50%', transform:'translateY(-50%)', color:'#94A3B8', pointerEvents:'none' }}/>
                  <input value={search} onChange={e => setSearch(e.target.value)}
                         placeholder="Locataire, bien, type de panne..."
                         style={{ width:'100%', height:'40px', paddingLeft:'32px', paddingRight:'12px', border:'1.5px solid #E2E8F0', borderRadius:'10px', fontSize:'13px', color:'#0F172A', outline:'none', background:'white', fontFamily:'inherit', boxSizing:'border-box' }}/>
                  {search && (
                    <button onClick={() => setSearch('')}
                            style={{ position:'absolute', right:'10px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#94A3B8' }}>
                      <IconX size={13}/>
                    </button>
                  )}
                </div>

                {/* Filtre statut */}
                <div className="flex gap-1 p-1 rounded-xl overflow-x-auto flex-shrink-0" style={{ background: '#F1F5F9' }}>
                  {[
                    { val: 'tous',    lbl: 'Tous',     ico: null,                        col: undefined  },
                    { val: 'ouvert',  lbl: 'Ouverts',  ico: <IconClock size={11}/>,      col: '#2563EB'  },
                    { val: 'en_cours',lbl: 'En cours', ico: <IconTool size={11}/>,       col: '#D97706'  },
                    { val: 'resolu',  lbl: 'Résolus',  ico: <IconCheck size={11}/>,      col: '#059669'  },
                    { val: 'clos',    lbl: 'Clos',     ico: <IconCircleCheck size={11}/>,col: '#64748B'  },
                  ].map(f => (
                    <button key={f.val} onClick={() => setFilterStatut(f.val)}
                            className="filter-btn flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap"
                            style={filterStatut === f.val
                              ? { background: '#fff', color: f.col ?? '#0F172A', boxShadow: '0 1px 4px rgba(0,0,0,.1)', border: 'none', cursor: 'pointer' }
                              : { background: 'transparent', color: '#64748B', border: 'none', cursor: 'pointer' }}>
                      {f.ico && <span style={{ color: filterStatut === f.val ? f.col : '#94A3B8' }}>{f.ico}</span>}
                      {f.lbl}
                    </button>
                  ))}
                </div>

                {/* Filtre urgence */}
                <div className="flex gap-1 p-1 rounded-xl overflow-x-auto flex-shrink-0" style={{ background: '#F1F5F9' }}>
                  {[
                    { val: 'tous',     lbl: 'Urgence', dot: null       },
                    { val: 'critique', lbl: 'Critique', dot: '#F43F5E' },
                    { val: 'elevee',   lbl: 'Élevée',  dot: '#EF4444' },
                    { val: 'moyenne',  lbl: 'Moyenne', dot: '#F59E0B' },
                    { val: 'basse',    lbl: 'Basse',   dot: '#10B981' },
                  ].map(f => (
                    <button key={f.val} onClick={() => setFilterUrg(f.val)}
                            className="filter-btn flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap"
                            style={filterUrgence === f.val
                              ? { background: '#fff', color: '#0F172A', boxShadow: '0 1px 4px rgba(0,0,0,.1)', border: 'none', cursor: 'pointer' }
                              : { background: 'transparent', color: '#64748B', border: 'none', cursor: 'pointer' }}>
                      {f.dot && <span style={{ width:'7px', height:'7px', borderRadius:'50%', background: f.dot, flexShrink:0, display:'inline-block' }}/>}
                      {f.lbl}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Liste ── */}
            {!planOk ? (
              /* Plan insuffisant → aperçu flou + CTA */
              <div style={{ position: 'relative' }}>
                <div style={{ filter: 'blur(3px)', opacity: .35, pointerEvents: 'none', userSelect: 'none' }}>
                  {Array(4).fill(0).map((_,i) => (
                    <div key={i} className="bg-white rounded-2xl overflow-hidden mb-2"
                         style={{ border: '1px solid #E2E8F0', height: '88px' }}/>
                  ))}
                </div>
                <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'16px' }}>
                  <div style={{ width:'52px', height:'52px', borderRadius:'16px', background:'linear-gradient(135deg,rgba(124,58,237,.12),rgba(37,99,235,.12))', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <IconLock size={22} style={{ color:'#7C3AED' }}/>
                  </div>
                  <div style={{ textAlign:'center' }}>
                    <div style={{ fontSize:'15px', fontWeight:700, color:'#0F172A', marginBottom:'4px' }}>
                      Signalements réservés au plan Pro
                    </div>
                    <div style={{ fontSize:'13px', color:'#64748B' }}>
                      Vos locataires peuvent déjà signaler des pannes
                    </div>
                  </div>
                  <Link href="/bailleur/abonnement"
                        style={{ padding:'12px 28px', borderRadius:'14px', background:'linear-gradient(135deg,#7C3AED,#2563EB)', color:'#fff', textDecoration:'none', fontSize:'14px', fontWeight:700, boxShadow:'0 4px 16px rgba(37,99,235,.35)' }}>
                    Passer au plan Pro
                  </Link>
                </div>
              </div>
            ) : loading ? (
              <div className="space-y-3">
                {Array(5).fill(0).map((_,i) => (
                  <div key={i} className="h-24 rounded-2xl"
                       style={{ background: 'linear-gradient(90deg,#E2E8F0 25%,#F1F5F9 50%,#E2E8F0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }}/>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl text-center"
                   style={{ border: '1px solid #E2E8F0' }}>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: '#F0FDF4' }}>
                  <IconCircleCheck size={28} style={{ color: '#6EE7B7' }}/>
                </div>
                <h3 className="text-base font-bold mb-1" style={{ color: '#0F172A' }}>
                  {search || filterStatut !== 'tous' || filterUrgence !== 'tous' ? 'Aucun résultat' : 'Aucun signalement'}
                </h3>
                <p className="text-sm" style={{ color: '#94A3B8' }}>
                  {search || filterStatut !== 'tous' || filterUrgence !== 'tous'
                    ? 'Modifiez vos critères de recherche'
                    : 'Aucune panne signalée par vos locataires'}
                </p>
                {(search || filterStatut !== 'tous' || filterUrgence !== 'tous') && (
                  <button onClick={() => { setSearch(''); setFilterStatut('tous'); setFilterUrg('tous') }}
                          className="mt-3 text-xs font-semibold px-3 py-1.5 rounded-lg"
                          style={{ background: '#EFF6FF', color: '#2563EB', border: 'none', cursor: 'pointer' }}>
                    Réinitialiser les filtres
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {filtered.map((s, i) => (
                  <motion.div key={s.id}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="row-h bg-white rounded-2xl overflow-hidden"
                    style={{ border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}
                    onClick={() => setSelected(s)}>
                    <div className="flex items-stretch">
                      {/* Bande urgence */}
                      <div className="w-1 flex-shrink-0" style={{ background: URGENCE[s.urgence].dot }}/>
                      <div className="flex items-center gap-3 p-4 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                             style={{ background: URGENCE[s.urgence].bg, color: URGENCE[s.urgence].col }}>
                          {TYPE_ICON[s.type_panne] ?? <IconTool size={18}/>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 mb-1">
                            <span className="text-sm font-bold" style={{ color: '#0F172A' }}>{s.type_display}</span>
                            <BadgeUrgence urgence={s.urgence} display={s.urgence_display}/>
                            <BadgeStatut  statut={s.statut}   display={s.statut_display}/>
                          </div>
                          <p className="text-xs mb-1.5 line-clamp-1" style={{ color: '#64748B' }}>{s.description}</p>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs" style={{ color: '#94A3B8' }}>
                            <span className="flex items-center gap-1"><IconHome2 size={11}/><span className="truncate max-w-[150px]">{s.bien.titre}</span></span>
                            <span className="flex items-center gap-1"><IconUser size={11}/><span>{s.locataire.nom_complet}</span></span>
                            <span className="flex items-center gap-1"><IconClock size={11}/><span>{tempsRelatif(s.date_creation)}</span></span>
                            {s.date_resolution && (
                              <span className="flex items-center gap-1" style={{ color: '#059669' }}>
                                <IconCircleCheck size={11}/><span>Résolu {tempsRelatif(s.date_resolution)}</span>
                              </span>
                            )}
                          </div>
                        </div>
                        <IconChevronRight size={15} style={{ color: '#CBD5E1', flexShrink: 0 }}/>
                      </div>
                    </div>
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
          <DrawerTraitement sig={selected} onClose={() => setSelected(null)} onSuccess={load}/>
        )}
      </AnimatePresence>
    </>
  )
}