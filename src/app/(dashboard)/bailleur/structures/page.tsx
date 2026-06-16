'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import api from '@/lib/api'
import { PaginatedResponse } from '@/types'
import {
  IconBuilding, IconPlus, IconSearch, IconEdit, IconTrash,
  IconX, IconCheck, IconLoader2, IconArrowLeft, IconRefresh,
  IconMapPin, IconHome2, IconUsers, IconAlertCircle,
  IconBuildingSkyscraper, IconBuildingCommunity, IconHomeDot,
  IconBuildingWarehouse, IconCamera, IconPhoto, IconChevronRight,
  IconTrendingUp,
} from '@tabler/icons-react'

// ── Types ─────────────────────────────────────────────────
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
  photo_url?: string
}

interface FormData {
  nom: string
  type_structure: string
  adresse: string
  ville: string
  description: string
}

const TYPES = [
  { val: 'immeuble',   lbl: 'Immeuble',       icon: <IconBuildingSkyscraper size={20}/>, color: '#2563EB', bg: '#EFF6FF', gradient: 'linear-gradient(135deg,#1E3A5F,#2563EB)' },
  { val: 'residence',  lbl: 'Résidence',       icon: <IconBuildingCommunity size={20}/>, color: '#059669', bg: '#ECFDF5', gradient: 'linear-gradient(135deg,#064E3B,#059669)' },
  { val: 'villa',      lbl: 'Villa divisée',   icon: <IconHomeDot size={20}/>,           color: '#D97706', bg: '#FFFBEB', gradient: 'linear-gradient(135deg,#78350F,#D97706)' },
  { val: 'entrepot',   lbl: 'Entrepôt',        icon: <IconBuildingWarehouse size={20}/>, color: '#7C3AED', bg: '#F5F3FF', gradient: 'linear-gradient(135deg,#4C1D95,#7C3AED)' },
  { val: 'autre',      lbl: 'Autre',           icon: <IconBuilding size={20}/>,          color: '#475569', bg: '#F1F5F9', gradient: 'linear-gradient(135deg,#1E293B,#475569)' },
]

const VILLES = ['Douala', 'Yaoundé', 'Bafoussam', 'Limbé', 'Kribi', 'Garoua', 'Ngaoundéré', 'Autre']

function getType(val: string) { return TYPES.find(t => t.val === val) ?? TYPES[4] }

