'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import api from '@/lib/api'
import { PaginatedResponse } from '@/types'
import {
  IconTool, IconArrowLeft, IconRefresh, IconSearch,
  IconX, IconFilter, IconEye, IconCheck, IconBan,
  IconLoader2, IconAlertTriangle, IconAlertCircle,
  IconCircleCheck, IconClock, IconMessage, IconHome2,
  IconUser, IconCalendar, IconChevronRight,
  IconBolt, IconDroplet, IconDoor, IconBuildingArch,
} from '@tabler/icons-react'

// ── Types ─────────────────────────────────────────────────────
interface Signalement {
  id: number
  bien?: { id: number; titre: string; adresse: string }
  locataire?: { id: number; nom_complet: string; email: string }
  type_panne: string
  type_panne_display?: string
  description?: string
  statut: string
  statut_display?: string
  priorite?: string
  date_creation: string
  date_resolution?: string
  commentaire_admin?: string
}

type StatutSig = 'ouvert' | 'en_cours' | 'resolu' | 'ferme'
type Priorite  = 'faible' | 'normale' | 'haute' | 'urgente'

// ── Maps ──────────────────────────────────────────────────────
const STATUT_MAP: Record<string, { bg: string; col: string; lbl: string; ico: React.ReactNode }> = {
  ouvert:   { bg:'#FEF2F2', col:'#DC2626', lbl:'Ouvert',    ico:<IconAlertCircle size={11}/> },
  en_cours: { bg:'#FFFBEB', col:'#D97706', lbl:'En cours',  ico:<IconClock size={11}/> },
  resolu:   { bg:'#ECFDF5', col:'#059669', lbl:'Résolu',    ico:<IconCircleCheck size={11}/> },
  ferme:    { bg:'#F1F5F9', col:'#64748B', lbl:'Fermé',     ico:<IconBan size={11}/> },
}

const PRIORITE_MAP: Record<string, { bg: string; col: string; lbl: string }> = {
  urgente:  { bg:'#FEF2F2', col:'#DC2626', lbl:'Urgente' },
  haute:    { bg:'#FFFBEB', col:'#D97706', lbl:'Haute' },
  normale:  { bg:'#EFF6FF', col:'#2563EB', lbl:'Normale' },
  faible:   { bg:'#F1F5F9', col:'#64748B', lbl:'Faible' },
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  electricite: <IconBolt size={16}/>,
  eau:         <IconDroplet size={16}/>,
  serrure:     <IconDoor size={16}/>,
  structure:   <IconBuildingArch size={16}/>,
  default:     <IconTool size={16}/>,
}

function getTypeIcon(type: string) {
  return TYPE_ICONS[type] ?? TYPE_ICONS.default
}

// ── Composants ────────────────────────────────────────────────
function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`rounded-xl ${className}`} style={{
      background:'linear-gradient(90deg,#E2E8F0 25%,#F1F5F9 50%,#E2E8F0 75%)',
      backgroundSize:'200% 100%', animation:'shimmer 1.5s infinite',
    }}/>
  )
}

function StatutBadge({ statut }: { statut: string }) {
  const s = STATUT_MAP[statut] ?? { bg:'#F1F5F9', col:'#64748B', lbl:statut, ico:null }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap"
          style={{ background:s.bg, color:s.col }}>
      {s.ico}{s.lbl}
    </span>
  )
}

function PrioriteBadge({ priorite }: { priorite?: string }) {
  if (!priorite) return null
  const p = PRIORITE_MAP[priorite] ?? { bg:'#F1F5F9', col:'#64748B', lbl: priorite }
  return (
    <span className="inline-flex text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
          style={{ background:p.bg, color:p.col, fontSize:'10px' }}>
      {p.lbl}
    </span>
  )
}

function tempsRelatif(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  if (diff < 3600000)  return `Il y a ${Math.floor(diff/60000)}min`
  if (diff < 86400000) return `Il y a ${Math.floor(diff/3600000)}h`
  return `Il y a ${Math.floor(diff/86400000)}j`
}

