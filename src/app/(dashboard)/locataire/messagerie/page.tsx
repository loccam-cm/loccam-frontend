'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import api from '@/lib/api'
import { Message, Utilisateur, PaginatedResponse } from '@/types'
import {
  IconArrowLeft, IconSend, IconSearch, IconX,
  IconMessage, IconPhoto, IconPaperclip,
  IconCheck, IconChecks, IconDots,
  IconPhone, IconVideo, IconChevronLeft,
  IconMoodSmile, IconRefresh,
} from '@tabler/icons-react'

// ── Types ─────────────────────────────────────────────────────
interface Conversation {
  interlocuteur: Utilisateur
  dernierMessage: Message
  nonLus: number
  messages: Message[]
}

// ── Utilitaires ───────────────────────────────────────────────
function formatHeure(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 60000) return 'maintenant'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m`
  if (diff < 86400000) return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  if (diff < 604800000) return d.toLocaleDateString('fr-FR', { weekday: 'short' })
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

function formatDate(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 86400000) return "Aujourd'hui"
  if (diff < 172800000) return 'Hier'
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
}

function Avatar({ nom, prenom, size = 40, online = false }: { nom: string; prenom: string; size?: number; online?: boolean }) {
  const colors = ['#3B82F6','#059669','#D97706','#7C3AED','#EF4444','#06B6D4','#EC4899']
  const col = colors[(prenom?.charCodeAt(0) ?? 0) % colors.length]
  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <div style={{ width: size, height: size, borderRadius: '14px', background: `${col}18`, border: `1.5px solid ${col}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: size * 0.35, color: col }}>
        {prenom?.[0]}{nom?.[0]}
      </div>
      {online && (
        <div style={{ position: 'absolute', bottom: 1, right: 1, width: 10, height: 10, borderRadius: '50%', background: '#10B981', border: '2px solid #fff' }} />
      )}
    </div>
  )
}

function SkeletonMsg() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px' }}>
      {[70, 55, 80, 45, 65].map((w, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: i % 2 === 0 ? 'flex-start' : 'flex-end' }}>
          <div style={{ width: `${w}%`, height: '44px', borderRadius: '16px', background: 'linear-gradient(90deg,#D1FAE5 25%,#ECFDF5 50%,#D1FAE5 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
        </div>
      ))}
    </div>
  )
}

