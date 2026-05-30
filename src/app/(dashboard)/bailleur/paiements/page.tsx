'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import api from '@/lib/api'
import { toast } from 'sonner'
import { Paiement, PaginatedResponse } from '@/types'
import {
  IconCreditCard, IconSearch, IconArrowLeft, IconRefresh,
  IconX, IconFilter, IconDownload, IconChevronRight,
  IconCheck, IconAlertTriangle, IconClock,
  IconTrendingUp, IconCalendar, IconHome2,
  IconCircleCheck, IconAlertCircle, IconEye,
  IconBuildingBank, IconLoader2,
} from '@tabler/icons-react'

// ── Types ────────────────────────────────────────────────────
const STATUT_MAP: Record<string, { bg: string; col: string; lbl: string; ico: React.ReactNode }> = {
  confirme:   { bg:'#ECFDF5', col:'#059669', lbl:'Confirmé',   ico:<IconCircleCheck size={11}/> },
  en_attente: { bg:'#FFFBEB', col:'#D97706', lbl:'En attente', ico:<IconClock size={11}/> },
  echoue:     { bg:'#FEF2F2', col:'#DC2626', lbl:'Échoué',     ico:<IconAlertCircle size={11}/> },
  rembourse:  { bg:'#EFF6FF', col:'#2563EB', lbl:'Remboursé',  ico:<IconCheck size={11}/> },
}

const MOYEN_MAP: Record<string, { lbl: string; col: string; bg: string }> = {
  orange_money: { lbl:'Orange Money', col:'#FF6600', bg:'rgba(255,102,0,.1)' },
  mtn_money:    { lbl:'MTN Money',    col:'#D97706', bg:'rgba(217,119,6,.1)' },
  cash:         { lbl:'Cash',         col:'#059669', bg:'rgba(5,150,105,.1)' },
  virement:     { lbl:'Virement',     col:'#2563EB', bg:'rgba(37,99,235,.1)' },
  autre:        { lbl:'Autre',        col:'#64748B', bg:'rgba(100,116,139,.1)' },
}

const MOIS = ['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Août','Sep','Oct','Nov','Déc']

function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`rounded-xl ${className}`} style={{
      background:'linear-gradient(90deg,#E2E8F0 25%,#F1F5F9 50%,#E2E8F0 75%)',
      backgroundSize:'200% 100%', animation:'shimmer 1.5s infinite',
    }} />
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

function MoyenBadge({ moyen }: { moyen: string }) {
  const m = MOYEN_MAP[moyen] ?? { lbl:moyen, col:'#64748B', bg:'rgba(100,116,139,.1)' }
  return (
    <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
          style={{ background:m.bg, color:m.col }}>
      {m.lbl}
    </span>
  )
}

