'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import api from '@/lib/api'
import { Contrat, PaginatedResponse } from '@/types'
import {
  IconFileText, IconArrowLeft, IconRefresh,
  IconHome2, IconMapPin, IconCalendar, IconCreditCard,
  IconShieldCheck, IconDownload, IconCheck,
  IconAlertCircle, IconUser, IconBuilding,
  IconClockHour4, IconCircleCheck, IconBan,
  IconChevronDown, IconChevronUp, IconBuildingSkyscraper,
} from '@tabler/icons-react'

// ── Badge statut ──────────────────────────────────────────────
function StatutBadge({ statut }: { statut: string }) {
  const map: Record<string, { bg: string; col: string; lbl: string; ico: React.ReactNode }> = {
    actif:      { bg:'#ECFDF5', col:'#059669', lbl:'Actif',      ico:<IconCircleCheck size={12}/> },
    termine:    { bg:'#F1F5F9', col:'#64748B', lbl:'Terminé',    ico:<IconBan size={12}/> },
    resilie:    { bg:'#FEF2F2', col:'#DC2626', lbl:'Résilié',    ico:<IconBan size={12}/> },
    en_attente: { bg:'#FFFBEB', col:'#D97706', lbl:'En attente', ico:<IconClockHour4 size={12}/> },
  }
  const s = map[statut] ?? { bg:'#F1F5F9', col:'#64748B', lbl:statut, ico:null }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
          style={{ background:s.bg, color:s.col }}>
      {s.ico}{s.lbl}
    </span>
  )
}

