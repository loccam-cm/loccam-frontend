'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import api from '@/lib/api'
import { Utilisateur, Contrat, PaginatedResponse } from '@/types'
import {
  IconUsers, IconSearch, IconArrowLeft, IconRefresh,
  IconPhone, IconMail, IconMapPin, IconEye,
  IconMessage, IconHome2, IconFileText,
  IconChevronRight, IconX, IconFilter,
  IconUserCheck, IconUserX, IconClock,
  IconCreditCard, IconAlertCircle,
} from '@tabler/icons-react'

// ── Types ────────────────────────────────────────────────────
interface LocataireAvecContrat extends Utilisateur {
  contrat?: Contrat
  bien_titre?: string
  loyer?: number
  statut_paiement?: 'ok' | 'retard' | 'attente'
}

// ── Skeleton ─────────────────────────────────────────────────
function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`rounded-xl ${className}`} style={{
      background: 'linear-gradient(90deg,#E2E8F0 25%,#F1F5F9 50%,#E2E8F0 75%)',
      backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite',
    }} />
  )
}

// ── Avatar initiales ─────────────────────────────────────────
function Avatar({ nom, prenom, size = 40 }: { nom: string; prenom: string; size?: number }) {
  const initiales = `${prenom?.[0] ?? '?'}${nom?.[0] ?? ''}`
  const colors = ['#3B82F6','#059669','#D97706','#7C3AED','#EF4444','#06B6D4','#EC4899']
  const color = colors[(prenom.charCodeAt(0) ?? 0) % colors.length]
  return (
    <div style={{ width: size, height: size, borderRadius: '12px', background: `${color}18`, border: `1.5px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: size * 0.35, color, flexShrink: 0, fontFamily: 'inherit' }}>
      {initiales}
    </div>
  )
}

// ── Badge statut paiement ────────────────────────────────────
function PaiementBadge({ statut }: { statut?: string }) {
  if (!statut) return null
  const map = {
    ok:      { bg: '#ECFDF5', col: '#059669', lbl: 'À jour',    ico: <IconUserCheck size={11} /> },
    retard:  { bg: '#FEF2F2', col: '#DC2626', lbl: 'En retard', ico: <IconUserX size={11} /> },
    attente: { bg: '#FFFBEB', col: '#D97706', lbl: 'En attente', ico: <IconClock size={11} /> },
  }
  const s = map[statut as keyof typeof map]
  if (!s) return null
  return (
    <span className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full"
          style={{ background: s.bg, color: s.col }}>
      {s.ico}{s.lbl}
    </span>
  )
}

// ────────────────────────────────────────────────────────────
export default function LocatairesPage() {
  const { user } = useAuth()
  const [locataires, setLocataires]   = useState<LocataireAvecContrat[]>([])
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState('')
  const [filterStatut, setFilter]     = useState<'tous' | 'ok' | 'retard' | 'attente'>('tous')
  const [selected, setSelected]       = useState<LocataireAvecContrat | null>(null)
  const [filterOpen, setFilterOpen]   = useState(false)

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    try {
      const [usersRes, contratsRes] = await Promise.all([
        api.get<PaginatedResponse<Utilisateur>>('/users/?role=locataire'),
        api.get<PaginatedResponse<Contrat>>('/contrats/'),
      ])

      const contrats = contratsRes.data.results
      const enriched: LocataireAvecContrat[] = usersRes.data.results
        .filter(u => u.role === 'locataire')
        .map(u => {
          const contrat = contrats.find(c => c.locataire?.id === u.id && c.statut === 'actif')
          return {
            ...u,
            contrat,
            bien_titre: contrat?.bien?.titre,
            loyer: contrat?.loyer_mensuel,
            statut_paiement: contrat ? 'ok' : undefined,
          }
        })
      setLocataires(enriched)
    } catch { } finally { setLoading(false) }
  }

  const filtered = locataires.filter(l => {
    const matchSearch = !search ||
      l.nom_complet.toLowerCase().includes(search.toLowerCase()) ||
      l.email.toLowerCase().includes(search.toLowerCase()) ||
      (l.bien_titre ?? '').toLowerCase().includes(search.toLowerCase())
    const matchStatut = filterStatut === 'tous' || l.statut_paiement === filterStatut
    return matchSearch && matchStatut
  })

  const stats = {
    total:   locataires.length,
    actifs:  locataires.filter(l => l.contrat).length,
    retard:  locataires.filter(l => l.statut_paiement === 'retard').length,
    attente: locataires.filter(l => l.statut_paiement === 'attente').length,
  }

  if (!user) return null

  return (
    <>
      <style>{`
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(100%)}to{opacity:1;transform:translateY(0)}}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:#E2E8F0;border-radius:4px}
        .row-hover{transition:background .12s}.row-hover:hover{background:#F8FAFC}
        .card-loc{transition:all .18s ease}.card-loc:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,.08)}
        .input-field{width:100%;height:42px;padding:0 12px 0 36px;border-radius:10px;border:1.5px solid #E2E8F0;font-size:14px;color:#0F172A;outline:none;background:#fff;transition:border-color .15s;font-family:inherit}
        .input-field:focus{border-color:#2563EB;box-shadow:0 0 0 3px rgba(37,99,235,.1)}
      `}</style>

      <div className="flex flex-col min-h-screen" style={{ background: '#F1F5F9', fontFamily: "'DM Sans','Helvetica Neue',sans-serif" }}>

        {/* ── HEADER ────────────────────────────────────────── */}
        <header className="sticky top-0 z-30 flex items-center gap-3 px-4 sm:px-6 h-14 sm:h-16 bg-white"
                style={{ borderBottom: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}>
          <Link href="/bailleur" className="flex items-center gap-1.5 text-sm font-medium flex-shrink-0"
                style={{ color: '#64748B', textDecoration: 'none' }}>
            <IconArrowLeft size={16} />
            <span className="hidden sm:inline">Retour</span>
          </Link>
          <div className="h-5 w-px flex-shrink-0" style={{ background: '#E2E8F0' }} />
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <IconUsers size={17} style={{ color: '#2563EB', flexShrink: 0 }} />
            <h1 className="text-sm font-bold truncate" style={{ color: '#0F172A' }}>Mes locataires</h1>
            {!loading && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: '#EFF6FF', color: '#2563EB' }}>
                {locataires.length}
              </span>
            )}
          </div>
          <button onClick={load} className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: '#F1F5F9', border: '1px solid #E2E8F0' }}>
            <IconRefresh size={15} style={{ color: '#64748B', animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          </button>
        </header>

        {/* ── STATS CARDS ───────────────────────────────────── */}
        <div className="px-4 sm:px-6 pt-4 sm:pt-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {[
              { lbl: 'Total',       val: stats.total,   col: '#2563EB', bg: '#EFF6FF',  ico: <IconUsers size={16}/> },
              { lbl: 'Actifs',      val: stats.actifs,  col: '#059669', bg: '#ECFDF5',  ico: <IconUserCheck size={16}/> },
              { lbl: 'En retard',   val: stats.retard,  col: '#DC2626', bg: '#FEF2F2',  ico: <IconAlertCircle size={16}/> },
              { lbl: 'En attente',  val: stats.attente, col: '#D97706', bg: '#FFFBEB',  ico: <IconClock size={16}/> },
            ].map((s, i) => (
              <motion.div key={s.lbl}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl p-4"
                style={{ border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium" style={{ color: '#94A3B8' }}>{s.lbl}</span>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                       style={{ background: s.bg, color: s.col }}>
                    {s.ico}
                  </div>
                </div>
                <div className="text-2xl font-bold" style={{ color: loading ? '#E2E8F0' : s.col }}>
                  {loading ? '—' : s.val}
                </div>
              </motion.div>
            ))}
          </div>

          {/* ── TOOLBAR ─────────────────────────────────────── */}
          <div className="flex gap-2 mb-4">
            {/* Recherche */}
            <div className="relative flex-1">
              <IconSearch size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
              <input value={search} onChange={e => setSearch(e.target.value)}
                     placeholder="Nom, email, logement..."
                     className="input-field" />
              {search && (
                <button onClick={() => setSearch('')}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', background: 'none', border: 'none', cursor: 'pointer' }}>
                  <IconX size={14} />
                </button>
              )}
            </div>

            {/* Filtre */}
            <button onClick={() => setFilterOpen(!filterOpen)}
              className="flex items-center gap-2 px-3 h-11 rounded-xl text-sm font-semibold flex-shrink-0"
              style={{ background: filterStatut !== 'tous' ? '#EFF6FF' : '#fff', border: '1.5px solid', borderColor: filterStatut !== 'tous' ? '#2563EB' : '#E2E8F0', color: filterStatut !== 'tous' ? '#2563EB' : '#64748B' }}>
              <IconFilter size={15} />
              <span className="hidden sm:inline">Filtrer</span>
              {filterStatut !== 'tous' && <div className="w-2 h-2 rounded-full" style={{ background: '#2563EB' }} />}
            </button>
          </div>

          {/* Filtres rapides */}
          <AnimatePresence>
            {filterOpen && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }} transition={{ duration: .2 }}
                          className="overflow-hidden mb-4">
                <div className="flex gap-2 flex-wrap pb-1">
                  {[
                    { val: 'tous',    lbl: 'Tous les locataires' },
                    { val: 'ok',      lbl: 'À jour' },
                    { val: 'retard',  lbl: 'En retard' },
                    { val: 'attente', lbl: 'En attente' },
                  ].map(f => (
                    <button key={f.val}
                      onClick={() => { setFilter(f.val as typeof filterStatut); setFilterOpen(false) }}
                      className="px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                      style={filterStatut === f.val
                        ? { background: '#2563EB', color: '#fff' }
                        : { background: '#fff', color: '#64748B', border: '1px solid #E2E8F0' }}>
                      {f.lbl}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── LISTE ─────────────────────────────────────────── */}
        <div className="flex-1 px-4 sm:px-6 pb-6">
          {loading ? (
            <div className="flex flex-col gap-3">
              {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-20" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
                   style={{ background: '#EFF6FF' }}>
                <IconUsers size={24} style={{ color: '#93C5FD' }} />
              </div>
              <h3 className="text-sm font-bold mb-1" style={{ color: '#0F172A' }}>
                {search || filterStatut !== 'tous' ? 'Aucun résultat' : 'Aucun locataire'}
              </h3>
              <p className="text-xs" style={{ color: '#94A3B8' }}>
                {search || filterStatut !== 'tous'
                  ? 'Modifiez vos critères de recherche'
                  : 'Invitez vos premiers locataires via les contrats'}
              </p>
            </div>
          ) : (
            <>
              {/* Compteur résultats */}
              <p className="text-xs mb-3" style={{ color: '#94A3B8' }}>
                {filtered.length} locataire{filtered.length > 1 ? 's' : ''}
                {search && ` pour "${search}"`}
              </p>

              {/* Cartes mobile / tableau desktop */}
              <div className="sm:hidden flex flex-col gap-3">
                {filtered.map((l, i) => (
                  <motion.div key={l.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="card-loc bg-white rounded-2xl p-4"
                    style={{ border: '1px solid #E2E8F0' }}
                    onClick={() => setSelected(l)}>
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar nom={l.nom} prenom={l.prenom} size={44} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold" style={{ color: '#0F172A' }}>{l.nom_complet}</span>
                          <PaiementBadge statut={l.statut_paiement} />
                        </div>
                        <span className="text-xs truncate block" style={{ color: '#94A3B8' }}>{l.email}</span>
                      </div>
                      <IconChevronRight size={16} style={{ color: '#CBD5E1', flexShrink: 0 }} />
                    </div>
                    {l.bien_titre && (
                      <div className="flex items-center gap-2 pt-2.5" style={{ borderTop: '1px solid #F1F5F9' }}>
                        <IconHome2 size={13} style={{ color: '#94A3B8' }} />
                        <span className="text-xs font-medium truncate" style={{ color: '#475569' }}>{l.bien_titre}</span>
                        {l.loyer && (
                          <>
                            <span style={{ color: '#CBD5E1' }}>·</span>
                            <span className="text-xs font-bold flex-shrink-0" style={{ color: '#059669' }}>
                              {l.loyer.toLocaleString('fr-FR')} XAF
                            </span>
                          </>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Tableau desktop */}
              <div className="hidden sm:block bg-white rounded-2xl overflow-hidden"
                   style={{ border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}>
                {/* En-tête */}
                <div className="grid px-5 py-3"
                     style={{ gridTemplateColumns: '2fr 1.5fr 1fr 1fr auto', gap: '12px', background: '#F8FAFC', borderBottom: '1px solid #F1F5F9' }}>
                  {['Locataire', 'Logement', 'Loyer', 'Statut', ''].map(h => (
                    <div key={h} className="text-xs font-bold uppercase tracking-wider" style={{ color: '#94A3B8' }}>{h}</div>
                  ))}
                </div>

                {filtered.map((l, i) => (
                  <motion.div key={l.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="row-hover grid items-center px-5 py-3.5 cursor-pointer"
                    style={{ gridTemplateColumns: '2fr 1.5fr 1fr 1fr auto', gap: '12px', borderBottom: '1px solid #F8FAFC' }}
                    onClick={() => setSelected(l)}>

                    {/* Locataire */}
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar nom={l.nom} prenom={l.prenom} size={38} />
                      <div className="min-w-0">
                        <div className="text-sm font-semibold truncate" style={{ color: '#0F172A' }}>{l.nom_complet}</div>
                        <div className="text-xs truncate" style={{ color: '#94A3B8' }}>{l.email}</div>
                      </div>
                    </div>

                    {/* Logement */}
                    <div className="min-w-0">
                      {l.bien_titre
                        ? <div className="flex items-center gap-1.5">
                            <IconHome2 size={13} style={{ color: '#94A3B8', flexShrink: 0 }} />
                            <span className="text-sm truncate" style={{ color: '#475569' }}>{l.bien_titre}</span>
                          </div>
                        : <span className="text-xs" style={{ color: '#CBD5E1' }}>—</span>}
                    </div>

                    {/* Loyer */}
                    <div>
                      {l.loyer
                        ? <span className="text-sm font-bold" style={{ color: '#059669' }}>
                            {l.loyer.toLocaleString('fr-FR')} XAF
                          </span>
                        : <span className="text-xs" style={{ color: '#CBD5E1' }}>—</span>}
                    </div>

                    {/* Statut */}
                    <div><PaiementBadge statut={l.statut_paiement} /></div>

                    {/* Actions */}
                    <div className="flex gap-1.5">
                      <button onClick={e => { e.stopPropagation(); setSelected(l) }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: '#EFF6FF', color: '#2563EB' }}>
                        <IconEye size={14} />
                      </button>
                      <button onClick={e => e.stopPropagation()}
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: '#F1F5F9', color: '#64748B' }}>
                        <IconMessage size={14} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* ── DRAWER DÉTAIL LOCATAIRE ────────────────────────── */}
        <AnimatePresence>
          {selected && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-40"
                style={{ background: 'rgba(0,0,0,.35)', backdropFilter: 'blur(4px)' }}
                onClick={() => setSelected(null)} />

              <motion.div
                initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 280 }}
                className="fixed right-0 top-0 bottom-0 z-50 overflow-y-auto"
                style={{ width: 'min(420px, 100vw)', background: '#fff', boxShadow: '-8px 0 40px rgba(0,0,0,.15)' }}>

                {/* Header drawer */}
                <div className="flex items-center justify-between px-5 py-4 sticky top-0 bg-white z-10"
                     style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <h2 className="text-sm font-bold" style={{ color: '#0F172A' }}>Fiche locataire</h2>
                  <button onClick={() => setSelected(null)}
                    className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: '#F1F5F9' }}>
                    <IconX size={15} style={{ color: '#64748B' }} />
                  </button>
                </div>

                <div className="px-5 py-5 space-y-5">

                  {/* Profil */}
                  <div className="flex items-center gap-4 p-4 rounded-2xl"
                       style={{ background: '#F8FAFC', border: '1px solid #F1F5F9' }}>
                    <Avatar nom={selected.nom} prenom={selected.prenom} size={56} />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-base truncate" style={{ color: '#0F172A' }}>{selected.nom_complet}</h3>
                      <p className="text-xs truncate mb-2" style={{ color: '#94A3B8' }}>{selected.email}</p>
                      <PaiementBadge statut={selected.statut_paiement} />
                    </div>
                  </div>

                  {/* Coordonnées */}
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#94A3B8' }}>Coordonnées</div>
                    <div className="space-y-2.5">
                      {[
                        { ico: <IconMail size={15} />,  val: selected.email,      lbl: 'Email' },
                        { ico: <IconPhone size={15} />, val: selected.telephone ?? '—', lbl: 'Téléphone' },
                      ].map(row => (
                        <div key={row.lbl} className="flex items-center gap-3 p-3 rounded-xl"
                             style={{ background: '#F8FAFC' }}>
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                               style={{ background: '#EFF6FF', color: '#2563EB' }}>
                            {row.ico}
                          </div>
                          <div>
                            <div className="text-xs" style={{ color: '#94A3B8' }}>{row.lbl}</div>
                            <div className="text-sm font-semibold" style={{ color: '#0F172A' }}>{row.val}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Contrat actif */}
                  {selected.contrat ? (
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#94A3B8' }}>Contrat actif</div>
                      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #E2E8F0' }}>
                        <div className="p-4" style={{ background: 'linear-gradient(135deg,#0F172A,#1E293B)' }}>
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                 style={{ background: 'rgba(255,255,255,.1)' }}>
                              <IconHome2 size={20} color="white" />
                            </div>
                            <div>
                              <div className="text-white font-bold text-sm">{selected.bien_titre}</div>
                              <div className="text-xs" style={{ color: 'rgba(255,255,255,.5)' }}>Contrat actif</div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            {[
                              { lbl: 'Loyer mensuel', val: selected.loyer ? `${selected.loyer.toLocaleString('fr-FR')} XAF` : '—' },
                              { lbl: 'Caution', val: selected.contrat.caution ? `${selected.contrat.caution.toLocaleString('fr-FR')} XAF` : '—' },
                              { lbl: "Date d'entrée", val: selected.contrat.date_debut ? new Date(selected.contrat.date_debut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : '—' },
                              { lbl: 'Statut', val: selected.contrat.statut === 'actif' ? 'Actif' : selected.contrat.statut },
                            ].map(s => (
                              <div key={s.lbl}>
                                <div className="text-xs" style={{ color: 'rgba(255,255,255,.4)' }}>{s.lbl}</div>
                                <div className="text-sm font-semibold text-white">{s.val}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl p-4 flex items-center gap-3"
                         style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
                      <IconAlertCircle size={18} style={{ color: '#D97706', flexShrink: 0 }} />
                      <div>
                        <div className="text-sm font-semibold" style={{ color: '#92400E' }}>Aucun contrat actif</div>
                        <div className="text-xs" style={{ color: '#B45309' }}>Ce locataire n&apos;a pas de logement attribué</div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#94A3B8' }}>Actions rapides</div>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { ico: <IconMessage size={15} />,   lbl: 'Envoyer un message', col: '#2563EB', bg: '#EFF6FF' },
                        { ico: <IconCreditCard size={15} />, lbl: 'Voir paiements',     col: '#059669', bg: '#ECFDF5' },
                        { ico: <IconFileText size={15} />,  lbl: 'Voir contrat',        col: '#7C3AED', bg: '#F5F3FF' },
                        { ico: <IconAlertCircle size={15}/>, lbl: 'Signalements',       col: '#D97706', bg: '#FFFBEB' },
                      ].map(a => (
                        <button key={a.lbl}
                          className="flex items-center gap-2 p-3 rounded-xl text-xs font-semibold text-left w-full"
                          style={{ background: a.bg, color: a.col }}>
                          {a.ico}{a.lbl}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