// ────────────────────────────────────────────────────────────
export default function PaiementsPage() {
  const { user } = useAuth()
  const [paiements, setPaiements]     = useState<Paiement[]>([])
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState('')
  const [filterStatut, setFilter]     = useState('tous')
  const [filterMois, setFilterMois]   = useState('tous')
  const [filterOpen, setFilterOpen]   = useState(false)
  const [selected, setSelected]       = useState<Paiement | null>(null)
  const [downloading, setDownloading] = useState<number | null>(null)

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get<PaginatedResponse<Paiement>>('/paiements/')
      setPaiements(res.data.results)
    } catch { } finally { setLoading(false) }
  }

  // ── Télécharger une quittance ──────────────────────────
  const telechargerQuittance = async (e: React.MouseEvent, paiementId: number) => {
    e.stopPropagation()
    setDownloading(paiementId)
    try {
      const res = await api.get(`/paiements/${paiementId}/quittance/`, {
        responseType: 'blob',
      })
      const url  = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const link = document.createElement('a')
      link.href  = url
      link.setAttribute('download', `Quittance_${paiementId}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      toast.success('Quittance téléchargée !')
    } catch {
      toast.error('Erreur lors du téléchargement.')
    } finally {
      setDownloading(null)
    }
  }

  // Calculs stats
  const annee = new Date().getFullYear()
  const stats = {
    total_confirme: paiements.filter(p => p.statut === 'confirme').reduce((s, p) => s + p.montant_total, 0),
    nb_confirmes:   paiements.filter(p => p.statut === 'confirme').length,
    nb_attente:     paiements.filter(p => p.statut === 'en_attente').length,
    nb_echoues:     paiements.filter(p => p.statut === 'echoue').length,
    taux:           paiements.length > 0 ? Math.round((paiements.filter(p => p.statut === 'confirme').length / paiements.length) * 100) : 0,
  }

  const chartData = MOIS.map((m, i) => {
    const montant = paiements
      .filter(p => p.statut === 'confirme' && p.mois === i + 1 && p.annee === annee)
      .reduce((s, p) => s + p.montant_total, 0)
    return { mois: m, montant, actif: i + 1 === new Date().getMonth() + 1 }
  })
  const maxMontant = Math.max(...chartData.map(d => d.montant), 1)

  const filtered = paiements.filter(p => {
    const locNom    = p.contrat?.locataire?.nom_complet ?? ''
    const bienTitre = p.contrat?.bien?.titre ?? ''
    const matchSearch  = !search || locNom.toLowerCase().includes(search.toLowerCase()) || bienTitre.toLowerCase().includes(search.toLowerCase()) || (p.transaction_id ?? '').toLowerCase().includes(search.toLowerCase())
    const matchStatut  = filterStatut === 'tous' || p.statut === filterStatut
    const matchMois    = filterMois   === 'tous' || p.mois === Number(filterMois)
    return matchSearch && matchStatut && matchMois
  })

  const grouped = filtered.reduce<Record<string, Paiement[]>>((acc, p) => {
    const key = `${MOIS[(p.mois ?? 1) - 1]} ${p.annee}`
    if (!acc[key]) acc[key] = []
    acc[key].push(p)
    return acc
  }, {})

  if (!user) return null

  return (
    <>
      <style>{`
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes spin{to{transform:rotate(360deg)}}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:#E2E8F0;border-radius:4px}
        .row-hover{transition:background .12s}.row-hover:hover{background:#F8FAFC}
        .card-p{transition:all .18s ease}.card-p:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,.08)}
      `}</style>

      <div className="flex flex-col min-h-screen" style={{ background:'#F1F5F9', fontFamily:"'DM Sans','Helvetica Neue',sans-serif" }}>

        {/* ── HEADER ────────────────────────────────────────── */}
        <header className="sticky top-0 z-30 flex items-center gap-3 px-4 sm:px-6 h-14 sm:h-16 bg-white"
                style={{ borderBottom:'1px solid #E2E8F0', boxShadow:'0 1px 3px rgba(0,0,0,.04)' }}>
          <Link href="/bailleur" className="flex items-center gap-1.5 text-sm font-medium flex-shrink-0"
                style={{ color:'#64748B', textDecoration:'none' }}>
            <IconArrowLeft size={16} />
            <span className="hidden sm:inline">Retour</span>
          </Link>
          <div className="h-5 w-px flex-shrink-0" style={{ background:'#E2E8F0' }} />
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <IconCreditCard size={17} style={{ color:'#059669', flexShrink:0 }} />
            <h1 className="text-sm font-bold truncate" style={{ color:'#0F172A' }}>Historique paiements</h1>
            {!loading && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ background:'#ECFDF5', color:'#059669' }}>
                {paiements.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={load} className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background:'#F1F5F9', border:'1px solid #E2E8F0' }}>
              <IconRefresh size={15} style={{ color:'#64748B', animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            </button>
            <button className="hidden sm:flex items-center gap-2 px-3 h-9 rounded-xl text-xs font-semibold"
                    style={{ background:'#ECFDF5', color:'#059669', border:'1px solid #A7F3D0' }}>
              <IconDownload size={14} />Exporter CSV
            </button>
          </div>
        </header>

        <div className="px-4 sm:px-6 pt-4 sm:pt-5 space-y-4">

          {/* ── KPIs ──────────────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { lbl:'Revenus confirmés', val: loading ? '—' : `${stats.total_confirme.toLocaleString('fr-FR')} XAF`, col:'#059669', bg:'#ECFDF5', ico:<IconTrendingUp size={16}/>, big:true },
              { lbl:'Paiements reçus',   val: loading ? '—' : stats.nb_confirmes.toString(), col:'#2563EB', bg:'#EFF6FF', ico:<IconCircleCheck size={16}/> },
              { lbl:'En attente',        val: loading ? '—' : stats.nb_attente.toString(),   col:'#D97706', bg:'#FFFBEB', ico:<IconClock size={16}/> },
              { lbl:'Taux confirmation', val: loading ? '—' : `${stats.taux}%`,              col:'#7C3AED', bg:'#F5F3FF', ico:<IconCheck size={16}/> },
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
                <div className="font-bold" style={{ color:s.col, fontSize: s.big ? '16px' : '22px' }}>{s.val}</div>
              </motion.div>
            ))}
          </div>

          {/* ── GRAPHIQUE MENSUEL ─────────────────────────────── */}
          <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
            transition={{ delay:.15 }}
            className="bg-white rounded-2xl p-4 sm:p-5"
            style={{ border:'1px solid #E2E8F0' }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider mb-0.5" style={{ color:'#94A3B8' }}>Revenus mensuels {annee}</div>
                <div className="text-lg font-bold" style={{ color:'#0F172A' }}>{stats.total_confirme.toLocaleString('fr-FR')} XAF</div>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color:'#059669' }}>
                <IconTrendingUp size={14} />Confirmés
              </div>
            </div>
            <div className="flex items-end gap-1 sm:gap-2" style={{ height:'72px' }}>
              {chartData.map((d, i) => (
                <div key={d.mois} className="flex-1 flex flex-col items-center gap-1">
                  <motion.div
                    className="w-full rounded-t cursor-pointer"
                    initial={{ height:0 }}
                    animate={{ height: d.montant > 0 ? `${Math.max((d.montant / maxMontant) * 100, 6)}%` : '6%' }}
                    transition={{ duration:.7, delay: i * 0.04, ease:'easeOut' }}
                    style={{ background: d.actif ? '#059669' : d.montant > 0 ? '#A7F3D0' : '#E2E8F0', minHeight:'4px' }}
                    title={`${d.mois}: ${d.montant.toLocaleString('fr-FR')} XAF`}
                  />
                  <span className="text-center" style={{ fontSize:'9px', color: d.actif ? '#059669' : '#94A3B8', fontWeight: d.actif ? 700 : 400 }}>
                    {d.mois}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── TOOLBAR ───────────────────────────────────────── */}
          <div className="flex gap-2 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <IconSearch size={15} style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', color:'#94A3B8', pointerEvents:'none' }} />
              <input value={search} onChange={e => setSearch(e.target.value)}
                     placeholder="Locataire, bien, transaction..."
                     style={{ width:'100%', height:'42px', padding:'0 36px', borderRadius:'10px', border:'1.5px solid #E2E8F0', fontSize:'14px', color:'#0F172A', outline:'none', background:'#fff', fontFamily:'inherit', transition:'border-color .15s' }}
                     onFocus={e => (e.target.style.borderColor='#059669')}
                     onBlur={e => (e.target.style.borderColor='#E2E8F0')} />
              {search && (
                <button onClick={() => setSearch('')}
                  style={{ position:'absolute', right:'10px', top:'50%', transform:'translateY(-50%)', color:'#94A3B8', background:'none', border:'none', cursor:'pointer' }}>
                  <IconX size={14} />
                </button>
              )}
            </div>
            <select value={filterMois} onChange={e => setFilterMois(e.target.value)}
              style={{ height:'42px', padding:'0 12px', borderRadius:'10px', border:'1.5px solid #E2E8F0', fontSize:'13px', color:'#475569', outline:'none', background:'#fff', cursor:'pointer', fontFamily:'inherit' }}>
              <option value="tous">Tous les mois</option>
              {MOIS.map((m, i) => <option key={m} value={i+1}>{m}</option>)}
            </select>
            <button onClick={() => setFilterOpen(!filterOpen)}
              className="flex items-center gap-2 px-3 h-11 rounded-xl text-sm font-semibold flex-shrink-0"
              style={{ background: filterStatut !== 'tous' ? '#ECFDF5' : '#fff', border:'1.5px solid', borderColor: filterStatut !== 'tous' ? '#059669' : '#E2E8F0', color: filterStatut !== 'tous' ? '#059669' : '#64748B' }}>
              <IconFilter size={15} /><span className="hidden sm:inline">Statut</span>
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
                    { val:'confirme',   lbl:'Confirmés' },
                    { val:'en_attente', lbl:'En attente' },
                    { val:'echoue',     lbl:'Échoués' },
                  ].map(f => (
                    <button key={f.val}
                      onClick={() => { setFilter(f.val); setFilterOpen(false) }}
                      className="px-3 py-2 rounded-xl text-xs font-semibold"
                      style={filterStatut === f.val
                        ? { background:'#059669', color:'#fff' }
                        : { background:'#fff', color:'#64748B', border:'1px solid #E2E8F0' }}>
                      {f.lbl}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── LISTE ─────────────────────────────────────────── */}
        <div className="flex-1 px-4 sm:px-6 pb-6 mt-4">
          {loading ? (
            <div className="flex flex-col gap-3">
              {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-20" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3" style={{ background:'#ECFDF5' }}>
                <IconCreditCard size={24} style={{ color:'#6EE7B7' }} />
              </div>
              <h3 className="text-sm font-bold mb-1" style={{ color:'#0F172A' }}>Aucun paiement trouvé</h3>
              <p className="text-xs" style={{ color:'#94A3B8' }}>
                {search || filterStatut !== 'tous' || filterMois !== 'tous' ? 'Modifiez vos critères de recherche' : 'Les paiements apparaîtront ici'}
              </p>
            </div>
          ) : (
            <>
              {/* Cartes mobile */}
              <div className="sm:hidden flex flex-col gap-2">
                {Object.entries(grouped).map(([periode, items]) => (
                  <div key={periode}>
                    <div className="text-xs font-bold uppercase tracking-wider py-2 px-1" style={{ color:'#94A3B8' }}>{periode}</div>
                    {items.map((p, i) => (
                      <motion.div key={p.id}
                        initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay: i * 0.03 }}
                        className="card-p bg-white rounded-2xl p-4 mb-2 cursor-pointer"
                        style={{ border:'1px solid #E2E8F0' }}
                        onClick={() => setSelected(p)}>
                        <div className="flex items-center gap-3 mb-2.5">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                               style={{ background: p.statut === 'confirme' ? '#ECFDF5' : p.statut === 'echoue' ? '#FEF2F2' : '#FFFBEB' }}>
                            {p.statut === 'confirme' ? <IconCircleCheck size={20} style={{ color:'#059669' }} />
                              : p.statut === 'echoue' ? <IconAlertTriangle size={20} style={{ color:'#DC2626' }} />
                              : <IconClock size={20} style={{ color:'#D97706' }} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-0.5">
                              <span className="text-sm font-bold" style={{ color:'#0F172A' }}>{p.contrat?.locataire?.nom_complet ?? '—'}</span>
                              <StatutBadge statut={p.statut} />
                            </div>
                            <div className="flex items-center gap-1.5">
                              <IconHome2 size={11} style={{ color:'#94A3B8' }} />
                              <span className="text-xs truncate" style={{ color:'#64748B' }}>{p.contrat?.bien?.titre ?? '—'}</span>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="text-sm font-bold" style={{ color: p.statut === 'confirme' ? '#059669' : '#DC2626' }}>
                              {p.montant_total.toLocaleString('fr-FR')} XAF
                            </div>
                            <MoyenBadge moyen={p.moyen_paiement} />
                          </div>
                        </div>
                        {/* Bouton quittance mobile */}
                        {p.statut === 'confirme' && (
                          <button
                            onClick={e => telechargerQuittance(e, p.id)}
                            disabled={downloading === p.id}
                            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold mt-2"
                            style={{ background:'#ECFDF5', color:'#059669', border:'1px solid #A7F3D0', opacity: downloading === p.id ? 0.7 : 1 }}>
                            {downloading === p.id
                              ? <><IconLoader2 size={12} style={{ animation:'spin 1s linear infinite' }}/>Téléchargement...</>
                              : <><IconDownload size={12}/>Quittance PDF</>
                            }
                          </button>
                        )}
                      </motion.div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Tableau desktop */}
              <div className="hidden sm:block bg-white rounded-2xl overflow-hidden" style={{ border:'1px solid #E2E8F0' }}>
                <div className="grid px-5 py-3"
                     style={{ gridTemplateColumns:'2fr 1.5fr 1fr 1fr 1fr auto', gap:'12px', background:'#F8FAFC', borderBottom:'1px solid #F1F5F9' }}>
                  {['Locataire','Logement','Montant','Moyen','Statut',''].map(h => (
                    <div key={h} className="text-xs font-bold uppercase tracking-wider" style={{ color:'#94A3B8' }}>{h}</div>
                  ))}
                </div>

                {Object.entries(grouped).map(([periode, items]) => (
                  <div key={periode}>
                    <div className="flex items-center gap-3 px-5 py-2.5"
                         style={{ background:'#F8FAFC', borderBottom:'1px solid #F1F5F9', borderTop:'1px solid #F1F5F9' }}>
                      <IconCalendar size={13} style={{ color:'#94A3B8' }} />
                      <span className="text-xs font-bold uppercase tracking-wider" style={{ color:'#94A3B8' }}>{periode}</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background:'#E2E8F0', color:'#64748B' }}>
                        {items.length} paiement{items.length > 1 ? 's' : ''}
                      </span>
                      <div className="flex-1 h-px" style={{ background:'#E2E8F0' }} />
                      <span className="text-xs font-bold" style={{ color:'#059669' }}>
                        {items.filter(p => p.statut === 'confirme').reduce((s, p) => s + p.montant_total, 0).toLocaleString('fr-FR')} XAF
                      </span>
                    </div>

                    {items.map((p, i) => (
                      <motion.div key={p.id}
                        initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay: i * 0.03 }}
                        className="row-hover grid items-center px-5 py-3.5 cursor-pointer"
                        style={{ gridTemplateColumns:'2fr 1.5fr 1fr 1fr 1fr auto', gap:'12px', borderBottom:'1px solid #F8FAFC' }}
                        onClick={() => setSelected(p)}>

                        {/* Locataire */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0"
                               style={{ background: p.statut === 'confirme' ? '#ECFDF5' : p.statut === 'echoue' ? '#FEF2F2' : '#FFFBEB', color: p.statut === 'confirme' ? '#059669' : p.statut === 'echoue' ? '#DC2626' : '#D97706' }}>
                            {p.contrat?.locataire?.prenom?.[0]}{p.contrat?.locataire?.nom?.[0]}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-semibold truncate" style={{ color:'#0F172A' }}>{p.contrat?.locataire?.nom_complet ?? '—'}</div>
                            <div className="text-xs" style={{ color:'#94A3B8' }}>{String(p.mois).padStart(2,'0')}/{p.annee}</div>
                          </div>
                        </div>

                        {/* Logement */}
                        <div className="flex items-center gap-1.5 min-w-0">
                          <IconHome2 size={13} style={{ color:'#94A3B8', flexShrink:0 }} />
                          <span className="text-sm truncate" style={{ color:'#475569' }}>{p.contrat?.bien?.titre ?? '—'}</span>
                        </div>

                        {/* Montant */}
                        <div className="text-sm font-bold" style={{ color: p.statut === 'confirme' ? '#059669' : '#DC2626' }}>
                          {p.montant_total.toLocaleString('fr-FR')} XAF
                        </div>

                        {/* Moyen */}
                        <MoyenBadge moyen={p.moyen_paiement} />

                        {/* Statut */}
                        <StatutBadge statut={p.statut} />

                        {/* Actions */}
                        <div className="flex gap-1.5">
                          <button onClick={e => { e.stopPropagation(); setSelected(p) }}
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ background:'#F1F5F9', color:'#64748B' }}>
                            <IconEye size={13} />
                          </button>
                          {p.statut === 'confirme' && (
                            <button
                              onClick={e => telechargerQuittance(e, p.id)}
                              disabled={downloading === p.id}
                              className="w-8 h-8 rounded-lg flex items-center justify-center"
                              style={{ background:'#ECFDF5', color:'#059669', opacity: downloading === p.id ? 0.6 : 1 }}
                              title="Télécharger la quittance">
                              {downloading === p.id
                                ? <IconLoader2 size={13} style={{ animation:'spin 1s linear infinite' }} />
                                : <IconDownload size={13} />
                              }
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* ── DRAWER DÉTAIL PAIEMENT ────────────────────────── */}
        <AnimatePresence>
          {selected && (
            <>
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                className="fixed inset-0 z-40"
                style={{ background:'rgba(0,0,0,.35)', backdropFilter:'blur(4px)' }}
                onClick={() => setSelected(null)} />
              <motion.div
                initial={{ x:'100%' }} animate={{ x:0 }} exit={{ x:'100%' }}
                transition={{ type:'spring', damping:28, stiffness:280 }}
                className="fixed right-0 top-0 bottom-0 z-50 overflow-y-auto"
                style={{ width:'min(420px,100vw)', background:'#fff', boxShadow:'-8px 0 40px rgba(0,0,0,.15)' }}>

                <div className="flex items-center justify-between px-5 py-4 sticky top-0 bg-white z-10"
                     style={{ borderBottom:'1px solid #F1F5F9' }}>
                  <h2 className="text-sm font-bold" style={{ color:'#0F172A' }}>Détail du paiement</h2>
                  <button onClick={() => setSelected(null)}
                    className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background:'#F1F5F9' }}>
                    <IconX size={15} style={{ color:'#64748B' }} />
                  </button>
                </div>

                <div className="px-5 py-5 space-y-5">

                  {/* Montant hero */}
                  <div className="rounded-2xl p-5 text-center"
                       style={{ background: selected.statut === 'confirme' ? 'linear-gradient(135deg,#064E3B,#059669)' : selected.statut === 'echoue' ? 'linear-gradient(135deg,#450A0A,#DC2626)' : 'linear-gradient(135deg,#451A03,#D97706)' }}>
                    <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color:'rgba(255,255,255,.5)' }}>
                      {selected.statut === 'confirme' ? 'Paiement confirmé' : selected.statut === 'echoue' ? 'Paiement échoué' : 'En attente'}
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">{selected.montant_total.toLocaleString('fr-FR')} XAF</div>
                    <div className="text-sm" style={{ color:'rgba(255,255,255,.6)' }}>{MOIS[(selected.mois ?? 1) - 1]} {selected.annee}</div>
                  </div>

                  {/* Détail montants */}
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color:'#94A3B8' }}>Détail</div>
                    <div className="space-y-2">
                      {[
                        { lbl:'Loyer de base', val: selected.montant_loyer },
                        { lbl:'Charges eau',   val: selected.montant_eau ?? 0 },
                        { lbl:'Électricité',   val: selected.montant_elec ?? 0 },
                      ].filter(r => r.val > 0).map(r => (
                        <div key={r.lbl} className="flex justify-between py-2.5 px-3 rounded-xl" style={{ background:'#F8FAFC' }}>
                          <span className="text-xs" style={{ color:'#64748B' }}>{r.lbl}</span>
                          <span className="text-sm font-semibold" style={{ color:'#0F172A' }}>{r.val.toLocaleString('fr-FR')} XAF</span>
                        </div>
                      ))}
                      <div className="flex justify-between py-2.5 px-3 rounded-xl" style={{ background:'#ECFDF5', border:'1px solid #A7F3D0' }}>
                        <span className="text-xs font-bold" style={{ color:'#059669' }}>Total</span>
                        <span className="text-sm font-bold" style={{ color:'#059669' }}>{selected.montant_total.toLocaleString('fr-FR')} XAF</span>
                      </div>
                    </div>
                  </div>

                  {/* Infos transaction */}
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color:'#94A3B8' }}>Transaction</div>
                    <div className="space-y-2">
                      {[
                        { lbl:'Moyen de paiement', val:<MoyenBadge moyen={selected.moyen_paiement} /> },
                        { lbl:'Statut',             val:<StatutBadge statut={selected.statut} /> },
                        { lbl:'Date de paiement',   val: selected.date_paiement ? new Date(selected.date_paiement).toLocaleDateString('fr-FR', { day:'numeric', month:'long', year:'numeric' }) : '—' },
                        { lbl:'Référence',           val: selected.transaction_id ? <span className="text-xs font-mono" style={{ color:'#475569' }}>{selected.transaction_id}</span> : '—' },
                      ].map(r => (
                        <div key={r.lbl} className="flex items-center justify-between py-2.5 px-3 rounded-xl" style={{ background:'#F8FAFC' }}>
                          <span className="text-xs" style={{ color:'#64748B' }}>{r.lbl}</span>
                          <span className="text-sm font-semibold" style={{ color:'#0F172A' }}>{typeof r.val === 'string' ? r.val : r.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Logement & locataire */}
                  {(selected.contrat?.bien || selected.contrat?.locataire) && (
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color:'#94A3B8' }}>Concernant</div>
                      <div className="space-y-2">
                        {selected.contrat.bien && (
                          <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background:'#F8FAFC' }}>
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background:'#EFF6FF' }}>
                              <IconHome2 size={15} style={{ color:'#2563EB' }} />
                            </div>
                            <div>
                              <div className="text-xs" style={{ color:'#94A3B8' }}>Logement</div>
                              <div className="text-sm font-semibold" style={{ color:'#0F172A' }}>{selected.contrat.bien.titre}</div>
                            </div>
                          </div>
                        )}
                        {selected.contrat.locataire && (
                          <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background:'#F8FAFC' }}>
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background:'#ECFDF5' }}>
                              <IconBuildingBank size={15} style={{ color:'#059669' }} />
                            </div>
                            <div>
                              <div className="text-xs" style={{ color:'#94A3B8' }}>Locataire</div>
                              <div className="text-sm font-semibold" style={{ color:'#0F172A' }}>{selected.contrat.locataire.nom_complet}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Bouton quittance dans le drawer */}
                  {selected.statut === 'confirme' && (
                    <button
                      onClick={e => telechargerQuittance(e, selected.id)}
                      disabled={downloading === selected.id}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold"
                      style={{ background:'#ECFDF5', color:'#059669', border:'1px solid #A7F3D0', opacity: downloading === selected.id ? 0.7 : 1 }}>
                      {downloading === selected.id
                        ? <><IconLoader2 size={15} style={{ animation:'spin 1s linear infinite' }}/>Téléchargement...</>
                        : <><IconDownload size={15}/>Télécharger la quittance PDF</>
                      }
                    </button>
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
