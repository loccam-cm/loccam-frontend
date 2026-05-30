'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import api from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import {
  IconDroplet, IconBolt, IconPlus, IconChevronLeft,
  IconBuilding, IconCalendar, IconCheck, IconLoader2,
  IconAlertCircle, IconCalculator, IconX,
} from '@tabler/icons-react'

interface Bien { id: number; titre: string; adresse: string; statut: string }

interface IndexConsommation {
  id: number
  bien: { id: number; titre: string }
  mois: number
  annee: number
  index_eau: string
  index_elec: string
  consommation_eau: string
  consommation_elec: string
  date_saisie: string
}

interface CalcResult {
  consommation_eau: number
  consommation_elec: number
  tarif_eau: number
  tarif_elec: number
  montant_eau: number
  montant_elec: number
  total_charges: number
}

const MOIS_FR = ['','Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']
const now = new Date()

export default function RelevesPage() {
  const { user } = useAuth()
  const [biens, setBiens]             = useState<Bien[]>([])
  const [releves, setReleves]         = useState<IndexConsommation[]>([])
  const [loading, setLoading]         = useState(true)
  const [showForm, setShowForm]       = useState(false)
  const [saving, setSaving]           = useState(false)
  const [calcResult, setCalcResult]   = useState<CalcResult | null>(null)
  const [calcLoading, setCalcLoading] = useState(false)

  const [form, setForm] = useState({
    bien: '', mois: now.getMonth() + 1, annee: now.getFullYear(),
    index_eau: '', index_elec: '', consommation_eau: '', consommation_elec: '',
  })

  const set = (k: string, v: string | number) => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    try {
      const [biensRes, relevesRes] = await Promise.all([
        api.get('/biens/'),
        api.get('/index/'),
      ])
      setBiens(biensRes.data.results ?? biensRes.data)
      setReleves(relevesRes.data.results ?? relevesRes.data)
    } catch { toast.error('Erreur de chargement') }
    finally { setLoading(false) }
  }

  const calculerCharges = async () => {
    if (!form.bien) return
    setCalcLoading(true)
    try {
      const res = await api.get(`/index/${form.bien}/calcul/?mois=${form.mois}&annee=${form.annee}`)
      setCalcResult(res.data)
    } catch {
      toast.error('Aucun relevé trouvé pour ce mois ou tarifs non configurés.')
      setCalcResult(null)
    } finally { setCalcLoading(false) }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.bien) { toast.error('Sélectionnez un bien'); return }
    setSaving(true)
    try {
      await api.post('/index/', {
        bien              : parseInt(form.bien),
        mois              : form.mois,
        annee             : form.annee,
        index_eau         : parseFloat(form.index_eau)  || 0,
        index_elec        : parseFloat(form.index_elec) || 0,
        consommation_eau  : parseFloat(form.consommation_eau)  || 0,
        consommation_elec : parseFloat(form.consommation_elec) || 0,
      })
      toast.success('Relevé enregistré !')
      setShowForm(false)
      setCalcResult(null)
      setForm({ bien: '', mois: now.getMonth() + 1, annee: now.getFullYear(), index_eau: '', index_elec: '', consommation_eau: '', consommation_elec: '' })
      load()
    } catch (err: unknown) {
      const e = err as { response?: { data?: Record<string, string[]> } }
      const msg = e.response?.data ? Object.values(e.response.data).flat()[0] : 'Erreur enregistrement.'
      toast.error(String(msg))
    } finally { setSaving(false) }
  }

  const closeForm = () => { setShowForm(false); setCalcResult(null) }

  return (
    <div className="min-h-screen bg-slate-50" style={{ fontFamily: "'DM Sans','Helvetica Neue',sans-serif" }}>

      {/* ── HEADER ───────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/bailleur" className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors shrink-0">
              <IconChevronLeft size={16} />
              <span className="hidden sm:inline">Retour</span>
            </Link>
            <div className="w-px h-5 bg-slate-200 shrink-0" />
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0"
                   style={{ background: 'linear-gradient(135deg,#0EA5E9,#0284C7)' }}>
                <IconDroplet size={16} color="white" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-slate-900 truncate">Relevés eau & électricité</div>
                <div className="text-xs text-slate-500 hidden sm:block">Saisie mensuelle des index</div>
              </div>
            </div>
          </div>
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-white text-xs sm:text-sm font-bold shrink-0 transition-all hover:opacity-90 active:scale-95"
            style={{ background: 'linear-gradient(135deg,#0EA5E9,#0284C7)', boxShadow: '0 4px 12px rgba(14,165,233,0.35)' }}>
            <IconPlus size={14} />
            <span className="hidden xs:inline">Nouveau relevé</span>
            <span className="xs:hidden">Nouveau</span>
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 sm:py-6">

        {/* ── FORMULAIRE (modale sur mobile, inline sur desktop) ── */}
        <AnimatePresence>
          {showForm && (
            <>
              {/* Overlay mobile */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-black/40 sm:hidden"
                onClick={closeForm} />

              {/* Formulaire */}
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="fixed sm:relative inset-x-0 bottom-0 sm:inset-auto z-50 sm:z-auto
                           bg-white rounded-t-2xl sm:rounded-2xl border border-slate-200
                           p-5 sm:p-6 mb-0 sm:mb-6
                           shadow-2xl sm:shadow-md"
                style={{ maxHeight: '90vh', overflowY: 'auto' }}>

                {/* Header formulaire */}
                <div className="flex items-center justify-between mb-5">
                  <div className="text-base font-bold text-slate-900">Nouveau relevé mensuel</div>
                  <button onClick={closeForm}
                    className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
                    <IconX size={15} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">

                  {/* Bien + Mois + Année */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-1">
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Bien <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <IconBuilding size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <select value={form.bien} onChange={e => set('bien', e.target.value)} required
                          className="w-full h-10 pl-8 pr-3 rounded-xl border border-slate-200 text-sm outline-none appearance-none bg-white focus:border-sky-400 transition-colors"
                          style={{ color: form.bien ? '#0F172A' : '#94A3B8' }}>
                          <option value="" disabled>Sélectionnez un bien…</option>
                          {biens.map(b => <option key={b.id} value={b.id}>{b.titre}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Mois</label>
                      <select value={form.mois} onChange={e => set('mois', parseInt(e.target.value))}
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm text-slate-900 outline-none appearance-none bg-white focus:border-sky-400 transition-colors">
                        {MOIS_FR.slice(1).map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Année</label>
                      <input type="number" value={form.annee} onChange={e => set('annee', parseInt(e.target.value))}
                        min={2020} max={2100}
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm text-slate-900 outline-none focus:border-sky-400 transition-colors" />
                    </div>
                  </div>

                  {/* Index eau + élec */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { k: 'index_eau',         ico: <IconDroplet size={12}/>, label: 'Index eau (m³)',   col: '#0EA5E9' },
                      { k: 'index_elec',        ico: <IconBolt size={12}/>,    label: 'Index élec (kWh)', col: '#F59E0B' },
                      { k: 'consommation_eau',  ico: <IconDroplet size={12}/>, label: 'Conso eau (m³)',   col: '#0EA5E9' },
                      { k: 'consommation_elec', ico: <IconBolt size={12}/>,    label: 'Conso élec (kWh)', col: '#F59E0B' },
                    ].map(f => (
                      <div key={f.k}>
                        <label className="flex items-center gap-1 text-xs font-bold text-slate-700 mb-1.5">
                          <span style={{ color: f.col }}>{f.ico}</span>
                          <span className="truncate">{f.label}</span>
                        </label>
                        <input type="number" step="0.001" min="0"
                          value={form[f.k as keyof typeof form]}
                          onChange={e => set(f.k, e.target.value)}
                          placeholder="0.000"
                          className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm text-slate-900 outline-none focus:border-sky-400 transition-colors" />
                      </div>
                    ))}
                  </div>

                  {/* Boutons actions */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:justify-between sm:items-center pt-1">
                    <button type="button" onClick={calculerCharges} disabled={!form.bien || calcLoading}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
                      style={{ background: '#F0F9FF', border: '1.5px solid #BAE6FD', color: '#0284C7' }}>
                      {calcLoading ? <IconLoader2 size={14} className="animate-spin" /> : <IconCalculator size={14} />}
                      Calculer les charges
                    </button>
                    <div className="flex gap-2">
                      <button type="button" onClick={closeForm}
                        className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-sm font-semibold hover:bg-slate-200 transition-colors">
                        Annuler
                      </button>
                      <button type="submit" disabled={saving}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold transition-all disabled:opacity-70"
                        style={{ background: 'linear-gradient(135deg,#0EA5E9,#0284C7)' }}>
                        {saving ? <IconLoader2 size={14} className="animate-spin" /> : <IconCheck size={14} />}
                        Enregistrer
                      </button>
                    </div>
                  </div>
                </form>

                {/* Résultat calcul */}
                <AnimatePresence>
                  {calcResult && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 p-4 rounded-xl overflow-hidden"
                      style={{ background: 'linear-gradient(135deg,rgba(14,165,233,0.06),rgba(245,158,11,0.06))', border: '1px solid #BAE6FD' }}>
                      <div className="flex items-center gap-2 text-xs font-bold text-sky-700 mb-3">
                        <IconCalculator size={13} /> Estimation des charges
                      </div>
                      <div className="grid grid-cols-3 gap-2 sm:gap-3">
                        {[
                          { l: 'Eau',          v: calcResult.montant_eau,    ico: <IconDroplet size={13}/>,    c: '#0EA5E9', bg: '#F0F9FF', conso: `${calcResult.consommation_eau} m³ × ${calcResult.tarif_eau} XAF` },
                          { l: 'Électricité',  v: calcResult.montant_elec,   ico: <IconBolt size={13}/>,       c: '#F59E0B', bg: '#FFFBEB', conso: `${calcResult.consommation_elec} kWh × ${calcResult.tarif_elec} XAF` },
                          { l: 'Total',        v: calcResult.total_charges,  ico: <IconCalculator size={13}/>, c: '#059669', bg: '#F0FDF4', conso: 'Eau + Électricité' },
                        ].map(item => (
                          <div key={item.l} className="rounded-xl p-3" style={{ background: item.bg }}>
                            <div className="flex items-center gap-1.5 mb-2">
                              <span style={{ color: item.c }}>{item.ico}</span>
                              <span className="text-xs font-semibold text-slate-500">{item.l}</span>
                            </div>
                            <div className="text-base sm:text-lg font-extrabold leading-none" style={{ color: item.c }}>
                              {item.v.toLocaleString('fr-FR')} <span className="text-xs font-semibold">XAF</span>
                            </div>
                            <div className="text-xs text-slate-400 mt-1 truncate">{item.conso}</div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ── LISTE DES RELEVÉS ─────────────────────────────── */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <IconLoader2 size={32} className="animate-spin text-sky-500" />
          </div>
        ) : releves.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-white rounded-2xl border border-slate-200">
            <div className="w-14 h-14 rounded-2xl bg-sky-50 flex items-center justify-center mb-4">
              <IconDroplet size={24} className="text-sky-400" />
            </div>
            <div className="text-sm font-bold text-slate-900 mb-2">Aucun relevé enregistré</div>
            <div className="text-sm text-slate-500 mb-5 max-w-xs">Commencez par saisir les index mensuels de vos biens.</div>
            <button onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold transition-all hover:opacity-90 active:scale-95"
              style={{ background: 'linear-gradient(135deg,#0EA5E9,#0284C7)' }}>
              <IconPlus size={14} /> Premier relevé
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {releves.map((r, i) => (
              <motion.div key={r.id}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl border border-slate-200 p-4 hover:shadow-md transition-shadow">

                {/* Titre + période */}
                <div className="flex items-start justify-between mb-3 gap-2">
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-slate-900 truncate">{r.bien.titre}</div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                      <IconCalendar size={11} />
                      {MOIS_FR[r.mois]} {r.annee}
                    </div>
                  </div>
                  <span className="shrink-0 px-2.5 py-1 rounded-full text-xs font-bold text-sky-700 bg-sky-50 border border-sky-200">
                    Relevé
                  </span>
                </div>

                {/* Eau + Élec */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-sky-50 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-2">
                      <IconDroplet size={12} className="text-sky-500" />
                      <span className="text-xs font-semibold text-slate-500">EAU</span>
                    </div>
                    <div className="text-base font-extrabold text-sky-500 leading-none">
                      {parseFloat(r.consommation_eau).toFixed(1)} m³
                    </div>
                    <div className="text-xs text-slate-400 mt-1">Index : {parseFloat(r.index_eau).toFixed(1)}</div>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-2">
                      <IconBolt size={12} className="text-amber-500" />
                      <span className="text-xs font-semibold text-slate-500">ÉLEC</span>
                    </div>
                    <div className="text-base font-extrabold text-amber-500 leading-none">
                      {parseFloat(r.consommation_elec).toFixed(1)} kWh
                    </div>
                    <div className="text-xs text-slate-400 mt-1">Index : {parseFloat(r.index_elec).toFixed(1)}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        .animate-spin { animation: spin 1s linear infinite }
        @media (max-width: 480px) { .xs\\:hidden { display: none } }
        @media (min-width: 480px) { .xs\\:inline { display: inline } .xs\\:hidden { display: none } }
      `}</style>
    </div>
  )
}
