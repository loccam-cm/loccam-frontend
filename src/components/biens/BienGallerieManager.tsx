'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import api from '@/lib/api'
import {
  IconX, IconChevronLeft, IconChevronRight, IconPhoto,
  IconStar, IconBuilding, IconTrash, IconLoader2,
  IconUpload, IconCheck, IconPlus, IconZoomIn,
} from '@tabler/icons-react'

// ── Types ──────────────────────────────────────────────────
export interface PhotoBien {
  id: number
  url_publique: string
  est_principal: boolean
  nom_original: string
  taille: number
  date_upload: string
  object_id: number
}

interface Props {
  bienId: number
  bienTitre: string
  photos: PhotoBien[]
  onClose: () => void
  onUpdate: () => void  // callback pour recharger les photos dans la page parent
}

type Vue = 'grille' | 'zoom'

function formatTaille(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function BienGallerieManager({ bienId, bienTitre, photos: initialPhotos, onClose, onUpdate }: Props) {
  const [photos, setPhotos]       = useState<PhotoBien[]>(initialPhotos)
  const [vue, setVue]             = useState<Vue>('grille')
  const [zoomIdx, setZoomIdx]     = useState(0)
  const [deleting, setDeleting]   = useState<number | null>(null)
  const [confirmId, setConfirmId] = useState<number | null>(null)
  const [promoting, setPromoting] = useState<number | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)

  const principale = photos.find(p => p.est_principal) ?? photos[0]

  // ── C : Upload ────────────────────────────────────────────
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    setUploading(true)
    setUploadProgress(0)

    const timer = setInterval(() => setUploadProgress(p => Math.min(p + 12, 85)), 200)

    try {
      const formData = new FormData()
      formData.append('fichier', file)
      formData.append('type_document', 'photo_bien')
      formData.append('objet_id', bienId.toString())
      formData.append('est_principal', photos.length === 0 ? 'true' : 'false')

      const res = await api.post('/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      clearInterval(timer)
      setUploadProgress(100)

      const newPhoto: PhotoBien = {
        id            : res.data.id,
        url_publique  : res.data.url_publique,
        est_principal : photos.length === 0,
        nom_original  : res.data.nom_original,
        taille        : res.data.taille,
        date_upload   : res.data.date_upload,
        object_id     : bienId,
      }
      setPhotos(prev => [...prev, newPhoto])
      toast.success('Photo ajoutée !')
      onUpdate()
    } catch (err: unknown) {
      clearInterval(timer)
      const e = err as { response?: { data?: { error?: string } } }
      toast.error(e.response?.data?.error ?? 'Erreur upload')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  // ── U : Définir comme principale ──────────────────────────
  const handleSetPrincipale = async (photo: PhotoBien) => {
    if (photo.est_principal) return
    setPromoting(photo.id)
    try {
      // Met à jour toutes les photos localement
      setPhotos(prev => prev.map(p => ({ ...p, est_principal: p.id === photo.id })))

      // Appel API — on met à jour le document
      await api.patch(`/documents/${photo.id}/`, { est_principal: true })

      // Retirer principale des autres
      const others = photos.filter(p => p.est_principal && p.id !== photo.id)
      await Promise.all(others.map(p => api.patch(`/documents/${p.id}/`, { est_principal: false })))

      toast.success('Photo principale mise à jour')
      onUpdate()
    } catch {
      toast.error('Erreur mise à jour')
      setPhotos(initialPhotos) // revert
    } finally {
      setPromoting(null)
    }
  }

  // ── D : Supprimer ─────────────────────────────────────────
  const handleDelete = async (id: number) => {
    setDeleting(id)
    try {
      await api.delete(`/documents/${id}/`)
      const newPhotos = photos.filter(p => p.id !== id)

      // Si on supprime la principale, on promeut la première restante
      if (photos.find(p => p.id === id)?.est_principal && newPhotos.length > 0) {
        newPhotos[0].est_principal = true
        await api.patch(`/documents/${newPhotos[0].id}/`, { est_principal: true }).catch(() => {})
      }

      setPhotos(newPhotos)
      setConfirmId(null)

      // Si on était en zoom sur cette photo
      if (vue === 'zoom') {
        if (newPhotos.length === 0) setVue('grille')
        else setZoomIdx(i => Math.min(i, newPhotos.length - 1))
      }

      toast.success('Photo supprimée')
      onUpdate()
    } catch {
      toast.error('Erreur suppression')
    } finally {
      setDeleting(null)
    }
  }

  // ── Zoom ──────────────────────────────────────────────────
  const openZoom = (idx: number) => { setZoomIdx(idx); setVue('zoom') }
  const prevZoom = () => setZoomIdx(i => (i - 1 + photos.length) % photos.length)
  const nextZoom = () => setZoomIdx(i => (i + 1) % photos.length)

  return (
    <>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50"
        style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ pointerEvents: 'none' }}>
        <div
          className="w-full max-w-4xl bg-white rounded-2xl overflow-hidden flex flex-col"
          style={{ pointerEvents: 'all', maxHeight: '92vh' }}>

          {/* ── Header ── */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                <IconBuilding size={17} className="text-blue-500" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-slate-900 truncate">{bienTitre}</div>
                <div className="text-xs text-slate-400">
                  {photos.length} photo{photos.length > 1 ? 's' : ''} · Gérer les photos
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Toggle vue */}
              {vue === 'zoom' && (
                <button onClick={() => setVue('grille')}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors">
                  Grille
                </button>
              )}
              <button onClick={onClose}
                className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
                <IconX size={16} />
              </button>
            </div>
          </div>

          {/* ── VUE GRILLE ── */}
          {vue === 'grille' && (
            <div className="flex-1 overflow-y-auto">

              {/* Zone upload */}
              <div className="p-4 border-b border-slate-100">
                <input ref={fileRef} type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleUpload}
                  style={{ display: 'none' }} />

                {uploading ? (
                  <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <IconLoader2 size={16} className="text-blue-500 animate-spin" />
                      <span className="text-sm font-semibold text-blue-700">Upload en cours...</span>
                      <span className="text-xs text-blue-400 ml-auto">{uploadProgress}%</span>
                    </div>
                    <div className="h-1.5 bg-blue-100 rounded-full overflow-hidden">
                      <motion.div className="h-full bg-blue-500 rounded-full"
                        animate={{ width: `${uploadProgress}%` }}
                        transition={{ duration: 0.3 }} />
                    </div>
                  </div>
                ) : (
                  <button onClick={() => fileRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-slate-200 text-sm font-semibold text-slate-500 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50 transition-all">
                    <IconPlus size={16} />
                    Ajouter une photo
                  </button>
                )}
              </div>

              {/* Grille photos */}
              {photos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                    <IconPhoto size={28} className="text-slate-300" />
                  </div>
                  <div className="text-sm font-semibold text-slate-400 mb-1">Aucune photo</div>
                  <div className="text-xs text-slate-300">Cliquez sur "Ajouter une photo" ci-dessus</div>
                </div>
              ) : (
                <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {photos.map((p, i) => (
                    <motion.div key={p.id}
                      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.04 }}
                      className="relative rounded-xl overflow-hidden group"
                      style={{ aspectRatio: '4/3', background: '#F1F5F9' }}>

                      <img src={p.url_publique} alt={p.nom_original}
                        className="w-full h-full object-cover" />

                      {/* Badge principale */}
                      {p.est_principal && (
                        <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold"
                          style={{ background: 'rgba(245,158,11,0.9)', color: 'white' }}>
                          <IconStar size={10} />
                          Principale
                        </div>
                      )}

                      {/* Actions au hover */}
                      <div className="absolute inset-0 flex flex-col justify-between p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 40%, transparent 60%, rgba(0,0,0,0.6) 100%)' }}>

                        {/* Haut : zoom */}
                        <div className="flex justify-end">
                          <button onClick={() => openZoom(i)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
                            <IconZoomIn size={14} />
                          </button>
                        </div>

                        {/* Bas : actions */}
                        <div className="flex items-center justify-between gap-2">
                          {/* Définir principale */}
                          {!p.est_principal && (
                            <button onClick={() => handleSetPrincipale(p)}
                              disabled={promoting === p.id}
                              className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-semibold"
                              style={{ background: 'rgba(245,158,11,0.85)', color: 'white' }}>
                              {promoting === p.id
                                ? <IconLoader2 size={11} style={{ animation: 'spin 1s linear infinite' }} />
                                : <IconStar size={11} />
                              }
                              Principale
                            </button>
                          )}

                          {/* Supprimer */}
                          {confirmId === p.id ? (
                            <div className="flex gap-1">
                              <button onClick={() => setConfirmId(null)}
                                className="px-2 py-1.5 rounded-lg text-xs font-semibold"
                                style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
                                Non
                              </button>
                              <button onClick={() => handleDelete(p.id)}
                                disabled={deleting === p.id}
                                className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-bold"
                                style={{ background: '#EF4444', color: 'white' }}>
                                {deleting === p.id
                                  ? <IconLoader2 size={11} style={{ animation: 'spin 1s linear infinite' }} />
                                  : <IconCheck size={11} />
                                }
                                Oui
                              </button>
                            </div>
                          ) : (
                            <button onClick={() => setConfirmId(p.id)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ background: 'rgba(239,68,68,0.8)', color: 'white' }}>
                              <IconTrash size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── VUE ZOOM ── */}
          {vue === 'zoom' && photos.length > 0 && (
            <div className="flex flex-col flex-1 overflow-hidden">
              <div className="relative flex-1 bg-slate-900 flex items-center justify-center"
                style={{ minHeight: '300px' }}>
                <AnimatePresence mode="wait">
                  <motion.img
                    key={zoomIdx}
                    src={photos[zoomIdx]?.url_publique}
                    alt={photos[zoomIdx]?.nom_original}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="max-w-full max-h-full object-contain"
                    style={{ maxHeight: '60vh' }}
                  />
                </AnimatePresence>

                {photos[zoomIdx]?.est_principal && (
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                    style={{ background: 'rgba(245,158,11,0.9)', color: 'white' }}>
                    <IconStar size={11} /> Photo principale
                  </div>
                )}

                <div className="absolute top-3 right-3 px-3 py-1.5 rounded-full text-xs font-semibold"
                  style={{ background: 'rgba(0,0,0,0.5)', color: 'white' }}>
                  {zoomIdx + 1} / {photos.length}
                </div>

                {photos.length > 1 && (
                  <>
                    <button onClick={prevZoom}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}>
                      <IconChevronLeft size={20} />
                    </button>
                    <button onClick={nextZoom}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}>
                      <IconChevronRight size={20} />
                    </button>
                  </>
                )}

                {/* Info + actions */}
                <div className="absolute bottom-0 left-0 right-0 px-4 py-3 flex items-end justify-between"
                  style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75), transparent)' }}>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-white/80 truncate">{photos[zoomIdx]?.nom_original}</div>
                    <div className="text-xs text-white/50">
                      {photos[zoomIdx] && formatTaille(photos[zoomIdx].taille)} · {photos[zoomIdx] && new Date(photos[zoomIdx].date_upload).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                    {!photos[zoomIdx]?.est_principal && (
                      <button onClick={() => handleSetPrincipale(photos[zoomIdx])}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
                        style={{ background: 'rgba(245,158,11,0.85)', color: 'white' }}>
                        <IconStar size={11} /> Principale
                      </button>
                    )}
                    {confirmId === photos[zoomIdx]?.id ? (
                      <div className="flex gap-1">
                        <button onClick={() => setConfirmId(null)}
                          className="px-2 py-1.5 rounded-lg text-xs"
                          style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}>Non</button>
                        <button onClick={() => handleDelete(photos[zoomIdx].id)}
                          disabled={!!deleting}
                          className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-bold"
                          style={{ background: '#EF4444', color: 'white' }}>
                          {deleting ? <IconLoader2 size={11} style={{ animation: 'spin 1s linear infinite' }} /> : <IconCheck size={11} />}
                          Oui
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmId(photos[zoomIdx]?.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
                        style={{ background: 'rgba(239,68,68,0.25)', color: '#FCA5A5', border: '1px solid rgba(239,68,68,0.3)' }}>
                        <IconTrash size={11} /> Supprimer
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Thumbnails */}
              {photos.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto flex-shrink-0 bg-slate-50 border-t border-slate-100">
                  {photos.map((p, i) => (
                    <button key={p.id} onClick={() => setZoomIdx(i)}
                      className="relative flex-shrink-0 rounded-xl overflow-hidden"
                      style={{
                        width: '72px', height: '56px',
                        border: i === zoomIdx ? '2.5px solid #2563EB' : '2.5px solid transparent',
                        opacity: i === zoomIdx ? 1 : 0.55,
                      }}>
                      <img src={p.url_publique} alt="" className="w-full h-full object-cover" />
                      {p.est_principal && (
                        <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center">
                          <IconStar size={8} color="white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </>
  )
}
