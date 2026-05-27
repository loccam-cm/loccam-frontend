'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Utilisateur } from '@/types'
import {
  IconLayoutDashboard, IconUsers, IconHome2, IconShieldCheck,
  IconFileText, IconTool, IconChartBar, IconSettings,
  IconLogout, IconDownload, IconRefresh, IconBuilding,
  IconAlertCircle, IconCheck, IconX, IconClock,
} from '@tabler/icons-react'

export default function AdminDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<Utilisateur | null>(null)

  useEffect(() => {
    const u = localStorage.getItem('user')
    if (!u) { router.push('/login'); return }
    const parsed = JSON.parse(u)
    if (parsed.role !== 'admin') { router.push('/login'); return }
    setUser(parsed)
  }, [router])

  const deconnexion = () => { localStorage.clear(); router.push('/login') }

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F1F5F9' }}>
      <div className="text-sm" style={{ color: '#8A9BB0' }}>Chargement...</div>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#F8FAFD' }}>

      {/* ══════════════════════════════════
          SIDEBAR
      ══════════════════════════════════ */}
      <aside className="w-52 flex-shrink-0 flex flex-col h-full bg-white"
             style={{ borderRight: '1px solid #E6EDF4' }}>

        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 py-4"
             style={{ borderBottom: '1px solid #E6EDF4' }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
               style={{ background: '#1A3C5E' }}>
            <IconBuilding size={16} color="white" />
          </div>
          <div>
            <div className="font-bold text-sm leading-none" style={{ color: '#1A3C5E' }}>LocCam</div>
            <div className="text-xs" style={{ color: '#8A9BB0' }}>Administration</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 overflow-y-auto">

          <div className="text-xs font-bold uppercase tracking-wider px-2 mb-2"
               style={{ color: '#8A9BB0' }}>Supervision</div>

          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg mb-0.5 cursor-pointer text-sm"
               style={{ background: '#EEF4FA', color: '#1A3C5E', fontWeight: 600,
                        boxShadow: 'inset 2px 0 0 #1A3C5E' }}>
            <IconLayoutDashboard size={15} />Vue d&apos;ensemble
          </div>

          <div className="text-xs font-bold uppercase tracking-wider px-2 mt-4 mb-2"
               style={{ color: '#8A9BB0' }}>Utilisateurs</div>

          {[
            { icon: <IconUsers size={15} />,      label: 'Bailleurs' },
            { icon: <IconUsers size={15} />,      label: 'Locataires' },
            { icon: <IconShieldCheck size={15} />, label: 'Validation CNI', badge: 4, badgeColor: '#C55A11' },
          ].map((item) => (
            <div key={item.label}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg mb-0.5 cursor-pointer text-sm"
              style={{ color: '#5B6E8C' }}>
              {item.icon}
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="text-xs font-bold px-1.5 py-0.5 rounded-full text-white"
                      style={{ background: item.badgeColor, fontSize: '10px' }}>
                  {item.badge}
                </span>
              )}
            </div>
          ))}

          <div className="text-xs font-bold uppercase tracking-wider px-2 mt-4 mb-2"
               style={{ color: '#8A9BB0' }}>Contenu</div>

          {[
            { icon: <IconHome2 size={15} />,  label: 'Biens publiés' },
            { icon: <IconTool size={15} />,   label: 'Signalements', badge: 3, badgeColor: '#A32D2D' },
          ].map((item) => (
            <div key={item.label}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg mb-0.5 cursor-pointer text-sm"
              style={{ color: '#5B6E8C' }}>
              {item.icon}
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="text-xs font-bold px-1.5 py-0.5 rounded-full text-white"
                      style={{ background: item.badgeColor, fontSize: '10px' }}>
                  {item.badge}
                </span>
              )}
            </div>
          ))}

          <div className="text-xs font-bold uppercase tracking-wider px-2 mt-4 mb-2"
               style={{ color: '#8A9BB0' }}>Système</div>

          {[
            { icon: <IconChartBar size={15} />,  label: 'KPIs & Revenus' },
            { icon: <IconFileText size={15} />,  label: 'Logs système' },
            { icon: <IconSettings size={15} />,  label: 'Paramètres' },
          ].map((item) => (
            <div key={item.label}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg mb-0.5 cursor-pointer text-sm"
              style={{ color: '#5B6E8C' }}>
              {item.icon}{item.label}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 py-3 flex items-center gap-2.5"
             style={{ borderTop: '1px solid #E6EDF4' }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white flex-shrink-0"
               style={{ background: '#1A3C5E' }}>
            {user.prenom[0]}{user.nom[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold truncate" style={{ color: '#1E2A3E' }}>
              {user.nom_complet}
            </div>
            <div className="text-xs" style={{ color: '#8A9BB0' }}>Administrateur</div>
          </div>
          <button onClick={deconnexion} style={{ color: '#8A9BB0' }}>
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
            Vue d&apos;ensemble — Janvier 2026
          </h1>
          <button className="flex items-center gap-1.5 px-3 h-9 rounded-lg text-xs font-medium"
                  style={{ background: '#F1F5F9', border: '1px solid #E6EDF4', color: '#5B6E8C' }}>
            <IconDownload size={14} />Exporter CSV
          </button>
          <button className="flex items-center gap-1.5 px-3 h-9 rounded-lg text-xs font-medium"
                  style={{ background: '#F1F5F9', border: '1px solid #E6EDF4', color: '#5B6E8C' }}>
            <IconRefresh size={14} />Actualiser
          </button>
          <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white"
               style={{ background: '#1A3C5E' }}>
            {user.prenom[0]}{user.nom[0]}
          </div>
        </header>

        {/* Contenu */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex h-full">

            {/* ── Colonne centrale ── */}
            <div className="flex-1 p-5 overflow-y-auto">

              {/* Salutation */}
              <div className="flex items-center gap-2 mb-5">
                <div className="w-7 h-7 rounded-full flex items-center justify-center"
                     style={{ background: '#EEF4FA' }}>
                  <IconUsers size={14} style={{ color: '#1A3C5E' }} />
                </div>
                <div>
                  <div className="text-xl font-bold" style={{ color: '#1A3C5E' }}>
                    Bonjour, {user.prenom} !
                  </div>
                  <div className="text-xs" style={{ color: '#8A9BB0' }}>
                    Supervision de la plateforme LocCam — 18 janvier 2026
                  </div>
                </div>
              </div>

              {/* KPIs globaux */}
              <div className="grid grid-cols-4 gap-3 mb-5">
                {[
                  {
                    label: 'UTILISATEURS', val: '87', sub: '12 bailleurs · 75 locataires',
                    icon: '👤', border: '#2E75B6', subColor: '#2E75B6',
                  },
                  {
                    label: 'BIENS ACTIFS', val: '143', sub: '124 occupés · 19 libres',
                    icon: '🏠', border: '#0F6E56', subColor: '#0F6E56',
                  },
                  {
                    label: 'PAIEMENTS DU MOIS', val: '11 240 000', sub: 'XAF · 63 transactions',
                    icon: '💳', border: '#C55A11', subColor: '#C55A11',
                  },
                  {
                    label: 'SIGNALEMENTS', val: '3', sub: '⚠ 1 urgent · action requise',
                    icon: '🔔', border: '#A32D2D', subColor: '#A32D2D',
                  },
                ].map((k) => (
                  <div key={k.label} className="bg-white rounded-xl p-4 relative overflow-hidden"
                       style={{ border: '1px solid #E6EDF4',
                                boxShadow: '0 1px 3px rgba(30,42,62,.05)' }}>
                    <div className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
                         style={{ background: k.border }} />
                    <div className="text-3xl mb-3">{k.icon}</div>
                    <div className="text-xs font-bold uppercase tracking-wider mb-2"
                         style={{ color: '#8A9BB0' }}>{k.label}</div>
                    <div className="text-3xl font-bold mb-1" style={{ color: '#1E2A3E' }}>{k.val}</div>
                    <div className="text-xs" style={{ color: k.subColor }}>{k.sub}</div>
                  </div>
                ))}
              </div>

              {/* Gestion utilisateurs */}
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-bold uppercase tracking-wider"
                     style={{ color: '#8A9BB0' }}>GESTION DES UTILISATEURS</div>
                <button className="text-xs font-semibold" style={{ color: '#2E75B6' }}>
                  Voir tout
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-5">

                {/* Utilisateurs récents */}
                <div className="bg-white rounded-xl overflow-hidden"
                     style={{ border: '1px solid #E6EDF4' }}>
                  <div className="flex items-center justify-between px-4 py-3"
                       style={{ borderBottom: '1px solid #E6EDF4' }}>
                    <div className="text-sm font-bold" style={{ color: '#1E2A3E' }}>
                      Utilisateurs récents
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: '#EEF4FA', color: '#1A3C5E' }}>
                      87 total
                    </span>
                  </div>
                  {/* Entête */}
                  <div className="grid grid-cols-4 px-4 py-2"
                       style={{ background: '#F8FAFD', borderBottom: '1px solid #E6EDF4' }}>
                    {['UTILISATEUR', 'RÔLE', 'CNI', 'STATUT'].map(h => (
                      <div key={h} className="text-xs font-bold uppercase tracking-wider"
                           style={{ color: '#8A9BB0' }}>{h}</div>
                    ))}
                  </div>
                  {[
                    { av: 'KV', bg: '#EEF4FA', col: '#1A3C5E', name: 'Kenmatio Vicens',
                      email: 'kenmatio@email.cm', role: 'Bailleur', roleCol: '#1A3C5E', roleBg: '#EEF4FA',
                      cni: '✓ Validée', cniCol: '#0F6E56', statut: 'Actif', statutCol: '#0F6E56' },
                    { av: 'MJ', bg: '#ECFDF5', col: '#0F6E56', name: 'Mbida Jean',
                      email: 'mbida@email.cm', role: 'Locataire', roleCol: '#0F6E56', roleBg: '#ECFDF5',
                      cni: '✓ Validée', cniCol: '#0F6E56', statut: 'Actif', statutCol: '#0F6E56' },
                    { av: 'TM', bg: '#FFFBEB', col: '#C55A11', name: 'Tamba Martin',
                      email: 'tamba@email.cm', role: 'Bailleur', roleCol: '#1A3C5E', roleBg: '#EEF4FA',
                      cni: '⏳ En attente', cniCol: '#C55A11', statut: 'Actif', statutCol: '#0F6E56' },
                    { av: 'BF', bg: '#FEF2F2', col: '#A32D2D', name: 'Bello Fatima',
                      email: 'fatima@email.cm', role: 'Bailleur', roleCol: '#1A3C5E', roleBg: '#EEF4FA',
                      cni: '⏳ En attente', cniCol: '#C55A11', statut: 'Actif', statutCol: '#0F6E56' },
                  ].map((u) => (
                    <div key={u.name}
                      className="grid grid-cols-4 px-4 py-2.5 items-center hover:bg-gray-50 cursor-pointer"
                      style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0"
                             style={{ background: u.bg, color: u.col }}>{u.av}</div>
                        <div>
                          <div className="text-xs font-semibold" style={{ color: '#1E2A3E' }}>{u.name}</div>
                          <div className="text-xs" style={{ color: '#8A9BB0' }}>{u.email}</div>
                        </div>
                      </div>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full w-fit"
                            style={{ background: u.roleBg, color: u.roleCol }}>{u.role}</span>
                      <span className="text-xs font-semibold" style={{ color: u.cniCol }}>{u.cni}</span>
                      <span className="text-xs font-semibold" style={{ color: u.statutCol }}>{u.statut}</span>
                    </div>
                  ))}
                </div>

                {/* Validation CNI */}
                <div className="bg-white rounded-xl overflow-hidden"
                     style={{ border: '1px solid #E6EDF4' }}>
                  <div className="flex items-center justify-between px-4 py-3"
                       style={{ borderBottom: '1px solid #E6EDF4' }}>
                    <div className="text-sm font-bold" style={{ color: '#1E2A3E' }}>
                      Validation CNI en attente
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: '#FFFBEB', color: '#C55A11' }}>
                      4 en attente
                    </span>
                  </div>
                  {[
                    { av: 'TM', bg: '#FFFBEB', col: '#C55A11', name: 'Tamba Martin',
                      sub: 'Soumise il y a 2h · bailleur' },
                    { av: 'BF', bg: '#FEF2F2', col: '#A32D2D', name: 'Bello Fatima',
                      sub: 'Soumise il y a 5h · bailleur' },
                    { av: 'NK', bg: '#EEF4FA', col: '#1A3C5E', name: 'Nkolo Karine',
                      sub: 'Soumise hier · bailleur' },
                    { av: 'SR', bg: '#F5F3FF', col: '#6D28D9', name: 'Simo René',
                      sub: 'Soumise avant-hier · bailleur' },
                  ].map((u) => (
                    <div key={u.name}
                      className="flex items-center gap-3 px-4 py-3"
                      style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                           style={{ background: u.bg, color: u.col }}>{u.av}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold" style={{ color: '#1E2A3E' }}>{u.name}</div>
                        <div className="text-xs" style={{ color: '#8A9BB0' }}>{u.sub}</div>
                      </div>
                      <button className="px-3 py-1.5 rounded-lg text-xs font-semibold mr-1"
                              style={{ background: '#ECFDF5', color: '#0F6E56' }}>
                        Valider
                      </button>
                      <button className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                              style={{ background: '#FEF2F2', color: '#A32D2D' }}>
                        Rejeter
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modération & Logs */}
              <div className="text-xs font-bold uppercase tracking-wider mb-3"
                   style={{ color: '#8A9BB0' }}>MODÉRATION & LOGS</div>
              <div className="grid grid-cols-2 gap-4">

                {/* Signalements à traiter */}
                <div className="bg-white rounded-xl overflow-hidden"
                     style={{ border: '1px solid #E6EDF4' }}>
                  <div className="flex items-center justify-between px-4 py-3"
                       style={{ borderBottom: '1px solid #E6EDF4' }}>
                    <div className="text-sm font-bold" style={{ color: '#1E2A3E' }}>
                      Signalements à traiter
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: '#FFFBEB', color: '#C55A11' }}>
                      3 ouverts
                    </span>
                  </div>
                  {[
                    { ico: '🚨', bg: '#FEF2F2', icoBg: '#FEF2F2',
                      title: 'Annonce frauduleuse signalée',
                      sub: 'Bien #284 · Signalé par 2 utilisateurs · Il y a 1h',
                      actions: ['Traiter', 'Rejeter'] },
                    { ico: '❓', bg: '#FFFBEB', icoBg: '#FFFBEB',
                      title: 'Compte bailleur suspect',
                      sub: 'Utilisateur #17 · Activité inhabituelle · Il y a 3h',
                      actions: ['Traiter', 'Ignorer'] },
                    { ico: '💬', bg: '#F1F5F9', icoBg: '#F1F5F9',
                      title: 'Message inapproprié signalé',
                      sub: 'Conversation bien #112 · Il y a 6h',
                      actions: ['Traiter', 'Rejeter'] },
                  ].map((s, i) => (
                    <div key={i} className="flex items-start gap-3 px-4 py-3"
                         style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                           style={{ background: s.icoBg }}>
                        {s.ico}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold" style={{ color: '#1E2A3E' }}>{s.title}</div>
                        <div className="text-xs" style={{ color: '#8A9BB0' }}>{s.sub}</div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <button className="px-3 py-1 rounded-lg text-xs font-bold text-white"
                                style={{ background: '#1A3C5E' }}>
                          {s.actions[0]}
                        </button>
                        <button className="px-3 py-1 rounded-lg text-xs font-semibold"
                                style={{ background: '#F1F5F9', color: '#5B6E8C' }}>
                          {s.actions[1]}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Logs système */}
                <div className="bg-white rounded-xl overflow-hidden"
                     style={{ border: '1px solid #E6EDF4' }}>
                  <div className="flex items-center justify-between px-4 py-3"
                       style={{ borderBottom: '1px solid #E6EDF4' }}>
                    <div className="text-sm font-bold" style={{ color: '#1E2A3E' }}>
                      Logs système — Actions sensibles
                    </div>
                    <button className="text-xs font-semibold" style={{ color: '#2E75B6' }}>
                      Voir tout
                    </button>
                  </div>
                  {[
                    { time: '10:42', desc: 'Paiement confirmé — 85 000 XAF · Mbida J. · TXN-20260115-001',
                      tag: 'PAY', tagCol: '#0F6E56', tagBg: '#ECFDF5' },
                    { time: '10:15', desc: 'CNI validée — Kenmatio V. · Admin Michel',
                      tag: 'AUTH', tagCol: '#2E75B6', tagBg: '#EEF4FA' },
                    { time: '09:33', desc: 'Contrat signé — Bien #284 · Bailleur + Locataire',
                      tag: 'DOC', tagCol: '#6D28D9', tagBg: '#F5F3FF' },
                    { time: '09:08', desc: "Bien modéré — Annonce #156 retirée · Admin Michel",
                      tag: 'MOD', tagCol: '#C55A11', tagBg: '#FFFBEB' },
                    { time: '08:47', desc: 'Compte suspendu — Utilisateur #23 · 30 jours',
                      tag: 'SEC', tagCol: '#A32D2D', tagBg: '#FEF2F2' },
                    { time: '08:22', desc: 'Paiement cash — Ngo S. · 120 000 XAF · Bailleur KV',
                      tag: 'PAY', tagCol: '#0F6E56', tagBg: '#ECFDF5' },
                    { time: '07:55', desc: 'Signalement ouvert — Studio 101 · Panne électrique',
                      tag: 'TECH', tagCol: '#5B6E8C', tagBg: '#F1F5F9' },
                  ].map((log, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-2.5"
                         style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <div className="text-xs font-mono flex-shrink-0"
                           style={{ color: '#8A9BB0' }}>{log.time}</div>
                      <div className="flex-1 text-xs" style={{ color: '#1E2A3E' }}>{log.desc}</div>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                            style={{ background: log.tagBg, color: log.tagCol }}>
                        {log.tag}
                      </span>
                    </div>
                  ))}
                </div>

              </div>
            </div>

            {/* ── Panneau droit ── */}
            <div className="w-64 flex-shrink-0 overflow-y-auto bg-white"
                 style={{ borderLeft: '1px solid #E6EDF4' }}>

              {/* KPIs plateforme */}
              <div className="p-4" style={{ borderBottom: '1px solid #E6EDF4' }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs font-bold uppercase tracking-wider"
                       style={{ color: '#8A9BB0' }}>KPIs plateforme</div>
                  <span className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: '#F1F5F9', color: '#8A9BB0' }}>Jan. 2026</span>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {[
                    { lbl: 'BAILLEURS',  val: '12', sub: '+2 ce mois', col: '#2E75B6', bg: '#EEF4FA' },
                    { lbl: 'LOCATAIRES', val: '75', sub: '+8 ce mois', col: '#0F6E56', bg: '#ECFDF5' },
                    { lbl: 'BIENS ACTIFS', val: '143', sub: 'Taux 87%', col: '#C55A11', bg: '#FFFBEB' },
                    { lbl: 'TRANSACTIONS', val: '63', sub: 'Confirmées', col: '#6D28D9', bg: '#F5F3FF' },
                  ].map((k) => (
                    <div key={k.lbl} className="rounded-xl p-3"
                         style={{ background: k.bg }}>
                      <div className="text-xs font-bold uppercase tracking-wider mb-1"
                           style={{ color: k.col, fontSize: '9px' }}>{k.lbl}</div>
                      <div className="text-xl font-bold" style={{ color: k.col }}>{k.val}</div>
                      <div className="text-xs" style={{ color: k.col, opacity: 0.7 }}>{k.sub}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Revenus mensuels */}
              <div className="p-4" style={{ borderBottom: '1px solid #E6EDF4' }}>
                <div className="text-xs font-bold uppercase tracking-wider mb-3"
                     style={{ color: '#8A9BB0' }}>Revenus mensuels (XAF)</div>
                {/* Mini chart */}
                <div className="flex items-end gap-1 h-16 mb-2">
                  {[
                    { h: 40, lbl: 'Sep' },
                    { h: 55, lbl: 'Oct' },
                    { h: 50, lbl: 'Nov' },
                    { h: 65, lbl: 'Déc' },
                    { h: 90, lbl: 'Jan', active: true },
                  ].map((b) => (
                    <div key={b.lbl} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full rounded-t"
                           style={{ height: `${b.h}%`,
                                    background: b.active ? '#1A3C5E' : '#E6EDF4' }} />
                      <div className="text-xs" style={{ color: b.active ? '#1A3C5E' : '#8A9BB0',
                                                         fontSize: '9px' }}>{b.lbl}</div>
                    </div>
                  ))}
                </div>
                <div className="text-base font-bold" style={{ color: '#1E2A3E' }}>
                  11 240 000 XAF
                  <span className="text-xs font-semibold ml-1" style={{ color: '#0F6E56' }}>
                    ↑ +8.2%
                  </span>
                </div>
              </div>

              {/* Stats rapides */}
              <div className="p-4" style={{ borderBottom: '1px solid #E6EDF4' }}>
                <div className="text-xs font-bold uppercase tracking-wider mb-3"
                     style={{ color: '#8A9BB0' }}>Stats rapides</div>
                {[
                  { lbl: "Taux d'occupation", val: '87%', col: '#0F6E56' },
                  { lbl: 'Paiements confirmés', val: '94%', col: '#0F6E56' },
                  { lbl: 'CNI en attente', val: '4', col: '#C55A11' },
                  { lbl: 'Signalements urgents', val: '1', col: '#A32D2D' },
                ].map((s) => (
                  <div key={s.lbl} className="flex items-center justify-between py-2"
                       style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <span className="text-xs" style={{ color: '#5B6E8C' }}>{s.lbl}</span>
                    <span className="text-xs font-bold" style={{ color: s.col }}>{s.val}</span>
                  </div>
                ))}
              </div>

              {/* Actions rapides */}
              <div className="p-4">
                <div className="text-xs font-bold uppercase tracking-wider mb-3"
                     style={{ color: '#8A9BB0' }}>Actions rapides</div>
                {[
                  { lbl: 'Valider les CNI', badge: 4, bg: '#1A3C5E', col: '#fff',
                    icon: <IconShieldCheck size={14} /> },
                  { lbl: 'Traiter signalements', badge: 3, bg: '#F1F5F9', col: '#1E2A3E',
                    icon: <IconTool size={14} /> },
                  { lbl: 'Exporter rapport PDF', badge: null, bg: '#F1F5F9', col: '#1E2A3E',
                    icon: <IconDownload size={14} /> },
                  { lbl: 'Envoyer rappels loyers', badge: null, bg: '#F1F5F9', col: '#1E2A3E',
                    icon: <IconCheck size={14} /> },
                ].map((a) => (
                  <button key={a.lbl}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl mb-2 text-sm font-semibold transition-all"
                    style={{ background: a.bg, color: a.col }}>
                    <span style={{ color: a.col }}>{a.icon}</span>
                    <span className="flex-1 text-left text-xs">{a.lbl}</span>
                    {a.badge && (
                      <span className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                            style={{ background: 'rgba(255,255,255,0.2)', color: a.col }}>
                        {a.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}