// ────────────────────────────────────────────────────────────
export default function MessageriePage() {
  const { user } = useAuth()

  const [conversations, setConvs] = useState<Conversation[]>([])
  const [active, setActive]       = useState<Conversation | null>(null)
  const [messages, setMessages]   = useState<Message[]>([])
  const [input, setInput]         = useState('')
  const [loading, setLoading]     = useState(true)
  const [sending, setSending]     = useState(false)
  const [search, setSearch]       = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  // mobile: 'list' | 'chat'
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list')
  const bottomRef   = useRef<HTMLDivElement>(null)
  const inputRef    = useRef<HTMLInputElement>(null)
  const prevDateRef = useRef<string>('')

  useEffect(() => { if (user) load() }, [user])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get<PaginatedResponse<Message>>('/messages/')
      const msgs = res.data.results

      // Regrouper par interlocuteur
      const map = new Map<number, Conversation>()
      msgs.forEach(m => {
        const other = m.expediteur?.id === user?.id ? m.destinataire : m.expediteur
        if (!other) return
        const existing = map.get(other.id)
        if (!existing) {
          map.set(other.id, { interlocuteur: other, dernierMessage: m, nonLus: !m.est_lu && m.expediteur?.id !== user?.id ? 1 : 0, messages: [m] })
        } else {
          existing.messages.push(m)
          if (!m.est_lu && m.expediteur?.id !== user?.id) existing.nonLus++
          if (new Date(m.date_envoi) > new Date(existing.dernierMessage.date_envoi)) existing.dernierMessage = m
        }
      })

      const convList = Array.from(map.values()).sort((a, b) =>
        new Date(b.dernierMessage.date_envoi).getTime() - new Date(a.dernierMessage.date_envoi).getTime()
      )
      setConvs(convList)

      // Ouvrir la première conv auto sur desktop
      if (convList.length > 0 && !active) {
        setActive(convList[0])
        setMessages(convList[0].messages.sort((a, b) => new Date(a.date_envoi).getTime() - new Date(b.date_envoi).getTime()))
      }
    } catch { } finally { setLoading(false) }
  }

  const openConv = (conv: Conversation) => {
    setActive(conv)
    setMessages(conv.messages.sort((a, b) => new Date(a.date_envoi).getTime() - new Date(b.date_envoi).getTime()))
    setMobileView('chat')
    inputRef.current?.focus()
  }

  const sendMessage = async () => {
    if (!input.trim() || !active || sending) return
    const txt = input.trim()
    setInput('')
    setSending(true)

    const optimistic: Message = {
      id: Date.now(),
      expediteur: user!,
      destinataire: active.interlocuteur,
      contenu: txt,
      est_lu: false,
      date_envoi: new Date().toISOString(),
      piece_jointe_url: '',
      date_lecture: null,
    }
    setMessages(prev => [...prev, optimistic])

    try {
      await api.post('/messages/', {
        destinataire: active.interlocuteur.id,
        contenu: txt,
      })
      load()
    } catch { } finally { setSending(false) }
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const filteredConvs = conversations.filter(c =>
    !search || c.interlocuteur.nom_complet.toLowerCase().includes(search.toLowerCase())
  )

  const totalNonLus = conversations.reduce((s, c) => s + c.nonLus, 0)

  if (!user) return null

  return (
    <>
      <style>{`
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        ::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:#D1FAE5;border-radius:4px}
        .conv-item{transition:background .12s;cursor:pointer}
        .conv-item:hover{background:#F0FDF4}
        .conv-item.active{background:#ECFDF5}
        .msg-input{flex:1;min-width:0;padding:10px 16px;border-radius:24px;border:1.5px solid #D1FAE5;font-size:15px;color:#0F172A;outline:none;background:#fff;resize:none;font-family:inherit;transition:border-color .15s;line-height:1.45;max-height:120px;overflow-y:auto}
        .msg-input:focus{border-color:#059669;box-shadow:0 0 0 3px rgba(5,150,105,.08)}
        .msg-input::placeholder{color:#94A3B8}
        .send-btn{width:44px;height:44px;border-radius:50%;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .15s}
        .send-btn:hover{transform:scale(1.08)}
        .send-btn:active{transform:scale(.95)}
        .bubble-in{animation:slideUp .2s ease both}
        .online-pulse{animation:pulse 2.5s ease-in-out infinite}
        /* ── Layout ── */
        .chat-shell{display:flex;height:100dvh;overflow:hidden;background:#F0FDF4}
        /* Desktop */
        @media(min-width:768px){
          .sidebar-list{width:340px;flex-shrink:0;display:flex!important;flex-direction:column;height:100dvh;background:#fff;border-right:1px solid #D1FAE5}
          .chat-area{flex:1;display:flex!important;flex-direction:column;height:100dvh}
          .mobile-only{display:none!important}
          .back-btn{display:none!important}
        }
        /* Mobile */
        @media(max-width:767px){
          .sidebar-list{position:fixed;inset:0;z-index:10;background:#fff;flex-direction:column;height:100dvh}
          .sidebar-list.hidden-mobile{display:none!important}
          .chat-area{position:fixed;inset:0;z-index:20;background:#fff;flex-direction:column;height:100dvh}
          .chat-area.hidden-mobile{display:none!important}
          .fab-msg{display:flex!important}
        }
        .fab-msg{display:none;position:fixed;bottom:20px;right:20px;z-index:50;width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#059669,#047857);box-shadow:0 4px 16px rgba(5,150,105,.45);align-items:center;justify-content:center;border:none;cursor:pointer;transition:transform .2s}
        .fab-msg:hover{transform:scale(1.08)}
        .fab-msg:active{transform:scale(.95)}
      `}</style>

      <div className="chat-shell" style={{ fontFamily: "'DM Sans','Helvetica Neue',sans-serif" }}>

        {/* ══════════════════════════════════
            SIDEBAR — LISTE CONVERSATIONS
        ══════════════════════════════════ */}
        <div className={`sidebar-list ${mobileView === 'chat' ? 'hidden-mobile' : ''}`}>

          {/* Header liste */}
          <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid #F0FDF4', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <Link href="/locataire" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748B', textDecoration: 'none', fontSize: '14px', fontWeight: 500, flexShrink: 0 }}>
                <IconArrowLeft size={16} />
              </Link>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h1 style={{ fontSize: '17px', fontWeight: 700, color: '#0F172A' }}>Messages</h1>
                  {totalNonLus > 0 && (
                    <span style={{ fontSize: '11px', fontWeight: 700, background: '#059669', color: '#fff', padding: '2px 7px', borderRadius: '10px' }}>
                      {totalNonLus}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '12px', color: '#94A3B8' }}>
                  {conversations.length} conversation{conversations.length > 1 ? 's' : ''}
                </div>
              </div>
              <button onClick={load} style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#F0FDF4', border: '1px solid #D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                <IconRefresh size={15} style={{ color: '#059669', animation: loading ? 'spin 1s linear infinite' : 'none' }} />
              </button>
            </div>

            {/* Barre de recherche */}
            <div style={{ position: 'relative' }}>
              <IconSearch size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
              <input value={search} onChange={e => setSearch(e.target.value)}
                     placeholder="Rechercher..."
                     style={{ width: '100%', height: '38px', padding: '0 12px 0 36px', borderRadius: '12px', border: '1.5px solid #E2E8F0', fontSize: '14px', color: '#0F172A', outline: 'none', background: '#F8FAFC', fontFamily: 'inherit', transition: 'border-color .15s' }}
                     onFocus={e => (e.target.style.borderColor = '#059669')}
                     onBlur={e => (e.target.style.borderColor = '#E2E8F0')} />
              {search && (
                <button onClick={() => setSearch('')}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', background: 'none', border: 'none', cursor: 'pointer' }}>
                  <IconX size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Liste */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: '12px' }}>
                {Array(4).fill(0).map((_, i) => (
                  <div key={i} style={{ display: 'flex', gap: '12px', padding: '12px', marginBottom: '4px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(90deg,#D1FAE5 25%,#ECFDF5 50%,#D1FAE5 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', flexShrink: 0 }} />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ height: '13px', borderRadius: '6px', background: 'linear-gradient(90deg,#D1FAE5 25%,#ECFDF5 50%,#D1FAE5 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', width: '60%' }} />
                      <div style={{ height: '11px', borderRadius: '6px', background: 'linear-gradient(90deg,#D1FAE5 25%,#ECFDF5 50%,#D1FAE5 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredConvs.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', textAlign: 'center' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                  <IconMessage size={26} style={{ color: '#6EE7B7' }} />
                </div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
                  {search ? 'Aucun résultat' : 'Aucun message'}
                </div>
                <div style={{ fontSize: '12px', color: '#94A3B8', lineHeight: 1.5 }}>
                  {search ? 'Modifiez votre recherche' : 'Vos échanges avec votre bailleur apparaîtront ici'}
                </div>
              </div>
            ) : filteredConvs.map(conv => (
              <div key={conv.interlocuteur.id}
                className={`conv-item ${active?.interlocuteur.id === conv.interlocuteur.id ? 'active' : ''}`}
                onClick={() => openConv(conv)}
                style={{ display: 'flex', gap: '12px', padding: '14px 20px', borderBottom: '1px solid #F8FAFC', position: 'relative' }}>

                <Avatar nom={conv.interlocuteur.nom} prenom={conv.interlocuteur.prenom} size={48} online={true} />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <span style={{ fontSize: '14px', fontWeight: conv.nonLus > 0 ? 700 : 600, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                      {conv.interlocuteur.nom_complet}
                    </span>
                    <span style={{ fontSize: '11px', color: conv.nonLus > 0 ? '#059669' : '#94A3B8', flexShrink: 0, marginLeft: '8px', fontWeight: conv.nonLus > 0 ? 600 : 400 }}>
                      {formatHeure(conv.dernierMessage.date_envoi)}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <div style={{ fontSize: '13px', color: conv.nonLus > 0 ? '#374151' : '#94A3B8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, fontWeight: conv.nonLus > 0 ? 500 : 400 }}>
                      {conv.dernierMessage.expediteur?.id === user?.id ? 'Vous : ' : ''}
                      {conv.dernierMessage.contenu}
                    </div>
                    {conv.nonLus > 0 && (
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#059669', color: '#fff', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {conv.nonLus}
                      </div>
                    )}
                  </div>

                  <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>
                    {conv.interlocuteur.role === 'bailleur' ? 'Propriétaire' : 'Locataire'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════
            ZONE CHAT
        ══════════════════════════════════ */}
        <div className={`chat-area ${mobileView === 'list' ? 'hidden-mobile' : ''}`}
             style={{ display: 'flex', flexDirection: 'column', background: '#F8FAFC' }}>

          {/* Header chat */}
          {active ? (
            <div style={{ padding: '12px 16px', background: '#fff', borderBottom: '1px solid #D1FAE5', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 1px 4px rgba(5,150,105,.05)', flexShrink: 0, zIndex: 10 }}>
              {/* Retour mobile */}
              <button className="back-btn"
                onClick={() => setMobileView('list')}
                style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#F0FDF4', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                <IconChevronLeft size={20} style={{ color: '#059669' }} />
              </button>

              <Avatar nom={active.interlocuteur.nom} prenom={active.interlocuteur.prenom} size={42} online={true} />

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {active.interlocuteur.nom_complet}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <div className="online-pulse" style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10B981', flexShrink: 0 }} />
                  <span style={{ fontSize: '12px', color: '#059669' }}>En ligne · Propriétaire</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                {[
                  { ico: <IconPhone size={17} />, bg: '#F0FDF4' },
                  { ico: <IconVideo size={17} />, bg: '#F0FDF4' },
                  { ico: <IconDots size={17} />, bg: '#F0FDF4' },
                ].map((a, i) => (
                  <button key={i} style={{ width: '36px', height: '36px', borderRadius: '10px', background: a.bg, border: '1px solid #D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748B' }}>
                    {a.ico}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Placeholder desktop sans conv sélectionnée */
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '24px', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconMessage size={32} style={{ color: '#6EE7B7' }} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>Vos messages</div>
                <div style={{ fontSize: '13px', color: '#94A3B8' }}>Sélectionnez une conversation</div>
              </div>
            </div>
          )}

          {/* Messages */}
          {active && (
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {loading
                ? <SkeletonMsg />
                : messages.map((msg, i) => {
                  const isMine = msg.expediteur?.id === user?.id
                  const prev   = messages[i - 1]
                  const next   = messages[i + 1]
                  const showDate = !prev || formatDate(msg.date_envoi) !== formatDate(prev.date_envoi)
                  const showAvatar = !isMine && (!next || next.expediteur?.id !== msg.expediteur?.id)
                  const isGrouped = prev && prev.expediteur?.id === msg.expediteur?.id && !showDate

                  return (
                    <div key={msg.id}>
                      {/* Séparateur date */}
                      {showDate && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '12px 0' }}>
                          <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
                          <span style={{ fontSize: '11px', fontWeight: 600, color: '#94A3B8', whiteSpace: 'nowrap', padding: '4px 12px', borderRadius: '12px', background: '#F1F5F9' }}>
                            {formatDate(msg.date_envoi)}
                          </span>
                          <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
                        </div>
                      )}

                      <motion.div
                        className="bubble-in"
                        initial={{ opacity: 0, y: 8, scale: .97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: .2 }}
                        style={{
                          display: 'flex',
                          flexDirection: isMine ? 'row-reverse' : 'row',
                          alignItems: 'flex-end',
                          gap: '8px',
                          marginTop: isGrouped ? '2px' : '10px',
                          marginBottom: '0',
                        }}>

                        {/* Avatar interlocuteur */}
                        {!isMine && (
                          <div style={{ width: '32px', flexShrink: 0 }}>
                            {showAvatar && (
                              <Avatar nom={active.interlocuteur.nom} prenom={active.interlocuteur.prenom} size={32} />
                            )}
                          </div>
                        )}

                        <div style={{ maxWidth: '72%', display: 'flex', flexDirection: 'column', alignItems: isMine ? 'flex-end' : 'flex-start' }}>
                          {/* Bulle */}
                          <div style={{
                            padding: '10px 14px',
                            borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                            background: isMine ? 'linear-gradient(135deg,#059669,#047857)' : '#fff',
                            color: isMine ? '#fff' : '#0F172A',
                            fontSize: '14px',
                            lineHeight: 1.5,
                            boxShadow: isMine ? '0 2px 8px rgba(5,150,105,.3)' : '0 1px 4px rgba(0,0,0,.06)',
                            border: isMine ? 'none' : '1px solid #F1F5F9',
                            wordBreak: 'break-word',
                          }}>
                            {msg.contenu}
                          </div>

                          {/* Heure + lu */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px', padding: '0 4px' }}>
                            <span style={{ fontSize: '11px', color: '#94A3B8' }}>
                              {new Date(msg.date_envoi).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isMine && (
                              msg.est_lu
                                ? <IconChecks size={13} style={{ color: '#059669' }} />
                                : <IconCheck size={13} style={{ color: '#94A3B8' }} />
                            )}
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  )
                })}
              <div ref={bottomRef} />
            </div>
          )}

          {/* Input */}
          {active && (
            <div style={{ padding: '12px 16px 16px', background: '#fff', borderTop: '1px solid #D1FAE5', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
                {/* Attachements */}
                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                  <button style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#F0FDF4', border: '1px solid #D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#059669' }}>
                    <IconPaperclip size={17} />
                  </button>
                </div>

                {/* Champ texte */}
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Écrire un message..."
                  className="msg-input"
                />

                {/* Emoji */}
                <button style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#F0FDF4', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#94A3B8', flexShrink: 0 }}>
                  <IconMoodSmile size={20} />
                </button>

                {/* Envoyer */}
                <button
                  className="send-btn"
                  onClick={sendMessage}
                  disabled={!input.trim() || sending}
                  style={{ background: input.trim() ? 'linear-gradient(135deg,#059669,#047857)' : '#E2E8F0', boxShadow: input.trim() ? '0 4px 12px rgba(5,150,105,.35)' : 'none' }}>
                  {sending
                    ? <IconRefresh size={18} color="white" style={{ animation: 'spin 1s linear infinite' }} />
                    : <IconSend size={18} color={input.trim() ? 'white' : '#94A3B8'} />}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ══════════════════════════════════
            FAB MOBILE — bouton messagerie
        ══════════════════════════════════ */}
        <AnimatePresence>
          {mobileView === 'chat' && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', duration: .35 }}
              className="fab-msg"
              onClick={() => setMobileView('list')}>
              <div style={{ position: 'relative' }}>
                <IconMessage size={24} color="white" />
                {totalNonLus > 0 && (
                  <div style={{ position: 'absolute', top: '-8px', right: '-8px', width: '18px', height: '18px', borderRadius: '50%', background: '#EF4444', color: '#fff', fontSize: '10px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white' }}>
                    {totalNonLus}
                  </div>
                )}
              </div>
            </motion.button>
          )}
        </AnimatePresence>

      </div>
    </>
  )
}
