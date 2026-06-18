'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import api from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import {
  IconDroplet, IconBolt, IconPlus, IconArrowLeft,
  IconBuilding, IconCalendar, IconCheck, IconLoader2,
  IconCalculator, IconX, IconHome2, IconChevronRight,
  IconBrandWhatsapp, IconRefresh, IconAlertCircle, IconFileText,
} from '@tabler/icons-react'

// ── Types ──────────────────────────────────────────────────
interface Structure { id: number; nom: string; type_structure: string; adresse: string }
interface Bien      { id: number; titre: string; adresse: string; statut: string; structure_id: number | null }

interface IndexConsommation {
  id: number
  bien: { id: number; titre: string }
  mois: number; annee: number
  index_eau: string; index_elec: string
  consommation_eau: string; consommation_elec: string
  date_saisie: string
}

interface CalcResult {
  consommation_eau: number; consommation_elec: number
  tarif_eau: number; tarif_elec: number
  montant_eau: number; montant_elec: number; total_charges: number
}

const MOIS_FR = ['','Janvier','Février','Mars','Avril','Mai','Juin',
                 'Juillet','Août','Septembre','Octobre','Novembre','Décembre']
const now = new Date()

// ── Step indicator ─────────────────────────────────────────
function Steps({ current }: { current: number }) {
  const steps = ['Structure', 'Bien', 'Index']
  return (
    <div className="flex items-center gap-0 mb-6">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center flex-1">
          <div className="flex flex-col items-center flex-1">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                 style={{ background: i < current ? '#059669' : i === current ? '#7C3AED' : '#E2E8F0', color: i <= current ? '#fff' : '#94A3B8' }}>
              {i < current ? <IconCheck size={14}/> : i + 1}
            </div>
            <span className="text-xs mt-1 font-medium"
                  style={{ color: i === current ? '#7C3AED' : i < current ? '#059669' : '#94A3B8' }}>
              {s}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className="h-0.5 flex-1 mb-5 mx-1 transition-all"
                 style={{ background: i < current ? '#059669' : '#E2E8F0' }} />
          )}
        </div>
      ))}
    </div>
  )
}

