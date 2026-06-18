'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import api from '@/lib/api'
import {
  IconArrowLeft, IconRefresh, IconChartBar,
  IconHome2, IconCreditCard, IconBuildingSkyscraper,
  IconTrendingUp, IconCoin,
} from '@tabler/icons-react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
  RadialBarChart, RadialBar,
} from 'recharts'

// ── Types ─────────────────────────────────────────────────
interface Kpis {
  revenu_mois: number
  revenu_annee: number
  taux_occupation: number
  nb_biens: number
  biens_occupes: number
  biens_libres: number
  nb_contrats_actifs: number
}

interface Analytique {
  kpis: Kpis
  revenus_mensuels: { mois: string; revenu: number }[]
  revenus_annuels: { annee: string; revenu: number }[]
  recus_vs_impayes: { mois: string; recus: number; impayes: number }[]
  repartition_types: { type: string; nb: number; revenu: number }[]
}

// ── Couleurs ──────────────────────────────────────────────
const COLORS = ['#059669','#7C3AED','#D97706','#2563EB','#EF4444','#06B6D4']

// ── Formater XAF ─────────────────────────────────────────
const xaf = (n: number) =>
  n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000
    ? `${(n / 1_000).toFixed(0)}k`
    : `${n}`

const xafFull = (n: number) =>
  `${n.toLocaleString('fr-FR')} XAF`

// ── Tooltip personnalisé ──────────────────────────────────
const TooltipXAF = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white rounded-xl p-3 shadow-lg" style={{ border: '1px solid #E2E8F0', fontSize: 12 }}>
      <p className="font-bold mb-1" style={{ color: '#0F172A' }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name} : {xafFull(p.value)}
        </p>
      ))}
    </div>
  )
}

const TooltipNb = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white rounded-xl p-3 shadow-lg" style={{ border: '1px solid #E2E8F0', fontSize: 12 }}>
      <p className="font-bold mb-1" style={{ color: '#0F172A' }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name} : {p.value}
        </p>
      ))}
    </div>
  )
}

// ── Skeleton ──────────────────────────────────────────────
function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`rounded-2xl ${className}`}
         style={{ background: 'linear-gradient(90deg,#E2E8F0 25%,#F1F5F9 50%,#E2E8F0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
  )
}