// ────────────────────────────────────────────────────────────
export default function SignalementsPage() {
  const { user } = useAuth()
  const [signalements, setSignalements] = useState<Signalement[]>([])
  const [loading, setLoading]           = useState(true)
  const [search, setSearch]             = useState('')
  const [filterStatut, setFilter]       = useState<'tous' | StatutSig>('tous')
  const [filterOpen, setFilterOpen]     = useState(false)
  const [selected, setSelected]         = useState<Signalement | null>(null)
  const [actionLoading, setActLoad]     = useState<number | null>(null)
  const [commentaire, setCommentaire]   = useState('')
  const [toast, setToast]               = useState<{ msg: string; ok: boolean } | null>(null)

  useEffect(() => { if (user) load() }, [user])

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get<{ results: Signalement[] }>('/signalements/')
      setSignalements(res.data.results)
    } catch { } finally { setLoading(false) }
  }

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  const handleAction = async (sig: Signalement, statut: StatutSig) => {
    setActLoad(sig.id)
    try {
      await api.patch(`/signalements/${sig.id}/`, {
        statut,
        commentaire_admin: commentaire || undefined,
      })
      showToast(
        statut === 'resolu' ? 'Signalement marqué résolu' :
        statut === 'en_cours' ? 'Signalement pris en charge' :
        statut === 'ferme'   ? 'Signalement fermé' : 'Statut mis à jour',
        statut === 'resolu' || statut === 'en_cours'
      )
      setSelected(null); setCommentaire('')
      await load()
    } catch {
      showToast('Une erreur est survenue', false)
    } finally { setActLoad(null) }
  }

  const filtered = signalements.filter(s => {
    const matchSearch = !search ||
      (s.bien?.titre ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (s.locataire?.nom_complet ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (s.type_panne_display ?? s.type_panne).toLowerCase().includes(search.toLowerCase())
    const matchStatut = filterStatut === 'tous' || s.statut === filterStatut
    return matchSearch && matchStatut
  })

  const stats = {
    total:    signalements.length,
    ouverts:  signalements.filter(s => s.statut === 'ouvert').length,
    en_cours: signalements.filter(s => s.statut === 'en_cours').length,
    resolus:  signalements.filter(s => s.statut === 'resolu').length,
  }

  if (!user) return null

  return (
    <>
      <style>{`
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes spin{to{transform:rotate(360deg)}}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:#CBD5E1;border-radius:4px}
        .row-hover{transition:background .12s;cursor:pointer}.row-hover:hover{background:#F8FAFC}
        .card-sig{transition:all .18s ease}.card-sig:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,.08)}
        .action-btn{transition:all .15s}.action-btn:hover{transform:scale(1.04)}.action-btn:active{transform:scale(.96)}
        .textarea-f{width:100%;padding:10px 12px;border-radius:10px;border:1.5px solid #E2E8F0;font-size:13px;color:#0F172A;outline:none;background:#fff;resize:vertical;min-height:72px;font-family:inherit;transition:border-color .15s}
        .textarea-f:focus{border-color:#2563EB;box-shadow:0 0 0 3px rgba(37,99,235,.08)}
      `}</style>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity:0, y:-20, scale:.95 }}
            animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:-20, scale:.95 }}
            transition={{ duration:.22 }}
            style={{ position:'fixed', top:'20px', left:'50%', transform:'translateX(-50%)', zIndex:100,
                     display:'flex', alignItems:'center', gap:'10px', padding:'12px 20px', borderRadius:'16px',
                     background: toast.ok ? '#059669' : '#DC2626', color:'#fff', fontSize:'14px', fontWeight:600,
                     boxShadow:'0 8px 24px rgba(0,0,0,.2)', whiteSpace:'nowrap' }}>
            {toast.ok ? <IconCircleCheck size={17}/> : <IconAlertCircle size={17}/>}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col min-h-screen" style={{ background:'#F1F5F9', fontFamily:"'DM Sans','Helvetica Neue',sans-serif" }}>

        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center gap-3 px-4 sm:px-6 h-14 sm:h-16 bg-white"
                style={{ borderBottom:'1px solid #E2E8F0', boxShadow:'0 1px 3px rgba(0,0,0,.04)' }}>
          <Link href="/admin" className="flex items-center gap-1.5 text-sm font-medium flex-shrink-0"
                style={{ color:'#64748B', textDecoration:'none' }}>
            <IconArrowLeft size={16}/>
            <span className="hidden sm:inline">Tableau de bord</span>
          </Link>
          <div className="h-5 w-px flex-shrink-0" style={{ background:'#E2E8F0' }}/>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <IconTool size={17} style={{ color:'#DC2626', flexShrink:0 }}/>
            <h1 className="text-sm font-bold truncate" style={{ color:'#0F172A' }}>Signalements</h1>
            {stats.ouverts > 0 && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ background:'#FEF2F2', color:'#DC2626' }}>
                {stats.ouverts} ouvert{stats.ouverts > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <button onClick={load} className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ background:'#F1F5F9', border:'1px solid #E2E8F0' }}>
            <IconRefresh size={15} style={{ color:'#64748B', animation: loading ? 'spin 1s linear infinite' : 'none' }}/>
          </button>
        </header>

        <div className="px-4 sm:px-6 pt-4 sm:pt-5 space-y-4">

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { lbl:'Total',     val:stats.total,    col:'#2563EB', bg:'#EFF6FF', ico:<IconTool size={15}/> },
              { lbl:'Ouverts',   val:stats.ouverts,  col:'#DC2626', bg:'#FEF2F2', ico:<IconAlertCircle size={15}/> },
              { lbl:'En cours',  val:stats.en_cours, col:'#D97706', bg:'#FFFBEB', ico:<IconClock size={15}/> },
              { lbl:'Résolus',   val:stats.resolus,  col:'#059669', bg:'#ECFDF5', ico:<IconCircleCheck size={15}/> },
            ].map((s, i) => (
              <motion.div key={s.lbl}
                initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
                transition={{ delay: i * 0.06 }}
                className="bg-white rounded-2xl p-4"
                style={{ border:'1px solid #E2E8F0' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs" style={{ color:'#94A3B8' }}>{s.lbl}</span>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                       style={{ background:s.bg, color:s.col }}>{s.ico}</div>
                </div>
                <div className="text-2xl font-bold" style={{ color:s.col }}>
                  {loading ? '—' : s.val}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Toolbar */}
          <div className="flex gap-2 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <IconSearch size={15} style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', color:'#94A3B8', pointerEvents:'none' }}/>
              <input value={search} onChange={e => setSearch(e.target.value)}
                     placeholder="Bien, locataire, type..."
                     style={{ width:'100%', height:'42px', padding:'0 36px', borderRadius:'10px', border:'1.5px solid #E2E8F0', fontSize:'14px', color:'#0F172A', outline:'none', background:'#fff', fontFamily:'inherit', transition:'border-color .15s' }}
                     onFocus={e=>(e.target.style.borderColor='#DC2626')}
                     onBlur={e=>(e.target.style.borderColor='#E2E8F0')}/>
              {search && (
                <button onClick={() => setSearch('')}
                  style={{ position:'absolute', right:'10px', top:'50%', transform:'translateY(-50%)', color:'#94A3B8', background:'none', border:'none', cursor:'pointer' }}>
                  <IconX size={14}/>
                </button>
              )}
            </div>
            <button onClick={() => setFilterOpen(!filterOpen)}
              className="flex items-center gap-2 px-3 h-11 rounded-xl text-sm font-semibold flex-shrink-0"
              style={{ background: filterStatut !== 'tous' ? '#FEF2F2' : '#fff', border:'1.5px solid', borderColor: filterStatut !== 'tous' ? '#DC2626' : '#E2E8F0', color: filterStatut !== 'tous' ? '#DC2626' : '#64748B' }}>
              <IconFilter size={15}/>
              <span className="hidden sm:inline">Filtrer</span>
            </button>
          </div>

          <AnimatePresence>
            {filterOpen && (
              <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }}
                          exit={{ height:0, opacity:0 }} transition={{ duration:.2 }}
                          className="overflow-hidden">
                <div className="flex gap-2 flex-wrap pb-1">
                  {[
                    { val:'tous',     lbl:'Tous' },
                    { val:'ouvert',   lbl:'Ouverts' },
                    { val:'en_cours', lbl:'En cours' },
                    { val:'resolu',   lbl:'Résolus' },
                    { val:'ferme',    lbl:'Fermés' },
                  ].map(f => (
                    <button key={f.val}
                      onClick={() => { setFilter(f.val as typeof filterStatut); setFilterOpen(false) }}
                      className="px-3 py-2 rounded-xl text-xs font-semibold"
                      style={filterStatut === f.val
                        ? { background:'#DC2626', color:'#fff' }
                        : { background:'#fff', color:'#64748B', border:'1px solid #E2E8F0' }}>
                      {f.lbl}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Liste */}
        <div className="flex-1 px-4 sm:px-6 pb-6 mt-4">
          {loading ? (
            <div className="flex flex-col gap-3">
              {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-28"/>)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
                   style={{ background:'#FEF2F2' }}>
                <IconTool size={26} style={{ color:'#FCA5A5' }}/>
              </div>
              <h3 className="text-sm font-bold mb-1" style={{ color:'#0F172A' }}>
                {search || filterStatut !== 'tous' ? 'Aucun signalement trouvé' : 'Aucun signalement'}
              </h3>
              <p className="text-xs" style={{ color:'#94A3B8' }}>
                {search || filterStatut !== 'tous' ? 'Modifiez vos critères' : 'Aucun signalement technique pour le moment'}
              </p>
            </div>
          ) : (
            <>
              <p className="text-xs mb-3" style={{ color:'#94A3B8' }}>
                {filtered.length} signalement{filtered.length > 1 ? 's' : ''}
              </p>

              {/* Cartes mobile */}
              <div className="sm:hidden flex flex-col gap-3">
                {filtered.map((s, i) => (
                  <motion.div key={s.id}
                    initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
                    transition={{ delay: i * 0.04 }}
                    className="card-sig bg-white rounded-2xl p-4 cursor-pointer"
                    style={{ border:`1px solid ${s.statut === 'ouvert' ? '#FECACA' : s.statut === 'en_cours' ? '#FDE68A' : '#E2E8F0'}` }}
                    onClick={() => setSelected(s)}>

                    {/* Top */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                           style={{ background: s.statut === 'ouvert' ? '#FEF2F2' : s.statut === 'en_cours' ? '#FFFBEB' : '#ECFDF5', color: s.statut === 'ouvert' ? '#DC2626' : s.statut === 'en_cours' ? '#D97706' : '#059669' }}>
                        {getTypeIcon(s.type_panne)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-sm font-bold" style={{ color:'#0F172A' }}>
                            {s.type_panne_display ?? s.type_panne}
                          </span>
                          {s.priorite && <PrioriteBadge priorite={s.priorite}/>}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs" style={{ color:'#94A3B8' }}>
                          <IconCalendar size={11}/>
                          {tempsRelatif(s.date_creation)}
                        </div>
                      </div>
                      <StatutBadge statut={s.statut}/>
                    </div>

                    {/* Bien + locataire */}
                    <div className="space-y-1.5 mb-3">
                      {s.bien && (
                        <div className="flex items-center gap-2">
                          <IconHome2 size={12} style={{ color:'#94A3B8', flexShrink:0 }}/>
                          <span className="text-xs truncate" style={{ color:'#475569' }}>{s.bien.titre}</span>
                        </div>
                      )}
                      {s.locataire && (
                        <div className="flex items-center gap-2">
                          <IconUser size={12} style={{ color:'#94A3B8', flexShrink:0 }}/>
                          <span className="text-xs truncate" style={{ color:'#475569' }}>{s.locataire.nom_complet}</span>
                        </div>
                      )}
                      {s.description && (
                        <p className="text-xs line-clamp-2" style={{ color:'#64748B' }}>{s.description}</p>
                      )}
                    </div>

                    {/* Actions rapides */}
                    {(s.statut === 'ouvert' || s.statut === 'en_cours') && (
                      <div className="flex gap-2 pt-3" style={{ borderTop:'1px solid #F1F5F9' }}
                           onClick={e => e.stopPropagation()}>
                        {s.statut === 'ouvert' && (
                          <button
                            onClick={() => handleAction(s, 'en_cours')}
                            disabled={actionLoading === s.id}
                            className="action-btn flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold"
                            style={{ background:'#FFFBEB', color:'#D97706', border:'1px solid #FDE68A' }}>
                            {actionLoading === s.id ? <IconLoader2 size={13} style={{ animation:'spin 1s linear infinite' }}/> : <IconClock size={13}/>}
                            Prendre en charge
                          </button>
                        )}
                        <button
                          onClick={() => handleAction(s, 'resolu')}
                          disabled={actionLoading === s.id}
                          className="action-btn flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-white"
                          style={{ background:'linear-gradient(135deg,#059669,#047857)', boxShadow:'0 2px 6px rgba(5,150,105,.25)' }}>
                          {actionLoading === s.id ? <IconLoader2 size={13} style={{ animation:'spin 1s linear infinite' }}/> : <IconCheck size={13}/>}
                          Résoudre
                        </button>
                        <button onClick={() => setSelected(s)}
                          className="w-9 flex items-center justify-center py-2 rounded-xl"
                          style={{ background:'#EFF6FF', color:'#2563EB' }}>
                          <IconEye size={14}/>
                        </button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Tableau desktop */}
              <div className="hidden sm:block bg-white rounded-2xl overflow-hidden"
                   style={{ border:'1px solid #E2E8F0' }}>
                <div className="grid px-5 py-3"
                     style={{ gridTemplateColumns:'2fr 1.5fr 1.2fr 1fr 1fr auto', gap:'12px', background:'#F8FAFC', borderBottom:'1px solid #F1F5F9' }}>
                  {['Type / Bien','Locataire','Date','Priorité','Statut',''].map(h => (
                    <div key={h} className="text-xs font-bold uppercase tracking-wider" style={{ color:'#94A3B8' }}>{h}</div>
                  ))}
                </div>

                {filtered.map((s, i) => (
                  <motion.div key={s.id}
                    initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay: i * 0.03 }}
                    className="row-hover grid items-center px-5 py-3.5"
                    style={{ gridTemplateColumns:'2fr 1.5fr 1.2fr 1fr 1fr auto', gap:'12px', borderBottom:'1px solid #F8FAFC', borderLeft: s.statut === 'ouvert' ? '3px solid #EF4444' : s.statut === 'en_cours' ? '3px solid #F59E0B' : '3px solid transparent' }}
                    onClick={() => setSelected(s)}>

                    {/* Type + bien */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                           style={{ background: s.statut === 'ouvert' ? '#FEF2F2' : s.statut === 'en_cours' ? '#FFFBEB' : '#ECFDF5', color: s.statut === 'ouvert' ? '#DC2626' : s.statut === 'en_cours' ? '#D97706' : '#059669' }}>
                        {getTypeIcon(s.type_panne)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold truncate" style={{ color:'#0F172A' }}>
                          {s.type_panne_display ?? s.type_panne}
                        </div>
                        <div className="flex items-center gap-1 text-xs" style={{ color:'#94A3B8' }}>
                          <IconHome2 size={10}/>
                          <span className="truncate">{s.bien?.titre ?? '—'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Locataire */}
                    <div className="min-w-0">
                      <div className="text-sm truncate" style={{ color:'#475569' }}>
                        {s.locataire?.nom_complet ?? '—'}
                      </div>
                      <div className="text-xs truncate" style={{ color:'#94A3B8' }}>
                        {s.locataire?.email ?? '—'}
                      </div>
                    </div>

                    {/* Date */}
                    <div className="text-xs" style={{ color:'#64748B' }}>
                      {tempsRelatif(s.date_creation)}
                    </div>

                    {/* Priorité */}
                    <div><PrioriteBadge priorite={s.priorite}/></div>

                    {/* Statut */}
                    <div><StatutBadge statut={s.statut}/></div>

                    {/* Actions */}
                    <div className="flex gap-1.5" onClick={e => e.stopPropagation()}>
                      <button onClick={() => setSelected(s)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background:'#EFF6FF', color:'#2563EB' }}>
                        <IconEye size={13}/>
                      </button>
                      {s.statut === 'ouvert' && (
                        <button onClick={() => handleAction(s, 'en_cours')}
                          disabled={actionLoading === s.id}
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ background:'#FFFBEB', color:'#D97706' }}>
                          {actionLoading === s.id ? <IconLoader2 size={13} style={{ animation:'spin 1s linear infinite' }}/> : <IconClock size={13}/>}
                        </button>
                      )}
                      {(s.statut === 'ouvert' || s.statut === 'en_cours') && (
                        <button onClick={() => handleAction(s, 'resolu')}
                          disabled={actionLoading === s.id}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                          style={{ background:'#059669' }}>
                          {actionLoading === s.id ? <IconLoader2 size={13} style={{ animation:'spin 1s linear infinite' }}/> : <IconCheck size={13}/>}
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* ── DRAWER DÉTAIL ─────────────────────────────────── */}
        <AnimatePresence>
          {selected && (
            <>
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                className="fixed inset-0 z-40"
                style={{ background:'rgba(0,0,0,.35)', backdropFilter:'blur(4px)' }}
                onClick={() => setSelected(null)}/>

              <motion.div
                initial={{ x:'100%' }} animate={{ x:0 }} exit={{ x:'100%' }}
                transition={{ type:'spring', damping:28, stiffness:280 }}
                className="fixed right-0 top-0 bottom-0 z-50 overflow-y-auto"
                style={{ width:'min(460px,100vw)', background:'#fff', boxShadow:'-8px 0 40px rgba(0,0,0,.15)' }}>

                <div className="flex items-center justify-between px-5 py-4 sticky top-0 bg-white z-10"
                     style={{ borderBottom:'1px solid #F1F5F9' }}>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold" style={{ color:'#0F172A' }}>Signalement #{selected.id}</h2>
                    <StatutBadge statut={selected.statut}/>
                    {selected.priorite && <PrioriteBadge priorite={selected.priorite}/>}
                  </div>
                  <button onClick={() => setSelected(null)}
                    className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background:'#F1F5F9' }}>
                    <IconX size={15} style={{ color:'#64748B' }}/>
                  </button>
                </div>

                <div className="px-5 py-5 space-y-5">

                  {/* Hero type */}
                  <div className="flex items-center gap-4 p-4 rounded-2xl"
                       style={{ background: selected.statut === 'ouvert' ? '#FEF2F2' : selected.statut === 'en_cours' ? '#FFFBEB' : '#ECFDF5', border: `1px solid ${selected.statut === 'ouvert' ? '#FECACA' : selected.statut === 'en_cours' ? '#FDE68A' : '#A7F3D0'}` }}>
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                         style={{ background:'#fff', color: selected.statut === 'ouvert' ? '#DC2626' : selected.statut === 'en_cours' ? '#D97706' : '#059669' }}>
                      {getTypeIcon(selected.type_panne)}
                    </div>
                    <div>
                      <div className="font-bold text-sm" style={{ color:'#0F172A' }}>
                        {selected.type_panne_display ?? selected.type_panne}
                      </div>
                      <div className="text-xs" style={{ color:'#64748B' }}>
                        Déclaré {tempsRelatif(selected.date_creation)}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {selected.description && (
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color:'#94A3B8' }}>Description</div>
                      <p className="text-sm leading-relaxed p-3 rounded-xl"
                         style={{ background:'#F8FAFC', color:'#475569', border:'1px solid #F1F5F9' }}>
                        {selected.description}
                      </p>
                    </div>
                  )}

                  {/* Bien + locataire */}
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color:'#94A3B8' }}>Concernant</div>
                    <div className="space-y-2.5">
                      {selected.bien && (
                        <div className="flex items-center gap-3 p-3 rounded-xl"
                             style={{ background:'#F8FAFC' }}>
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                               style={{ background:'#EFF6FF' }}>
                            <IconHome2 size={15} style={{ color:'#2563EB' }}/>
                          </div>
                          <div>
                            <div className="text-xs" style={{ color:'#94A3B8' }}>Logement</div>
                            <div className="text-sm font-semibold" style={{ color:'#0F172A' }}>{selected.bien.titre}</div>
                            <div className="text-xs" style={{ color:'#94A3B8' }}>{selected.bien.adresse}</div>
                          </div>
                        </div>
                      )}
                      {selected.locataire && (
                        <div className="flex items-center gap-3 p-3 rounded-xl"
                             style={{ background:'#F8FAFC' }}>
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                               style={{ background:'#F5F3FF' }}>
                            <IconUser size={15} style={{ color:'#7C3AED' }}/>
                          </div>
                          <div>
                            <div className="text-xs" style={{ color:'#94A3B8' }}>Locataire</div>
                            <div className="text-sm font-semibold" style={{ color:'#0F172A' }}>{selected.locataire.nom_complet}</div>
                            <div className="text-xs" style={{ color:'#94A3B8' }}>{selected.locataire.email}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Timeline */}
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color:'#94A3B8' }}>Chronologie</div>
                    <div className="space-y-3">
                      {[
                        { ico:<IconAlertTriangle size={14}/>, col:'#DC2626', bg:'#FEF2F2', lbl:'Déclaré', val: new Date(selected.date_creation).toLocaleString('fr-FR', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' }) },
                        ...(selected.statut === 'en_cours' || selected.statut === 'resolu' || selected.statut === 'ferme'
                          ? [{ ico:<IconClock size={14}/>, col:'#D97706', bg:'#FFFBEB', lbl:'Pris en charge', val:'En cours de traitement' }]
                          : []),
                        ...(selected.date_resolution
                          ? [{ ico:<IconCircleCheck size={14}/>, col:'#059669', bg:'#ECFDF5', lbl:'Résolu', val: new Date(selected.date_resolution).toLocaleString('fr-FR', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' }) }]
                          : []),
                      ].map((t, i) => (
                        <div key={i} className="flex gap-3">
                          <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
                               style={{ background:t.bg, color:t.col }}>{t.ico}</div>
                          <div>
                            <div className="text-xs font-semibold" style={{ color:'#0F172A' }}>{t.lbl}</div>
                            <div className="text-xs" style={{ color:'#94A3B8' }}>{t.val}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Commentaire admin */}
                  {(selected.statut === 'ouvert' || selected.statut === 'en_cours') && (
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color:'#94A3B8' }}>
                        Commentaire admin (optionnel)
                      </div>
                      <textarea
                        value={commentaire}
                        onChange={e => setCommentaire(e.target.value)}
                        placeholder="Ajoutez un commentaire visible par le locataire..."
                        className="textarea-f"
                      />
                    </div>
                  )}

                  {selected.commentaire_admin && (
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color:'#94A3B8' }}>Commentaire</div>
                      <div className="flex gap-3 p-3 rounded-xl" style={{ background:'#F8FAFC' }}>
                        <IconMessage size={15} style={{ color:'#64748B', flexShrink:0, marginTop:'1px' }}/>
                        <p className="text-sm" style={{ color:'#475569' }}>{selected.commentaire_admin}</p>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  {(selected.statut === 'ouvert' || selected.statut === 'en_cours') && (
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color:'#94A3B8' }}>Actions</div>
                      <div className="space-y-2">
                        {selected.statut === 'ouvert' && (
                          <motion.button whileHover={{ scale:1.01 }} whileTap={{ scale:.99 }}
                            onClick={() => handleAction(selected, 'en_cours')}
                            disabled={actionLoading === selected.id}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold"
                            style={{ background:'#FFFBEB', color:'#D97706', border:'1px solid #FDE68A' }}>
                            {actionLoading === selected.id ? <IconLoader2 size={15} style={{ animation:'spin 1s linear infinite' }}/> : <IconClock size={15}/>}
                            Prendre en charge
                          </motion.button>
                        )}
                        <motion.button whileHover={{ scale:1.01 }} whileTap={{ scale:.99 }}
                          onClick={() => handleAction(selected, 'resolu')}
                          disabled={actionLoading === selected.id}
                          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white"
                          style={{ background:'linear-gradient(135deg,#059669,#047857)', boxShadow:'0 2px 10px rgba(5,150,105,.3)' }}>
                          {actionLoading === selected.id ? <IconLoader2 size={15} style={{ animation:'spin 1s linear infinite' }}/> : <IconCircleCheck size={15}/>}
                          Marquer comme résolu
                        </motion.button>
                        <motion.button whileHover={{ scale:1.01 }} whileTap={{ scale:.99 }}
                          onClick={() => handleAction(selected, 'ferme')}
                          disabled={actionLoading === selected.id}
                          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold"
                          style={{ background:'#F1F5F9', color:'#64748B' }}>
                          <IconBan size={15}/>Fermer sans résolution
                        </motion.button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
