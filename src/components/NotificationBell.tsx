'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '@/lib/api'
import { Notification } from '@/types'
import {
  IconBell, IconX, IconCheck, IconCreditCard,
  IconMessage, IconShieldCheck, IconHome2,
  IconAlertCircle, IconMail,
} from '@tabler/icons-react'

// ── Icône par type de notification ────────────────────────
const NOTIF_STYLES: Record<string, { bg: string; col: string; ico: React.ReactNode }> = {
  paiement_confirme  : { bg: '#ECFDF5', col: '#059669', ico: <IconCreditCard size={13}/> },
  paiement_en_retard : { bg: '#FEF2F2', col: '#DC2626', ico: <IconAlertCircle size={13}/> },
  rappel_loyer       : { bg: '#FFFBEB', col: '#D97706', ico: <IconBell size={13}/> },
  relance_impaye     : { bg: '#FEF2F2', col: '#DC2626', ico: <IconAlertCircle size={13}/> },
  nouveau_message    : { bg: '#EFF6FF', col: '#2563EB', ico: <IconMessage size={13}/> },
  invitation_locataire:{ bg: '#F5F3FF', col: '#7C3AED', ico: <IconMail size={13}/> },
  contrat_signe      : { bg: '#ECFDF5', col: '#059669', ico: <IconHome2 size={13}/> },
  cni_validee        : { bg: '#ECFDF5', col: '#059669', ico: <IconShieldCheck size={13}/> },
}

function tempsEcoule(date: string): string {
  const diff = Date.now() - new Date(date).getTime()
  const min  = Math.floor(diff / 60000)
  const h    = Math.floor(diff / 3600000)
  const j    = Math.floor(diff / 86400000)
  if (min < 1)  return "À l'instant"
  if (min < 60) return `Il y a ${min} min`
  if (h   < 24) return `Il y a ${h}h`
  return `Il y a ${j}j`
}

interface Props {
  color?       : string
  bgColor?     : string
  borderColor? : string
}

