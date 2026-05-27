'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import api from '@/lib/api'
import { Contrat, Paiement, Notification, Message, PaginatedResponse } from '@/types'
import {
  IconLayoutDashboard, IconHome2, IconFileText, IconCreditCard,
  IconMessage, IconTool, IconUser, IconBell, IconLogout,
  IconCheck, IconPlus, IconAlertTriangle, IconDownload,
  IconBuilding, IconX, IconMenu2, IconRefresh, IconClock,
  IconShieldCheck, IconMapPin, IconCalendar, IconDroplet,
  IconBolt, IconCircleCheck, IconAlertCircle, IconChevronRight,
} from '@tabler/icons-react'

// ── Types locaux ─────────────────────────────────────────────
interface SignalementLocal {
  id: number
  type_panne: string
  type_panne_display?: string
  statut: string
  date_creation: string
}

interface DashboardData {
  contrat: Contrat | null
  paiements: Paiement[]
  notifications: Notification[]
  messages: Message[]
  signalements: SignalementLocal[]
  totalPaye: number
  paiementsEffectues: number
  moisSansRetard: number
}

// ── Variants d'animation ─────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.07, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

const listItem = {
  hidden: { opacity: 0, x: -10 },
  visible: (i = 0) => ({
    opacity: 1, x: 0,
    transition: { delay: i * 0.05, duration: 0.3 },
  }),
}

// ── Squelette de chargement ──────────────────────────────────
function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`rounded-lg ${className}`} style={{
      background: 'linear-gradient(90deg,#D1FAE5 25%,#ECFDF5 50%,#D1FAE5 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
    }} />
  )
}

// ── Nombre animé ─────────────────────────────────────────────
function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0)
  const raf = useRef<number>(0)
  useEffect(() => {
    const start = Date.now()
    const run = () => {
      const p = Math.min((Date.now() - start) / 900, 1)
      setDisplay(Math.round((1 - Math.pow(1 - p, 3)) * value))
      if (p < 1) raf.current = requestAnimationFrame(run)
    }
    raf.current = requestAnimationFrame(run)
    return () => cancelAnimationFrame(raf.current)
  }, [value])
  return <>{display.toLocaleString('fr-FR')}{suffix}</>
}

// ── Barre de progression animée ──────────────────────────────
function ProgressBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="h-2 rounded-full overflow-hidden" style={{ background: '#D1FAE5' }}>
      <motion.div className="h-full rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
        style={{ background: color }}
      />
    </div>
  )
}

// ── Cercle de progression SVG animé ─────────────────────────
function CircleProgress({ pct, size = 60, color = '#059669' }: { pct: number; color?: string; size?: number }) {
  const stroke = 4
  const r = (size - stroke * 2) / 2
  const circ = 2 * Math.PI * r
  const [prog, setProg] = useState(0)
  useEffect(() => { const t = setTimeout(() => setProg(pct), 250); return () => clearTimeout(t) }, [pct])
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="flex-shrink-0">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#D1FAE5" strokeWidth={stroke} />
      <motion.circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeLinecap="round" strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - (prog / 100) * circ }}
        transition={{ duration: 1.1, ease: 'easeOut', delay: 0.4 }}
        style={{ transformOrigin: 'center', transform: 'rotate(-90deg)' }}
      />
      <text x={size/2} y={size/2 + 5} textAnchor="middle"
            fontSize={size * 0.2} fontWeight="700" fill={color}>
        {prog}%
      </text>
    </svg>
  )
}

