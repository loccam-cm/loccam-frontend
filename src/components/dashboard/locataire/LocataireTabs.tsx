'use client'

import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { LocataireSkeleton } from '@/components/dashboard/locataire/LocataireSkeleton'
import { LocataireDashboardData } from '@/types/locataire'
import { Contrat, Paiement, Message } from '@/types'
import {
  IconCreditCard, IconFileText, IconMessage, IconTool,
  IconCircleCheck, IconAlertCircle, IconDownload, IconShieldCheck,
  IconHome2, IconPlus, IconChevronRight,
} from '@tabler/icons-react'

const listItem = {
  hidden: { opacity: 0, x: -10 },
  visible: (i = 0) => ({ opacity: 1, x: 0, transition: { delay: i * 0.05, duration: 0.3 } }),
}

type TabKey = 'paiements' | 'documents' | 'messages' | 'signalements'

interface Props {
  activeTab: TabKey
  onTabChange: (tab: TabKey) => void
  data: LocataireDashboardData | null
  loading: boolean
  contrat: Contrat | null
}

export function LocataireTabs({ activeTab, onTabChange, data, loading, contrat }: Props) {
  const tabs = [
    { key: 'paiements'    as const, label: 'Paiements',    icon: <IconCreditCard size={13}/> },
    { key: 'documents'    as const, label: 'Documents',    icon: <IconFileText size={13}/> },
    { key: 'messages'     as const, label: 'Messages',     icon: <IconMessage size={13}/> },
    { key: 'signalements' as const, label: 'Signalements', icon: <IconTool size={13}/> },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.21, duration: 0.4, ease: 'easeOut' }}
      className="bg-white rounded-2xl overflow-hidden"
      style={{ border: '1px solid #D1FAE5', boxShadow: '0 2px 8px rgba(5,150,105,.05)' }}>

      {/* Headers */}
      <div className="flex overflow-x-auto" style={{ borderBottom: '1px solid #F0FDF4' }}>
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => onTabChange(tab.key)}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-3 text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0"
            style={activeTab === tab.key
              ? { color: '#059669', borderBottom: '2px solid #059669', background: '#F0FDF4' }
              : { color: '#64748B', borderBottom: '2px solid transparent' }}>
            <span style={{ color: activeTab === tab.key ? '#059669' : '#94A3B8' }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeTab}
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>

          {/* ── PAIEMENTS ── */}
          {activeTab === 'paiements' && (
            <div className="p-4">
              {loading ? Array(3).fill(0).map((_,i) => (
                <div key={i} className="flex gap-3 py-3" style={{ borderBottom: '1px solid #F8FAFC' }}>
                  <LocataireSkeleton className="w-8 h-8 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-2"><LocataireSkeleton className="h-3 w-28" /><LocataireSkeleton className="h-3 w-20" /></div>
                  <LocataireSkeleton className="h-4 w-20 flex-shrink-0" />
                </div>
              )) : (data?.paiements ?? []).length === 0 ? (
                <div className="py-10 text-center">
                  <IconCreditCard size={32} style={{ color: '#A7F3D0', margin: '0 auto 8px' }} />
                  <p className="text-sm font-medium" style={{ color: '#64748B' }}>Aucun paiement</p>
                  <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>Vos paiements apparaîtront ici</p>
                </div>
              ) : (data?.paiements ?? []).map((p, i) => {
                const ok = p.statut === 'confirme'
                return (
                  <motion.div key={p.id} variants={listItem} initial="hidden" animate="visible" custom={i}
                    className="flex items-center gap-3 py-3 row-hover cursor-pointer -mx-4 px-4"
                    style={{ borderBottom: '1px solid #F8FAFC' }}>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                         style={{ background: ok ? '#ECFDF5' : '#FEF2F2' }}>
                      {ok ? <IconCircleCheck size={16} style={{ color: '#059669' }}/> : <IconAlertCircle size={16} style={{ color: '#DC2626' }}/>}
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
                          <IconDownload size={10} /><span className="text-xs">Quittance</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
              <Link href="/locataire/paiement" style={{ textDecoration: 'none' }}>
                <div className="flex items-center justify-center gap-1 pt-3 text-xs font-semibold" style={{ color: '#059669' }}>
                  Voir tout l&apos;historique <IconChevronRight size={12}/>
                </div>
              </Link>
            </div>
          )}

          {/* ── DOCUMENTS ── */}
          {activeTab === 'documents' && (
            <div className="p-4">
              {[
                { ico: <IconFileText size={15}/>,   bg: '#ECFDF5', col: '#059669', title: 'Contrat de bail',          sub: contrat ? `Signé le ${new Date(contrat.date_debut).toLocaleDateString('fr-FR')}` : 'Non disponible', url: (contrat as any)?.pdf_url },
                { ico: <IconFileText size={15}/>,   bg: '#EFF6FF', col: '#2563EB', title: 'Quittances',               sub: `${data?.paiementsEffectues ?? 0} disponible(s)`, url: null },
                { ico: <IconShieldCheck size={15}/>, bg: '#F5F3FF', col: '#7C3AED', title: 'Attestation de location', sub: 'Sur demande', url: null },
                { ico: <IconHome2 size={15}/>,      bg: '#FFFBEB', col: '#D97706', title: "État des lieux — Entrée",  sub: 'Document signé', url: null },
              ].map((d, i) => (
                <motion.div key={d.title} variants={listItem} initial="hidden" animate="visible" custom={i}
                  className="flex items-center gap-3 py-3 row-hover cursor-pointer -mx-4 px-4"
                  style={{ borderBottom: '1px solid #F8FAFC' }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: d.bg }}>
                    <span style={{ color: d.col }}>{d.ico}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold" style={{ color: '#0F172A' }}>{d.title}</div>
                    <div className="text-xs" style={{ color: '#94A3B8' }}>{d.sub}</div>
                  </div>
                  {d.url ? (
                    <a href={d.url} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg" style={{ background: '#ECFDF5' }}>
                      <IconDownload size={14} style={{ color: '#059669' }} />
                    </a>
                  ) : (
                    <div className="p-1.5 rounded-lg" style={{ background: '#F1F5F9' }}>
                      <IconDownload size={14} style={{ color: '#CBD5E1' }} />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}

          {/* ── MESSAGES ── */}
          {activeTab === 'messages' && (
            <div className="p-4">
              {loading ? Array(3).fill(0).map((_,i) => (
                <div key={i} className="flex gap-3 py-3">
                  <LocataireSkeleton className="w-8 h-8 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-2"><LocataireSkeleton className="h-3 w-32" /><LocataireSkeleton className="h-3 w-48" /></div>
                </div>
              )) : (data?.messages ?? []).length === 0 ? (
                <div className="py-10 text-center">
                  <IconMessage size={32} style={{ color: '#A7F3D0', margin: '0 auto 8px' }} />
                  <p className="text-sm" style={{ color: '#64748B' }}>Aucun message</p>
                </div>
              ) : (data?.messages ?? []).map((m, i) => (
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
              <Link href="/locataire/messagerie" style={{ textDecoration: 'none' }}>
                <div className="flex items-center justify-center gap-1 pt-3 text-xs font-semibold" style={{ color: '#059669' }}>
                  Ouvrir la messagerie <IconChevronRight size={12}/>
                </div>
              </Link>
            </div>
          )}

          {/* ── SIGNALEMENTS ── */}
          {activeTab === 'signalements' && (
            <div className="p-4">
              {(data?.signalements ?? []).length === 0 && !loading ? (
                <div className="py-8 text-center">
                  <IconTool size={28} style={{ color: '#A7F3D0', margin: '0 auto 8px' }} />
                  <p className="text-sm" style={{ color: '#64748B' }}>Aucun signalement</p>
                </div>
              ) : (data?.signalements ?? []).map((s, i) => {
                const open = s.statut === 'ouvert' || s.statut === 'en_cours'
                return (
                  <motion.div key={s.id} variants={listItem} initial="hidden" animate="visible" custom={i}
                    className="flex items-center gap-3 py-3 -mx-4 px-4"
                    style={{ borderBottom: '1px solid #F8FAFC' }}>
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 pulse"
                         style={{ background: open ? '#D97706' : '#059669' }} />
                    <div className="flex-1 min-w-0">
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
              <Link href="/locataire/signalements" style={{ textDecoration: 'none' }}>
                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                  className="mt-3 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold cursor-pointer"
                  style={{ background: '#F0FDF4', border: '1.5px dashed #A7F3D0', color: '#059669' }}>
                  <IconPlus size={14} />Déclarer une panne
                </motion.div>
              </Link>
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}