// ── Composant GroupesReleves ───────────────────────────────
function GroupesReleves({ releves, allBiens, structures, onWhatsApp }: {
  releves: IndexConsommation[]
  allBiens: Bien[]
  structures: Structure[]
  onWhatsApp: (r: IndexConsommation) => void
}) {
  const [ouvert, setOuvert] = useState<number | 'isole' | null>(null)

  const getStructureId = (bienId: number): number | null => {
    const bien = allBiens.find(b => b.id === bienId)
    return bien?.structure_id ?? null
  }

  // Grouper les relevés par structure
  const groupes: { key: number | 'isole'; label: string; adresse: string; releves: IndexConsommation[]; isStructure: boolean }[] = []

  structures.forEach(s => {
    const rel = releves.filter(r => getStructureId(r.bien.id) === s.id)
    if (rel.length > 0) groupes.push({ key: s.id, label: s.nom, adresse: s.adresse, releves: rel, isStructure: true })
  })

  const isoles = releves.filter(r => getStructureId(r.bien.id) === null)
  if (isoles.length > 0) groupes.push({ key: 'isole', label: 'Biens isolés', adresse: 'Sans structure', releves: isoles, isStructure: false })

  return (
    <div className="space-y-3">
      <p className="text-xs" style={{ color: '#94A3B8' }}>
        {releves.length} relevé{releves.length > 1 ? 's' : ''} · {groupes.length} groupe{groupes.length > 1 ? 's' : ''}
      </p>

      {groupes.map(groupe => {
        const isOpen = ouvert === groupe.key
        return (
          <motion.div key={String(groupe.key)} layout
            className="bg-white rounded-2xl overflow-hidden"
            style={{ border: '1px solid #E2E8F0' }}>

            {/* Header accordéon */}
            <button
              onClick={() => setOuvert(isOpen ? null : groupe.key)}
              className="w-full flex items-center gap-4 px-5 py-4 text-left transition-colors"
              style={{ background: isOpen ? '#F0F9FF' : '#fff' }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                   style={{ background: groupe.isStructure ? 'linear-gradient(135deg,#EFF6FF,#DBEAFE)' : '#F1F5F9', color: groupe.isStructure ? '#2563EB' : '#94A3B8' }}>
                {groupe.isStructure ? <IconBuilding size={20}/> : <IconHome2 size={20}/>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold truncate" style={{ color: '#0F172A' }}>{groupe.label}</div>
                <div className="text-xs mt-0.5 truncate" style={{ color: '#94A3B8' }}>{groupe.adresse}</div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                      style={{ background: isOpen ? '#DBEAFE' : '#F1F5F9', color: isOpen ? '#2563EB' : '#64748B' }}>
                  {groupe.releves.length} relevé{groupe.releves.length > 1 ? 's' : ''}
                </span>
                <motion.div animate={{ rotate: isOpen ? 90 : 0 }} transition={{ duration: .2 }}>
                  <IconChevronRight size={16} style={{ color: '#CBD5E1' }} />
                </motion.div>
              </div>
            </button>

            {/* Relevés */}
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: .25, ease: 'easeInOut' }}
                  className="overflow-hidden">
                  <div className="px-4 pb-4 pt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {groupe.releves.map((r, i) => (
                        <motion.div key={r.id}
                          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="rounded-2xl p-4"
                          style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>

                          <div className="flex items-start justify-between mb-3 gap-2">
                            <div className="min-w-0">
                              <div className="text-sm font-bold truncate" style={{ color: '#0F172A' }}>{r.bien.titre}</div>
                              <div className="flex items-center gap-1.5 mt-0.5" style={{ color: '#94A3B8' }}>
                                <IconCalendar size={11} />
                                <span className="text-xs">{MOIS_FR[r.mois]} {r.annee}</span>
                              </div>
                            </div>
                            <span className="flex-shrink-0 text-xs px-2 py-1 rounded-full font-bold"
                                  style={{ background: '#F0F9FF', color: '#0284C7', border: '1px solid #BAE6FD' }}>
                              #{r.id}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 mb-3">
                            <div className="rounded-xl p-2.5" style={{ background: '#F0F9FF' }}>
                              <div className="flex items-center gap-1 mb-1">
                                <IconDroplet size={11} style={{ color: '#0EA5E9' }} />
                                <span className="text-xs font-bold" style={{ color: '#0284C7' }}>EAU</span>
                              </div>
                              <div className="text-sm font-extrabold" style={{ color: '#0EA5E9' }}>
                                {parseFloat(r.consommation_eau).toFixed(1)} m³
                              </div>
                              <div className="text-xs" style={{ color: '#7DD3FC' }}>
                                Index : {parseFloat(r.index_eau).toFixed(1)}
                              </div>
                            </div>
                            <div className="rounded-xl p-2.5" style={{ background: '#FFFBEB' }}>
                              <div className="flex items-center gap-1 mb-1">
                                <IconBolt size={11} style={{ color: '#F59E0B' }} />
                                <span className="text-xs font-bold" style={{ color: '#D97706' }}>ÉLEC</span>
                              </div>
                              <div className="text-sm font-extrabold" style={{ color: '#F59E0B' }}>
                                {parseFloat(r.consommation_elec).toFixed(1)} kWh
                              </div>
                              <div className="text-xs" style={{ color: '#FCD34D' }}>
                                Index : {parseFloat(r.index_elec).toFixed(1)}
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => onWhatsApp(r)}
                            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold"
                            style={{ background: '#DCFCE7', color: '#16A34A', border: '1px solid #A7F3D0' }}>
                            <IconBrandWhatsapp size={13} />
                            Envoyer par WhatsApp
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )
      })}
    </div>
  )
}