// ── Section accordéon ─────────────────────────────────────────
function Section({ title, icon, children, defaultOpen = true }: {
  title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <motion.div layout className="bg-white rounded-2xl overflow-hidden"
                style={{ border:'1px solid #E2E8F0' }}>
      <button onClick={() => setOpen(!open)}
              className="w-full flex items-center gap-3 px-5 py-4 text-left"
              style={{ borderBottom: open ? '1px solid #F1F5F9' : 'none' }}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
             style={{ background:'#F0FDF4', color:'#059669' }}>
          {icon}
        </div>
        <span className="flex-1 text-sm font-bold" style={{ color:'#0F172A' }}>{title}</span>
        {open
          ? <IconChevronUp size={16} style={{ color:'#94A3B8' }} />
          : <IconChevronDown size={16} style={{ color:'#94A3B8' }} />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }}
                      exit={{ height:0, opacity:0 }} transition={{ duration:.22, ease:'easeInOut' }}>
            <div className="px-5 py-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Ligne info ────────────────────────────────────────────────
function InfoRow({ label, value, valueColor }: { label: string; value: React.ReactNode; valueColor?: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3"
         style={{ borderBottom:'1px solid #F8FAFC' }}>
      <span className="text-xs flex-shrink-0" style={{ color:'#94A3B8', paddingTop:'1px' }}>{label}</span>
      <span className="text-sm font-semibold text-right" style={{ color: valueColor ?? '#0F172A' }}>
        {value}
      </span>
    </div>
  )
}

// ────────────────────────────────────────────────────────────
export default function LocataireContratPage() {
  const { user } = useAuth()
  const [contrat, setContrat] = useState<Contrat | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(false)

  useEffect(() => { if (user) load() }, [user])

  const load = async () => {
    setLoading(true); setError(false)
    try {
      const res = await api.get<PaginatedResponse<Contrat>>('/contrats/')
      const actif = res.data.results.find(c => c.statut === 'actif')
        ?? res.data.results[0]
        ?? null
      setContrat(actif)
    } catch { setError(true) } finally { setLoading(false) }
  }

  if (!user) return null

  const bien       = contrat?.bien
  const bailleur   = contrat?.bailleur
  const dateDebut  = contrat?.date_debut  ? new Date(contrat.date_debut) : null
  const dateFin    = contrat?.date_fin    ? new Date(contrat.date_fin)   : null
  const maintenant = new Date()

  // Progression du bail (jours écoulés / durée totale)
  const bailPct = dateDebut && dateFin
    ? Math.min(Math.round(((maintenant.getTime() - dateDebut.getTime()) / (dateFin.getTime() - dateDebut.getTime())) * 100), 100)
    : dateDebut
      ? Math.min(Math.round(((maintenant.getTime() - dateDebut.getTime()) / (365 * 24 * 3600 * 1000)) * 100), 100)
      : 0

  const joursRestants = dateFin
    ? Math.max(0, Math.ceil((dateFin.getTime() - maintenant.getTime()) / (24 * 3600 * 1000)))
    : null

  return (
    <>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        .fade-up{animation:fadeUp .4s ease both}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:#D1FAE5;border-radius:4px}
      `}</style>

      <div className="min-h-screen" style={{ background:'#F0FDF4', fontFamily:"'DM Sans','Helvetica Neue',sans-serif" }}>

        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center gap-3 px-4 sm:px-6 h-14 sm:h-16 bg-white"
                style={{ borderBottom:'1px solid #D1FAE5', boxShadow:'0 1px 4px rgba(5,150,105,.05)' }}>
          <Link href="/locataire" className="flex items-center gap-1.5 text-sm font-medium flex-shrink-0"
                style={{ color:'#64748B', textDecoration:'none' }}>
            <IconArrowLeft size={16} />
            <span className="hidden sm:inline">Tableau de bord</span>
          </Link>
          <div className="h-5 w-px flex-shrink-0" style={{ background:'#D1FAE5' }} />
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <IconFileText size={17} style={{ color:'#059669', flexShrink:0 }} />
            <h1 className="text-sm font-bold truncate" style={{ color:'#0F172A' }}>Mon contrat</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={load}
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background:'#F0FDF4', border:'1px solid #D1FAE5' }}>
              <IconRefresh size={15} style={{ color:'#059669', animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            </button>
            {contrat && (
              <button className="hidden sm:flex items-center gap-2 px-3 h-9 rounded-xl text-xs font-bold"
                      style={{ background:'linear-gradient(135deg,#059669,#047857)', color:'#fff', boxShadow:'0 2px 8px rgba(5,150,105,.3)' }}>
                <IconDownload size={14} />Télécharger PDF
              </button>
            )}
          </div>
        </header>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-5 sm:py-6 space-y-4">

          {/* ── LOADING ─────────────────────────────────────── */}
          {loading && (
            <div className="space-y-4">
              {[120, 200, 180, 160].map((h, i) => (
                <div key={i} className="rounded-2xl" style={{ height:`${h}px`, background:'linear-gradient(90deg,#D1FAE5 25%,#ECFDF5 50%,#D1FAE5 75%)', backgroundSize:'200% 100%', animation:'shimmer 1.5s infinite' }} />
              ))}
            </div>
          )}

          {/* ── ERREUR ──────────────────────────────────────── */}
          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
                   style={{ background:'#FEF2F2' }}>
                <IconAlertCircle size={26} style={{ color:'#EF4444' }} />
              </div>
              <h3 className="text-sm font-bold mb-1" style={{ color:'#0F172A' }}>Erreur de chargement</h3>
              <p className="text-xs mb-4" style={{ color:'#94A3B8' }}>Impossible de récupérer votre contrat</p>
              <button onClick={load}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white"
                style={{ background:'#059669' }}>
                <IconRefresh size={14} />Réessayer
              </button>
            </div>
          )}

          {/* ── AUCUN CONTRAT ───────────────────────────────── */}
          {!loading && !error && !contrat && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                   style={{ background:'#ECFDF5' }}>
                <IconFileText size={28} style={{ color:'#6EE7B7' }} />
              </div>
              <h3 className="text-base font-bold mb-2" style={{ color:'#0F172A' }}>Aucun contrat actif</h3>
              <p className="text-sm" style={{ color:'#64748B', maxWidth:'280px', lineHeight:1.6 }}>
                Vous n&apos;avez pas encore de contrat de bail. Votre bailleur vous enverra une invitation.
              </p>
            </div>
          )}

          {/* ── CONTRAT ─────────────────────────────────────── */}
          {!loading && contrat && (
            <>
              {/* Hero — statut + logement */}
              <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
                transition={{ duration:.45 }}
                className="rounded-2xl overflow-hidden"
                style={{ border:'1px solid rgba(255,255,255,.1)' }}>

                {/* Bandeau vert */}
                <div className="p-5 relative overflow-hidden"
                     style={{ background:'linear-gradient(135deg,#064E3B 0%,#059669 55%,#10B981 100%)' }}>
                  <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-10"
                       style={{ background:'radial-gradient(circle,#A7F3D0,transparent)' }} />

                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <StatutBadge statut={contrat.statut} />
                      <span className="text-xs font-mono" style={{ color:'rgba(255,255,255,.45)' }}>
                        #{contrat.id}
                      </span>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                           style={{ background:'rgba(255,255,255,.12)' }}>
                        <IconHome2 size={24} color="white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className="text-white font-bold text-base sm:text-lg mb-0.5 truncate">
                          {bien?.titre ?? 'Logement'}
                        </h2>
                        {bien?.adresse && (
                          <div className="flex items-center gap-1.5 mb-3"
                               style={{ color:'rgba(255,255,255,.6)' }}>
                            <IconMapPin size={12} />
                            <span className="text-sm truncate">{bien.adresse}</span>
                          </div>
                        )}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {[
                            { lbl:'Loyer mensuel', val: contrat.loyer_mensuel ? `${contrat.loyer_mensuel.toLocaleString('fr-FR')} XAF` : '—' },
                            { lbl:'Caution', val: contrat.caution ? `${contrat.caution.toLocaleString('fr-FR')} XAF` : '—' },
                            { lbl:"Entrée", val: dateDebut ? dateDebut.toLocaleDateString('fr-FR', { day:'numeric', month:'short', year:'numeric' }) : '—' },
                          ].map(s => (
                            <div key={s.lbl}>
                              <div className="text-xs mb-0.5" style={{ color:'rgba(255,255,255,.4)' }}>{s.lbl}</div>
                              <div className="text-sm font-bold text-white">{s.val}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Barre progression bail */}
                {dateDebut && (
                  <div className="px-5 py-4 bg-white">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span style={{ color:'#94A3B8' }}>
                        {dateDebut.toLocaleDateString('fr-FR', { day:'numeric', month:'short', year:'numeric' })}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold" style={{ color:'#059669' }}>{bailPct}%</span>
                        <span style={{ color:'#94A3B8' }}>du bail écoulé</span>
                      </div>
                      <span style={{ color:'#94A3B8' }}>
                        {dateFin
                          ? dateFin.toLocaleDateString('fr-FR', { day:'numeric', month:'short', year:'numeric' })
                          : 'Indéterminée'}
                      </span>
                    </div>
                    <div className="h-2.5 rounded-full overflow-hidden" style={{ background:'#E2E8F0' }}>
                      <motion.div className="h-full rounded-full"
                        initial={{ width:0 }}
                        animate={{ width:`${bailPct}%` }}
                        transition={{ duration:1, ease:'easeOut', delay:.3 }}
                        style={{ background:'linear-gradient(90deg,#059669,#10B981)' }} />
                    </div>
                    {joursRestants !== null && (
                      <div className="flex justify-end mt-1.5">
                        <span className="text-xs font-semibold" style={{ color: joursRestants < 30 ? '#DC2626' : '#64748B' }}>
                          {joursRestants === 0 ? 'Bail expiré' : `${joursRestants} jour${joursRestants > 1 ? 's' : ''} restant${joursRestants > 1 ? 's' : ''}`}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>

              {/* Sections accordéon */}

              {/* Conditions financières */}
              <div className="fade-up" style={{ animationDelay:'.1s' }}>
                <Section title="Conditions financières" icon={<IconCreditCard size={16}/>}>
                  <InfoRow label="Loyer mensuel"
                           value={contrat.loyer_mensuel ? `${contrat.loyer_mensuel.toLocaleString('fr-FR')} XAF` : '—'}
                           valueColor="#059669" />
                  <InfoRow label="Caution versée"
                           value={contrat.caution ? `${contrat.caution.toLocaleString('fr-FR')} XAF` : '—'} />
                  <InfoRow label="Jour d'échéance"
                           value={contrat.jour_echeance ? `Le ${contrat.jour_echeance} de chaque mois` : '—'} />
                  <InfoRow label="Charges eau" value="Selon relevé mensuel" />
                  <InfoRow label="Charges électricité" value="Selon relevé mensuel" />
                  {/* Total estimé */}
                  <div className="mt-3 p-3 rounded-xl" style={{ background:'#ECFDF5', border:'1px solid #A7F3D0' }}>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold" style={{ color:'#059669' }}>Loyer de base</span>
                      <span className="text-sm font-bold" style={{ color:'#059669' }}>
                        {contrat.loyer_mensuel ? `${contrat.loyer_mensuel.toLocaleString('fr-FR')} XAF` : '—'}
                      </span>
                    </div>
                  </div>
                </Section>
              </div>

              {/* Durée du bail */}
              <div className="fade-up" style={{ animationDelay:'.15s' }}>
                <Section title="Durée du bail" icon={<IconCalendar size={16}/>}>
                  <InfoRow label="Date d'entrée"
                           value={dateDebut ? dateDebut.toLocaleDateString('fr-FR', { day:'numeric', month:'long', year:'numeric' }) : '—'} />
                  <InfoRow label="Date de fin"
                           value={dateFin ? dateFin.toLocaleDateString('fr-FR', { day:'numeric', month:'long', year:'numeric' }) : 'Bail sans terme fixe'} />
                  <InfoRow label="Durée totale"
                           value={dateDebut && dateFin
                             ? `${Math.round((dateFin.getTime() - dateDebut.getTime()) / (30 * 24 * 3600 * 1000))} mois`
                             : 'Indéterminée'} />
                  {contrat.signe_locataire !== undefined && (
                    <InfoRow label="Signature locataire"
                             value={contrat.signe_locataire ? 'Signé' : 'En attente'}
                             valueColor={contrat.signe_locataire ? '#059669' : '#D97706'} />
                  )}
                  {contrat.signe_bailleur !== undefined && (
                    <InfoRow label="Signature bailleur"
                             value={contrat.signe_bailleur ? 'Signé' : 'En attente'}
                             valueColor={contrat.signe_bailleur ? '#059669' : '#D97706'} />
                  )}
                </Section>
              </div>

              {/* Logement */}
              {bien && (
                <div className="fade-up" style={{ animationDelay:'.2s' }}>
                  <Section title="Détails du logement" icon={<IconBuildingSkyscraper size={16}/>}>
                    <InfoRow label="Type" value={bien.type_bien ?? '—'} />
                    {bien.surface && <InfoRow label="Surface" value={`${bien.surface} m²`} />}
                    {bien.nb_pieces && <InfoRow label="Nombre de pièces" value={bien.nb_pieces.toString()} />}
                    {bien.nb_chambres && <InfoRow label="Chambres" value={bien.nb_chambres.toString()} />}
                    {bien.etage !== undefined && bien.etage !== null && (
                      <InfoRow label="Étage" value={bien.etage === 0 ? 'RDC' : `${bien.etage}ème étage`} />
                    )}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {bien.meuble && (
                        <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-full"
                              style={{ background:'#ECFDF5', color:'#059669' }}>
                          <IconCheck size={11}/>Meublé
                        </span>
                      )}
                      {bien.eau_incluse && (
                        <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-full"
                              style={{ background:'#EFF6FF', color:'#2563EB' }}>
                          <IconCheck size={11}/>Eau incluse
                        </span>
                      )}
                      {bien.elec_incluse && (
                        <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-full"
                              style={{ background:'#FFFBEB', color:'#D97706' }}>
                          <IconCheck size={11}/>Électricité incluse
                        </span>
                      )}
                    </div>
                  </Section>
                </div>
              )}

              {/* Bailleur */}
              {bailleur && (
                <div className="fade-up" style={{ animationDelay:'.25s' }}>
                  <Section title="Votre propriétaire" icon={<IconUser size={16}/>}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-base text-white flex-shrink-0"
                           style={{ background:'linear-gradient(135deg,#1E3A5F,#2563EB)' }}>
                        {bailleur.prenom?.[0]}{bailleur.nom?.[0]}
                      </div>
                      <div>
                        <div className="text-sm font-bold" style={{ color:'#0F172A' }}>{bailleur.nom_complet}</div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <IconShieldCheck size={12} style={{ color:'#059669' }} />
                          <span className="text-xs font-medium" style={{ color:'#059669' }}>
                            {bailleur.cni_statut === 'valide' ? 'CNI vérifiée' : 'CNI en cours de vérification'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <InfoRow label="Email" value={bailleur.email} />
                    {bailleur.telephone && <InfoRow label="Téléphone" value={bailleur.telephone} />}
                  </Section>
                </div>
              )}

              {/* Notes */}
              {contrat.notes && (
                <div className="fade-up" style={{ animationDelay:'.3s' }}>
                  <Section title="Clauses et notes" icon={<IconFileText size={16}/>} defaultOpen={false}>
                    <p className="text-sm leading-relaxed" style={{ color:'#475569' }}>
                      {contrat.notes}
                    </p>
                  </Section>
                </div>
              )}

              {/* Signatures */}
              <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
                transition={{ delay:.35 }}
                className="bg-white rounded-2xl p-5"
                style={{ border:'1px solid #E2E8F0' }}>
                <div className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color:'#94A3B8' }}>
                  État des signatures
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { lbl:'Bailleur', signed: contrat.signe_bailleur, nom: bailleur?.nom_complet },
                    { lbl:'Locataire', signed: contrat.signe_locataire, nom: user.nom_complet },
                  ].map(s => (
                    <div key={s.lbl} className="rounded-xl p-3.5 flex items-center gap-3"
                         style={{ background: s.signed ? '#ECFDF5' : '#F8FAFC', border:`1px solid ${s.signed ? '#A7F3D0' : '#E2E8F0'}` }}>
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                           style={{ background: s.signed ? '#059669' : '#E2E8F0' }}>
                        {s.signed
                          ? <IconCheck size={15} color="white" />
                          : <IconClockHour4 size={15} style={{ color:'#94A3B8' }} />}
                      </div>
                      <div>
                        <div className="text-xs font-semibold" style={{ color: s.signed ? '#059669' : '#94A3B8' }}>
                          {s.lbl}
                        </div>
                        <div className="text-xs truncate" style={{ color:'#94A3B8' }}>
                          {s.signed ? 'Signé' : 'En attente'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Actions */}
              <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
                transition={{ delay:.4 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-6">
                <button className="flex items-center justify-center gap-2.5 py-3.5 rounded-2xl text-sm font-bold text-white"
                        style={{ background:'linear-gradient(135deg,#059669,#047857)', boxShadow:'0 4px 14px rgba(5,150,105,.3)' }}>
                  <IconDownload size={17} />
                  Télécharger le contrat PDF
                </button>
                <Link href="/locataire/paiement"
                      className="flex items-center justify-center gap-2.5 py-3.5 rounded-2xl text-sm font-bold"
                      style={{ background:'#F0FDF4', border:'1.5px solid #A7F3D0', color:'#059669', textDecoration:'none' }}>
                  <IconCreditCard size={17} />
                  Payer mon loyer
                </Link>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