function Skeleton() {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #E2E8F0' }}>
      <div style={{ height: '140px', background: 'linear-gradient(90deg,#E2E8F0 25%,#F1F5F9 50%,#E2E8F0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
      <div className="p-5 space-y-3">
        <div style={{ height: '16px', background: '#F1F5F9', borderRadius: '8px', width: '60%' }} />
        <div style={{ height: '12px', background: '#F1F5F9', borderRadius: '6px', width: '80%' }} />
        <div className="grid grid-cols-2 gap-2 pt-2">
          <div style={{ height: '56px', background: '#F1F5F9', borderRadius: '12px' }} />
          <div style={{ height: '56px', background: '#F1F5F9', borderRadius: '12px' }} />
        </div>
      </div>
    </div>
  )
}

// ── Carte structure ────────────────────────────────────────
function StructureCard({ s, i, onEdit, onDelete, onPhotoClick }: {
  s: Structure; i: number
  onEdit: () => void; onDelete: () => void; onPhotoClick: () => void
}) {
  const type = getType(s.type_structure)
  const total = s.nb_biens ?? 0
  const occupes = s.nb_biens_occupes ?? 0
  const pct = total > 0 ? Math.round(occupes / total * 100) : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="group bg-white rounded-2xl overflow-hidden"
      style={{ border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,.04)', transition: 'all .2s ease' }}
      whileHover={{ y: -3, boxShadow: '0 16px 40px rgba(0,0,0,.1)' }}>

      {/* ── Cover photo ── */}
      <div className="relative overflow-hidden" style={{ height: '140px' }}>
        {s.photo_url ? (
          <img src={s.photo_url} alt={s.nom} className="w-full h-full object-cover"
            style={{ transition: 'transform .4s ease' }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')} />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center relative"
            style={{ background: type.gradient }}>
            <div style={{ opacity: 0.15, position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,.3) 1px, transparent 1px)', backgroundSize: '18px 18px' }} />
            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '72px', lineHeight: 1 }}>
              {type.icon}
            </div>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', fontWeight: 600, marginTop: '8px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              {type.lbl}
            </span>
          </div>
        )}

        {/* Badge type */}
        <div className="absolute top-3 left-3">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
            style={{ background: 'rgba(255,255,255,0.92)', color: type.color, backdropFilter: 'blur(8px)' }}>
            {type.icon && <span style={{ display: 'flex', transform: 'scale(0.7)', transformOrigin: 'left' }}>{type.icon}</span>}
            {type.lbl}
          </span>
        </div>

        {/* Bouton photo */}
        <button onClick={onPhotoClick}
          className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold opacity-0 group-hover:opacity-100 transition-all"
          style={{ background: 'rgba(0,0,0,0.55)', color: 'white', backdropFilter: 'blur(6px)', transform: 'translateY(4px)' }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(0)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(4px)')}>
          <IconCamera size={12} />
          {s.photo_url ? 'Changer la photo' : 'Ajouter une photo'}
        </button>
      </div>

      {/* ── Corps ── */}
      <div className="p-4">
        <div className="mb-3">
          <h3 className="font-bold text-sm mb-1 truncate" style={{ color: '#0F172A' }}>{s.nom}</h3>
          <div className="flex items-center gap-1.5">
            <IconMapPin size={12} style={{ color: '#94A3B8', flexShrink: 0 }} />
            <span className="text-xs truncate" style={{ color: '#64748B' }}>
              {s.adresse}{s.ville ? ` · ${s.ville}` : ''}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="rounded-xl p-2.5 text-center" style={{ background: '#F8FAFC', border: '1px solid #F1F5F9' }}>
            <div className="text-xs mb-0.5" style={{ color: '#94A3B8' }}>Biens</div>
            <div className="text-lg font-bold" style={{ color: '#0F172A' }}>{total}</div>
          </div>
          <div className="rounded-xl p-2.5 text-center" style={{ background: '#F8FAFC', border: '1px solid #F1F5F9' }}>
            <div className="text-xs mb-0.5" style={{ color: '#94A3B8' }}>Occupés</div>
            <div className="text-lg font-bold" style={{ color: '#059669' }}>{occupes}</div>
          </div>
          <div className="rounded-xl p-2.5 text-center" style={{ background: '#F8FAFC', border: '1px solid #F1F5F9' }}>
            <div className="text-xs mb-0.5" style={{ color: '#94A3B8' }}>Taux</div>
            <div className="text-lg font-bold" style={{ color: pct >= 80 ? '#059669' : pct >= 50 ? '#D97706' : '#EF4444' }}>
              {pct}%
            </div>
          </div>
        </div>

        {/* Barre occupation */}
        {total > 0 && (
          <div className="mb-3">
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#E2E8F0' }}>
              <motion.div className="h-full rounded-full"
                initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, delay: i * 0.06 + 0.3 }}
                style={{ background: pct >= 80 ? '#059669' : pct >= 50 ? '#D97706' : '#EF4444' }} />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-3" style={{ borderTop: '1px solid #F1F5F9' }}>
          <button onClick={onEdit}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold"
            style={{ background: '#EFF6FF', color: '#2563EB' }}>
            <IconEdit size={13} /> Modifier
          </button>
          <Link href={`/bailleur/biens?structure=${s.id}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold"
            style={{ background: '#F8FAFC', color: '#475569', textDecoration: 'none' }}>
            <IconHome2 size={13} /> Voir les biens
            <IconChevronRight size={12} style={{ marginLeft: 'auto' }} />
          </Link>
          <button onClick={onDelete}
            className="w-9 flex items-center justify-center py-2 rounded-lg"
            style={{ background: '#FEF2F2', color: '#EF4444' }}>
            <IconTrash size={13} />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// ── Modal upload photo structure ───────────────────────────
function PhotoModal({ structure, onClose, onSuccess }: {
  structure: Structure; onClose: () => void; onSuccess: (url: string) => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleFile = async (file: File) => {
    setUploading(true); setProgress(0)
    const timer = setInterval(() => setProgress(p => Math.min(p + 12, 85)), 200)
    try {
      const fd = new FormData()
      fd.append('fichier', file)
      fd.append('type_document', 'structure')
      fd.append('objet_id', structure.id.toString())
      fd.append('est_principal', 'true')
      const res = await api.post('/upload/', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      clearInterval(timer); setProgress(100)
      toast.success('Photo mise à jour !')
      onSuccess(res.data.url_publique)
      setTimeout(onClose, 600)
    } catch {
      clearInterval(timer)
      toast.error('Erreur lors de l\'upload')
    } finally { setUploading(false) }
  }

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
        onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 w-full max-w-sm" style={{ boxShadow: '0 24px 60px rgba(0,0,0,.2)' }}
          onClick={e => e.stopPropagation()}>
          
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold" style={{ color: '#0F172A' }}>Photo de la structure</h3>
              <p className="text-xs" style={{ color: '#94A3B8' }}>{structure.nom}</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: '#F1F5F9', color: '#64748B' }}>
              <IconX size={14} />
            </button>
          </div>

          {/* Preview actuelle */}
          <div className="rounded-xl overflow-hidden mb-4"
            style={{ height: '140px', background: getType(structure.type_structure).gradient }}>
            {structure.photo_url ? (
              <img src={structure.photo_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <IconPhoto size={36} style={{ color: 'rgba(255,255,255,0.4)' }} />
              </div>
            )}
          </div>

          {/* Upload */}
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = '' }}
            style={{ display: 'none' }} />

          {uploading ? (
            <div className="p-4 rounded-xl" style={{ background: '#EFF6FF', border: '1px solid #DBEAFE' }}>
              <div className="flex items-center gap-2 mb-2">
                <IconLoader2 size={14} className="text-blue-500" style={{ animation: 'spin 1s linear infinite' }} />
                <span className="text-xs font-semibold" style={{ color: '#2563EB' }}>Upload en cours... {progress}%</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#DBEAFE' }}>
                <motion.div className="h-full rounded-full" animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }} style={{ background: '#2563EB' }} />
              </div>
            </div>
          ) : (
            <button onClick={() => fileRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold"
              style={{ background: 'linear-gradient(135deg,#2563EB,#1D4ED8)', color: 'white', boxShadow: '0 4px 14px rgba(37,99,235,.4)' }}>
              <IconCamera size={16} />
              {structure.photo_url ? 'Changer la photo' : 'Choisir une photo'}
            </button>
          )}
          <p className="text-xs mt-2 text-center" style={{ color: '#94A3B8' }}>JPG, PNG ou WEBP · Max 5 Mo</p>
        </div>
      </motion.div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </>
  )
}

// ── Page principale ────────────────────────────────────────
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
  const [photoModal, setPhotoModal] = useState<Structure | null>(null)

  const emptyForm: FormData = { nom: '', type_structure: 'immeuble', adresse: '', ville: 'Douala', description: '' }
  const [form, setForm] = useState<FormData>(emptyForm)

  useEffect(() => { const init = async () => { await load() }; init() }, [])

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get<PaginatedResponse<Structure>>('/structures/')
      setStructures(res.data.results)
    } catch { } finally { setLoading(false) }
  }

  const openAdd = () => { setEditItem(null); setForm(emptyForm); setErrors({}); setShowForm(true) }
  const openEdit = (s: Structure) => {
    setEditItem(s)
    setForm({ nom: s.nom, type_structure: s.type_structure, adresse: s.adresse, ville: s.ville ?? 'Douala', description: s.description ?? '' })
    setErrors({}); setShowForm(true)
  }

  const validate = (): boolean => {
    const e: Record<string, string> = {}
    if (!form.nom.trim()) e.nom = 'Le nom est requis'
    if (!form.adresse.trim()) e.adresse = "L'adresse est requise"
    setErrors(e); return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      if (editItem) { await api.put(`/structures/${editItem.id}/`, form) }
      else { await api.post('/structures/', form) }
      setSuccess(true)
      setTimeout(() => { setSuccess(false); setShowForm(false); load() }, 1400)
    } catch (err: unknown) {
      const e = err as { response?: { data?: Record<string, string[]> } }
      if (e.response?.data) {
        const apiErrors: Record<string, string> = {}
        Object.entries(e.response.data).forEach(([k, v]) => { apiErrors[k] = Array.isArray(v) ? v[0] : String(v) })
        setErrors(apiErrors)
      }
    } finally { setSaving(false) }
  }

  const handleDelete = async (id: number) => {
    try { await api.delete(`/structures/${id}/`); setDeleteId(null); load() }
    catch { setDeleteId(null); toast.error('Erreur lors de la suppression') }
  }

  const set = (k: keyof FormData, v: string) => setForm(p => ({ ...p, [k]: v }))

  const filtered = structures.filter(s =>
    !search || s.nom.toLowerCase().includes(search.toLowerCase()) ||
    s.adresse.toLowerCase().includes(search.toLowerCase())
  )

  // Stats globales
  const totalBiens   = structures.reduce((a, s) => a + (s.nb_biens ?? 0), 0)
  const totalOccupes = structures.reduce((a, s) => a + (s.nb_biens_occupes ?? 0), 0)
  const tauxGlobal   = totalBiens > 0 ? Math.round(totalOccupes / totalBiens * 100) : 0

  if (!user) return null

  return (
    <>
      <style>{`
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes spin{to{transform:rotate(360deg)}}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:#E2E8F0;border-radius:4px}
        .input-field{width:100%;height:42px;padding:0 12px;border-radius:10px;border:1.5px solid #E2E8F0;font-size:13px;color:#0F172A;outline:none;background:#fff;transition:border-color .15s;font-family:inherit}
        .input-field:focus{border-color:#2563EB;box-shadow:0 0 0 3px rgba(37,99,235,.1)}
        .input-field.error{border-color:#EF4444}
        .textarea-field{width:100%;padding:10px 12px;border-radius:10px;border:1.5px solid #E2E8F0;font-size:13px;color:#0F172A;outline:none;background:#fff;resize:vertical;min-height:80px;font-family:inherit;transition:border-color .15s}
        .textarea-field:focus{border-color:#2563EB}
        .select-field{width:100%;height:42px;padding:0 12px;border-radius:10px;border:1.5px solid #E2E8F0;font-size:13px;color:#0F172A;outline:none;background:#fff;cursor:pointer;font-family:inherit}
      `}</style>

      <div className="flex h-screen overflow-hidden"
        style={{ background: '#F1F5F9', fontFamily: "'DM Sans','Helvetica Neue',sans-serif" }}>
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* ── Header ── */}
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
                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#EFF6FF', color: '#2563EB' }}>
                  {structures.length}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={load} className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: '#F1F5F9', border: '1px solid #E2E8F0' }}>
                <IconRefresh size={15} style={{ color: '#64748B', animation: loading ? 'spin 1s linear infinite' : 'none' }} />
              </button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: .98 }} onClick={openAdd}
                className="flex items-center gap-2 px-4 h-9 rounded-xl text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg,#2563EB,#1D4ED8)', boxShadow: '0 2px 8px rgba(37,99,235,.35)' }}>
                <IconPlus size={15} />
                <span className="hidden sm:inline">Nouvelle structure</span>
              </motion.button>
            </div>
          </header>

          {/* ── Contenu ── */}
          <div className="flex-1 overflow-y-auto">

            {/* KPIs + Recherche */}
            <div className="px-6 pt-5 pb-4">
              {/* Stats globales */}
              {!loading && structures.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mb-5">
                  {[
                    { lbl: 'Structures', val: structures.length, color: '#2563EB', bg: '#EFF6FF', ico: <IconBuilding size={16}/> },
                    { lbl: 'Biens totaux', val: totalBiens, color: '#7C3AED', bg: '#F5F3FF', ico: <IconHome2 size={16}/> },
                    { lbl: "Taux d'occupation", val: `${tauxGlobal}%`, color: tauxGlobal >= 80 ? '#059669' : '#D97706', bg: tauxGlobal >= 80 ? '#ECFDF5' : '#FFFBEB', ico: <IconTrendingUp size={16}/> },
                  ].map(stat => (
                    <div key={stat.lbl} className="rounded-2xl p-4 flex items-center gap-3"
                      style={{ background: 'white', border: '1px solid #E2E8F0' }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: stat.bg, color: stat.color }}>
                        {stat.ico}
                      </div>
                      <div>
                        <div className="text-xl font-bold" style={{ color: '#0F172A', lineHeight: 1 }}>{stat.val}</div>
                        <div className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>{stat.lbl}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Recherche */}
              <div className="relative">
                <IconSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#94A3B8' }} />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Rechercher une structure..." className="input-field"
                  style={{ paddingLeft: '36px' }} />
              </div>
            </div>

            {/* Grille */}
            <div className="px-6 pb-6">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {Array(4).fill(0).map((_, i) => <Skeleton key={i} />)}
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5"
                    style={{ background: 'linear-gradient(135deg,#EFF6FF,#DBEAFE)' }}>
                    <IconBuilding size={36} style={{ color: '#93C5FD' }} />
                  </div>
                  <h3 className="text-base font-bold mb-2" style={{ color: '#0F172A' }}>
                    {search ? 'Aucune structure trouvée' : 'Aucune structure pour l\'instant'}
                  </h3>
                  <p className="text-sm mb-6" style={{ color: '#64748B' }}>
                    {search ? 'Modifiez votre recherche' : 'Créez votre premier immeuble, résidence ou villa divisée.'}
                  </p>
                  {!search && (
                    <button onClick={openAdd}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white"
                      style={{ background: 'linear-gradient(135deg,#2563EB,#1D4ED8)', boxShadow: '0 4px 14px rgba(37,99,235,.4)' }}>
                      <IconPlus size={15} /> Créer une structure
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filtered.map((s, i) => (
                    <StructureCard key={s.id} s={s} i={i}
                      onEdit={() => openEdit(s)}
                      onDelete={() => setDeleteId(s.id)}
                      onPhotoClick={() => setPhotoModal(s)} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── DRAWER FORMULAIRE ── */}
        <AnimatePresence>
          {showForm && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-40"
                style={{ background: 'rgba(0,0,0,.35)', backdropFilter: 'blur(4px)' }}
                onClick={() => setShowForm(false)} />
              <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 280 }}
                className="fixed right-0 top-0 bottom-0 z-50 overflow-y-auto"
                style={{ width: 'min(480px, 100vw)', background: '#fff', boxShadow: '-8px 0 40px rgba(0,0,0,.15)' }}>

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
                    className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#F1F5F9' }}>
                    <IconX size={16} style={{ color: '#64748B' }} />
                  </button>
                </div>

                <div className="px-6 py-5 space-y-6">
                  {/* Type */}
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#94A3B8' }}>Type</div>
                    <div className="grid grid-cols-3 gap-2">
                      {TYPES.map(t => (
                        <button key={t.val} onClick={() => set('type_structure', t.val)}
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

                  {/* Informations */}
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#94A3B8' }}>Informations</div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>
                          Nom <span style={{ color: '#EF4444' }}>*</span>
                        </label>
                        <input value={form.nom} onChange={e => set('nom', e.target.value)}
                          placeholder="Ex: Immeuble Les Cocotiers"
                          className={`input-field ${errors.nom ? 'error' : ''}`} />
                        {errors.nom && <p className="text-xs mt-1" style={{ color: '#EF4444' }}>{errors.nom}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>Description</label>
                        <textarea value={form.description} onChange={e => set('description', e.target.value)}
                          placeholder="Décrivez la structure..." className="textarea-field" />
                      </div>
                    </div>
                  </div>

                  {/* Localisation */}
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#94A3B8' }}>Localisation</div>
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

                <div className="sticky bottom-0 bg-white px-6 py-4 flex gap-3"
                  style={{ borderTop: '1px solid #F1F5F9', boxShadow: '0 -4px 16px rgba(0,0,0,.06)' }}>
                  <button onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-xl text-sm font-semibold"
                    style={{ background: '#F1F5F9', color: '#64748B' }}>Annuler</button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: .98 }}
                    onClick={handleSubmit} disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white"
                    style={{ background: success ? '#059669' : 'linear-gradient(135deg,#2563EB,#1D4ED8)', boxShadow: '0 2px 10px rgba(37,99,235,.3)' }}>
                    {saving ? <><IconLoader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Enregistrement...</>
                      : success ? <><IconCheck size={16} /> Enregistré !</>
                      : <><IconCheck size={16} /> {editItem ? 'Mettre à jour' : 'Créer'}</>}
                  </motion.button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ── MODAL SUPPRESSION ── */}
        <AnimatePresence>
          {deleteId !== null && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{ background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(6px)' }}>
              <motion.div initial={{ scale: .9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: .9, opacity: 0 }} transition={{ duration: .2 }}
                className="bg-white rounded-2xl p-6 w-full max-w-sm"
                style={{ boxShadow: '0 20px 60px rgba(0,0,0,.2)' }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: '#FEF2F2' }}>
                  <IconAlertCircle size={24} style={{ color: '#EF4444' }} />
                </div>
                <h3 className="text-base font-bold mb-2" style={{ color: '#0F172A' }}>Supprimer cette structure ?</h3>
                <p className="text-sm mb-5" style={{ color: '#64748B', lineHeight: 1.6 }}>
                  Cette action est irréversible. Tous les biens associés seront également supprimés.
                </p>
                <div className="flex gap-3">
                  <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                    style={{ background: '#F1F5F9', color: '#64748B' }}>Annuler</button>
                  <button onClick={() => handleDelete(deleteId)} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white"
                    style={{ background: '#EF4444' }}>Supprimer</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── MODAL PHOTO ── */}
        <AnimatePresence>
          {photoModal && (
            <PhotoModal
              structure={photoModal}
              onClose={() => setPhotoModal(null)}
              onSuccess={(url) => {
                setStructures(prev => prev.map(s => s.id === photoModal.id ? { ...s, photo_url: url } : s))
                setPhotoModal(null)
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