// ── Page principale ────────────────────────────────────────
export default function RelevesPage() {
  const { user } = useAuth()
  const [structures, setStructures]   = useState<Structure[]>([])
  const [allBiens, setAllBiens]       = useState<Bien[]>([])
  const [releves, setReleves]         = useState<IndexConsommation[]>([])
  const [loading, setLoading]         = useState(true)
  const [showForm, setShowForm]       = useState(false)
  const [saving, setSaving]           = useState(false)
  const [calcResult, setCalcResult]   = useState<CalcResult | null>(null)
  const [calcLoading, setCalcLoading] = useState(false)

  const [step, setStep]                               = useState(0)
  const [selectedStructure, setSelectedStructure]     = useState<Structure | null>(null)
  const [selectedBien, setSelectedBien]               = useState<Bien | null>(null)
  const [isSansStructure, setIsSansStructure]         = useState(false)

  const [form, setForm] = useState({
    mois: now.getMonth() + 1, annee: now.getFullYear(),
    index_eau: '', index_elec: '', consommation_eau: '', consommation_elec: '',
  })

  const setF = (k: string, v: string | number) => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    try {
      const [structRes, biensRes, relevesRes] = await Promise.all([
        api.get('/structures/'),
        api.get('/biens/'),
        api.get('/index/'),
      ])
      setStructures(structRes.data.results ?? structRes.data)
      setAllBiens(biensRes.data.results ?? biensRes.data)
      setReleves(relevesRes.data.results ?? relevesRes.data)
    } catch { toast.error('Erreur de chargement') }
    finally { setLoading(false) }
  }

  const biensFiltres = isSansStructure
    ? allBiens.filter(b => !b.structure_id)
    : selectedStructure
      ? allBiens.filter(b => b.structure_id === selectedStructure.id)
      : []

  const calculerCharges = async () => {
    if (!selectedBien) return
    setCalcLoading(true)
    try {
      const res = await api.get(`/index/${selectedBien.id}/calcul/?mois=${form.mois}&annee=${form.annee}`)
      setCalcResult(res.data)
    } catch {
      toast.error('Aucun relevé trouvé ou tarifs non configurés.')
      setCalcResult(null)
    } finally { setCalcLoading(false) }
  }

  const handleSubmit = async () => {
    if (!selectedBien) return
    setSaving(true)
    try {
      await api.post('/index/', {
        bien: selectedBien.id, mois: form.mois, annee: form.annee,
        index_eau: parseFloat(form.index_eau) || 0,
        index_elec: parseFloat(form.index_elec) || 0,
        consommation_eau: parseFloat(form.consommation_eau) || 0,
        consommation_elec: parseFloat(form.consommation_elec) || 0,
      })
      toast.success('Relevé enregistré !')
      resetForm()
      load()
    } catch (err: unknown) {
      const e = err as { response?: { data?: Record<string, string[]> } }
      const msg = e.response?.data ? Object.values(e.response.data).flat()[0] : 'Erreur.'
      toast.error(String(msg))
    } finally { setSaving(false) }
  }

  const resetForm = () => {
    setStep(0); setSelectedStructure(null); setSelectedBien(null)
    setIsSansStructure(false); setCalcResult(null)
    setForm({ mois: now.getMonth() + 1, annee: now.getFullYear(), index_eau: '', index_elec: '', consommation_eau: '', consommation_elec: '' })
    setShowForm(false)
  }

  const partagerWhatsApp = (releve: IndexConsommation) => {
    const texte = encodeURIComponent(
      `Bonjour,\n\nVoici votre relevé de consommation pour *${releve.bien.titre}* — ${MOIS_FR[releve.mois]} ${releve.annee} :\n\n` +
      `💧 *Eau* : ${parseFloat(releve.consommation_eau).toFixed(1)} m³\n` +
      `⚡ *Électricité* : ${parseFloat(releve.consommation_elec).toFixed(1)} kWh\n\n` +
      `Merci de contacter votre bailleur pour le montant des charges.\n\n— Plateforme LocCam`
    )
    window.open(`https://wa.me/?text=${texte}`, '_blank')
  }

  if (!user) return null

  return (
    <>
      <style>{`
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes spin{to{transform:rotate(360deg)}}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#E2E8F0;border-radius:4px}
      `}</style>

      <div className="min-h-screen" style={{ background: '#F1F5F9', fontFamily: "'DM Sans','Helvetica Neue',sans-serif" }}>

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
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                 style={{ background: 'linear-gradient(135deg,#0EA5E9,#0284C7)' }}>
              <IconDroplet size={15} color="white" />
            </div>
            <div>
              <h1 className="text-sm font-bold" style={{ color: '#0F172A' }}>Relevés eau & électricité</h1>
              <p className="text-xs hidden sm:block" style={{ color: '#94A3B8' }}>Saisie mensuelle des index</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={load} className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ background: '#F1F5F9', border: '1px solid #E2E8F0' }}>
              <IconRefresh size={15} style={{ color: '#64748B', animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            </button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: .98 }}
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-3 sm:px-4 h-9 rounded-xl text-xs sm:text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg,#0EA5E9,#0284C7)', boxShadow: '0 2px 8px rgba(14,165,233,.35)' }}>
              <IconPlus size={15} />
              <span className="hidden sm:inline">Nouveau relevé</span>
            </motion.button>
          </div>
        </header>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 space-y-5">

          {/* Drawer formulaire */}
          <AnimatePresence>
            {showForm && (
              <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="fixed inset-0 z-40"
                  style={{ background: 'rgba(0,0,0,.35)', backdropFilter: 'blur(4px)' }}
                  onClick={resetForm} />
                <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 28, stiffness: 280 }}
                  className="fixed right-0 top-0 bottom-0 z-50 overflow-y-auto"
                  style={{ width: 'min(480px,100vw)', background: '#fff', boxShadow: '-8px 0 40px rgba(0,0,0,.15)' }}>

                  <div className="flex items-center justify-between px-6 py-5 sticky top-0 bg-white z-10"
                       style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <div>
                      <h2 className="text-base font-bold" style={{ color: '#0F172A' }}>Nouveau relevé</h2>
                      <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>Saisie des index mensuels</p>
                    </div>
                    <button onClick={resetForm} className="w-9 h-9 rounded-xl flex items-center justify-center"
                            style={{ background: '#F1F5F9' }}>
                      <IconX size={16} style={{ color: '#64748B' }} />
                    </button>
                  </div>

                  <div className="px-6 py-5">
                    <Steps current={step} />

                    {/* Étape 0 : Structure */}
                    {step === 0 && (
                      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                        <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#94A3B8' }}>
                          Sélectionnez une structure
                        </p>
                        <div className="space-y-2">
                          {structures.map(s => (
                            <button key={s.id}
                              onClick={() => { setSelectedStructure(s); setIsSansStructure(false); setStep(1) }}
                              className="w-full flex items-center gap-3 p-4 rounded-2xl text-left"
                              style={{ background: '#F8FAFC', border: '1.5px solid #E2E8F0' }}>
                              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                   style={{ background: '#EFF6FF', color: '#2563EB' }}>
                                <IconBuilding size={18} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-bold truncate" style={{ color: '#0F172A' }}>{s.nom}</div>
                                <div className="text-xs truncate" style={{ color: '#94A3B8' }}>{s.adresse}</div>
                              </div>
                              <IconChevronRight size={16} style={{ color: '#CBD5E1' }} />
                            </button>
                          ))}
                          <button
                            onClick={() => { setIsSansStructure(true); setSelectedStructure(null); setStep(1) }}
                            className="w-full flex items-center gap-3 p-4 rounded-2xl text-left"
                            style={{ background: '#F8FAFC', border: '1.5px dashed #CBD5E1' }}>
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                 style={{ background: '#F1F5F9', color: '#94A3B8' }}>
                              <IconHome2 size={18} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-semibold" style={{ color: '#475569' }}>Bien isolé</div>
                              <div className="text-xs" style={{ color: '#94A3B8' }}>Sans structure associée</div>
                            </div>
                            <IconChevronRight size={16} style={{ color: '#CBD5E1' }} />
                          </button>
                        </div>
                        {structures.length === 0 && (
                          <div className="flex items-center gap-2 p-3 rounded-xl mt-4"
                               style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
                            <IconAlertCircle size={15} style={{ color: '#D97706', flexShrink: 0 }} />
                            <p className="text-xs" style={{ color: '#92400E' }}>
                              Aucune structure. Vous pouvez sélectionner un bien isolé.
                            </p>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* Étape 1 : Bien */}
                    {step === 1 && (
                      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                        <div className="flex items-center gap-2 mb-4">
                          <button onClick={() => setStep(0)}
                            className="flex items-center gap-1 text-xs font-semibold"
                            style={{ color: '#7C3AED' }}>
                            <IconArrowLeft size={13} /> Retour
                          </button>
                          {selectedStructure && (
                            <span className="text-xs px-2 py-1 rounded-lg font-semibold"
                                  style={{ background: '#EFF6FF', color: '#2563EB' }}>
                              {selectedStructure.nom}
                            </span>
                          )}
                          {isSansStructure && (
                            <span className="text-xs px-2 py-1 rounded-lg font-semibold"
                                  style={{ background: '#F1F5F9', color: '#64748B' }}>
                              Biens isolés
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#94A3B8' }}>
                          Sélectionnez le bien
                        </p>
                        {biensFiltres.length === 0 ? (
                          <div className="flex flex-col items-center py-10 text-center">
                            <IconHome2 size={32} style={{ color: '#CBD5E1', marginBottom: '8px' }} />
                            <p className="text-sm font-medium" style={{ color: '#64748B' }}>Aucun bien dans cette sélection</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {biensFiltres.map(b => (
                              <button key={b.id}
                                onClick={() => { setSelectedBien(b); setStep(2) }}
                                className="w-full flex items-center gap-3 p-4 rounded-2xl text-left"
                                style={{ background: '#F8FAFC', border: '1.5px solid #E2E8F0' }}>
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                     style={{ background: '#ECFDF5', color: '#059669' }}>
                                  <IconHome2 size={18} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-bold truncate" style={{ color: '#0F172A' }}>{b.titre}</div>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-xs" style={{ color: '#94A3B8' }}>{b.adresse}</span>
                                    <span className="text-xs px-1.5 py-0.5 rounded-full font-semibold"
                                          style={{ background: b.statut === 'occupe' ? '#ECFDF5' : '#F1F5F9', color: b.statut === 'occupe' ? '#059669' : '#94A3B8' }}>
                                      {b.statut === 'occupe' ? 'Occupé' : 'Libre'}
                                    </span>
                                  </div>
                                </div>
                                <IconChevronRight size={16} style={{ color: '#CBD5E1' }} />
                              </button>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* Étape 2 : Index */}
                    {step === 2 && selectedBien && (
                      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                        <div className="flex items-center gap-2 mb-4">
                          <button onClick={() => setStep(1)}
                            className="flex items-center gap-1 text-xs font-semibold"
                            style={{ color: '#7C3AED' }}>
                            <IconArrowLeft size={13} /> Retour
                          </button>
                          <span className="text-xs px-2 py-1 rounded-lg font-semibold"
                                style={{ background: '#ECFDF5', color: '#059669' }}>
                            {selectedBien.titre}
                          </span>
                        </div>

                        {/* Période */}
                        <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#94A3B8' }}>Période</p>
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div>
                            <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>Mois</label>
                            <select value={form.mois} onChange={e => setF('mois', parseInt(e.target.value))}
                              style={{ width: '100%', height: '42px', padding: '0 12px', borderRadius: '10px', border: '1.5px solid #E2E8F0', fontSize: '13px', outline: 'none', background: '#fff', fontFamily: 'inherit' }}>
                              {MOIS_FR.slice(1).map((m,i) => <option key={i+1} value={i+1}>{m}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>Année</label>
                            <input type="number" value={form.annee} onChange={e => setF('annee', parseInt(e.target.value))}
                              min={2020} max={2100}
                              style={{ width: '100%', height: '42px', padding: '0 12px', borderRadius: '10px', border: '1.5px solid #E2E8F0', fontSize: '13px', outline: 'none', background: '#fff', fontFamily: 'inherit' }} />
                          </div>
                        </div>

                        {/* Index */}
                        <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#94A3B8' }}>Index relevés</p>
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          {[
                            { k: 'index_eau',  ico: <IconDroplet size={13}/>, lbl: 'Index eau (m³)',   col: '#0EA5E9', bg: '#F0F9FF' },
                            { k: 'index_elec', ico: <IconBolt size={13}/>,    lbl: 'Index élec (kWh)', col: '#F59E0B', bg: '#FFFBEB' },
                          ].map(f => (
                            <div key={f.k}>
                              <label className="flex items-center gap-1.5 text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>
                                <span style={{ color: f.col }}>{f.ico}</span>{f.lbl}
                              </label>
                              <input type="number" step="0.001" min="0"
                                value={form[f.k as keyof typeof form]} onChange={e => setF(f.k, e.target.value)}
                                placeholder="0.000"
                                style={{ width: '100%', height: '42px', padding: '0 12px', borderRadius: '10px', border: `1.5px solid ${f.bg}`, fontSize: '13px', outline: 'none', background: f.bg, fontFamily: 'inherit' }} />
                            </div>
                          ))}
                        </div>

                        {/* Consommation */}
                        <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#94A3B8' }}>Consommation calculée</p>
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          {[
                            { k: 'consommation_eau',  ico: <IconDroplet size={13}/>, lbl: 'Conso eau (m³)',   col: '#0EA5E9', bg: '#F0F9FF' },
                            { k: 'consommation_elec', ico: <IconBolt size={13}/>,    lbl: 'Conso élec (kWh)', col: '#F59E0B', bg: '#FFFBEB' },
                          ].map(f => (
                            <div key={f.k}>
                              <label className="flex items-center gap-1.5 text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>
                                <span style={{ color: f.col }}>{f.ico}</span>{f.lbl}
                              </label>
                              <input type="number" step="0.001" min="0"
                                value={form[f.k as keyof typeof form]} onChange={e => setF(f.k, e.target.value)}
                                placeholder="0.000"
                                style={{ width: '100%', height: '42px', padding: '0 12px', borderRadius: '10px', border: `1.5px solid ${f.bg}`, fontSize: '13px', outline: 'none', background: f.bg, fontFamily: 'inherit' }} />
                            </div>
                          ))}
                        </div>

                        {/* Calcul charges */}
                        <button onClick={calculerCharges} disabled={calcLoading}
                          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold mb-4"
                          style={{ background: '#F0F9FF', border: '1.5px solid #BAE6FD', color: '#0284C7' }}>
                          {calcLoading
                            ? <IconLoader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />
                            : <IconCalculator size={15} />}
                          Calculer les charges
                        </button>

                        <AnimatePresence>
                          {calcResult && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mb-4 p-4 rounded-2xl overflow-hidden"
                              style={{ background: '#F0FDF4', border: '1px solid #A7F3D0' }}>
                              <p className="text-xs font-bold mb-3" style={{ color: '#059669' }}>Estimation des charges</p>
                              <div className="grid grid-cols-3 gap-2">
                                {[
                                  { l: 'Eau',         v: calcResult.montant_eau,   ico: <IconDroplet size={13}/>,    c: '#0EA5E9', detail: `${calcResult.consommation_eau} m³` },
                                  { l: 'Électricité', v: calcResult.montant_elec,  ico: <IconBolt size={13}/>,       c: '#F59E0B', detail: `${calcResult.consommation_elec} kWh` },
                                  { l: 'Total',       v: calcResult.total_charges, ico: <IconCalculator size={13}/>, c: '#059669', detail: 'Eau + Élec' },
                                ].map(item => (
                                  <div key={item.l} className="bg-white rounded-xl p-3 text-center"
                                       style={{ border: '1px solid #E2E8F0' }}>
                                    <span style={{ color: item.c }}>{item.ico}</span>
                                    <div className="text-xs font-semibold mt-1 mb-1" style={{ color: '#64748B' }}>{item.l}</div>
                                    <div className="text-sm font-black" style={{ color: item.c }}>
                                      {item.v.toLocaleString('fr-FR')}<span className="text-xs font-normal"> XAF</span>
                                    </div>
                                    <div className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>{item.detail}</div>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    )}
                  </div>

                  {/* Footer */}
                  {step === 2 && (
                    <div className="sticky bottom-0 bg-white px-6 py-4 flex gap-3"
                         style={{ borderTop: '1px solid #F1F5F9', boxShadow: '0 -4px 16px rgba(0,0,0,.06)' }}>
                      <button onClick={resetForm}
                        className="flex-1 py-3 rounded-xl text-sm font-semibold"
                        style={{ background: '#F1F5F9', color: '#64748B' }}>
                        Annuler
                      </button>
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: .98 }}
                        onClick={handleSubmit} disabled={saving}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white"
                        style={{ background: 'linear-gradient(135deg,#0EA5E9,#0284C7)', boxShadow: '0 2px 10px rgba(14,165,233,.3)' }}>
                        {saving
                          ? <><IconLoader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />Enregistrement...</>
                          : <><IconCheck size={15} />Enregistrer le relevé</>}
                      </motion.button>
                    </div>
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Liste par structure */}
          {loading ? (
            <div className="space-y-3">
              {Array(3).fill(0).map((_,i) => (
                <div key={i} className="rounded-2xl h-20"
                     style={{ background: 'linear-gradient(90deg,#E2E8F0 25%,#F1F5F9 50%,#E2E8F0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
              ))}
            </div>
          ) : releves.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl"
                 style={{ border: '1px solid #E2E8F0' }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                   style={{ background: '#F0F9FF' }}>
                <IconDroplet size={24} style={{ color: '#7DD3FC' }} />
              </div>
              <h3 className="text-sm font-bold mb-1" style={{ color: '#0F172A' }}>Aucun relevé enregistré</h3>
              <p className="text-xs mb-5" style={{ color: '#94A3B8' }}>Commencez par saisir les index mensuels de vos biens.</p>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: .98 }}
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg,#0EA5E9,#0284C7)' }}>
                <IconPlus size={14} />Premier relevé
              </motion.button>
            </div>
          ) : (
            <GroupesReleves
              releves={releves}
              allBiens={allBiens}
              structures={structures}
              onWhatsApp={partagerWhatsApp}
            />
          )}
        </div>
      </div>
    </>
  )
}