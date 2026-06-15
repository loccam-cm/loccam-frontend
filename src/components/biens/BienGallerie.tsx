'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  IconX, IconChevronLeft, IconChevronRight,
  IconPhoto,  IconStar, IconBuilding,
} from '@tabler/icons-react'

interface Photo {
  id: number
  url_publique: string
  est_principal: boolean
  nom_original: string
  taille: number
  date_upload: string
}

interface Bien {
  id: number
  titre: string
  adresse: string
  photos?: Photo[]
}

interface Props {
  bien: Bien
  onClose: () => void
}

function formatTaille(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function BienGallerie({ bien, onClose }: Props) {
  const photos = bien.photos ?? []
  const [activeIdx, setActiveIdx] = useState(
    Math.max(photos.findIndex(p => p.est_principal), 0)
  )

  const prev = () => setActiveIdx(i => (i - 1 + photos.length) % photos.length)
  const next = () => setActiveIdx(i => (i + 1) % photos.length)

  const activePhoto = photos[activeIdx]

  return (
    <>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50"
        style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
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
          className="w-full max-w-4xl bg-white rounded-2xl overflow-hidden"
          style={{ pointerEvents: 'all', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                <IconBuilding size={17} className="text-blue-500" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-slate-900 truncate">{bien.titre}</div>
                <div className="text-xs text-slate-400">{photos.length} photo{photos.length > 1 ? 's' : ''}</div>
              </div>
            </div>
            <button onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
              <IconX size={16} />
            </button>
          </div>

          {photos.length === 0 ? (
            /* Aucune photo */
            <div className="flex flex-col items-center justify-center py-20 flex-1">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                <IconPhoto size={28} className="text-slate-300" />
              </div>
              <div className="text-sm font-semibold text-slate-400 mb-1">Aucune photo</div>
              <div className="text-xs text-slate-300">Uploadez des photos depuis la fiche du bien</div>
            </div>
          ) : (
            <div className="flex flex-col flex-1 overflow-hidden">

              {/* Photo principale */}
              <div className="relative flex-1 bg-slate-900 flex items-center justify-center"
                style={{ minHeight: '300px', maxHeight: '500px' }}>
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeIdx}
                    src={activePhoto?.url_publique}
                    alt={activePhoto?.nom_original}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="max-w-full max-h-full object-contain"
                    style={{ maxHeight: '500px' }}
                  />
                </AnimatePresence>

                {/* Badge principale */}
                {activePhoto?.est_principal && (
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                    style={{ background: 'rgba(245,158,11,0.9)', color: 'white' }}>
                    <IconStar size={11} />
                    Photo principale
                  </div>
                )}

                {/* Numéro */}
                <div className="absolute top-3 right-3 px-3 py-1.5 rounded-full text-xs font-semibold"
                  style={{ background: 'rgba(0,0,0,0.5)', color: 'white' }}>
                  {activeIdx + 1} / {photos.length}
                </div>

                {/* Flèches */}
                {photos.length > 1 && (
                  <>
                    <button onClick={prev}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl flex items-center justify-center transition-all"
                      style={{ background: 'rgba(255,255,255,0.15)', color: 'white', backdropFilter: 'blur(4px)' }}>
                      <IconChevronLeft size={20} />
                    </button>
                    <button onClick={next}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl flex items-center justify-center transition-all"
                      style={{ background: 'rgba(255,255,255,0.15)', color: 'white', backdropFilter: 'blur(4px)' }}>
                      <IconChevronRight size={20} />
                    </button>
                  </>
                )}

                {/* Info photo active */}
                <div className="absolute bottom-0 left-0 right-0 px-4 py-3"
                  style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }}>
                  <div className="text-xs text-white/80 truncate">{activePhoto?.nom_original}</div>
                  <div className="text-xs text-white/50">
                    {activePhoto && formatTaille(activePhoto.taille)} · {activePhoto && new Date(activePhoto.date_upload).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              </div>

              {/* Thumbnails */}
              {photos.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto flex-shrink-0 bg-slate-50 border-t border-slate-100">
                  {photos.map((p, i) => (
                    <button key={p.id} onClick={() => setActiveIdx(i)}
                      className="relative flex-shrink-0 rounded-xl overflow-hidden transition-all"
                      style={{
                        width: '72px', height: '56px',
                        border: i === activeIdx ? '2.5px solid #2563EB' : '2.5px solid transparent',
                        opacity: i === activeIdx ? 1 : 0.6,
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
    </>
  )
}
