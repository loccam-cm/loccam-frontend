'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Utilisateur } from '@/types'
import {
  IconLayoutDashboard, IconBuilding, IconHome2, IconUsers,
  IconCreditCard, IconFileText, IconDroplet, IconMessage,
  IconTool, IconSettings, IconLogout, IconBell, IconDownload,
  IconPlus, IconCalendar, IconArrowRight, IconCheck,
  IconAlertCircle, IconAlertTriangle, IconTrendingUp,
  IconChevronRight,
} from '@tabler/icons-react'

export default function BailleurDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<Utilisateur | null>(null)

  useEffect(() => {
    const u = localStorage.getItem('user')
    if (!u) { router.push('/login'); return }
    setUser(JSON.parse(u))
  }, [router])

  const deconnexion = () => {
    localStorage.clear()
    router.push('/login')
  }

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F1F5F9' }}>
      <div className="text-sm" style={{ color: '#8A9BB0' }}>Chargement...</div>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#F1F5F9' }}>

      {/* ══════════════════════════════════
          SIDEBAR
      ══════════════════════════════════ */}
      <aside className="w-56 flex-shrink-0 flex flex-col h-full"
             style={{ background: '#0F2438' }}>

        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 py-5"
             style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
               style={{ background: 'rgba(255,255,255,0.12)' }}>
            <IconBuilding size={16} color="white" />
          </div>
          <div>
            <div className="text-white font-bold text-base leading-none">LocCam</div>
            <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Espace bailleur
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 overflow-y-auto">

          <div className="text-xs font-bold uppercase tracking-wider px-2 mb-2"
               style={{ color: 'rgba(255,255,255,0.28)' }}>Principal</div>

          {[
            { icon: <IconLayoutDashboard size={15} />, label: 'Dashboard', active: true },
            { icon: <IconBuilding size={15} />,        label: 'Structures' },
            { icon: <IconHome2 size={15} />,           label: 'Mes biens' },
            { icon: <IconUsers size={15} />,           label: 'Locataires' },
          ].map((item) => (
            <div key={item.label}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg mb-0.5 cursor-pointer transition-all text-sm"
              style={item.active
                ? { background: 'rgba(255,255,255,0.12)', color: '#fff', fontWeight: 500,
                    boxShadow: 'inset 2px 0 0 #5B9BD5' }
                : { color: 'rgba(255,255,255,0.55)' }
              }>
              {item.icon}
              {item.label}
            </div>
          ))}

          <div className="text-xs font-bold uppercase tracking-wider px-2 mt-4 mb-2"
               style={{ color: 'rgba(255,255,255,0.28)' }}>Finances</div>

          {[
            { icon: <IconCreditCard size={15} />, label: 'Paiements' },
            { icon: <IconFileText size={15} />,   label: 'Documents' },
            { icon: <IconDroplet size={15} />,    label: 'Eau / Électricité' },
          ].map((item) => (
            <div key={item.label}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg mb-0.5 cursor-pointer text-sm"
              style={{ color: 'rgba(255,255,255,0.55)' }}>
              {item.icon}
              {item.label}
            </div>
          ))}

          <div className="text-xs font-bold uppercase tracking-wider px-2 mt-4 mb-2"
               style={{ color: 'rgba(255,255,255,0.28)' }}>Communication</div>

          {[
            { icon: <IconMessage size={15} />, label: 'Messagerie', badge: 3, badgeColor: '#2E75B6' },
            { icon: <IconTool size={15} />,    label: 'Signalements', badge: 2, badgeColor: '#A32D2D' },
          ].map((item) => (
            <div key={item.label}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg mb-0.5 cursor-pointer text-sm"
              style={{ color: 'rgba(255,255,255,0.55)' }}>
              {item.icon}
              <span className="flex-1">{item.label}</span>
              <span className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: item.badgeColor, color: '#fff', fontSize: '10px' }}>
                {item.badge}
              </span>
            </div>
          ))}

          <div className="text-xs font-bold uppercase tracking-wider px-2 mt-4 mb-2"
               style={{ color: 'rgba(255,255,255,0.28)' }}>Compte</div>

          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer text-sm"
               style={{ color: 'rgba(255,255,255,0.55)' }}>
            <IconSettings size={15} />Paramètres
          </div>
        </nav>

        {/* Footer sidebar */}
        <div className="px-3 py-3 flex items-center gap-2.5"
             style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white flex-shrink-0"
               style={{ background: 'rgba(255,255,255,0.15)' }}>
            {user.prenom[0]}{user.nom[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-xs font-semibold truncate">{user.nom_complet}</div>
            <div className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Bailleur · CNI validée ✓
            </div>
          </div>
          <button onClick={deconnexion} style={{ color: 'rgba(255,255,255,0.35)' }}>
            <IconLogout size={15} />
          </button>
        </div>
      </aside>

      {/* ══════════════════════════════════
          MAIN
      ══════════════════════════════════ */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Topbar */}
        <header className="flex items-center gap-3 px-6 h-14 flex-shrink-0 bg-white"
                style={{ borderBottom: '1px solid #E6EDF4' }}>
          <h1 className="text-base font-bold flex-1" style={{ color: '#1E2A3E' }}>
            Tableau de bord
          </h1>
          <div className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg"
               style={{ background: '#F1F5F9', color: '#5B6E8C' }}>
            <IconCalendar size={13} style={{ color: '#2E75B6' }} />
            18 janvier 2026
          </div>
          <div className="relative">
            <button className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ background: '#F1F5F9', border: '1px solid #E6EDF4' }}>
              <IconBell size={16} style={{ color: '#5B6E8C' }} />
            </button>
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white flex items-center justify-center font-bold"
                  style={{ background: '#A32D2D', fontSize: '9px' }}>5</span>
          </div>
          <button className="flex items-center gap-1.5 px-3 h-9 rounded-lg text-xs font-medium"
                  style={{ background: '#F1F5F9', border: '1px solid #E6EDF4', color: '#5B6E8C' }}>
            <IconDownload size={14} />Exporter
          </button>
          <button className="flex items-center gap-1.5 px-3 h-9 rounded-lg text-xs font-bold text-white"
                  style={{ background: '#1A3C5E', boxShadow: '0 2px 8px rgba(26,60,94,0.3)' }}>
            <IconPlus size={14} />Ajouter un bien
          </button>
          <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white"
               style={{ background: '#1A3C5E' }}>
            {user.prenom[0]}{user.nom[0]}
          </div>
        </header>

        {/* Contenu scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex h-full">

            {/* ── Colonne centrale ── */}
            <div className="flex-1 p-5 overflow-y-auto">

              {/* Hero welcome */}
              <div className="rounded-2xl p-5 mb-5 flex items-center justify-between"
                   style={{ background: 'linear-gradient(135deg, #0F2438 0%, #1A3C5E 60%, #2E5580 100%)' }}>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider mb-1"
                       style={{ color: 'rgba(255,255,255,0.5)' }}>BONJOUR</div>
                  <div className="text-2xl font-bold text-white mb-1">
                    {user.prenom} {user.nom} 👋
                  </div>
                  <div className="text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
                    Voici l&apos;état de votre parc locatif ce 18 janvier 2026
                  </div>
                </div>
                <div className="flex gap-3">
                  {[
                    { val: '24', lbl: 'Logements', sub: '+3 ce mois', col: '#fff' },
                    { val: '87%', lbl: 'Occupation', sub: '+6%', col: '#fff' },
                    { val: '3', lbl: 'Impayés', sub: 'Action requise', col: '#FCA5A5', alert: true },
                  ].map((s) => (
                    <div key={s.lbl} className="rounded-xl px-5 py-3 text-center"
                         style={{ background: s.alert ? 'rgba(163,45,45,0.3)' : 'rgba(255,255,255,0.1)',
                                  border: `1px solid ${s.alert ? 'rgba(163,45,45,0.5)' : 'rgba(255,255,255,0.15)'}` }}>
                      <div className="text-2xl font-bold" style={{ color: s.col }}>{s.val}</div>
                      <div className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>{s.lbl}</div>
                      <div className="text-xs mt-0.5" style={{ color: s.alert ? '#FCA5A5' : 'rgba(255,255,255,0.4)' }}>
                        {s.alert && '⚠ '}{s.sub}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* KPIs */}
              <div className="text-xs font-bold uppercase tracking-wider mb-3"
                   style={{ color: '#8A9BB0' }}>INDICATEURS CLÉS</div>
              <div className="grid grid-cols-4 gap-3 mb-5">
                {[
                  { lbl: 'TOTAL BIENS', val: '24', sub: '+3 depuis le mois dernier',
                    color: '#2E75B6', accent: '#EEF4FA', icon: <IconHome2 size={18} /> },
                  { lbl: "TAUX D'OCCUPATION", val: '87%', sub: '21/24 occupés',
                    color: '#0F6E56', accent: '#ECFDF5', icon: <IconUsers size={18} />, progress: 87 },
                  { lbl: 'REVENUS MENSUELS', val: '1 785 000', sub: 'XAF · +2.3% ce mois',
                    color: '#C55A11', accent: '#FFFBEB', icon: <IconCreditCard size={18} /> },
                  { lbl: 'IMPAYÉS EN COURS', val: '3', sub: '255 000 XAF en retard',
                    color: '#A32D2D', accent: '#FEF2F2', icon: <IconAlertCircle size={18} /> },
                ].map((k) => (
                  <div key={k.lbl} className="bg-white rounded-xl p-4"
                       style={{ border: '1px solid #E6EDF4', boxShadow: '0 1px 3px rgba(30,42,62,.05)' }}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-xs font-bold uppercase tracking-wider"
                           style={{ color: '#8A9BB0' }}>{k.lbl}</div>
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                           style={{ background: k.accent }}>
                        <span style={{ color: k.color }}>{k.icon}</span>
                      </div>
                    </div>
                    <div className="text-2xl font-bold mb-1" style={{ color: '#1E2A3E' }}>{k.val}</div>
                    <div className="text-xs" style={{ color: k.color }}>
                      <IconTrendingUp size={11} className="inline mr-1" />{k.sub}
                    </div>
                    {k.progress && (
                      <div className="mt-3 h-1.5 rounded-full" style={{ background: '#E6EDF4' }}>
                        <div className="h-full rounded-full" style={{ width: `${k.progress}%`, background: k.color }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Structure principale */}
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-bold uppercase tracking-wider" style={{ color: '#8A9BB0' }}>
                  STRUCTURE PRINCIPALE
                </div>
                <Link href="#" className="flex items-center gap-1 text-xs font-semibold"
                      style={{ color: '#2E75B6' }}>
                  Toutes les structures <IconArrowRight size={12} />
                </Link>
              </div>
              <div className="bg-white rounded-xl mb-5 overflow-hidden flex"
                   style={{ border: '1px solid #E6EDF4', boxShadow: '0 1px 3px rgba(30,42,62,.05)' }}>
                <div className="w-44 bg-gradient-to-br from-slate-200 to-slate-300 flex-shrink-0
                                flex items-center justify-center">
                  <IconBuilding size={40} style={{ color: '#8A9BB0', opacity: 0.5 }} />
                </div>
                <div className="flex-1 p-4 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-sm mb-1" style={{ color: '#1E2A3E' }}>
                      Immeuble Les Cocotiers — Bonapriso, Douala
                    </div>
                    <div className="flex gap-4 text-xs mb-3">
                      <div>
                        <span style={{ color: '#8A9BB0' }}>UNITÉS </span>
                        <span className="font-semibold px-2 py-0.5 rounded-full mr-1"
                              style={{ background: '#EEF4FA', color: '#1A3C5E' }}>11 occupées</span>
                        <span className="font-semibold px-2 py-0.5 rounded-full"
                              style={{ background: '#ECFDF5', color: '#0F6E56' }}>1 libre</span>
                      </div>
                    </div>
                    <div className="flex gap-6 text-xs">
                      <div>
                        <div style={{ color: '#8A9BB0' }}>RENOUVELLEMENT</div>
                        <div className="font-semibold" style={{ color: '#1E2A3E' }}>01 mars 2026</div>
                      </div>
                      <div>
                        <div style={{ color: '#8A9BB0' }}>LOYER MOYEN</div>
                        <div className="font-semibold" style={{ color: '#1E2A3E' }}>87 500 XAF/mois</div>
                      </div>
                      <div>
                        <div style={{ color: '#8A9BB0' }}>REVENUS STRUCTURE</div>
                        <div className="font-semibold" style={{ color: '#1E2A3E' }}>1 050 000 XAF</div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold" style={{ color: '#1A3C5E' }}>91%</div>
                    <div className="text-xs" style={{ color: '#8A9BB0' }}>taux d&apos;occupation</div>
                    <div className="mt-2 h-1.5 w-24 ml-auto rounded-full" style={{ background: '#E6EDF4' }}>
                      <div className="h-full rounded-full" style={{ width: '91%', background: '#1A3C5E' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Suivi du parc */}
              <div className="text-xs font-bold uppercase tracking-wider mb-3"
                   style={{ color: '#8A9BB0' }}>SUIVI DU PARC</div>
              <div className="grid grid-cols-4 gap-3 mb-5">
                {[
                  { lbl: 'LOYERS CONFIRMÉS', val: '18', sub: 'Dernier : 15 jan. 2026',
                    icon: <IconCheck size={16} />, color: '#0F6E56', bg: '#ECFDF5' },
                  { lbl: 'IMPAYÉS', val: '3', sub: 'Relance J+7 envoyée',
                    icon: <IconAlertCircle size={16} />, color: '#A32D2D', bg: '#FEF2F2' },
                  { lbl: 'SIGNALEMENTS', val: '2', sub: 'En cours de traitement',
                    icon: <IconTool size={16} />, color: '#C55A11', bg: '#FFFBEB' },
                  { lbl: 'BAUX À RENOUVELER', val: '2', sub: 'Dans 30 jours',
                    icon: <IconFileText size={16} />, color: '#6D28D9', bg: '#F5F3FF' },
                ].map((s) => (
                  <div key={s.lbl} className="bg-white rounded-xl p-4"
                       style={{ border: '1px solid #E6EDF4' }}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-xs font-bold uppercase tracking-wider"
                           style={{ color: '#8A9BB0' }}>{s.lbl}</div>
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                           style={{ background: s.bg }}>
                        <span style={{ color: s.color }}>{s.icon}</span>
                      </div>
                    </div>
                    <div className="text-2xl font-bold" style={{ color: s.color }}>{s.val}</div>
                    <div className="text-xs mt-1" style={{ color: '#8A9BB0' }}>{s.sub}</div>
                  </div>
                ))}
              </div>

              {/* Paiements récents */}
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-bold uppercase tracking-wider" style={{ color: '#8A9BB0' }}>
                  PAIEMENTS RÉCENTS
                </div>
                <Link href="#" className="flex items-center gap-1 text-xs font-semibold"
                      style={{ color: '#2E75B6' }}>
                  Voir l&apos;historique <IconChevronRight size={12} />
                </Link>
              </div>
              <div className="bg-white rounded-xl overflow-hidden"
                   style={{ border: '1px solid #E6EDF4' }}>
                {/* Entête table */}
                <div className="grid grid-cols-5 px-4 py-2.5"
                     style={{ background: '#F8FAFD', borderBottom: '1px solid #E6EDF4' }}>
                  {['LOCATAIRE', 'DATE', 'MOYEN', 'MONTANT', 'STATUT'].map(h => (
                    <div key={h} className="text-xs font-bold uppercase tracking-wider"
                         style={{ color: '#8A9BB0' }}>{h}</div>
                  ))}
                </div>
                {[
                  { av: 'MJ', avBg: '#EEF4FA', avCol: '#1A3C5E',
                    name: 'Mbida Jean', unit: 'Studio 101 · Les Cocotiers',
                    date: '15 jan. 2026', dateCol: '#5B6E8C',
                    moyen: 'Orange Money', moyenBg: '#FFFBEB', moyenCol: '#C55A11',
                    mont: '85 000 XAF', montCol: '#0F6E56',
                    statut: 'Confirmé', statutBg: '#ECFDF5', statutCol: '#0F6E56' },
                  { av: 'NS', avBg: '#ECFDF5', avCol: '#0F6E56',
                    name: 'Ngo Sarah', unit: 'F2 Apt. 204 · Rés. Soleil',
                    date: '14 jan. 2026', dateCol: '#5B6E8C',
                    moyen: 'Cash', moyenBg: '#F1F5F9', moyenCol: '#5B6E8C',
                    mont: '120 000 XAF', montCol: '#0F6E56',
                    statut: 'Confirmé', statutBg: '#ECFDF5', statutCol: '#0F6E56' },
                  { av: 'BE', avBg: '#FEF2F2', avCol: '#A32D2D',
                    name: 'Bello Eric', unit: 'Boutique 02 · Les Cocotiers',
                    date: 'Retard · J+7', dateCol: '#A32D2D',
                    moyen: 'Impayé', moyenBg: '#FEF2F2', moyenCol: '#A32D2D',
                    mont: '-95 000 XAF', montCol: '#A32D2D',
                    statut: 'En retard', statutBg: '#FEF2F2', statutCol: '#A32D2D' },
                  { av: 'TM', avBg: '#F1F5F9', avCol: '#8A9BB0',
                    name: 'Talla Marie', unit: 'Studio 303 · Villa Mbanga',
                    date: 'Échéance 20 jan.', dateCol: '#C55A11',
                    moyen: 'MTN Money', moyenBg: '#FFFBEB', moyenCol: '#C55A11',
                    mont: '75 000 XAF', montCol: '#C55A11',
                    statut: 'En attente', statutBg: '#FFFBEB', statutCol: '#C55A11' },
                ].map((row) => (
                  <div key={row.name}
                    className="grid grid-cols-5 px-4 py-3 items-center hover:bg-gray-50 cursor-pointer"
                    style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0"
                           style={{ background: row.avBg, color: row.avCol }}>{row.av}</div>
                      <div>
                        <div className="text-sm font-semibold" style={{ color: '#1E2A3E' }}>{row.name}</div>
                        <div className="text-xs" style={{ color: '#8A9BB0' }}>{row.unit}</div>
                      </div>
                    </div>
                    <div className="text-sm" style={{ color: row.dateCol }}>{row.date}</div>
                    <div>
                      <span className="text-xs font-semibold px-2 py-1 rounded-full"
                            style={{ background: row.moyenBg, color: row.moyenCol }}>
                        {row.moyen}
                      </span>
                    </div>
                    <div className="text-sm font-bold" style={{ color: row.montCol }}>{row.mont}</div>
                    <div>
                      <span className="text-xs font-semibold px-2 py-1 rounded-full"
                            style={{ background: row.statutBg, color: row.statutCol }}>
                        {row.statut}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

            </div>

            {/* ── Panneau droit ── */}
            <div className="w-64 flex-shrink-0 overflow-y-auto bg-white"
                 style={{ borderLeft: '1px solid #E6EDF4' }}>

              {/* Aperçu financier */}
              <div className="p-4" style={{ background: '#0F2438' }}>
                <div className="text-xs font-bold uppercase tracking-wider mb-3"
                     style={{ color: 'rgba(255,255,255,0.4)' }}>
                  APERÇU FINANCIER · JAN. 2026
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.07)' }}>
                    <div className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>ENCAISSÉ</div>
                    <div className="font-bold text-white text-sm">1 530 000</div>
                  </div>
                  <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.07)' }}>
                    <div className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>IMPAYÉS</div>
                    <div className="font-bold text-sm" style={{ color: '#FCD34D' }}>255 000</div>
                  </div>
                </div>
                <div className="rounded-xl p-3 mb-3" style={{ background: 'rgba(255,255,255,0.07)' }}>
                  <div className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>REVENU NET MENSUEL</div>
                  <div className="font-bold text-white text-lg">1 275 000 <span className="text-xs font-normal opacity-60">XAF</span></div>
                </div>
                {/* Mini bar chart */}
                <div className="flex items-end gap-1 h-10">
                  {[35,50,42,65,52,70,55,90].map((h, i) => (
                    <div key={i} className="flex-1 rounded-t"
                         style={{ height: `${h}%`,
                                  background: i === 7 ? '#2E75B6' : 'rgba(255,255,255,0.15)' }} />
                  ))}
                </div>
              </div>

              {/* Activités récentes */}
              <div className="p-4">
                <div className="text-xs font-bold uppercase tracking-wider mb-3"
                     style={{ color: '#8A9BB0' }}>ACTIVITÉS RÉCENTES</div>
                {[
                  { ico: <IconTool size={14} />, bg: '#FFFBEB', col: '#C55A11',
                    title: 'Signalement technique', desc: 'Studio 101 — Panne électrique', time: 'Il y a 2 heures' },
                  { ico: <IconCreditCard size={14} />, bg: '#ECFDF5', col: '#0F6E56',
                    title: 'Loyer reçu', desc: 'Apt. 204 — 120 000 XAF', time: 'Il y a 5 heures' },
                  { ico: <IconCreditCard size={14} />, bg: '#ECFDF5', col: '#0F6E56',
                    title: 'Loyer reçu', desc: 'Studio 101 — 85 000 XAF', time: 'Il y a 5 heures' },
                  { ico: <IconAlertTriangle size={14} />, bg: '#FEF2F2', col: '#A32D2D',
                    title: 'Impayé — Relance J+7', desc: 'Boutique 02 — Bello Eric', time: 'Hier, 09:00' },
                  { ico: <IconFileText size={14} />, bg: '#F5F3FF', col: '#6D28D9',
                    title: 'Bail à renouveler', desc: 'Apt. 108 — 01 mars 2026', time: 'Il y a 1 jour' },
                  { ico: <IconMessage size={14} />, bg: '#EEF4FA', col: '#2E75B6',
                    title: 'Nouveau message', desc: 'Ngo Sarah — Studio 207', time: 'Il y a 1 jour' },
                  { ico: <IconFileText size={14} />, bg: '#F5F3FF', col: '#6D28D9',
                    title: 'Bail à renouveler', desc: 'Apt. 112 — 01 mars 2026', time: 'Il y a 2 jours' },
                ].map((a, i) => (
                  <div key={i} className="flex gap-2.5 py-3 cursor-pointer hover:bg-gray-50 -mx-4 px-4"
                       style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                         style={{ background: a.bg }}>
                      <span style={{ color: a.col }}>{a.ico}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs" style={{ color: '#8A9BB0' }}>{a.title}</div>
                      <div className="text-xs font-semibold" style={{ color: '#1E2A3E' }}>{a.desc}</div>
                      <div className="text-xs" style={{ color: '#8A9BB0' }}>{a.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}