// ════════════════════════════════════════════════════════════
//  DASHBOARD LOCATAIRE
// ════════════════════════════════════════════════════════════
export default function LocataireDashboard() {
  const { user, deconnexion } = useAuth()
  const [data, setData]             = useState<DashboardData | null>(null)
  const [loading, setLoading]       = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeNav, setActiveNav]   = useState('Tableau de bord')
  const [notifOpen, setNotifOpen]   = useState(false)
  const [activeTab, setActiveTab]   = useState<'paiements' | 'documents' | 'messages' | 'signalements'>('paiements')

  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const now   = new Date()
  const joursDansMois   = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const joursRestants   = joursDansMois - now.getDate()
  const progressMois    = Math.round((now.getDate() / joursDansMois) * 100)
  const dateEcheance    = new Date(now.getFullYear(), now.getMonth() + 1, 0).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })

  useEffect(() => { if (user) load() }, [user])

  const load = async () => {
  setLoading(true)
  try {
    const [cRes, pRes, nRes, mRes, sRes] = await Promise.all([
      api.get<PaginatedResponse<Contrat>>('/contrats/').catch(e => { console.error('contrats:', e.response?.status); throw e }),
      api.get<PaginatedResponse<Paiement>>('/paiements/').catch(e => { console.error('paiements:', e.response?.status); throw e }),
      api.get<PaginatedResponse<Notification>>('/notifications/').catch(e => { console.error('notifications:', e.response?.status); throw e }),
      api.get<PaginatedResponse<Message>>('/messages/').catch(e => { console.error('messages:', e.response?.status); throw e }),
      api.get<{ results: SignalementLocal[] }>('/signalements/').catch(e => { console.error('signalements:', e.response?.status); throw e }),
    ])
      const contrat = cRes.data.results.find(c => c.statut === 'actif') ?? cRes.data.results[0] ?? null
      const paiements = pRes.data.results
      const confirmes = paiements.filter(p => p.statut === 'confirme')
      setData({
        contrat,
        paiements: paiements.slice(0, 5),
        notifications: nRes.data.results.slice(0, 6),
        messages: mRes.data.results.slice(0, 4),
        signalements: sRes.data.results.slice(0, 4),
        totalPaye: confirmes.reduce((s, p) => s + p.montant_total, 0),
        paiementsEffectues: confirmes.length,
        moisSansRetard: confirmes.length,
      })
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  if (!user) return null

  const ini     = `${user.prenom?.[0] ?? ''}${user.nom?.[0] ?? ''}`
  const contrat = data?.contrat
  const bien    = contrat?.bien
  const nonLues = data?.notifications.filter(n => !n.est_lue).length ?? 0

  const navGroups = [
    { label: 'Mon logement', items: [
      { icon: <IconLayoutDashboard size={15} />, label: 'Tableau de bord' },
      { icon: <IconHome2 size={15} />,           label: 'Mon logement' },
      { icon: <IconFileText size={15} />,        label: 'Mon contrat' },
    ]},
    { label: 'Finances', items: [
      { icon: <IconCreditCard size={15} />, label: 'Payer mon loyer' },
      { icon: <IconFileText size={15} />,   label: 'Mes quittances' },
    ]},
    { label: 'Communication', items: [
      { icon: <IconMessage size={15} />, label: 'Messagerie',   badge: data?.messages.length ?? 0,   badgeColor: '#059669' },
      { icon: <IconTool size={15} />,    label: 'Signalements', badge: data?.signalements.filter(s => s.statut === 'ouvert' || s.statut === 'en_cours').length ?? 0, badgeColor: '#DC2626' },
    ]},
    { label: 'Compte', items: [
      { icon: <IconUser size={15} />, label: 'Mon compte' },
    ]},
  ]

  const tabs = [
    { key: 'paiements'    as const, label: 'Paiements',    icon: <IconCreditCard size={13} /> },
    { key: 'documents'    as const, label: 'Documents',    icon: <IconFileText size={13} /> },
    { key: 'messages'     as const, label: 'Messages',     icon: <IconMessage size={13} /> },
    { key: 'signalements' as const, label: 'Signalements', icon: <IconTool size={13} /> },
  ]

  const notifStyles: Record<string, { bg: string; col: string; ico: React.ReactNode }> = {
    paiement_confirme:  { bg: '#ECFDF5', col: '#059669', ico: <IconCheck size={12} /> },
    paiement_en_retard: { bg: '#FEF2F2', col: '#DC2626', ico: <IconAlertTriangle size={12} /> },
    nouveau_message:    { bg: '#EFF6FF', col: '#2563EB', ico: <IconMessage size={12} /> },
    signalement_ouvert: { bg: '#FFFBEB', col: '#D97706', ico: <IconTool size={12} /> },
    signalement_resolu: { bg: '#ECFDF5', col: '#059669', ico: <IconCircleCheck size={12} /> },
  }

  return (
    <>
      <style>{`
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .pulse{animation:pulse 2.5s ease-in-out infinite}
        ::-webkit-scrollbar{width:3px;height:3px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:#A7F3D0;border-radius:4px}
        *{scrollbar-width:thin;scrollbar-color:#A7F3D0 transparent}
        .nav-item{transition:all .15s ease}
        .nav-item:hover{background:rgba(5,150,105,.07)}
        .row-hover{transition:background .12s}
        .row-hover:hover{background:#F0FDF4}
        .card-hover{transition:transform .2s ease,box-shadow .2s ease}
        .card-hover:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(5,150,105,.1)}
        @media(max-width:1024px){
          .sidebar-overlay{position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:40}
          .sidebar-mobile{position:fixed;left:0;top:0;bottom:0;z-index:50;transform:translateX(-100%);transition:transform .3s ease}
          .sidebar-mobile.open{transform:translateX(0)}
        }
      `}</style>

      <div className="flex h-screen overflow-hidden"
           style={{ background: '#F0FDF4', fontFamily: "'DM Sans','Helvetica Neue',sans-serif" }}>

        {/* Overlay mobile */}
        {sidebarOpen && <div className="sidebar-overlay lg:hidden" onClick={() => setSidebarOpen(false)} />}

        {/* ══ SIDEBAR ══════════════════════════════════════════ */}
        <aside className={`sidebar-mobile lg:relative lg:translate-x-0 w-56 flex-shrink-0 flex flex-col h-full ${sidebarOpen ? 'open' : ''}`}
               style={{ background: '#fff', borderRight: '1px solid #D1FAE5', boxShadow: '4px 0 20px rgba(5,150,105,.06)' }}>

          {/* Logo */}
          <div className="flex items-center gap-3 px-4 py-5" style={{ borderBottom: '1px solid #D1FAE5' }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                 style={{ background: 'linear-gradient(135deg,#059669,#047857)', boxShadow: '0 4px 12px rgba(5,150,105,.3)' }}>
              <IconBuilding size={18} color="white" />
            </div>
            <div>
              <div className="font-bold text-sm leading-none" style={{ color: '#059669' }}>LocCam</div>
              <div className="text-xs mt-0.5 font-medium" style={{ color: '#6EE7B7' }}>Espace locataire</div>
            </div>
            <button className="ml-auto lg:hidden" onClick={() => setSidebarOpen(false)} style={{ color: '#94A3B8' }}>
              <IconX size={15} />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-2 py-4 overflow-y-auto">
            {navGroups.map(group => (
              <div key={group.label} className="mb-5">
                <div className="text-xs font-bold uppercase tracking-widest px-2 mb-1.5"
                     style={{ color: '#A7F3D0', letterSpacing: '.1em' }}>
                  {group.label}
                </div>
                {group.items.map(item => {
                  const active = activeNav === item.label
                  return (
                    <button key={item.label}
                      onClick={() => { setActiveNav(item.label); setSidebarOpen(false) }}
                      className="nav-item w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl mb-0.5 text-sm text-left"
                      style={active
                        ? { background: '#ECFDF5', color: '#059669', fontWeight: 600, boxShadow: 'inset 2px 0 0 #059669' }
                        : { color: '#64748B' }}>
                      <span style={{ color: active ? '#059669' : '#94A3B8' }}>{item.icon}</span>
                      <span className="flex-1">{item.label}</span>
                      {'badge' in item && item.badge > 0 && (
                        <span className="text-xs font-bold px-1.5 py-0.5 rounded-full text-white"
                              style={{ background: item.badgeColor, fontSize: '10px', minWidth: '16px', textAlign: 'center' }}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            ))}
          </nav>

          {/* Footer sidebar */}
          <div className="px-3 pb-4">
            <div className="flex items-center gap-2.5 px-3 py-3 rounded-xl"
                 style={{ background: '#F0FDF4', border: '1px solid #D1FAE5' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm text-white flex-shrink-0"
                   style={{ background: 'linear-gradient(135deg,#059669,#7C3AED)' }}>
                {ini}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold truncate" style={{ color: '#0F172A' }}>{user.nom_complet}</div>
                <div className="flex items-center gap-1 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full pulse" style={{ background: '#10B981' }} />
                  <span className="text-xs" style={{ color: '#6EE7B7' }}>En ligne</span>
                </div>
              </div>
              <button onClick={deconnexion} title="Déconnexion" style={{ color: '#94A3B8' }}>
                <IconLogout size={14} />
              </button>
            </div>
          </div>
        </aside>

        {/* ══ MAIN ═════════════════════════════════════════════ */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">

          {/* Topbar */}
          <header className="flex items-center gap-3 px-5 h-14 flex-shrink-0"
                  style={{ background: '#fff', borderBottom: '1px solid #D1FAE5', boxShadow: '0 1px 4px rgba(5,150,105,.05)' }}>
            <button className="lg:hidden w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ background: '#F0FDF4', border: '1px solid #D1FAE5' }}
                    onClick={() => setSidebarOpen(true)}>
              <IconMenu2 size={17} style={{ color: '#059669' }} />
            </button>

            <div className="flex-1 min-w-0">
              <h1 className="text-sm font-bold" style={{ color: '#0F172A' }}>Tableau de bord</h1>
              <p className="text-xs capitalize hidden sm:block truncate" style={{ color: '#94A3B8' }}>{today}</p>
            </div>

            <div className="flex items-center gap-2">
              {/* Refresh */}
              <button onClick={load}
                      className="w-9 h-9 rounded-lg flex items-center justify-center"
                      style={{ background: '#F0FDF4', border: '1px solid #D1FAE5' }}>
                <IconRefresh size={15} style={{ color: '#059669', animation: loading ? 'spin 1s linear infinite' : 'none' }} />
              </button>

              {/* Notifications */}
              <div className="relative">
                <button onClick={() => setNotifOpen(!notifOpen)}
                        className="w-9 h-9 rounded-lg flex items-center justify-center relative"
                        style={{ background: notifOpen ? '#ECFDF5' : '#F0FDF4', border: '1px solid #D1FAE5' }}>
                  <IconBell size={15} style={{ color: '#059669' }} />
                  {nonLues > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white flex items-center justify-center font-bold pulse"
                          style={{ background: '#EF4444', fontSize: '9px' }}>{nonLues}</span>
                  )}
                </button>
                <AnimatePresence>
                  {notifOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: .96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: .96 }}
                      transition={{ duration: .18 }}
                      className="absolute right-0 top-11 w-80 rounded-2xl shadow-2xl z-50 overflow-hidden"
                      style={{ background: '#fff', border: '1px solid #D1FAE5' }}>
                      <div className="flex items-center justify-between px-4 py-3"
                           style={{ borderBottom: '1px solid #F0FDF4' }}>
                        <span className="text-sm font-bold" style={{ color: '#0F172A' }}>Notifications</span>
                        <button onClick={() => setNotifOpen(false)}><IconX size={13} style={{ color: '#94A3B8' }} /></button>
                      </div>
                      <div className="max-h-72 overflow-y-auto">
                        {(data?.notifications ?? []).length === 0
                          ? <div className="py-6 text-center text-xs" style={{ color: '#94A3B8' }}>Aucune notification</div>
                          : (data?.notifications ?? []).map(n => {
                            const st = notifStyles[n.type] ?? { bg: '#ECFDF5', col: '#059669', ico: <IconBell size={12} /> }
                            return (
                              <div key={n.id} className="flex gap-3 px-4 py-3 row-hover cursor-pointer"
                                   style={{ borderBottom: '1px solid #F8FAFC' }}>
                                <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
                                     style={{ background: st.bg }}>
                                  <span style={{ color: st.col }}>{st.ico}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-semibold truncate" style={{ color: '#0F172A' }}>{n.titre}</div>
                                  <div className="text-xs" style={{ color: '#94A3B8' }}>
                                    {new Date(n.date_creation).toLocaleDateString('fr-FR')}
                                  </div>
                                </div>
                                {!n.est_lue && <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: '#059669' }} />}
                              </div>
                            )
                          })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* CTA payer */}
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: .98 }}
                className="flex items-center gap-2 px-4 h-9 rounded-xl text-xs font-bold text-white"
                style={{ background: 'linear-gradient(135deg,#059669,#047857)', boxShadow: '0 2px 8px rgba(5,150,105,.35)' }}>
                <IconCreditCard size={14} />
                <span className="hidden sm:inline">Payer mon loyer</span>
              </motion.button>

              <div className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs text-white flex-shrink-0"
                   style={{ background: 'linear-gradient(135deg,#059669,#7C3AED)' }}>
                {ini}
              </div>
            </div>
          </header>

          {/* Contenu principal */}
          <div className="flex-1 overflow-y-auto">
            <div className="flex h-full">

              {/* ── Colonne centrale ── */}
              <div className="flex-1 p-4 sm:p-5 overflow-y-auto min-w-0">

                {/* Salutation */}
                <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0} className="mb-4">
                  <h2 className="text-xl font-bold" style={{ color: '#0F172A' }}>
                    Bonjour, {user.prenom}
                  </h2>
                  <p className="text-sm" style={{ color: '#64748B' }}>Bienvenue sur votre espace locataire LocCam.</p>
                </motion.div>

                {/* Carte logement */}
                <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={1}
                  className="rounded-2xl p-5 mb-4 relative overflow-hidden"
                  style={{ background: 'linear-gradient(135deg,#064E3B 0%,#059669 55%,#10B981 100%)' }}>
                  {/* Cercles déco */}
                  <div className="absolute -right-10 -top-10 w-44 h-44 rounded-full opacity-10"
                       style={{ background: 'radial-gradient(circle,#A7F3D0,transparent)' }} />
                  <div className="absolute right-20 -bottom-6 w-24 h-24 rounded-full opacity-5"
                       style={{ background: 'radial-gradient(circle,#6EE7B7,transparent)' }} />

                  <div className="relative flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                         style={{ background: 'rgba(255,255,255,.12)' }}>
                      <IconHome2 size={24} color="white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      {loading ? (
                        <div className="space-y-2">
                          <Skeleton className="h-5 w-52" />
                          <Skeleton className="h-3 w-40" />
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                            {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-10" />)}
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="text-white font-bold text-base sm:text-lg mb-0.5 truncate">
                            {bien?.titre ?? 'Aucun logement actif'}
                          </div>
                          <div className="flex items-center gap-1.5 text-sm mb-3"
                               style={{ color: 'rgba(255,255,255,.6)' }}>
                            <IconMapPin size={12} />
                            <span className="truncate">{bien?.adresse ?? '—'}</span>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[
                              { lbl: 'Loyer mensuel',  val: contrat ? `${contrat.loyer_mensuel.toLocaleString('fr-FR')} XAF` : '—' },
                              { lbl: 'Caution versée', val: contrat ? `${contrat.caution.toLocaleString('fr-FR')} XAF` : '—' },
                              { lbl: "Date d'entrée",  val: contrat ? new Date(contrat.date_debut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : '—' },
                              { lbl: 'Propriétaire',   val: contrat?.bailleur?.nom_complet ?? '—' },
                            ].map(s => (
                              <div key={s.lbl}>
                                <div className="text-xs mb-0.5" style={{ color: 'rgba(255,255,255,.4)' }}>{s.lbl}</div>
                                <div className="text-sm font-semibold text-white truncate">{s.val}</div>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>

                {/* Prochain paiement */}
                <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={2}
                  className="card-hover bg-white rounded-2xl p-5 mb-4"
                  style={{ border: '1px solid #D1FAE5', boxShadow: '0 2px 8px rgba(5,150,105,.06)' }}>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                             style={{ background: '#ECFDF5' }}>
                          <IconCalendar size={13} style={{ color: '#059669' }} />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#059669' }}>
                          Prochain paiement
                        </span>
                      </div>
                      {loading ? <Skeleton className="h-10 w-44 mb-1" /> : (
                        <div className="text-3xl font-bold" style={{ color: '#059669' }}>
                          <AnimatedNumber value={contrat?.loyer_mensuel ?? 0} suffix=" XAF" />
                        </div>
                      )}
                      <div className="text-xs mt-1" style={{ color: '#64748B' }}>
                        Loyer de base — charges selon relevé mensuel
                      </div>
                    </div>

                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="text-right">
                        <div className="text-xs font-bold uppercase tracking-wider mb-0.5"
                             style={{ color: joursRestants <= 5 ? '#DC2626' : '#D97706' }}>
                          Échéance
                        </div>
                        <div className="text-xl font-bold"
                             style={{ color: joursRestants <= 5 ? '#DC2626' : '#D97706' }}>
                          {joursRestants} jours
                        </div>
                        <div className="flex items-center justify-end gap-1 mt-0.5">
                          <IconClock size={10} style={{ color: '#94A3B8' }} />
                          <span className="text-xs" style={{ color: '#94A3B8' }}>{dateEcheance}</span>
                        </div>
                      </div>
                      <CircleProgress pct={progressMois} color="#059669" size={58} />
                    </div>
                  </div>

                  {/* Boutons Mobile Money */}
                  <div className="grid grid-cols-2 gap-3">
                    <motion.button whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: .98 }}
                      className="flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white"
                      style={{ background: 'linear-gradient(135deg,#FF6600,#E55A00)', boxShadow: '0 4px 14px rgba(255,102,0,.3)' }}>
                      <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs font-black">O</div>
                      Orange Money
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: .98 }}
                      className="flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm"
                      style={{ background: 'linear-gradient(135deg,#FFCC00,#E6B800)', color: '#1C1C1E', boxShadow: '0 4px 14px rgba(255,204,0,.3)' }}>
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-black" style={{ background: 'rgba(0,0,0,.15)' }}>M</div>
                      MTN Mobile Money
                    </motion.button>
                  </div>
                </motion.div>

                {/* Tabs ── Paiements / Documents / Messages / Signalements */}
                <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3}
                  className="bg-white rounded-2xl overflow-hidden"
                  style={{ border: '1px solid #D1FAE5', boxShadow: '0 2px 8px rgba(5,150,105,.05)' }}>

                  {/* Tab headers */}
                  <div className="flex overflow-x-auto" style={{ borderBottom: '1px solid #F0FDF4' }}>
                    {tabs.map(t => (
                      <button key={t.key} onClick={() => setActiveTab(t.key)}
                        className="flex items-center gap-1.5 px-4 py-3 text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0"
                        style={activeTab === t.key
                          ? { color: '#059669', borderBottom: '2px solid #059669', background: '#F0FDF4' }
                          : { color: '#64748B', borderBottom: '2px solid transparent' }}>
                        <span style={{ color: activeTab === t.key ? '#059669' : '#94A3B8' }}>{t.icon}</span>
                        {t.label}
                      </button>
                    ))}
                  </div>

                  {/* Tab body */}
                  <AnimatePresence mode="wait">
                    <motion.div key={activeTab}
                      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }} transition={{ duration: .18 }}>

                      {/* ── Paiements ── */}
                      {activeTab === 'paiements' && (
                        <div className="p-4">
                          {loading
                            ? Array(3).fill(0).map((_, i) => (
                                <div key={i} className="flex gap-3 py-3" style={{ borderBottom: '1px solid #F8FAFC' }}>
                                  <Skeleton className="w-8 h-8 rounded-xl flex-shrink-0" />
                                  <div className="flex-1 space-y-2"><Skeleton className="h-3 w-28" /><Skeleton className="h-3 w-20" /></div>
                                  <Skeleton className="h-4 w-20 flex-shrink-0" />
                                </div>
                              ))
                            : (data?.paiements ?? []).length === 0
                              ? (
                                <div className="py-10 text-center">
                                  <IconCreditCard size={32} style={{ color: '#A7F3D0', margin: '0 auto 8px' }} />
                                  <p className="text-sm font-medium" style={{ color: '#64748B' }}>Aucun paiement</p>
                                  <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>Vos paiements apparaîtront ici</p>
                                </div>
                              )
                              : (data?.paiements ?? []).map((p, i) => {
                                const ok = p.statut === 'confirme'
                                return (
                                  <motion.div key={p.id} variants={listItem} initial="hidden" animate="visible" custom={i}
                                    className="flex items-center gap-3 py-3 row-hover cursor-pointer -mx-4 px-4"
                                    style={{ borderBottom: '1px solid #F8FAFC' }}>
                                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                                         style={{ background: ok ? '#ECFDF5' : '#FEF2F2' }}>
                                      {ok
                                        ? <IconCircleCheck size={16} style={{ color: '#059669' }} />
                                        : <IconAlertCircle size={16} style={{ color: '#DC2626' }} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="text-sm font-semibold" style={{ color: '#0F172A' }}>
                                        {String(p.mois).padStart(2,'0')}/{p.annee}
                                      </div>
                                      <div className="text-xs" style={{ color: '#94A3B8' }}>
                                        {p.moyen_display ?? p.moyen_paiement}
                                        {p.date_paiement && ` · ${new Date(p.date_paiement).toLocaleDateString('fr-FR')}`}
                                      </div>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                      <div className="text-sm font-bold" style={{ color: ok ? '#059669' : '#DC2626' }}>
                                        {p.montant_total.toLocaleString('fr-FR')} XAF
                                      </div>
                                      {ok && (
                                        <div className="flex items-center gap-1 justify-end mt-0.5" style={{ color: '#059669' }}>
                                          <IconDownload size={10} />
                                          <span className="text-xs">Quittance</span>
                                        </div>
                                      )}
                                    </div>
                                  </motion.div>
                                )
                              })}
                        </div>
                      )}

                      {/* ── Documents ── */}
                      {activeTab === 'documents' && (
                        <div className="p-4">
                          {[
                            { ico: <IconFileText size={15} />,  bg: '#ECFDF5', col: '#059669',
                              title: 'Contrat de bail',
                              sub: contrat ? `Signé le ${new Date(contrat.date_debut).toLocaleDateString('fr-FR')}` : 'Non disponible',
                              url: contrat?.pdf_url },
                            { ico: <IconFileText size={15} />,  bg: '#EFF6FF', col: '#2563EB',
                              title: 'Quittances', sub: `${data?.paiementsEffectues ?? 0} disponible(s)`, url: null },
                            { ico: <IconShieldCheck size={15} />, bg: '#F5F3FF', col: '#7C3AED',
                              title: 'Attestation de location', sub: 'Sur demande', url: null },
                            { ico: <IconHome2 size={15} />,     bg: '#FFFBEB', col: '#D97706',
                              title: "État des lieux — Entrée", sub: 'Document signé', url: null },
                          ].map((d, i) => (
                            <motion.div key={d.title} variants={listItem} initial="hidden" animate="visible" custom={i}
                              className="flex items-center gap-3 py-3 row-hover cursor-pointer -mx-4 px-4"
                              style={{ borderBottom: '1px solid #F8FAFC' }}>
                              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                                   style={{ background: d.bg }}>
                                <span style={{ color: d.col }}>{d.ico}</span>
                              </div>
                              <div className="flex-1">
                                <div className="text-sm font-semibold" style={{ color: '#0F172A' }}>{d.title}</div>
                                <div className="text-xs" style={{ color: '#94A3B8' }}>{d.sub}</div>
                              </div>
                              {d.url
                                ? <a href={d.url} target="_blank" rel="noreferrer" className="p-1 rounded-lg" style={{ background: '#ECFDF5' }}>
                                    <IconDownload size={14} style={{ color: '#059669' }} />
                                  </a>
                                : <div className="p-1 rounded-lg" style={{ background: '#F1F5F9' }}>
                                    <IconDownload size={14} style={{ color: '#CBD5E1' }} />
                                  </div>}
                            </motion.div>
                          ))}
                        </div>
                      )}

                      {/* ── Messages ── */}
                      {activeTab === 'messages' && (
                        <div className="p-4">
                          {loading
                            ? Array(3).fill(0).map((_, i) => (
                                <div key={i} className="flex gap-3 py-3">
                                  <Skeleton className="w-8 h-8 rounded-xl flex-shrink-0" />
                                  <div className="flex-1 space-y-2"><Skeleton className="h-3 w-32" /><Skeleton className="h-3 w-48" /></div>
                                </div>
                              ))
                            : (data?.messages ?? []).length === 0
                              ? (
                                <div className="py-10 text-center">
                                  <IconMessage size={32} style={{ color: '#A7F3D0', margin: '0 auto 8px' }} />
                                  <p className="text-sm" style={{ color: '#64748B' }}>Aucun message</p>
                                </div>
                              )
                              : (data?.messages ?? []).map((m, i) => (
                                  <motion.div key={m.id} variants={listItem} initial="hidden" animate="visible" custom={i}
                                    className="flex gap-3 py-3 row-hover cursor-pointer -mx-4 px-4"
                                    style={{ borderBottom: '1px solid #F8FAFC' }}>
                                    <div className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs text-white flex-shrink-0"
                                         style={{ background: 'linear-gradient(135deg,#1E3A5F,#2563EB)' }}>
                                      {m.expediteur?.prenom?.[0] ?? '?'}{m.expediteur?.nom?.[0] ?? ''}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="text-xs font-bold mb-0.5" style={{ color: '#0F172A' }}>
                                        {m.expediteur?.nom_complet ?? 'Propriétaire'}
                                      </div>
                                      <div className="text-xs truncate" style={{ color: '#64748B' }}>{m.contenu}</div>
                                      <div className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>
                                        {new Date(m.date_envoi).toLocaleDateString('fr-FR')}
                                      </div>
                                    </div>
                                    {!m.est_lu && <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 pulse" style={{ background: '#059669' }} />}
                                  </motion.div>
                                ))}
                        </div>
                      )}

                      {/* ── Signalements ── */}
                      {activeTab === 'signalements' && (
                        <div className="p-4">
                          {(data?.signalements ?? []).length === 0 && !loading
                            ? (
                              <div className="py-6 text-center">
                                <IconTool size={28} style={{ color: '#A7F3D0', margin: '0 auto 8px' }} />
                                <p className="text-sm" style={{ color: '#64748B' }}>Aucun signalement</p>
                              </div>
                            )
                            : (data?.signalements ?? []).map((s, i) => {
                              const open = s.statut === 'ouvert' || s.statut === 'en_cours'
                              return (
                                <motion.div key={s.id} variants={listItem} initial="hidden" animate="visible" custom={i}
                                  className="flex items-center gap-3 py-3 -mx-4 px-4"
                                  style={{ borderBottom: '1px solid #F8FAFC' }}>
                                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 pulse"
                                       style={{ background: open ? '#D97706' : '#059669' }} />
                                  <div className="flex-1">
                                    <div className="text-sm font-semibold" style={{ color: '#0F172A' }}>
                                      {s.type_panne_display ?? s.type_panne}
                                    </div>
                                    <div className="text-xs" style={{ color: '#94A3B8' }}>
                                      {new Date(s.date_creation).toLocaleDateString('fr-FR')}
                                    </div>
                                  </div>
                                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                                        style={{ background: open ? '#FFFBEB' : '#ECFDF5', color: open ? '#D97706' : '#059669' }}>
                                    {s.statut === 'en_cours' ? 'En cours' : s.statut === 'resolu' ? 'Résolu' : 'Ouvert'}
                                  </span>
                                </motion.div>
                              )
                            })}
                          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: .99 }}
                            className="w-full mt-3 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold"
                            style={{ background: '#F0FDF4', border: '1.5px dashed #A7F3D0', color: '#059669' }}>
                            <IconPlus size={14} />Déclarer une panne
                          </motion.button>
                        </div>
                      )}

                    </motion.div>
                  </AnimatePresence>
                </motion.div>
              </div>

              {/* ── Panneau droit ── */}
              <div className="hidden xl:flex w-72 flex-shrink-0 flex-col overflow-y-auto"
                   style={{ background: '#fff', borderLeft: '1px solid #D1FAE5' }}>

                {/* Détail paiement (fond vert foncé) */}
                <div className="p-5" style={{ background: 'linear-gradient(160deg,#064E3B,#059669)', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
                  <div className="text-xs font-bold uppercase tracking-widest mb-4"
                       style={{ color: 'rgba(255,255,255,.38)' }}>
                    Détail du prochain paiement
                  </div>
                  {loading
                    ? Array(4).fill(0).map((_, i) => (
                        <div key={i} className="flex justify-between py-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,.06)' }}>
                          <Skeleton className="h-3 w-28" /><Skeleton className="h-3 w-20" />
                        </div>
                      ))
                    : [
                        { lbl: 'Loyer mensuel', val: contrat ? `${contrat.loyer_mensuel.toLocaleString('fr-FR')} XAF` : '—', ico: <IconHome2 size={12} />, bold: false },
                        { lbl: 'Charges eau',   val: '— XAF', ico: <IconDroplet size={12} />, bold: false },
                        { lbl: 'Électricité',   val: '— XAF', ico: <IconBolt size={12} />,    bold: false },
                        { lbl: 'Total',         val: contrat ? `${contrat.loyer_mensuel.toLocaleString('fr-FR')} XAF` : '—', ico: null, bold: true },
                      ].map(r => (
                        <div key={r.lbl} className="flex items-center justify-between py-2.5"
                             style={{ borderBottom: '1px solid rgba(255,255,255,.06)' }}>
                          <div className="flex items-center gap-1.5">
                            {r.ico && <span style={{ color: 'rgba(255,255,255,.35)' }}>{r.ico}</span>}
                            <span className="text-sm" style={{ color: 'rgba(255,255,255,.6)' }}>{r.lbl}</span>
                          </div>
                          <span className="text-sm font-bold" style={{ color: r.bold ? '#6EE7B7' : '#fff' }}>
                            {r.val}
                          </span>
                        </div>
                      ))}
                </div>

                {/* Résumé année */}
                <div className="p-5" style={{ borderBottom: '1px solid #F0FDF4' }}>
                  <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#94A3B8' }}>
                    Résumé {new Date().getFullYear()}
                  </div>
                  <div className="space-y-3 mb-4">
                    {[
                      { lbl: 'Paiements effectués', val: data?.paiementsEffectues ?? 0, max: 12,    color: '#059669' },
                      { lbl: 'Mois sans retard',    val: data?.moisSansRetard ?? 0,    max: data?.paiementsEffectues || 1, color: '#2563EB' },
                    ].map(s => (
                      <div key={s.lbl}>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span style={{ color: '#64748B' }}>{s.lbl}</span>
                          <span className="font-bold" style={{ color: s.color }}>
                            {loading ? '—' : `${s.val}/${s.max}`}
                          </span>
                        </div>
                        <ProgressBar pct={s.max > 0 ? (s.val / s.max) * 100 : 0} color={s.color} />
                      </div>
                    ))}
                  </div>
                  <div className="rounded-xl p-3.5" style={{ background: '#F0FDF4', border: '1px solid #D1FAE5' }}>
                    <div className="text-xs mb-1" style={{ color: '#64748B' }}>Total payé ({new Date().getFullYear()})</div>
                    <div className="text-xl font-bold" style={{ color: '#059669' }}>
                      {loading ? <Skeleton className="h-6 w-28" /> : <><AnimatedNumber value={data?.totalPaye ?? 0} /> XAF</>}
                    </div>
                  </div>
                </div>

                {/* Notifications */}
                <div className="flex-1 p-5">
                  <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#94A3B8' }}>
                    Activité récente
                  </div>

                  {loading
                    ? Array(4).fill(0).map((_, i) => (
                        <div key={i} className="flex gap-2.5 py-3" style={{ borderBottom: '1px solid #F8FAFC' }}>
                          <Skeleton className="w-7 h-7 rounded-xl flex-shrink-0" />
                          <div className="flex-1 space-y-1.5"><Skeleton className="h-3 w-24" /><Skeleton className="h-3 w-32" /></div>
                        </div>
                      ))
                    : (data?.notifications ?? []).length === 0
                      ? (
                        <div className="py-6 text-center">
                          <IconBell size={24} style={{ color: '#A7F3D0', margin: '0 auto 6px' }} />
                          <p className="text-xs" style={{ color: '#94A3B8' }}>Aucune activité récente</p>
                        </div>
                      )
                      : (data?.notifications ?? []).map((n, i) => {
                        const st = notifStyles[n.type] ?? { bg: '#ECFDF5', col: '#059669', ico: <IconBell size={12} /> }
                        return (
                          <motion.div key={n.id}
                            initial={{ opacity: 0, x: 8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="flex gap-2.5 py-3 row-hover cursor-pointer -mx-5 px-5"
                            style={{ borderBottom: '1px solid #F8FAFC' }}>
                            <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
                                 style={{ background: st.bg }}>
                              <span style={{ color: st.col }}>{st.ico}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-semibold truncate" style={{ color: '#0F172A' }}>{n.titre}</div>
                              <div className="text-xs truncate" style={{ color: '#94A3B8' }}>{n.message}</div>
                            </div>
                            {!n.est_lue && <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 pulse" style={{ background: '#059669' }} />}
                          </motion.div>
                        )
                      })}

                  {/* Rappel loyer */}
                  <motion.div
                    initial={{ opacity: 0, scale: .97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: .5 }}
                    className="mt-4 rounded-2xl p-4 flex items-center gap-3"
                    style={{ background: 'linear-gradient(135deg,#ECFDF5,#D1FAE5)', border: '1px solid #A7F3D0' }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                         style={{ background: '#059669', boxShadow: '0 4px 10px rgba(5,150,105,.3)' }}>
                      <IconBell size={18} color="white" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold" style={{ color: '#059669' }}>Prochain loyer dans</div>
                      <div className="text-2xl font-bold" style={{ color: '#059669' }}>{joursRestants} jours</div>
                    </div>
                  </motion.div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  )
}
