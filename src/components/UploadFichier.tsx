'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '@/lib/api'
import {
  IconUpload, IconX, IconCheck, IconPhoto,
  IconFileText, IconLoader2, IconAlertCircle,
  IconEye, IconTrash,
} from '@tabler/icons-react'

// ── Types ─────────────────────────────────────────────────────
type TypeDocument =
  | 'avatar' | 'photo_bien' | 'structure'
  | 'cni' | 'contrat' | 'quittance' | 'facture'

interface DocumentUploade {
  id: number
  url: string
  type_document: string
  nom_original: string
  format: string
  taille: number
  date_upload: string
}

interface Props {
  typeDocument: TypeDocument
  objetId?: number
  label?: string
  description?: string
  multiple?: boolean
  estPrincipal?: boolean
  onSuccess?: (doc: DocumentUploade) => void
  onError?: (err: string) => void
  className?: string
  compact?: boolean
  previewActuel?: string
}

// ── Utilitaires ───────────────────────────────────────────────
const ACCEPTS: Record<TypeDocument, string> = {
  avatar:     'image/jpeg,image/png,image/webp',
  photo_bien: 'image/jpeg,image/png,image/webp',
  structure:  'image/jpeg,image/png,image/webp',
  cni:        'image/jpeg,image/png,application/pdf',
  contrat:    'application/pdf',
  quittance:  'application/pdf',
  facture:    'application/pdf,image/jpeg,image/png',
}

const LABELS_TYPE: Record<TypeDocument, string> = {
  avatar:     'photo de profil',
  photo_bien: 'photo du bien',
  structure:  'photo de la structure',
  cni:        'photo CNI',
  contrat:    'contrat PDF',
  quittance:  'quittance PDF',
  facture:    'facture',
}

