'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import api from '@/lib/api'
import { PaginatedResponse } from '@/types'
import {
  IconBuilding, IconPlus, IconSearch, IconEdit,
  IconTrash, IconX, IconCheck, IconLoader2,
  IconArrowLeft, IconRefresh, IconMapPin,
  IconHome2, IconUsers, IconAlertCircle,
  IconBuildingSkyscraper, IconBuildingCommunity,
  IconHomeDot, IconBuildingWarehouse,
} from '@tabler/icons-react'

// ── Types ────────────────────────────────────────────────────
interface Structure {
  id: number
  nom: string
  type_structure: string
  adresse: string
  ville?: string
  description?: string
  nb_biens?: number
  nb_biens_occupes?: number
  date_creation?: string
}

interface FormData {
  nom: string
  type_structure: string
  adresse: string
  ville: string
  description: string
}

const TYPES_STRUCTURE = [
  { val: 'immeuble',   lbl: 'Immeuble',          icon: <IconBuildingSkyscraper size={18} />, color: '#2563EB', bg: '#EFF6FF' },
  { val: 'residence',  lbl: 'Résidence',          icon: <IconBuildingCommunity size={18} />, color: '#059669', bg: '#ECFDF5' },
  { val: 'villa',      lbl: 'Villa divisée',      icon: <IconHomeDot size={18} />,           color: '#D97706', bg: '#FFFBEB' },
  { val: 'entrepot',   lbl: 'Entrepôt / Dépôt',  icon: <IconBuildingWarehouse size={18} />, color: '#7C3AED', bg: '#F5F3FF' },
  { val: 'autre',      lbl: 'Autre',              icon: <IconBuilding size={18} />,          color: '#64748B', bg: '#F1F5F9' },
]

const VILLES = ['Douala', 'Yaoundé', 'Bafoussam', 'Limbé', 'Kribi', 'Garoua', 'Ngaoundéré', 'Autre']

function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`rounded-xl ${className}`} style={{
      background: 'linear-gradient(90deg,#E2E8F0 25%,#F1F5F9 50%,#E2E8F0 75%)',
      backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite',
    }} />
  )
}

function TypeIcon({ type }: { type: string }) {
  const t = TYPES_STRUCTURE.find(x => x.val === type) ?? TYPES_STRUCTURE[4]
  return (
    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
         style={{ background: t.bg, color: t.color }}>
      {t.icon}
    </div>
  )
}

