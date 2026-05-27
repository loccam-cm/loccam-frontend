'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import api from '@/lib/api'
import { Utilisateur, PaginatedResponse } from '@/types'
import {
  IconShieldCheck, IconArrowLeft, IconRefresh,
  IconCheck, IconX, IconEye, IconSearch,
  IconFilter, IconUser, IconCalendar,
  IconAlertCircle, IconClock, IconCircleCheck,
  IconBan, IconLoader2, IconChevronRight,
  IconDownload, IconZoomIn,
} from '@tabler/icons-react'

// ── Types ─────────────────────────────────────────────────────
type CNIStatut = 'en_attente' | 'valide' | 'rejete'

interface CNIAction {
  userId: number
  action: 'valider' | 'rejeter'
  loading: boolean
}

// ── Composants ────────────────────────────────────────────────
function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`rounded-xl ${className}`} style={{
      background: 'linear-gradient(90deg,#E2E8F0 25%,#F1F5F9 50%,#E2E8F0 75%)',
      backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite',
    }} />
  )
}

function Avatar({ nom, prenom, size = 44 }: { nom: string; prenom: string; size?: number }) {
  const colors = ['#3B82F6','#059669','#D97706','#7C3AED','#EF4444','#06B6D4']
  const col = colors[(prenom?.charCodeAt(0) ?? 0) % colors.length]
  return (
    <div style={{ width: size, height: size, borderRadius: '15px', background: `${col}18`, border: `1.5px solid ${col}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: size * 0.35, color: col, flexShrink: 0 }}>
      {prenom?.[0]}{nom?.[0]}
    </div>
  )
}

function StatutBadge({ statut }: { statut: CNIStatut }) {
  const map = {
    en_attente: { bg:'#FFFBEB', col:'#D97706', lbl:'En attente', ico:<IconClock size={11}/> },
    valide:     { bg:'#ECFDF5', col:'#059669', lbl:'Validée',    ico:<IconCircleCheck size={11}/> },
    rejete:     { bg:'#FEF2F2', col:'#DC2626', lbl:'Rejetée',    ico:<IconBan size={11}/> },
  }
  const s = map[statut]
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{ background: s.bg, color: s.col }}>
      {s.ico}{s.lbl}
    </span>
  )
}

// ── Temps relatif ──────────────────────────────────────────────
function tempsRelatif(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  if (diff < 3600000)  return `Il y a ${Math.floor(diff / 60000)} min`
  if (diff < 86400000) return `Il y a ${Math.floor(diff / 3600000)}h`
  if (diff < 604800000) return `Il y a ${Math.floor(diff / 86400000)} jour${Math.floor(diff / 86400000) > 1 ? 's' : ''}`
  return new Date(iso).toLocaleDateString('fr-FR', { day:'numeric', month:'short', year:'numeric' })
}

// ────────────────────────────────────────────────────────────
export default function ValidationCNIPage() {
  const { user } = useAuth()
  const [users, setUsers]         = useState<Utilisateur[]>([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [filterStatut, setFilter] = useState<'tous' | CNIStatut>('en_attente')
  const [filterOpen, setFilterOpen] = useState(false)
  const [selected, setSelected]   = useState<Utilisateur | null>(null)
  const [actions, setActions]     = useState<Map<number, CNIAction>>(new Map())
  const [toast, setToast]         = useState<{ msg: string; ok: boolean } | null>(null)

  useEffect(() => { if (user) load() }, [user])

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get<PaginatedResponse<Utilisateur>>('/users/')
      setUsers(res.data.results.filter(u => u.role === 'bailleur'))
    } catch { } finally { setLoading(false) }
  }

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  const handleAction = async (u: Utilisateur, action: 'valider' | 'rejeter') => {
    setActions(prev => new Map(prev).set(u.id, { userId: u.id, action, loading: true }))
    try {
      await api.patch(`/users/${u.id}/`, {
        cni_statut: action === 'valider' ? 'valide' : 'rejete',
      })
      showToast(
        action === 'valider' ? `CNI de ${u.nom_complet} validée` : `CNI de ${u.nom_complet} rejetée`,
        action === 'valider'
      )
      if (selected?.id === u.id) setSelected(null)
      await load()
    } catch {
      showToast('Une erreur est survenue', false)
    } finally {
      setActions(prev => { const m = new Map(prev); m.delete(u.id); return m })
    }
  }

  const filtered = users.filter(u => {
    const matchSearch = !search ||
      u.nom_complet.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    const matchStatut = filterStatut === 'tous' || u.cni_statut === filterStatut
    return matchSearch && matchStatut
  })

  const stats = {
    total:    users.length,
    attente:  users.filter(u => u.cni_statut === 'en_attente').length,
    valides:  users.filter(u => u.cni_statut === 'valide').length,
    rejetes:  users.filter(u => u.cni_statut === 'rejete').length,
  }

  if (!user) return null

  return (
    <>
      <style>{`
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:#CBD5E1;border-radius:4px}
        .row-hover{transition:background .12s;cursor:pointer}.row-hover:hover{background:#F8FAFC}
        .card-hover{transition:all .18s ease}.card-hover:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,.08)}
        .action-btn{transition:all .15s ease}.action-btn:hover{transform:scale(1.04)}
        .action-btn:active{transform:scale(.97)}
      `}</style>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity:0, y:-20, scale:.95 }}
            animate={{ opacity:1, y:0, scale:1 }}
            exit={{ opacity:0, y:-20, scale:.95 }}
            transition={{ duration:.25 }}
            style={{ position:'fixed', top:'20px', left:'50%', transform:'translateX(-50%)', zIndex:100,
                     display:'flex', alignItems:'center', gap:'10px', padding:'12px 20px', borderRadius:'16px',
                     background: toast.ok ? '#059669' : '#DC2626', color:'#fff', fontSize:'14px', fontWeight:600,
                     boxShadow:'0 8px 24px rgba(0,0,0,.2)', whiteSpace:'nowrap' }}>
            {toast.ok ? <IconCircleCheck size={18}/> : <IconAlertCircle size={18}/>}
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
            <IconShieldCheck size={18} style={{ color:'#2563EB', flexShrink:0 }}/>
            <h1 className="text-sm font-bold truncate" style={{ color:'#0F172A' }}>Validation CNI</h1>
            {stats.attente > 0 && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ background:'#FFFBEB', color:'#D97706' }}>
                {stats.attente} en attente
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
              { lbl:'Total bailleurs', val:stats.total,   col:'#2563EB', bg:'#EFF6FF', ico:<IconUser size={15}/> },
              { lbl:'En attente',      val:stats.attente, col:'#D97706', bg:'#FFFBEB', ico:<IconClock size={15}/> },
              { lbl:'CNI validées',    val:stats.valides, col:'#059669', bg:'#ECFDF5', ico:<IconCircleCheck size={15}/> },
              { lbl:'CNI rejetées',    val:stats.rejetes, col:'#DC2626', bg:'#FEF2F2', ico:<IconBan size={15}/> },
            ].map((s, i) => (
              <motion.div key={s.lbl}
                initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
                transition={{ delay: i * 0.06 }}
                className="bg-white rounded-2xl p-4"
                style={{ border:'1px solid #E2E8F0' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium" style={{ color:'#94A3B8' }}>{s.lbl}</span>
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
                     placeholder="Nom, email du bailleur..."
                     style={{ width:'100%', height:'42px', padding:'0 36px', borderRadius:'10px', border:'1.5px solid #E2E8F0', fontSize:'14px', color:'#0F172A', outline:'none', background:'#fff', fontFamily:'inherit', transition:'border-color .15s' }}
                     onFocus={e=>(e.target.style.borderColor='#2563EB')}
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
              style={{ background: filterStatut !== 'tous' ? '#EFF6FF' : '#fff', border:'1.5px solid', borderColor: filterStatut !== 'tous' ? '#2563EB' : '#E2E8F0', color: filterStatut !== 'tous' ? '#2563EB' : '#64748B' }}>
              <IconFilter size={15}/>
              <span className="hidden sm:inline">Statut</span>
            </button>
          </div>

          <AnimatePresence>
            {filterOpen && (
              <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }}
                          exit={{ height:0, opacity:0 }} transition={{ duration:.2 }}
                          className="overflow-hidden">
                <div className="flex gap-2 flex-wrap pb-1">
                  {[
                    { val:'tous',       lbl:'Tous' },
                    { val:'en_attente', lbl:'En attente' },
                    { val:'valide',     lbl:'Validés' },
                    { val:'rejete',     lbl:'Rejetés' },
                  ].map(f => (
                    <button key={f.val}
                      onClick={() => { setFilter(f.val as typeof filterStatut); setFilterOpen(false) }}
                      className="px-3 py-2 rounded-xl text-xs font-semibold"
                      style={filterStatut === f.val
                        ? { background:'#2563EB', color:'#fff' }
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
              {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-24"/>)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
                   style={{ background:'#EFF6FF' }}>
                <IconShieldCheck size={26} style={{ color:'#93C5FD' }}/>
              </div>
              <h3 className="text-sm font-bold mb-1" style={{ color:'#0F172A' }}>
                {filterStatut === 'en_attente' ? 'Aucune CNI en attente' : 'Aucun résultat'}
              </h3>
              <p className="text-xs" style={{ color:'#94A3B8' }}>
                {filterStatut === 'en_attente' ? 'Toutes les CNI ont été traitées' : 'Modifiez vos critères'}
              </p>
            </div>
          ) : (
            <>
              <p className="text-xs mb-3" style={{ color:'#94A3B8' }}>
                {filtered.length} bailleur{filtered.length > 1 ? 's' : ''}
              </p>

              {/* Cartes mobile */}
              <div className="sm:hidden flex flex-col gap-3">
                {filtered.map((u, i) => {
                  const act = actions.get(u.id)
                  return (
                    <motion.div key={u.id}
                      initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
                      transition={{ delay: i * 0.04 }}
                      className="card-hover bg-white rounded-2xl p-4"
                      style={{ border:'1px solid #E2E8F0' }}>

                      <div className="flex items-start gap-3 mb-4">
                        <Avatar nom={u.nom} prenom={u.prenom} size={48}/>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-sm font-bold" style={{ color:'#0F172A' }}>{u.nom_complet}</span>
                            <StatutBadge statut={u.cni_statut as CNIStatut}/>
                          </div>
                          <div className="text-xs mb-1 truncate" style={{ color:'#94A3B8' }}>{u.email}</div>
                          <div className="flex items-center gap-1.5 text-xs" style={{ color:'#94A3B8' }}>
                            <IconCalendar size={11}/>
                            {u.date_creation ? tempsRelatif(u.date_creation) : '—'}
                          </div>
                        </div>
                        <button onClick={() => setSelected(u)}
                          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background:'#EFF6FF', color:'#2563EB' }}>
                          <IconEye size={14}/>
                        </button>
                      </div>

                      {/* CNI placeholder */}
                      {u.cni_statut === 'en_attente' && (
                        <div className="rounded-xl overflow-hidden mb-3 relative cursor-pointer"
                             onClick={() => setSelected(u)}
                             style={{ background:'linear-gradient(135deg,#EFF6FF,#DBEAFE)', height:'80px', display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid #BFDBFE' }}>
                          <div className="flex flex-col items-center gap-1">
                            <IconUser size={24} style={{ color:'#93C5FD' }}/>
                            <span className="text-xs font-medium" style={{ color:'#3B82F6' }}>Voir la CNI</span>
                          </div>
                          {u.cni_photo_url && (
                            <div className="absolute top-2 right-2">
                              <IconZoomIn size={16} style={{ color:'#2563EB' }}/>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      {u.cni_statut === 'en_attente' && (
                        <div className="flex gap-2">
                          <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:.98 }}
                            onClick={() => handleAction(u, 'valider')}
                            disabled={!!act?.loading}
                            className="action-btn flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold text-white"
                            style={{ background:'linear-gradient(135deg,#059669,#047857)', boxShadow:'0 2px 8px rgba(5,150,105,.3)' }}>
                            {act?.action === 'valider' && act.loading
                              ? <IconLoader2 size={14} style={{ animation:'spin 1s linear infinite' }}/>
                              : <IconCheck size={14}/>}
                            Valider
                          </motion.button>
                          <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:.98 }}
                            onClick={() => handleAction(u, 'rejeter')}
                            disabled={!!act?.loading}
                            className="action-btn flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold"
                            style={{ background:'#FEF2F2', color:'#DC2626', border:'1px solid #FECACA' }}>
                            {act?.action === 'rejeter' && act.loading
                              ? <IconLoader2 size={14} style={{ animation:'spin 1s linear infinite' }}/>
                              : <IconX size={14}/>}
                            Rejeter
                          </motion.button>
                        </div>
                      )}

                      {u.cni_statut !== 'en_attente' && (
                        <div className="flex items-center justify-between pt-2"
                             style={{ borderTop:'1px solid #F1F5F9' }}>
                          <span className="text-xs" style={{ color:'#94A3B8' }}>
                            Traité — {u.date_creation ? tempsRelatif(u.date_creation) : '—'}
                          </span>
                          <StatutBadge statut={u.cni_statut as CNIStatut}/>
                        </div>
                      )}
                    </motion.div>
                  )
                })}
              </div>

              {/* Tableau desktop */}
              <div className="hidden sm:block bg-white rounded-2xl overflow-hidden"
                   style={{ border:'1px solid #E2E8F0' }}>
                <div className="grid px-5 py-3"
                     style={{ gridTemplateColumns:'2.5fr 1fr 1fr 1fr auto', gap:'12px', background:'#F8FAFC', borderBottom:'1px solid #F1F5F9' }}>
                  {['Bailleur','Inscription','CNI','Statut','Actions'].map(h => (
                    <div key={h} className="text-xs font-bold uppercase tracking-wider" style={{ color:'#94A3B8' }}>{h}</div>
                  ))}
                </div>

                {filtered.map((u, i) => {
                  const act = actions.get(u.id)
                  return (
                    <motion.div key={u.id}
                      initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay: i * 0.03 }}
                      className="row-hover grid items-center px-5 py-4"
                      style={{ gridTemplateColumns:'2.5fr 1fr 1fr 1fr auto', gap:'12px', borderBottom:'1px solid #F8FAFC' }}
                      onClick={() => setSelected(u)}>

                      {/* Bailleur */}
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar nom={u.nom} prenom={u.prenom} size={42}/>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold truncate" style={{ color:'#0F172A' }}>{u.nom_complet}</div>
                          <div className="text-xs truncate" style={{ color:'#94A3B8' }}>{u.email}</div>
                        </div>
                      </div>

                      {/* Date */}
                      <div className="flex items-center gap-1.5">
                        <IconCalendar size={12} style={{ color:'#94A3B8' }}/>
                        <span className="text-xs" style={{ color:'#64748B' }}>
                          {u.date_creation ? tempsRelatif(u.date_creation) : '—'}
                        </span>
                      </div>

                      {/* CNI photo */}
                      <div>
                        {u.cni_photo_url ? (
                          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg w-fit"
                               style={{ background:'#EFF6FF' }}>
                            <IconShieldCheck size={13} style={{ color:'#2563EB' }}/>
                            <span className="text-xs font-medium" style={{ color:'#2563EB' }}>Photo uploadée</span>
                          </div>
                        ) : (
                          <span className="text-xs" style={{ color:'#CBD5E1' }}>Non fournie</span>
                        )}
                      </div>

                      {/* Statut */}
                      <div><StatutBadge statut={u.cni_statut as CNIStatut}/></div>

                      {/* Actions */}
                      <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setSelected(u)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ background:'#EFF6FF', color:'#2563EB' }}>
                          <IconEye size={13}/>
                        </button>
                        {u.cni_statut === 'en_attente' && (
                          <>
                            <motion.button whileHover={{ scale:1.08 }} whileTap={{ scale:.95 }}
                              onClick={() => handleAction(u, 'valider')}
                              disabled={!!act?.loading}
                              className="w-8 h-8 rounded-lg flex items-center justify-center"
                              style={{ background:'#ECFDF5', color:'#059669' }}>
                              {act?.action === 'valider' && act.loading
                                ? <IconLoader2 size={13} style={{ animation:'spin 1s linear infinite' }}/>
                                : <IconCheck size={13}/>}
                            </motion.button>
                            <motion.button whileHover={{ scale:1.08 }} whileTap={{ scale:.95 }}
                              onClick={() => handleAction(u, 'rejeter')}
                              disabled={!!act?.loading}
                              className="w-8 h-8 rounded-lg flex items-center justify-center"
                              style={{ background:'#FEF2F2', color:'#DC2626' }}>
                              {act?.action === 'rejeter' && act.loading
                                ? <IconLoader2 size={13} style={{ animation:'spin 1s linear infinite' }}/>
                                : <IconX size={13}/>}
                            </motion.button>
                          </>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
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
                style={{ width:'min(440px,100vw)', background:'#fff', boxShadow:'-8px 0 40px rgba(0,0,0,.15)' }}>

                <div className="flex items-center justify-between px-5 py-4 sticky top-0 bg-white z-10"
                     style={{ borderBottom:'1px solid #F1F5F9' }}>
                  <h2 className="text-sm font-bold" style={{ color:'#0F172A' }}>Dossier CNI</h2>
                  <button onClick={() => setSelected(null)}
                    className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background:'#F1F5F9' }}>
                    <IconX size={15} style={{ color:'#64748B' }}/>
                  </button>
                </div>

                <div className="px-5 py-5 space-y-5">

                  {/* Profil */}
                  <div className="flex items-center gap-4 p-4 rounded-2xl"
                       style={{ background:'#F8FAFC', border:'1px solid #F1F5F9' }}>
                    <Avatar nom={selected.nom} prenom={selected.prenom} size={56}/>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-base" style={{ color:'#0F172A' }}>{selected.nom_complet}</h3>
                      <p className="text-xs truncate mb-2" style={{ color:'#94A3B8' }}>{selected.email}</p>
                      <StatutBadge statut={selected.cni_statut as CNIStatut}/>
                    </div>
                  </div>

                  {/* Infos */}
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color:'#94A3B8' }}>
                      Informations
                    </div>
                    {[
                      { lbl:'Email',       val: selected.email },
                      { lbl:'Téléphone',   val: selected.telephone ?? '—' },
                      { lbl:'Rôle',        val: 'Bailleur' },
                      { lbl:'Inscription', val: selected.date_creation ? new Date(selected.date_creation).toLocaleDateString('fr-FR', { day:'numeric', month:'long', year:'numeric' }) : '—' },
                    ].map(r => (
                      <div key={r.lbl} className="flex justify-between py-3"
                           style={{ borderBottom:'1px solid #F8FAFC' }}>
                        <span className="text-xs" style={{ color:'#94A3B8' }}>{r.lbl}</span>
                        <span className="text-sm font-semibold" style={{ color:'#0F172A' }}>{r.val}</span>
                      </div>
                    ))}
                  </div>

                  {/* Photo CNI */}
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color:'#94A3B8' }}>
                      Photo CNI
                    </div>
                    {selected.cni_photo_url ? (
                      <div className="relative rounded-2xl overflow-hidden"
                           style={{ background:'#F1F5F9', border:'1px solid #E2E8F0' }}>
                        <img src={selected.cni_photo_url} alt="CNI"
                             className="w-full object-cover" style={{ maxHeight:'220px' }} />
                        <div className="absolute top-3 right-3">
                          <button className="w-8 h-8 rounded-xl flex items-center justify-center"
                                  style={{ background:'rgba(255,255,255,.9)' }}>
                            <IconZoomIn size={16} style={{ color:'#2563EB' }}/>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 rounded-2xl"
                           style={{ background:'#F8FAFC', border:'2px dashed #E2E8F0' }}>
                        <IconUser size={32} style={{ color:'#CBD5E1', marginBottom:'8px' }}/>
                        <p className="text-sm font-medium" style={{ color:'#94A3B8' }}>Aucune photo fournie</p>
                        <p className="text-xs mt-1" style={{ color:'#CBD5E1' }}>Le bailleur n&apos;a pas encore uploadé sa CNI</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {selected.cni_statut === 'en_attente' && (
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color:'#94A3B8' }}>
                        Décision
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:.98 }}
                          onClick={() => { handleAction(selected, 'valider'); setSelected(null) }}
                          disabled={!!actions.get(selected.id)?.loading}
                          className="flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white"
                          style={{ background:'linear-gradient(135deg,#059669,#047857)', boxShadow:'0 2px 10px rgba(5,150,105,.35)' }}>
                          <IconCircleCheck size={16}/>Valider la CNI
                        </motion.button>
                        <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:.98 }}
                          onClick={() => { handleAction(selected, 'rejeter'); setSelected(null) }}
                          disabled={!!actions.get(selected.id)?.loading}
                          className="flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold"
                          style={{ background:'#FEF2F2', color:'#DC2626', border:'1px solid #FECACA' }}>
                          <IconBan size={16}/>Rejeter
                        </motion.button>
                      </div>
                      <p className="text-xs text-center mt-3" style={{ color:'#94A3B8' }}>
                        Cette action enverra une notification au bailleur
                      </p>
                    </div>
                  )}

                  {selected.cni_statut !== 'en_attente' && (
                    <div className="rounded-xl p-4 flex items-center gap-3"
                         style={{ background: selected.cni_statut === 'valide' ? '#ECFDF5' : '#FEF2F2', border: `1px solid ${selected.cni_statut === 'valide' ? '#A7F3D0' : '#FECACA'}` }}>
                      {selected.cni_statut === 'valide'
                        ? <IconCircleCheck size={20} style={{ color:'#059669', flexShrink:0 }}/>
                        : <IconBan size={20} style={{ color:'#DC2626', flexShrink:0 }}/>}
                      <div>
                        <div className="text-sm font-bold" style={{ color: selected.cni_statut === 'valide' ? '#059669' : '#DC2626' }}>
                          {selected.cni_statut === 'valide' ? 'CNI validée' : 'CNI rejetée'}
                        </div>
                        <div className="text-xs" style={{ color:'#94A3B8' }}>
                          Traitement effectué par l&apos;administration
                        </div>
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