function formatTaille(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function isImage(format: string): boolean {
  return ['jpg', 'jpeg', 'png', 'webp'].includes(format.toLowerCase())
}

// ── Composant principal ───────────────────────────────────────
export default function UploadFichier({
  typeDocument, objetId, label, description,
  multiple = false, estPrincipal = false,
  onSuccess, onError, className = '', compact = false,
  previewActuel,
}: Props) {

  const [isDragging, setIsDragging]   = useState(false)
  const [uploading, setUploading]     = useState(false)
  const [progress, setProgress]       = useState(0)
  const [uploaded, setUploaded]       = useState<DocumentUploade | null>(null)
  const [error, setError]             = useState('')
  const [preview, setPreview]         = useState<string>(previewActuel ?? '')
  const inputRef = useRef<HTMLInputElement>(null)

  const isPDF = ['contrat', 'quittance', 'facture'].includes(typeDocument)
  const isPrivate = ['cni', 'contrat', 'quittance', 'facture'].includes(typeDocument)

  const handleFile = useCallback(async (file: File) => {
    setError(''); setUploading(true); setProgress(0)

    // Preview immédiate pour les images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = e => setPreview(e.target?.result as string)
      reader.readAsDataURL(file)
    }

    try {
      const formData = new FormData()
      formData.append('fichier', file)
      formData.append('type_document', typeDocument)
      if (objetId) formData.append('objet_id', objetId.toString())
      if (estPrincipal) formData.append('est_principal', 'true')

      // Simulation progression (API ne supporte pas encore streaming)
      const progressTimer = setInterval(() => {
        setProgress(prev => Math.min(prev + 15, 85))
      }, 200)

      const res = await api.post('/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      clearInterval(progressTimer)
      setProgress(100)

      const doc = res.data as DocumentUploade
      setUploaded(doc)
      onSuccess?.(doc)

      setTimeout(() => setProgress(0), 800)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      const msg = e.response?.data?.error ?? 'Erreur lors de l\'upload'
      setError(msg)
      setPreview(previewActuel ?? '')
      onError?.(msg)
    } finally {
      setUploading(false)
    }
  }, [typeDocument, objetId, estPrincipal, onSuccess, onError, previewActuel])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  const reset = () => {
    setUploaded(null); setPreview(previewActuel ?? ''); setError('')
  }

  // ── Rendu compact (pour avatar / mini zones) ──────────────
  if (compact) {
    return (
      <div className={`relative ${className}`}>
        <div
          onClick={() => !uploading && inputRef.current?.click()}
          className="relative cursor-pointer group"
          style={{ width: '80px', height: '80px' }}>

          {preview ? (
            <img src={preview} alt="Preview"
                 className="w-full h-full rounded-2xl object-cover"
                 style={{ border: '2px solid #E2E8F0' }} />
          ) : (
            <div className="w-full h-full rounded-2xl flex items-center justify-center"
                 style={{ background: '#F1F5F9', border: '2px dashed #CBD5E1' }}>
              <IconPhoto size={24} style={{ color: '#94A3B8' }} />
            </div>
          )}

          {/* Overlay hover */}
          <div className="absolute inset-0 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
               style={{ background: 'rgba(0,0,0,.45)' }}>
            {uploading
              ? <IconLoader2 size={20} color="white" style={{ animation: 'spin 1s linear infinite' }} />
              : <IconUpload size={20} color="white" />}
          </div>
        </div>
        <input ref={inputRef} type="file" accept={ACCEPTS[typeDocument]}
               onChange={onChange} style={{ display: 'none' }} />
        {uploaded && (
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
               style={{ background: '#059669' }}>
            <IconCheck size={11} color="white" />
          </div>
        )}
      </div>
    )
  }

  // ── Rendu complet ─────────────────────────────────────────
  return (
    <div className={className}>
      {/* Label */}
      {label && (
        <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>
          {label}
        </label>
      )}

      {/* Zone drop */}
      {!uploaded ? (
        <motion.div
          onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          onClick={() => !uploading && inputRef.current?.click()}
          animate={{ borderColor: isDragging ? '#2563EB' : error ? '#EF4444' : '#E2E8F0', scale: isDragging ? 1.01 : 1 }}
          transition={{ duration: .15 }}
          className="relative flex flex-col items-center justify-center gap-3 rounded-2xl cursor-pointer transition-colors"
          style={{
            border: `2px dashed ${isDragging ? '#2563EB' : error ? '#EF4444' : '#E2E8F0'}`,
            background: isDragging ? '#EFF6FF' : '#FAFAFA',
            minHeight: compact ? '80px' : preview ? 'auto' : '140px',
            padding: '20px',
            overflow: 'hidden',
          }}>

          {/* Preview image */}
          {preview && !isPDF && (
            <div className="w-full relative">
              <img src={preview} alt="Preview"
                   className="w-full rounded-xl object-cover"
                   style={{ maxHeight: '180px' }} />
              <div className="absolute inset-0 rounded-xl flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                   style={{ background: 'rgba(0,0,0,.4)' }}>
                <IconUpload size={24} color="white" />
              </div>
            </div>
          )}

          {/* Icône et texte */}
          {(!preview || isPDF) && (
            <>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                   style={{ background: isDragging ? '#DBEAFE' : '#F1F5F9' }}>
                {uploading
                  ? <IconLoader2 size={22} style={{ color: '#2563EB', animation: 'spin 1s linear infinite' }} />
                  : isPDF
                    ? <IconFileText size={22} style={{ color: isDragging ? '#2563EB' : '#94A3B8' }} />
                    : <IconPhoto size={22} style={{ color: isDragging ? '#2563EB' : '#94A3B8' }} />}
              </div>

              {!uploading && (
                <div className="text-center">
                  <p className="text-sm font-semibold" style={{ color: '#374151' }}>
                    {isDragging ? 'Déposez ici' : `Uploader ${LABELS_TYPE[typeDocument]}`}
                  </p>
                  <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>
                    {description ?? `Glissez-déposez ou cliquez pour choisir`}
                  </p>
                  {isPrivate && (
                    <p className="text-xs mt-1.5 font-medium" style={{ color: '#7C3AED' }}>
                      🔒 Fichier privé — accès restreint
                    </p>
                  )}
                </div>
              )}
            </>
          )}

          {/* Barre progression */}
          {uploading && (
            <div className="w-full">
              <div className="flex justify-between text-xs mb-1">
                <span style={{ color: '#64748B' }}>Upload en cours...</span>
                <span style={{ color: '#2563EB' }}>{progress}%</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: '#E2E8F0' }}>
                <motion.div className="h-full rounded-full"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: .3 }}
                  style={{ background: 'linear-gradient(90deg,#2563EB,#7C3AED)' }} />
              </div>
            </div>
          )}
        </motion.div>
      ) : (
        /* Fichier uploadé avec succès */
        <motion.div initial={{ opacity: 0, scale: .97 }} animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-3 p-4 rounded-2xl"
          style={{ background: '#ECFDF5', border: '1px solid #A7F3D0' }}>

          {/* Preview ou icône */}
          {preview && isImage(uploaded.format) ? (
            <img src={preview} alt=""
                 className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                 style={{ border: '1px solid #D1FAE5' }} />
          ) : (
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                 style={{ background: '#D1FAE5' }}>
              <IconFileText size={22} style={{ color: '#059669' }} />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <IconCheck size={14} style={{ color: '#059669', flexShrink: 0 }} />
              <span className="text-sm font-semibold truncate" style={{ color: '#059669' }}>
                Uploadé avec succès
              </span>
            </div>
            <div className="text-xs truncate" style={{ color: '#64748B' }}>
              {uploaded.nom_original}
            </div>
            <div className="text-xs" style={{ color: '#94A3B8' }}>
              {formatTaille(uploaded.taille)}
              {isPrivate && ' · Fichier privé'}
            </div>
          </div>

          <div className="flex gap-1.5 flex-shrink-0">
            {isImage(uploaded.format) && (
              <button onClick={() => window.open(preview, '_blank')}
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: '#D1FAE5', color: '#059669' }}>
                <IconEye size={14} />
              </button>
            )}
            <button onClick={reset}
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: '#FEF2F2', color: '#DC2626' }}>
              <IconTrash size={14} />
            </button>
          </div>
        </motion.div>
      )}

      {/* Erreur */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="flex items-center gap-2 mt-2 px-3 py-2 rounded-xl"
                      style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
            <IconAlertCircle size={14} style={{ color: '#DC2626', flexShrink: 0 }} />
            <span className="text-xs" style={{ color: '#DC2626' }}>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <input ref={inputRef} type="file" accept={ACCEPTS[typeDocument]}
             multiple={multiple} onChange={onChange} style={{ display: 'none' }} />
    </div>
  )
}