// ── Page ──────────────────────────────────────────────────
export default function AnalytiquePage() {
  const { user } = useAuth()
  const [data, setData]       = useState<Analytique | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get<Analytique>('/analytique/')
      setData(res.data)
    } catch { } finally { setLoading(false) }
  }

  if (!user) return null

  return (
    <>
      <style>{`
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes spin{to{transform:rotate(360deg)}}
        ::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar-thumb{background:#E2E8F0;border-radius:4px}
      `}</style>

      <div className="flex flex-col min-h-screen"
           style={{ background: '#F1F5F9', fontFamily: "'DM Sans','Helvetica Neue',sans-serif" }}>

        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center gap-3 px-4 sm:px-6 h-14 sm:h-16 bg-white"
                style={{ borderBottom: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}>
          <Link href="/bailleur" className="flex items-center gap-1.5 text-sm font-medium"
                style={{ color: '#64748B', textDecoration: 'none' }}>
            <IconArrowLeft size={16} />
            <span className="hidden sm:inline">Retour</span>
          </Link>
          <div className="h-5 w-px" style={{ background: '#E2E8F0' }} />
          <div className="flex items-center gap-2 flex-1">
            <IconChartBar size={17} style={{ color: '#7C3AED' }} />
            <h1 className="text-sm font-bold" style={{ color: '#0F172A' }}>Analytique</h1>
          </div>
          <button onClick={load} className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ background: '#F1F5F9', border: '1px solid #E2E8F0' }}>
            <IconRefresh size={15} style={{ color: '#64748B', animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          </button>
        </header>

        <div className="flex-1 px-4 sm:px-6 py-5 space-y-6 max-w-6xl mx-auto w-full">

          {/* ── KPIs ─────────────────────────────────────── */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Array(4).fill(0).map((_,i) => <Skeleton key={i} className="h-24" />)}
            </div>
          ) : data && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { lbl: 'Revenus ce mois',   val: xafFull(data.kpis.revenu_mois),    sub: 'Paiements confirmés',      ico: <IconCreditCard size={16}/>,       col: '#059669', bg: '#ECFDF5' },
                { lbl: 'Revenus cette année',val: xafFull(data.kpis.revenu_annee),   sub: `Depuis janvier ${new Date().getFullYear()}`, ico: <IconTrendingUp size={16}/>,     col: '#7C3AED', bg: '#F5F3FF' },
                { lbl: 'Taux d\'occupation', val: `${data.kpis.taux_occupation}%`,   sub: `${data.kpis.biens_occupes} / ${data.kpis.nb_biens} biens`,     ico: <IconHome2 size={16}/>,           col: '#D97706', bg: '#FFFBEB' },
                { lbl: 'Contrats actifs',    val: `${data.kpis.nb_contrats_actifs}`, sub: `${data.kpis.biens_libres} bien(s) libre(s)`,                   ico: <IconBuildingSkyscraper size={16}/>, col: '#2563EB', bg: '#EFF6FF' },
              ].map((k, i) => (
                <motion.div key={k.lbl}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="bg-white rounded-2xl p-4"
                  style={{ border: '1px solid #E2E8F0' }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs" style={{ color: '#94A3B8' }}>{k.lbl}</span>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                         style={{ background: k.bg, color: k.col }}>{k.ico}</div>
                  </div>
                  <div className="text-xl font-black mb-0.5" style={{ color: k.col }}>{k.val}</div>
                  <div className="text-xs" style={{ color: '#94A3B8' }}>{k.sub}</div>
                </motion.div>
              ))}
            </div>
          )}

          {/* ── Revenus mensuels ─────────────────────────── */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: .15 }}
            className="bg-white rounded-2xl p-5"
            style={{ border: '1px solid #E2E8F0' }}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-sm font-bold" style={{ color: '#0F172A' }}>Revenus mensuels</h2>
                <p className="text-xs" style={{ color: '#94A3B8' }}>12 derniers mois</p>
              </div>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                   style={{ background: '#ECFDF5', color: '#059669' }}>
                <IconTrendingUp size={15} />
              </div>
            </div>
            {loading ? <Skeleton className="h-56" /> : data && (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={data.revenus_mensuels} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="mois" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={xaf} tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} width={45} />
                  <Tooltip content={<TooltipXAF />} />
                  <Line type="monotone" dataKey="revenu" name="Revenus" stroke="#059669" strokeWidth={2.5}
                        dot={{ fill: '#059669', r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </motion.div>

          {/* ── Revenus annuels ──────────────────────────── */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: .2 }}
            className="bg-white rounded-2xl p-5"
            style={{ border: '1px solid #E2E8F0' }}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-sm font-bold" style={{ color: '#0F172A' }}>Revenus annuels</h2>
                <p className="text-xs" style={{ color: '#94A3B8' }}>5 dernières années</p>
              </div>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                   style={{ background: '#F5F3FF', color: '#7C3AED' }}>
                <IconCoin size={15} />
              </div>
            </div>
            {loading ? <Skeleton className="h-56" /> : data && (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.revenus_annuels} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="annee" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={xaf} tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} width={45} />
                  <Tooltip content={<TooltipXAF />} />
                  <Bar dataKey="revenu" name="Revenus" fill="#7C3AED" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </motion.div>

          {/* ── Reçus vs Impayés ─────────────────────────── */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: .25 }}
            className="bg-white rounded-2xl p-5"
            style={{ border: '1px solid #E2E8F0' }}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-sm font-bold" style={{ color: '#0F172A' }}>Paiements reçus vs impayés</h2>
                <p className="text-xs" style={{ color: '#94A3B8' }}>6 derniers mois</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: '#059669' }}/>Reçus</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: '#EF4444' }}/>Impayés</span>
              </div>
            </div>
            {loading ? <Skeleton className="h-56" /> : data && (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.recus_vs_impayes} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="mois" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} width={30} />
                  <Tooltip content={<TooltipNb />} />
                  <Bar dataKey="recus"   name="Reçus"   fill="#059669" radius={[4,4,0,0]} />
                  <Bar dataKey="impayes" name="Impayés" fill="#EF4444" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </motion.div>

          {/* ── Occupation + Types — côte à côte ─────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6">

            {/* Taux occupation */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: .3 }}
              className="bg-white rounded-2xl p-5"
              style={{ border: '1px solid #E2E8F0' }}>
              <h2 className="text-sm font-bold mb-1" style={{ color: '#0F172A' }}>Taux d'occupation</h2>
              <p className="text-xs mb-4" style={{ color: '#94A3B8' }}>Biens occupés / total</p>
              {loading ? <Skeleton className="h-44" /> : data && (
                <>
                  <ResponsiveContainer width="100%" height={160}>
                    <RadialBarChart
                      innerRadius="60%" outerRadius="100%"
                      data={[{ value: data.kpis.taux_occupation, fill: '#059669' }]}
                      startAngle={180} endAngle={0}>
                      <RadialBar dataKey="value" cornerRadius={8} background={{ fill: '#F1F5F9' }} />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <div className="text-center -mt-10">
                    <div className="text-3xl font-black" style={{ color: '#059669' }}>
                      {data.kpis.taux_occupation}%
                    </div>
                    <div className="text-xs mt-1" style={{ color: '#94A3B8' }}>
                      {data.kpis.biens_occupes} occupé(s) · {data.kpis.biens_libres} libre(s)
                    </div>
                  </div>
                </>
              )}
            </motion.div>

            {/* Répartition par type */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: .35 }}
              className="bg-white rounded-2xl p-5"
              style={{ border: '1px solid #E2E8F0' }}>
              <h2 className="text-sm font-bold mb-1" style={{ color: '#0F172A' }}>Répartition par type</h2>
              <p className="text-xs mb-4" style={{ color: '#94A3B8' }}>Nombre de biens par catégorie</p>
              {loading ? <Skeleton className="h-44" /> : data && (
                <div className="flex items-center gap-4">
                  <ResponsiveContainer width={140} height={140}>
                    <PieChart>
                      <Pie data={data.repartition_types} dataKey="nb" nameKey="type"
                           cx="50%" cy="50%" innerRadius={38} outerRadius={62}
                           paddingAngle={3}>
                        {data.repartition_types.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: any, n: any) => [`${v} bien(s)`, n]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-2">
                    {data.repartition_types.map((t, i) => (
                      <div key={t.type} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                               style={{ background: COLORS[i % COLORS.length] }} />
                          <span className="text-xs font-medium" style={{ color: '#475569' }}>{t.type}</span>
                        </div>
                        <span className="text-xs font-bold" style={{ color: '#0F172A' }}>{t.nb}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </>
  )
}