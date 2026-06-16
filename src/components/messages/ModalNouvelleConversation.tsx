'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import api from '@/lib/api'
import { Contrat, PaginatedResponse } from '@/types'
import {
  IconMessage, IconX, IconHome2, IconSend, IconLoader2,
} from '@tabler/icons-react'

interface Props {
  open:      boolean
  onClose:   () => void
  onSuccess: () => void
}

export default function ModalNouvelleConversation({ open, onClose, onSuccess }: Props) {
  const [contrats, setContrats]   = useState<Contrat[]>([])
  const [form, setForm]           = useState({ contrat_id: '', contenu: '' })
  const [saving, setSaving]       = useState(false)

  useEffect(() => {
    if (!open) return
    api.get<PaginatedResponse<Contrat>>('/contrats/')
      .then(r => setContrats(r.data.results.filter(c => c.statut === 'actif')))
      .catch(() => {})
  }, [open])

  // Reset à la fermeture
  useEffect(() => {
    if (!open) setForm({ contrat_id: '', contenu: '' })
  }, [open])

  const selectedContrat = contrats.find(c => c.id === Number(form.contrat_id))
  const canSubmit       = !!form.contrat_id && !!form.contenu.trim() && !saving

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedContrat || !form.contenu.trim()) return
    setSaving(true)
    try {
      await api.post('/messages/', {
        destinataire: selectedContrat.locataire!.id,
        bien:         selectedContrat.bien!.id,
        contenu:      form.contenu.trim(),
      })
      toast.success('Message envoyé !')
      onSuccess()
      onClose()
    } catch {
      toast.error("Erreur lors de l'envoi")
    } finally { setSaving(false) }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,.45)', backdropFilter: 'blur(6px)' }}
            onClick={onClose} />

          {/* Modal */}
          <motion.div initial={{ opacity: 0, scale: .96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: .96, y: 16 }}
            transition={{ duration: .2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden"
              style={{ boxShadow: '0 24px 60px rgba(0,0,0,.2)', fontFamily: "'DM Sans','Helvetica Neue',sans-serif" }}
              onClick={e => e.stopPropagation()}>

              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5"
                style={{ background: 'linear-gradient(135deg,#1A3C5E,#2563EB)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,.15)' }}>
                    <IconMessage size={18} color="white" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">Nouvelle conversation</h2>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,.6)' }}>
                      Envoyer un message à un locataire
                    </p>
                  </div>
                </div>
                <button onClick={onClose}
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,.15)', color: 'white' }}>
                  <IconX size={15} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

                {/* Sélection locataire */}
                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: '#374151' }}>
                    Locataire <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <select required value={form.contrat_id}
                    onChange={e => setForm(f => ({ ...f, contrat_id: e.target.value }))}
                    style={{
                      width: '100%', height: '42px', padding: '0 12px',
                      border: '1.5px solid #E2E8F0', borderRadius: '10px',
                      fontSize: '13px', color: form.contrat_id ? '#0F172A' : '#94A3B8',
                      outline: 'none', background: '#fff', fontFamily: 'inherit', cursor: 'pointer',
                    }}>
                    <option value="">-- Choisir un locataire --</option>
                    {contrats.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.locataire?.nom_complet} · {c.bien?.titre}
                      </option>
                    ))}
                  </select>
                  {contrats.length === 0 && (
                    <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>
                      Aucun contrat actif trouvé
                    </p>
                  )}
                </div>

                {/* Aperçu bien */}
                {selectedContrat && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-3 rounded-xl"
                    style={{ background: '#EFF6FF', border: '1px solid #DBEAFE' }}>
                    <IconHome2 size={13} style={{ color: '#2563EB', flexShrink: 0 }} />
                    <span className="text-xs font-semibold" style={{ color: '#1D4ED8' }}>
                      {selectedContrat.bien?.titre}
                      {selectedContrat.loyer_mensuel
                        ? ` · ${selectedContrat.loyer_mensuel.toLocaleString('fr-FR')} XAF/mois`
                        : ''}
                    </span>
                  </motion.div>
                )}

                {/* Message */}
                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: '#374151' }}>
                    Message <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <textarea required value={form.contenu}
                    onChange={e => setForm(f => ({ ...f, contenu: e.target.value }))}
                    placeholder="Écrivez votre message..."
                    rows={4}
                    style={{
                      width: '100%', padding: '10px 12px',
                      border: '1.5px solid #E2E8F0', borderRadius: '10px',
                      fontSize: '13px', color: '#0F172A', outline: 'none',
                      background: '#fff', fontFamily: 'inherit',
                      resize: 'vertical', minHeight: '100px', lineHeight: 1.6,
                    }} />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={onClose}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                    style={{ background: '#F1F5F9', color: '#64748B' }}>
                    Annuler
                  </button>
                  <motion.button type="submit" disabled={!canSubmit}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white"
                    style={{
                      background: 'linear-gradient(135deg,#2563EB,#1D4ED8)',
                      boxShadow: canSubmit ? '0 3px 12px rgba(37,99,235,.4)' : 'none',
                      opacity: canSubmit ? 1 : 0.5,
                    }}
                    whileHover={canSubmit ? { scale: 1.01 } : {}}
                    whileTap={canSubmit ? { scale: .99 } : {}}>
                    {saving
                      ? <><IconLoader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Envoi...</>
                      : <><IconSend size={14} /> Envoyer</>}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>

          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </>
      )}
    </AnimatePresence>
  )
}