export default function NotificationBell({
  color       = '#64748B',
  bgColor     = '#F1F5F9',
  borderColor = '#E2E8F0',
}: Props) {
  const [open, setOpen]           = useState(false)
  const [notifs, setNotifs]       = useState<Notification[]>([])
  const [loading, setLoading]     = useState(false)
  const [notifInapp, setNotifInapp] = useState(true)
  const ref = useRef<HTMLDivElement>(null)

  const nonLues = notifs.filter(n => !n.est_lue).length

  // ── Charger les notifications ──────────────────────────
  const charger = async () => {
    try {
      const res = await api.get('/notifications/')
      setNotifs(res.data.results?.slice(0, 10) ?? res.data.slice(0, 10))
    } catch {}
  }

  // ── Charger préférences + lancer polling si activé ────
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null

    api.get('/auth/preferences/')
      .then(res => {
        const inapp = res.data.notif_inapp ?? true
        setNotifInapp(inapp)
        if (inapp) {
          charger()
          interval = setInterval(charger, 30000)
        }
      })
      .catch(() => {
        // Erreur réseau → comportement par défaut (activé)
        charger()
        interval = setInterval(charger, 30000)
      })

    return () => { if (interval) clearInterval(interval) }
  }, [])

  // ── Fermer en cliquant dehors ──────────────────────────
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  // ── Marquer une notif comme lue ───────────────────────
  const marquerLue = async (id: number) => {
    try {
      await api.post(`/notifications/${id}/lire/`)
      setNotifs(prev => prev.map(n => n.id === id ? { ...n, est_lue: true } : n))
    } catch {}
  }

  // ── Tout marquer comme lu ─────────────────────────────
  const toutMarquerLu = async () => {
    setLoading(true)
    try {
      await api.post('/notifications/lire-tout/')
      setNotifs(prev => prev.map(n => ({ ...n, est_lue: true })))
    } catch {}
    setLoading(false)
  }

  // ── notif_inapp désactivé → cloche grisée ─────────────
  if (!notifInapp) {
    return (
      <div style={{
        width: '36px', height: '36px', borderRadius: '10px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: bgColor, border: `1px solid ${borderColor}`,
        opacity: 0.4, cursor: 'not-allowed',
      }}>
        <IconBell size={15} style={{ color }} />
      </div>
    )
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Bouton cloche */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '36px', height: '36px', borderRadius: '10px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: bgColor, border: `1px solid ${borderColor}`,
          cursor: 'pointer', position: 'relative', transition: 'all 0.15s',
        }}>
        <IconBell size={15} style={{ color }} />
        {nonLues > 0 && (
          <motion.span
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            style={{
              position: 'absolute', top: '-4px', right: '-4px',
              width: '16px', height: '16px', borderRadius: '50%',
              background: '#EF4444', color: 'white',
              fontSize: '9px', fontWeight: 800,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1.5px solid white',
            }}>
            {nonLues > 9 ? '9+' : nonLues}
          </motion.span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'absolute', right: 0, top: '44px',
              width: '320px', borderRadius: '16px',
              background: '#fff', border: '1px solid #E2E8F0',
              boxShadow: '0 16px 48px rgba(0,0,0,0.12)',
              zIndex: 100, overflow: 'hidden',
            }}>

            {/* Header */}
            <div style={{
              padding: '14px 16px', borderBottom: '1px solid #F1F5F9',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                  Notifications
                </span>
                {nonLues > 0 && (
                  <span style={{
                    padding: '1px 7px', borderRadius: '100px',
                    background: '#EFF6FF', color: '#2563EB',
                    fontSize: '10px', fontWeight: 700,
                  }}>
                    {nonLues} non lue{nonLues > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {nonLues > 0 && (
                  <button
                    onClick={toutMarquerLu}
                    disabled={loading}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '4px',
                      padding: '4px 8px', borderRadius: '8px',
                      background: '#F1F5F9', border: 'none', cursor: 'pointer',
                      fontSize: '11px', fontWeight: 600, color: '#64748B',
                    }}>
                    <IconCheck size={11} />
                    Tout lire
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', display: 'flex' }}>
                  <IconX size={14} />
                </button>
              </div>
            </div>

            {/* Liste */}
            <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
              {notifs.length === 0 ? (
                <div style={{ padding: '32px 16px', textAlign: 'center' }}>
                  <IconBell size={28} style={{ color: '#CBD5E1', margin: '0 auto 8px', display: 'block' }} />
                  <p style={{ fontSize: '13px', color: '#94A3B8' }}>Aucune notification</p>
                </div>
              ) : (
                notifs.map(n => {
                  const st = NOTIF_STYLES[n.type] ?? { bg: '#F1F5F9', col: '#64748B', ico: <IconBell size={13}/> }
                  return (
                    <div
                      key={n.id}
                      onClick={() => !n.est_lue && marquerLue(n.id)}
                      style={{
                        display: 'flex', gap: '10px', padding: '12px 16px',
                        borderBottom: '1px solid #F8FAFC',
                        cursor: n.est_lue ? 'default' : 'pointer',
                        background: n.est_lue ? 'transparent' : '#FAFCFF',
                        transition: 'background 0.15s',
                      }}>
                      <div style={{
                        width: '30px', height: '30px', borderRadius: '9px',
                        background: st.bg, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', color: st.col,
                        flexShrink: 0, marginTop: '1px',
                      }}>
                        {st.ico}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: '12px', fontWeight: n.est_lue ? 500 : 700,
                          color: '#0F172A', marginBottom: '2px',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {n.titre}
                        </div>
                        <div style={{
                          fontSize: '11px', color: '#64748B', lineHeight: 1.5,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {n.message}
                        </div>
                        <div style={{ fontSize: '10px', color: '#94A3B8', marginTop: '3px' }}>
                          {tempsEcoule(n.date_creation)}
                        </div>
                      </div>
                      {!n.est_lue && (
                        <div style={{
                          width: '6px', height: '6px', borderRadius: '50%',
                          background: '#2563EB', flexShrink: 0, marginTop: '6px',
                        }} />
                      )}
                    </div>
                  )
                })
              )}
            </div>

            {/* Footer */}
            {notifs.length > 0 && (
              <div style={{ padding: '10px 16px', borderTop: '1px solid #F1F5F9', textAlign: 'center' }}>
                <button
                  onClick={charger}
                  style={{
                    fontSize: '12px', fontWeight: 600, color: '#2563EB',
                    background: 'none', border: 'none', cursor: 'pointer',
                  }}>
                  Actualiser
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}