// ────────────────────────────────────────────────────────────
export default function StructuresPage() {
  const { user } = useAuth()
  const [structures, setStructures] = useState<Structure[]>([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [showForm, setShowForm]     = useState(false)
  const [editItem, setEditItem]     = useState<Structure | null>(null)
  const [saving, setSaving]         = useState(false)
  const [success, setSuccess]       = useState(false)
  const [errors, setErrors]         = useState<Record<string, string>>({})
  const [deleteId, setDeleteId]     = useState<number | null>(null)

  const emptyForm: FormData = { nom: '', type_structure: 'immeuble', adresse: '', ville: 'Douala', description: '' }
  const [form, setForm] = useState<FormData>(emptyForm)

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get<PaginatedResponse<Structure>>('/structures/')
      setStructures(res.data.results)
    } catch { } finally { setLoading(false) }
  }

  const openAdd = () => {
    setEditItem(null); setForm(emptyForm); setErrors({}); setShowForm(true)
  }

  const openEdit = (s: Structure) => {
    setEditItem(s)
    setForm({ nom: s.nom, type_structure: s.type_structure, adresse: s.adresse, ville: s.ville ?? 'Douala', description: s.description ?? '' })
    setErrors({}); setShowForm(true)
  }

  const validate = (): boolean => {
    const e: Record<string, string> = {}
    if (!form.nom.trim()) e.nom = 'Le nom est requis'
    if (!form.adresse.trim()) e.adresse = 'L\'adresse est requise'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      if (editItem) {
        await api.put(`/structures/${editItem.id}/`, form)
      } else {
        await api.post('/structures/', form)
      }
      setSuccess(true)
      setTimeout(() => { setSuccess(false); setShowForm(false); load() }, 1400)
    } catch (err: unknown) {
      const e = err as { response?: { data?: Record<string, string[]> } }
      if (e.response?.data) {
        const apiErrors: Record<string, string> = {}
        Object.entries(e.response.data).forEach(([k, v]) => {
          apiErrors[k] = Array.isArray(v) ? v[0] : String(v)
        })
        setErrors(apiErrors)
      }
    } finally { setSaving(false) }
  }

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/structures/${id}/`)
      setDeleteId(null); load()
    } catch { setDeleteId(null) }
  }

  const set = (k: keyof FormData, v: string) => setForm(p => ({ ...p, [k]: v }))

  const filtered = structures.filter(s =>
    !search || s.nom.toLowerCase().includes(search.toLowerCase()) ||
    s.adresse.toLowerCase().includes(search.toLowerCase())
  )

  if (!user) return null

  return (
    <>
      <style>{`
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes spin{to{transform:rotate(360deg)}}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:#E2E8F0;border-radius:4px}
        .card-hover{transition:all .2s ease}.card-hover:hover{transform:translateY(-2px);box-shadow:0 12px 28px rgba(0,0,0,.08)}
        .input-field{width:100%;height:42px;padding:0 12px;border-radius:10px;border:1.5px solid #E2E8F0;font-size:13px;color:#0F172A;outline:none;background:#fff;transition:border-color .15s;font-family:inherit}
        .input-field:focus{border-color:#2563EB;box-shadow:0 0 0 3px rgba(37,99,235,.1)}
        .input-field.error{border-color:#EF4444}
        .textarea-field{width:100%;padding:10px 12px;border-radius:10px;border:1.5px solid #E2E8F0;font-size:13px;color:#0F172A;outline:none;background:#fff;resize:vertical;min-height:80px;font-family:inherit;transition:border-color .15s}
        .textarea-field:focus{border-color:#2563EB;box-shadow:0 0 0 3px rgba(37,99,235,.1)}
        .select-field{width:100%;height:42px;padding:0 12px;border-radius:10px;border:1.5px solid #E2E8F0;font-size:13px;color:#0F172A;outline:none;background:#fff;cursor:pointer;font-family:inherit;transition:border-color .15s}
        .select-field:focus{border-color:#2563EB}
        .type-btn{display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px 8px;border-radius:12px;border:1.5px solid #E2E8F0;cursor:pointer;transition:all .15s;background:#fff;font-family:inherit}
        .type-btn.active{border-color:currentColor;background:var(--bg)}
        .type-btn:hover{border-color:#CBD5E1}
      `}</style>

      <div className="flex h-screen overflow-hidden" style={{ background: '#F1F5F9', fontFamily: "'DM Sans','Helvetica Neue',sans-serif" }}>
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Header */}
          <header className="flex items-center gap-4 px-6 h-16 flex-shrink-0 bg-white"
                  style={{ borderBottom: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}>
            <Link href="/bailleur" className="flex items-center gap-2 text-sm font-medium"
                  style={{ color: '#64748B', textDecoration: 'none' }}>
              <IconArrowLeft size={16} />
              <span className="hidden sm:inline">Tableau de bord</span>
            </Link>
            <div className="h-5 w-px" style={{ background: '#E2E8F0' }} />
            <div className="flex items-center gap-2 flex-1">
              <IconBuilding size={18} style={{ color: '#2563EB' }} />
              <h1 className="text-sm font-bold" style={{ color: '#0F172A' }}>Mes structures</h1>
              {!loading && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ background: '#EFF6FF', color: '#2563EB' }}>
                  {structures.length} structure{structures.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={load} className="w-9 h-9 rounded-lg flex items-center justify-center"
                      style={{ background: '#F1F5F9', border: '1px solid #E2E8F0' }}>
                <IconRefresh size={15} style={{ color: '#64748B', animation: loading ? 'spin 1s linear infinite' : 'none' }} />
              </button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: .98 }}
                onClick={openAdd}
                className="flex items-center gap-2 px-4 h-9 rounded-xl text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg,#2563EB,#1D4ED8)', boxShadow: '0 2px 8px rgba(37,99,235,.35)' }}>
                <IconPlus size={15} />
                <span className="hidden sm:inline">Nouvelle structure</span>
              </motion.button>
            </div>
          </header>

          {/* Toolbar */}
          <div className="flex items-center gap-3 px-6 py-4 flex-shrink-0 bg-white"
               style={{ borderBottom: '1px solid #F1F5F9' }}>
            <div className="relative flex-1 max-w-sm">
              <IconSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#94A3B8' }} />
              <input value={search} onChange={e => setSearch(e.target.value)}
                     placeholder="Rechercher une structure..."
                     className="input-field" style={{ paddingLeft: '36px' }} />
            </div>
          </div>

          {/* Contenu */}
          <div className="flex-1 overflow-y-auto p-6">

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-52" />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                     style={{ background: '#EFF6FF' }}>
                  <IconBuilding size={28} style={{ color: '#93C5FD' }} />
                </div>
                <h3 className="text-base font-bold mb-2" style={{ color: '#0F172A' }}>
                  {search ? 'Aucune structure trouvée' : 'Aucune structure pour l\'instant'}
                </h3>
                <p className="text-sm mb-5" style={{ color: '#64748B' }}>
                  {search ? 'Modifiez votre recherche' : 'Créez votre première structure (immeuble, résidence, villa...)'}
                </p>
                {!search && (
                  <button onClick={openAdd}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
                    style={{ background: 'linear-gradient(135deg,#2563EB,#1D4ED8)' }}>
                    <IconPlus size={15} />Créer une structure
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map((s, i) => {
                  const typeInfo = TYPES_STRUCTURE.find(t => t.val === s.type_structure) ?? TYPES_STRUCTURE[4]
                  const occupationPct = s.nb_biens && s.nb_biens > 0
                    ? Math.round((s.nb_biens_occupes ?? 0) / s.nb_biens * 100)
                    : 0

                  return (
                    <motion.div key={s.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="card-hover bg-white rounded-2xl overflow-hidden"
                      style={{ border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}>

                      {/* Bande couleur top */}
                      <div className="h-1.5 w-full" style={{ background: typeInfo.color, opacity: .7 }} />

                      <div className="p-5">
                        {/* En-tête */}
                        <div className="flex items-start gap-3 mb-4">
                          <TypeIcon type={s.type_structure} />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-sm mb-0.5 truncate" style={{ color: '#0F172A' }}>{s.nom}</h3>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                                  style={{ background: typeInfo.bg, color: typeInfo.color }}>
                              {typeInfo.lbl}
                            </span>
                          </div>
                        </div>

                        {/* Adresse */}
                        <div className="flex items-center gap-1.5 mb-4">
                          <IconMapPin size={13} style={{ color: '#94A3B8', flexShrink: 0 }} />
                          <span className="text-xs truncate" style={{ color: '#64748B' }}>{s.adresse}</span>
                          {s.ville && <span className="text-xs font-medium flex-shrink-0" style={{ color: '#475569' }}>· {s.ville}</span>}
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-2 mb-4">
                          <div className="rounded-xl p-3 text-center"
                               style={{ background: '#F8FAFC', border: '1px solid #F1F5F9' }}>
                            <div className="flex items-center justify-center gap-1 mb-0.5">
                              <IconHome2 size={13} style={{ color: '#64748B' }} />
                              <span className="text-xs" style={{ color: '#64748B' }}>Biens</span>
                            </div>
                            <div className="text-xl font-bold" style={{ color: '#0F172A' }}>
                              {s.nb_biens ?? 0}
                            </div>
                          </div>
                          <div className="rounded-xl p-3 text-center"
                               style={{ background: '#F8FAFC', border: '1px solid #F1F5F9' }}>
                            <div className="flex items-center justify-center gap-1 mb-0.5">
                              <IconUsers size={13} style={{ color: '#64748B' }} />
                              <span className="text-xs" style={{ color: '#64748B' }}>Occupés</span>
                            </div>
                            <div className="text-xl font-bold" style={{ color: occupationPct >= 80 ? '#059669' : occupationPct >= 50 ? '#D97706' : '#DC2626' }}>
                              {s.nb_biens_occupes ?? 0}
                            </div>
                          </div>
                        </div>

                        {/* Barre occupation */}
                        {(s.nb_biens ?? 0) > 0 && (
                          <div className="mb-4">
                            <div className="flex justify-between text-xs mb-1.5">
                              <span style={{ color: '#64748B' }}>Taux d&apos;occupation</span>
                              <span className="font-bold" style={{ color: occupationPct >= 80 ? '#059669' : '#D97706' }}>
                                {occupationPct}%
                              </span>
                            </div>
                            <div className="h-2 rounded-full overflow-hidden" style={{ background: '#E2E8F0' }}>
                              <motion.div className="h-full rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${occupationPct}%` }}
                                transition={{ duration: 0.8, delay: i * 0.05 + 0.2 }}
                                style={{ background: occupationPct >= 80 ? '#059669' : '#D97706' }} />
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 pt-3" style={{ borderTop: '1px solid #F1F5F9' }}>
                          <button onClick={() => openEdit(s)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold"
                            style={{ background: '#EFF6FF', color: '#2563EB' }}>
                            <IconEdit size={13} />Modifier
                          </button>
                          <Link href={`/bailleur/biens?structure=${s.id}`}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold"
                            style={{ background: '#F8FAFC', color: '#475569', textDecoration: 'none' }}>
                            <IconHome2 size={13} />Voir biens
                          </Link>
                          <button onClick={() => setDeleteId(s.id)}
                            className="w-9 flex items-center justify-center py-2 rounded-lg"
                            style={{ background: '#FEF2F2', color: '#EF4444' }}>
                            <IconTrash size={13} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── DRAWER FORMULAIRE ──────────────────────────────── */}
        <AnimatePresence>
          {showForm && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-40"
                style={{ background: 'rgba(0,0,0,.35)', backdropFilter: 'blur(4px)' }}
                onClick={() => setShowForm(false)} />

              <motion.div
                initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 280 }}
                className="fixed right-0 top-0 bottom-0 z-50 overflow-y-auto"
                style={{ width: 'min(480px, 100vw)', background: '#fff', boxShadow: '-8px 0 40px rgba(0,0,0,.15)' }}>

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 sticky top-0 bg-white z-10"
                     style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <div>
                    <h2 className="text-base font-bold" style={{ color: '#0F172A' }}>
                      {editItem ? 'Modifier la structure' : 'Nouvelle structure'}
                    </h2>
                    <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>
                      {editItem ? `Modification de "${editItem.nom}"` : 'Immeuble, résidence, villa divisée...'}
                    </p>
                  </div>
                  <button onClick={() => setShowForm(false)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: '#F1F5F9' }}>
                    <IconX size={16} style={{ color: '#64748B' }} />
                  </button>
                </div>

                <div className="px-6 py-5 space-y-6">

                  {/* Type de structure — boutons visuels */}
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#94A3B8' }}>
                      Type de structure
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {TYPES_STRUCTURE.map(t => (
                        <button key={t.val}
                          onClick={() => set('type_structure', t.val)}
                          style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center',
                            gap: '6px', padding: '12px 8px', borderRadius: '12px', cursor: 'pointer',
                            border: `1.5px solid ${form.type_structure === t.val ? t.color : '#E2E8F0'}`,
                            background: form.type_structure === t.val ? t.bg : '#fff',
                            transition: 'all .15s', fontFamily: 'inherit',
                          }}>
                          <span style={{ color: form.type_structure === t.val ? t.color : '#94A3B8' }}>{t.icon}</span>
                          <span className="text-xs font-semibold"
                                style={{ color: form.type_structure === t.val ? t.color : '#64748B', textAlign: 'center', lineHeight: 1.2 }}>
                            {t.lbl}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Nom */}
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#94A3B8' }}>
                      Informations
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>
                          Nom de la structure <span style={{ color: '#EF4444' }}>*</span>
                        </label>
                        <input value={form.nom} onChange={e => set('nom', e.target.value)}
                               placeholder="Ex: Immeuble Les Cocotiers"
                               className={`input-field ${errors.nom ? 'error' : ''}`} />
                        {errors.nom && <p className="text-xs mt-1" style={{ color: '#EF4444' }}>{errors.nom}</p>}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>Description</label>
                        <textarea value={form.description} onChange={e => set('description', e.target.value)}
                                  placeholder="Décrivez la structure..."
                                  className="textarea-field" />
                      </div>
                    </div>
                  </div>

                  {/* Localisation */}
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#94A3B8' }}>
                      Localisation
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>
                          Adresse <span style={{ color: '#EF4444' }}>*</span>
                        </label>
                        <input value={form.adresse} onChange={e => set('adresse', e.target.value)}
                               placeholder="Ex: Bonapriso, Douala"
                               className={`input-field ${errors.adresse ? 'error' : ''}`} />
                        {errors.adresse && <p className="text-xs mt-1" style={{ color: '#EF4444' }}>{errors.adresse}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>Ville</label>
                        <select value={form.ville} onChange={e => set('ville', e.target.value)} className="select-field">
                          {VILLES.map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-white px-6 py-4 flex gap-3"
                     style={{ borderTop: '1px solid #F1F5F9', boxShadow: '0 -4px 16px rgba(0,0,0,.06)' }}>
                  <button onClick={() => setShowForm(false)}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold"
                    style={{ background: '#F1F5F9', color: '#64748B' }}>
                    Annuler
                  </button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: .98 }}
                    onClick={handleSubmit} disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white"
                    style={{ background: success ? '#059669' : 'linear-gradient(135deg,#2563EB,#1D4ED8)', boxShadow: '0 2px 10px rgba(37,99,235,.3)' }}>
                    {saving
                      ? <><IconLoader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />Enregistrement...</>
                      : success
                        ? <><IconCheck size={16} />Enregistré !</>
                        : <><IconCheck size={16} />{editItem ? 'Mettre à jour' : 'Créer la structure'}</>}
                  </motion.button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ── MODAL SUPPRESSION ────────────────────────────────── */}
        <AnimatePresence>
          {deleteId !== null && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                style={{ background: 'rgba(0,0,0,.4)', backdropFilter: 'blur(6px)' }}>
                <motion.div initial={{ scale: .9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: .9, opacity: 0 }} transition={{ duration: .2 }}
                            className="bg-white rounded-2xl p-6 w-full max-w-sm"
                            style={{ boxShadow: '0 20px 60px rgba(0,0,0,.2)' }}>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                       style={{ background: '#FEF2F2' }}>
                    <IconAlertCircle size={24} style={{ color: '#EF4444' }} />
                  </div>
                  <h3 className="text-base font-bold mb-2" style={{ color: '#0F172A' }}>
                    Supprimer cette structure ?
                  </h3>
                  <p className="text-sm mb-5" style={{ color: '#64748B', lineHeight: 1.6 }}>
                    Cette action est irréversible. Tous les biens associés seront également supprimés.
                  </p>
                  <div className="flex gap-3">
                    <button onClick={() => setDeleteId(null)}
                      className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                      style={{ background: '#F1F5F9', color: '#64748B' }}>
                      Annuler
                    </button>
                    <button onClick={() => handleDelete(deleteId)}
                      className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white"
                      style={{ background: '#EF4444' }}>
                      Supprimer
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

      </div>
    </>
  )
}
