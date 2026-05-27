'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Utilisateur } from '@/types'
import {
  IconLayoutDashboard, IconHome2, IconFileText, IconCreditCard,
  IconMessage, IconTool, IconUser, IconBell, IconLogout,
  IconCheck, IconChevronRight, IconPlus, IconAlertTriangle,
  IconDownload, IconBuilding,
} from '@tabler/icons-react'

export default function LocataireDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<Utilisateur | null>(null)

  useEffect(() => {
    const u = localStorage.getItem('user')
    if (!u) { router.push('/login'); return }
    setUser(JSON.parse(u))
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
               style={{ background: '#0F6E56' }}>
            <IconBuilding size={16} color="white" />
          </div>
          <div>
            <div className="font-bold text-sm leading-none" style={{ color: '#0F6E56' }}>LocCam</div>
            <div className="text-xs" style={{ color: '#8A9BB0' }}>Espace locataire</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 overflow-y-auto">

          <div className="text-xs font-bold uppercase tracking-wider px-2 mb-2"
               style={{ color: '#8A9BB0' }}>Mon logement</div>

          {[
            { icon: <IconLayoutDashboard size={15} />, label: 'Tableau de bord', active: true },
            { icon: <IconHome2 size={15} />,           label: 'Mon logement' },
            { icon: <IconFileText size={15} />,        label: 'Mon contrat' },
          ].map((item) => (
            <div key={item.label}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg mb-0.5 cursor-pointer text-sm transition-all"
              style={item.active
                ? { background: '#ECFDF5', color: '#0F6E56', fontWeight: 600,
                    boxShadow: 'inset 2px 0 0 #0F6E56' }
                : { color: '#5B6E8C' }
              }>
              {item.icon}{item.label}
            </div>
          ))}

          <div className="text-xs font-bold uppercase tracking-wider px-2 mt-4 mb-2"
               style={{ color: '#8A9BB0' }}>Finances</div>

          {[
            { icon: <IconCreditCard size={15} />, label: 'Payer mon loyer' },
            { icon: <IconFileText size={15} />,   label: 'Mes quittances' },
          ].map((item) => (
            <div key={item.label}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg mb-0.5 cursor-pointer text-sm"
              style={{ color: '#5B6E8C' }}>
              {item.icon}{item.label}
            </div>
          ))}

          <div className="text-xs font-bold uppercase tracking-wider px-2 mt-4 mb-2"
               style={{ color: '#8A9BB0' }}>Communication</div>

          {[
            { icon: <IconMessage size={15} />, label: 'Messagerie',   badge: 4, badgeColor: '#0F6E56' },
            { icon: <IconTool size={15} />,    label: 'Signalements', badge: 1, badgeColor: '#A32D2D' },
          ].map((item) => (
            <div key={item.label}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg mb-0.5 cursor-pointer text-sm"
              style={{ color: '#5B6E8C' }}>
              {item.icon}
              <span className="flex-1">{item.label}</span>
              <span className="text-xs font-bold px-1.5 py-0.5 rounded-full text-white"
                    style={{ background: item.badgeColor, fontSize: '10px' }}>
                {item.badge}
              </span>
            </div>
          ))}

          <div className="text-xs font-bold uppercase tracking-wider px-2 mt-4 mb-2"
               style={{ color: '#8A9BB0' }}>Compte</div>
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer text-sm"
               style={{ color: '#5B6E8C' }}>
            <IconUser size={15} />Mon compte
          </div>
        </nav>

        {/* Footer sidebar */}
        <div className="px-3 py-3 flex items-center gap-2.5"
             style={{ borderTop: '1px solid #E6EDF4' }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white flex-shrink-0"
               style={{ background: '#0F6E56' }}>
            {user.prenom[0]}{user.nom[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate" style={{ color: '#1E2A3E' }}>
              {user.nom_complet}
            </div>
            <div className="text-xs truncate" style={{ color: '#8A9BB0' }}>
              Locataire · Studio 101
            </div>
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
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
               style={{ background: '#F1F5F9' }}>
            <IconLayoutDashboard size={16} style={{ color: '#5B6E8C' }} />
          </div>
          <h1 className="text-base font-bold flex-1" style={{ color: '#1E2A3E' }}>
            Tableau de bord
          </h1>
          {/* Alertes */}
          <button className="flex items-center gap-2 px-4 h-9 rounded-xl text-sm font-semibold"
                  style={{ background: '#FFFBEB', border: '1.5px solid #FCD34D', color: '#C55A11' }}>
            <IconBell size={15} />
            Alertes
            <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: '#C55A11' }}>3</span>
          </button>
          {/* Payer mon loyer */}
          <button className="flex items-center gap-2 px-4 h-9 rounded-xl text-sm font-bold text-white"
                  style={{ background: '#0F6E56', boxShadow: '0 2px 8px rgba(15,110,86,0.3)' }}>
            <IconCreditCard size={15} />
            Payer mon loyer
          </button>
          <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white"
               style={{ background: '#0F6E56' }}>
            {user.prenom[0]}{user.nom[0]}
          </div>
        </header>

        {/* Contenu */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex h-full">

            {/* ── Colonne centrale ── */}
            <div className="flex-1 p-5 overflow-y-auto">

              {/* Salutation */}
              <div className="mb-4">
                <h2 className="text-xl font-bold" style={{ color: '#1E2A3E' }}>
                  Bonjour, {user.prenom} !
                </h2>
                <p className="text-sm" style={{ color: '#8A9BB0' }}>
                  Bienvenue sur votre espace locataire LocCam.
                </p>
              </div>

              {/* Carte logement */}
              <div className="rounded-2xl p-5 mb-5 flex items-center gap-5"
                   style={{ background: 'linear-gradient(135deg, #0A3D2E 0%, #0F6E56 100%)' }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                     style={{ background: 'rgba(255,255,255,0.12)' }}>
                  <IconHome2 size={28} color="white" />
                </div>
                <div className="flex-1">
                  <div className="text-white font-bold text-lg mb-0.5">
                    Studio meublé — Appartement 101
                  </div>
                  <div className="flex items-center gap-1.5 text-sm mb-3"
                       style={{ color: 'rgba(255,255,255,0.6)' }}>
                    <span>📍</span>
                    Immeuble Les Cocotiers, Bonapriso, Douala
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    {[
                      { lbl: 'Loyer mensuel',  val: '85 000 XAF' },
                      { lbl: 'Caution versée', val: '85 000 XAF' },
                      { lbl: "Date d'entrée",  val: '01 fév. 2026' },
                      { lbl: 'Propriétaire',   val: 'Kenmatio Vicens' },
                    ].map((s) => (
                      <div key={s.lbl}>
                        <div className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.45)' }}>
                          {s.lbl}
                        </div>
                        <div className="text-sm font-semibold text-white">{s.val}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Prochain paiement */}
              <div className="bg-white rounded-2xl p-5 mb-5"
                   style={{ border: '1px solid #E6EDF4' }}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider mb-1"
                         style={{ color: '#0F6E56' }}>Prochain paiement</div>
                    <div className="text-3xl font-bold" style={{ color: '#0F6E56' }}>
                      92 925 XAF
                    </div>
                    <div className="text-xs mt-1" style={{ color: '#8A9BB0' }}>
                      Loyer 85 000 + Eau 3 125 + Élec 4 800
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-semibold uppercase tracking-wider mb-1"
                         style={{ color: '#C55A11' }}>Échéance</div>
                    <div className="text-xl font-bold" style={{ color: '#C55A11' }}>
                      20 jan. 2026
                    </div>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <IconBell size={12} style={{ color: '#C55A11' }} />
                      <span className="text-xs" style={{ color: '#C55A11' }}>dans 5 jours</span>
                    </div>
                    {/* Cercle progression */}
                    <div className="mt-2 flex justify-end">
                      <svg width="52" height="52" viewBox="0 0 52 52">
                        <circle cx="26" cy="26" r="22" fill="none" stroke="#E6EDF4" strokeWidth="4"/>
                        <circle cx="26" cy="26" r="22" fill="none" stroke="#0F6E56" strokeWidth="4"
                          strokeDasharray={`${2 * Math.PI * 22 * 0.7} ${2 * Math.PI * 22 * 0.3}`}
                          strokeDashoffset={2 * Math.PI * 22 * 0.25}
                          strokeLinecap="round"/>
                        <text x="26" y="30" textAnchor="middle" fontSize="12" fontWeight="bold"
                              fill="#0F6E56">70%</text>
                      </svg>
                    </div>
                  </div>
                </div>
                {/* Boutons paiement */}
                <div className="flex gap-3">
                  <button className="flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm flex-1 justify-center"
                          style={{ background: '#F8FAFD', border: '2px solid #E6EDF4' }}>
                    <span className="text-orange-500 font-bold text-lg">↗</span>
                    <span className="font-bold" style={{ color: '#FF6600' }}>Orange</span>
                    <span style={{ color: '#1E2A3E' }}>Money</span>
                  </button>
                  <button className="flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm flex-1 justify-center"
                          style={{ background: '#F8FAFD', border: '2px solid #E6EDF4' }}>
                    <span className="text-yellow-400 font-bold text-lg">▶</span>
                    <span className="font-bold" style={{ color: '#FFCC00' }}>MTN</span>
                    <span style={{ color: '#1E2A3E' }}>Mobile Money</span>
                  </button>
                </div>
              </div>

              {/* Grille bas — Historique + Documents + Messagerie + Signalements */}
              <div className="grid grid-cols-2 gap-4">

                {/* Historique paiements */}
                <div className="bg-white rounded-xl p-4"
                     style={{ border: '1px solid #E6EDF4' }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm font-bold" style={{ color: '#1E2A3E' }}>
                      Historique paiements
                    </div>
                    <Link href="#" className="flex items-center gap-1 text-xs font-semibold"
                          style={{ color: '#0F6E56' }}>
                      <span className="w-4 h-4 rounded-full border-2 flex items-center justify-center text-xs"
                            style={{ borderColor: '#0F6E56', color: '#0F6E56' }}>↻</span>
                      Tout voir
                    </Link>
                  </div>
                  {[
                    { mois: 'Janvier 2026',   moyen: 'Orange Money',  date: '15/01/2026', mont: '85 000 XAF' },
                    { mois: 'Décembre 2025',  moyen: 'MTN Money',     date: '14/12/2025', mont: '85 000 XAF' },
                    { mois: 'Novembre 2025',  moyen: 'Orange Money',  date: '12/11/2025', mont: '85 000 XAF' },
                    { mois: 'Octobre 2025',   moyen: 'Orange Money',  date: '10/10/2025', mont: '85 000 XAF' },
                  ].map((p) => (
                    <div key={p.mois} className="flex items-center gap-3 py-2.5"
                         style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                           style={{ background: '#ECFDF5' }}>
                        <IconCheck size={12} style={{ color: '#0F6E56' }} />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold" style={{ color: '#1E2A3E' }}>{p.mois}</div>
                        <div className="text-xs" style={{ color: '#8A9BB0' }}>{p.moyen} · {p.date}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold" style={{ color: '#0F6E56' }}>{p.mont}</div>
                        <div className="text-xs flex items-center gap-1 justify-end"
                             style={{ color: '#0F6E56' }}>
                          <IconDownload size={10} />Quittance
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Mes documents */}
                <div className="bg-white rounded-xl p-4"
                     style={{ border: '1px solid #E6EDF4' }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm font-bold" style={{ color: '#1E2A3E' }}>Mes documents</div>
                    <Link href="#" className="flex items-center gap-1 text-xs font-semibold"
                          style={{ color: '#0F6E56' }}>
                      <span className="w-4 h-4 rounded-full border-2 flex items-center justify-center"
                            style={{ borderColor: '#0F6E56' }}>↻</span>
                      Tout voir
                    </Link>
                  </div>
                  {[
                    { ico: '📄', title: 'Contrat de bail',         sub: 'Signé le 28 jan. 2026' },
                    { ico: '🧾', title: 'Quittance — Janv. 2026',  sub: 'Émise le 15 jan. 2026' },
                    { ico: '📋', title: 'Attestation de location', sub: 'Émise le 01 fév. 2026' },
                    { ico: '🔑', title: "État des lieux — Entrée", sub: '' },
                  ].map((d) => (
                    <div key={d.title}
                      className="flex items-center gap-3 py-2.5 cursor-pointer hover:bg-gray-50 -mx-4 px-4"
                      style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                           style={{ background: '#F1F5F9' }}>
                        {d.ico}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold" style={{ color: '#1E2A3E' }}>{d.title}</div>
                        {d.sub && <div className="text-xs" style={{ color: '#8A9BB0' }}>{d.sub}</div>}
                      </div>
                      <IconDownload size={14} style={{ color: '#8A9BB0' }} />
                    </div>
                  ))}
                </div>

                {/* Messagerie */}
                <div className="bg-white rounded-xl p-4"
                     style={{ border: '1px solid #E6EDF4' }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm font-bold" style={{ color: '#1E2A3E' }}>Messagerie</div>
                    <Link href="#" className="flex items-center gap-1 text-xs font-semibold"
                          style={{ color: '#0F6E56' }}>
                      <span className="w-4 h-4 rounded-full border-2 flex items-center justify-center"
                            style={{ borderColor: '#0F6E56' }}>↻</span>
                      Voir tout
                    </Link>
                  </div>
                  {[
                    { msg: 'Le technicien passera demain matin à 10h pour...', time: 'Il y a 2h',   unread: true },
                    { msg: "Votre relevé d'index eau de décembre est disponible", time: 'Hier 14:30', unread: true },
                    { msg: 'Bienvenue dans votre nouvel appartement !',          time: '12 jan. 2026', unread: false },
                  ].map((m, i) => (
                    <div key={i} className="flex gap-3 py-2.5 cursor-pointer"
                         style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white flex-shrink-0"
                           style={{ background: '#1A3C5E' }}>KV</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold mb-0.5" style={{ color: '#1E2A3E' }}>
                          Kenmatio Vicens (propriétaire)
                        </div>
                        <div className="text-xs truncate" style={{ color: '#8A9BB0' }}>{m.msg}</div>
                        <div className="text-xs mt-0.5" style={{ color: '#8A9BB0' }}>{m.time}</div>
                      </div>
                      {m.unread && (
                        <div className="w-2 h-2 rounded-full mt-1 flex-shrink-0"
                             style={{ background: '#0F6E56' }} />
                      )}
                    </div>
                  ))}
                </div>

                {/* Signalements */}
                <div className="bg-white rounded-xl p-4"
                     style={{ border: '1px solid #E6EDF4' }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm font-bold" style={{ color: '#1E2A3E' }}>Signalements</div>
                  </div>
                  {[
                    { title: 'Panne électrique',    date: 'Déclaré le 13 jan. 2026',
                      statut: 'En cours', col: '#C55A11', bg: '#FFFBEB', dot: '#C55A11' },
                    { title: 'Fuite d\'eau — cuisine', date: 'Résolu le 05 jan. 2026',
                      statut: 'Résolu', col: '#0F6E56', bg: '#ECFDF5', dot: '#0F6E56' },
                  ].map((s) => (
                    <div key={s.title} className="flex items-center gap-3 py-2.5"
                         style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                           style={{ background: s.dot }} />
                      <div className="flex-1">
                        <div className="text-sm font-semibold" style={{ color: '#1E2A3E' }}>{s.title}</div>
                        <div className="text-xs" style={{ color: '#8A9BB0' }}>{s.date}</div>
                      </div>
                      <span className="text-xs font-semibold px-2 py-1 rounded-full"
                            style={{ background: s.bg, color: s.col }}>{s.statut}</span>
                    </div>
                  ))}
                  <button className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all"
                          style={{ background: '#F8FAFD', border: '1.5px dashed #E6EDF4', color: '#5B6E8C' }}>
                    <IconPlus size={15} />Déclarer une nouvelle panne
                  </button>
                </div>

              </div>
            </div>

            {/* ── Panneau droit ── */}
            <div className="w-64 flex-shrink-0 overflow-y-auto bg-white"
                 style={{ borderLeft: '1px solid #E6EDF4' }}>

              {/* Détail prochain paiement */}
              <div className="p-4" style={{ background: '#0A3D2E' }}>
                <div className="text-xs font-bold uppercase tracking-wider mb-3"
                     style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Détail du prochain paiement
                </div>
                {[
                  { lbl: 'Loyer mensuel',       val: '85 000 XAF',  col: '#fff' },
                  { lbl: 'Eau (12.5 m³)',        val: '3 125 XAF',   col: '#fff' },
                  { lbl: 'Électricité (48 kWh)', val: '4 800 XAF',   col: '#fff' },
                  { lbl: 'Total',                val: '92 925 XAF',  col: '#4ADE80', bold: true },
                ].map((r) => (
                  <div key={r.lbl}
                    className="flex items-center justify-between py-2"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                    <span className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>{r.lbl}</span>
                    <span className="text-sm font-bold" style={{ color: r.col,
                      fontWeight: r.bold ? 700 : 600 }}>{r.val}</span>
                  </div>
                ))}
              </div>

              <div className="p-4">

                {/* Résumé année */}
                <div className="text-xs font-bold uppercase tracking-wider mb-3"
                     style={{ color: '#8A9BB0' }}>Résumé de l&apos;année</div>

                <div className="flex flex-col gap-2 mb-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{ color: '#5B6E8C' }}>Paiements effectués</span>
                      <span className="font-semibold" style={{ color: '#0F6E56' }}>4/5</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: '#E6EDF4' }}>
                      <div className="h-full rounded-full" style={{ width: '80%', background: '#0F6E56' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{ color: '#5B6E8C' }}>Mois sans retard</span>
                      <span className="font-semibold" style={{ color: '#0F6E56' }}>4/4</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: '#E6EDF4' }}>
                      <div className="h-full rounded-full" style={{ width: '100%', background: '#0F6E56' }} />
                    </div>
                  </div>
                  <div className="mt-1 pt-3" style={{ borderTop: '1px solid #E6EDF4' }}>
                    <div className="text-xs mb-1" style={{ color: '#8A9BB0' }}>Total payé (2026)</div>
                    <div className="text-xl font-bold" style={{ color: '#1E2A3E' }}>340 000 XAF</div>
                  </div>
                </div>

                {/* Notifications */}
                <div className="text-xs font-bold uppercase tracking-wider mb-2"
                     style={{ color: '#8A9BB0' }}>Notifications</div>
                {[
                  { ico: <IconCheck size={13} />,        bg: '#ECFDF5', col: '#0F6E56',
                    title: 'Paiement confirmé', sub: '85 000 XAF · il y a 5h' },
                  { ico: <IconAlertTriangle size={13} />, bg: '#FFFBEB', col: '#C55A11',
                    title: 'Signalement en cours', sub: 'Panne élec. · il y a 2h' },
                  { ico: <IconMessage size={13} />,      bg: '#EEF4FA', col: '#2E75B6',
                    title: 'Nouveau message', sub: 'Propriétaire · il y a 2h' },
                  { ico: <IconFileText size={13} />,     bg: '#F5F3FF', col: '#6D28D9',
                    title: 'Quittance disponible', sub: 'Janv. 2026 · hier' },
                ].map((n, i) => (
                  <div key={i} className="flex gap-2 py-2.5"
                       style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                         style={{ background: n.bg }}>
                      <span style={{ color: n.col }}>{n.ico}</span>
                    </div>
                    <div>
                      <div className="text-xs font-semibold" style={{ color: '#1E2A3E' }}>{n.title}</div>
                      <div className="text-xs" style={{ color: '#8A9BB0' }}>{n.sub}</div>
                    </div>
                  </div>
                ))}

                {/* Rappel loyer */}
                <div className="mt-4 rounded-xl p-3 flex items-center gap-3"
                     style={{ background: '#ECFDF5', border: '1px solid #A7F3D0' }}>
                  <IconBell size={18} style={{ color: '#0F6E56' }} />
                  <div>
                    <div className="text-xs font-semibold" style={{ color: '#0F6E56' }}>
                      Prochain loyer dans
                    </div>
                    <div className="text-xl font-bold" style={{ color: '#0F6E56' }}>5 jours</div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}