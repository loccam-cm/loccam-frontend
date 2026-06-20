"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { PaginatedResponse } from "@/types";
import ModalNouvelleConversation from "@/components/messages/ModalNouvelleConversation";
import {
  IconArrowLeft,
  IconRefresh,
  IconSend,
  IconMessage,
  IconSearch,
  IconHome2,
  IconCheck,
  IconChecks,
  IconLoader2,
  IconChevronLeft,
  IconPlus,
  IconX,
  IconPhone,
} from "@tabler/icons-react";

// ── Types ─────────────────────────────────────────────────────
interface UtilisateurLite {
  id: number;
  nom: string;
  prenom: string;
  nom_complet: string;
  email: string;
  telephone: string;
  role: string;
}
interface BienLite {
  id: number;
  titre: string;
  adresse: string;
  statut: string;
}
interface Message {
  id: number;
  expediteur: UtilisateurLite;
  destinataire: UtilisateurLite;
  bien: BienLite;
  contenu: string;
  piece_jointe_url: string;
  est_lu: boolean;
  date_envoi: string;
  date_lecture: string | null;
}
interface Conversation {
  key: string;
  interlocutor: UtilisateurLite;
  bien: BienLite;
  messages: Message[];
  lastMessage: Message;
  unread: number;
}

// ── Helpers ───────────────────────────────────────────────────
function timeLabel(date: string): string {
  const d = new Date(date);
  const diff = Date.now() - d.getTime();
  if (diff < 60000) return "À l'instant";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}min`;
  if (diff < 86400000)
    return d.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  if (diff < 604800000)
    return d.toLocaleDateString("fr-FR", { weekday: "short" });
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function fullDate(date: string): string {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
  });
}

// ── Avatar ────────────────────────────────────────────────────
const AVATAR_COLORS = [
  "#3B82F6",
  "#059669",
  "#D97706",
  "#7C3AED",
  "#EF4444",
  "#06B6D4",
  "#EC4899",
];
function avatarColor(nom: string, prenom: string) {
  return AVATAR_COLORS[
    ((prenom?.charCodeAt(0) ?? 0) + (nom?.charCodeAt(0) ?? 0)) %
      AVATAR_COLORS.length
  ];
}

function Avatar({
  nom,
  prenom,
  size = 40,
  online = false,
}: {
  nom: string;
  prenom: string;
  size?: number;
  online?: boolean;
}) {
  const col = avatarColor(nom, prenom);
  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "12px",
          background: `${col}18`,
          border: `2px solid ${col}30`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
          fontSize: size * 0.32,
          color: col,
          flexShrink: 0,
        }}
      >
        {(prenom?.[0] ?? "?").toUpperCase()}
        {(nom?.[0] ?? "").toUpperCase()}
      </div>
      {online && (
        <div
          style={{
            position: "absolute",
            bottom: "-2px",
            right: "-2px",
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: "#10B981",
            border: "2px solid #fff",
          }}
        />
      )}
    </div>
  );
}

// ── Construction conversations ────────────────────────────────
function buildConversations(
  messages: Message[],
  userId: number,
): Conversation[] {
  const map = new Map<string, Conversation>();
  messages.forEach((m) => {
    const interlocutor =
      m.expediteur.id === userId ? m.destinataire : m.expediteur;
    const key = `${interlocutor.id}_${m.bien.id}`;
    if (!map.has(key)) {
      map.set(key, {
        key,
        interlocutor,
        bien: m.bien,
        messages: [],
        lastMessage: m,
        unread: 0,
      });
    }
    const conv = map.get(key)!;
    conv.messages.push(m);
    conv.lastMessage = m;
    if (!m.est_lu && m.destinataire.id === userId) conv.unread++;
  });
  return Array.from(map.values()).sort(
    (a, b) =>
      new Date(b.lastMessage.date_envoi).getTime() -
      new Date(a.lastMessage.date_envoi).getTime(),
  );
}

// ── Page ──────────────────────────────────────────────────────
export default function MessagesPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [contenu, setContenu] = useState("");
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const [showModal, setShowModal] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await api.get<PaginatedResponse<Message>>("/messages/");
      setMessages(res.data.results);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    pollRef.current = setInterval(() => load(true), 10000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  useEffect(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  }, [messages, activeKey]);

  useEffect(() => {
    if (!activeKey || !user) return;
    const conv = buildConversations(messages, user.id).find(
      (c) => c.key === activeKey,
    );
    if (!conv) return;
    conv.messages.forEach((m) => {
      if (!m.est_lu && m.destinataire.id === user.id) {
        api.post(`/messages/${m.id}/lire/`).catch(() => {});
      }
    });
  }, [activeKey]);

  const handleSend = async () => {
    if (!contenu.trim() || !activeConv || sending) return;
    setSending(true);
    try {
      await api.post("/messages/", {
        destinataire: activeConv.interlocutor.id,
        bien: activeConv.bien.id,
        contenu: contenu.trim(),
      });
      setContenu("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
      await load(true);
    } catch {
      toast.error("Erreur lors de l'envoi");
    } finally {
      setSending(false);
    }
  };

  const openConv = (key: string) => {
    setActiveKey(key);
    setMobileView("chat");
    setSearch("");
    setShowSearch(false);
  };

  const goBack = () => {
    setMobileView("list");
    setActiveKey(null);
  };

  const conversations = user ? buildConversations(messages, user.id) : [];
  const filtered = conversations.filter(
    (c) =>
      !search ||
      c.interlocutor.nom_complet.toLowerCase().includes(search.toLowerCase()) ||
      c.bien.titre.toLowerCase().includes(search.toLowerCase()),
  );
  const activeConv = conversations.find((c) => c.key === activeKey) ?? null;
  const totalUnread = conversations.reduce((a, c) => a + c.unread, 0);

  if (!user) return null;

  return (
    <>
      <style>{`
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        ::-webkit-scrollbar{width:3px;height:3px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:#E2E8F0;border-radius:4px}
        .conv-item{transition:background .12s ease;cursor:pointer;-webkit-tap-highlight-color:transparent}
        .conv-item:hover{background:#F8FAFC}
        .conv-active{background:#EFF6FF !important}
        .conv-active:hover{background:#EFF6FF !important}
        textarea{resize:none;font-family:inherit;line-height:1.5}
        textarea:focus{outline:none}
        .msg-bubble{animation:fadeIn .2s ease both}
        .send-btn{transition:all .15s ease}
        .send-btn:active{transform:scale(.92)}
        /* Mobile-first — tout petit écran */
        .panel-list{
          display:flex;flex-direction:column;
          width:100%;height:100%;background:#fff;
          position:absolute;inset:0;z-index:10;
          transition:transform .3s ease;
        }
        .panel-chat{
          display:flex;flex-direction:column;
          width:100%;height:100%;background:#F8FAFC;
          position:absolute;inset:0;z-index:20;
          transform:translateX(100%);
          transition:transform .3s ease;
        }
        .panel-chat.active{transform:translateX(0)}
        /* Tablette et plus */
        @media(min-width:640px){
          .panel-list{
            position:relative;
            width:280px;flex-shrink:0;
            border-right:1px solid #E2E8F0;
            z-index:auto;
          }
          .panel-chat{
            position:relative;flex:1;
            transform:none !important;
            z-index:auto;
          }
        }
        /* Desktop */
        @media(min-width:1024px){
          .panel-list{width:320px}
        }
      `}</style>

      <div
        className="flex flex-col h-screen overflow-hidden"
        style={{
          background: "#F1F5F9",
          fontFamily: "'DM Sans','Helvetica Neue',sans-serif",
        }}
      >
        {/* ══ HEADER ══ */}
        <header
          className="flex items-center gap-2 sm:gap-3 px-3 sm:px-5 h-14 flex-shrink-0 bg-white"
          style={{
            borderBottom: "1px solid #E2E8F0",
            boxShadow: "0 1px 4px rgba(0,0,0,.05)",
          }}
        >
          {/* Mobile — vue chat : bouton retour + infos interlocuteur */}
          <AnimatePresence mode="wait">
            {mobileView === "chat" && activeConv ? (
              <motion.div
                key="chat-header"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2 flex-1 min-w-0 sm:hidden"
              >
                <button
                  onClick={goBack}
                  className="flex items-center justify-center w-8 h-8 rounded-xl flex-shrink-0"
                  style={{
                    background: "#F1F5F9",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <IconChevronLeft size={16} style={{ color: "#64748B" }} />
                </button>
                <Avatar
                  nom={activeConv.interlocutor.nom}
                  prenom={activeConv.interlocutor.prenom}
                  size={34}
                />
                <div className="flex-1 min-w-0">
                  <div
                    className="text-sm font-bold truncate"
                    style={{ color: "#0F172A" }}
                  >
                    {activeConv.interlocutor.nom_complet}
                  </div>
                  <div
                    className="text-xs truncate"
                    style={{ color: "#94A3B8" }}
                  >
                    {activeConv.bien.titre}
                  </div>
                </div>
                {activeConv.interlocutor.telephone && (
                  <a
                    href={`tel:${activeConv.interlocutor.telephone}`}
                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "#ECFDF5", textDecoration: "none" }}
                  >
                    <IconPhone size={14} style={{ color: "#059669" }} />
                  </a>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="list-header"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0"
              >
                <Link
                  href="/bailleur"
                  className="flex items-center gap-1 text-sm font-medium flex-shrink-0"
                  style={{ color: "#64748B", textDecoration: "none" }}
                >
                  <IconArrowLeft size={16} />
                  <span className="hidden sm:inline">Retour</span>
                </Link>
                <div
                  className="hidden sm:block h-5 w-px flex-shrink-0"
                  style={{ background: "#E2E8F0" }}
                />
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: "#EFF6FF" }}
                  >
                    <IconMessage size={15} style={{ color: "#2563EB" }} />
                  </div>
                  <h1
                    className="text-sm font-bold truncate"
                    style={{ color: "#0F172A" }}
                  >
                    Messagerie
                  </h1>
                  {totalUnread > 0 && (
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: "#EFF6FF", color: "#2563EB" }}
                    >
                      {totalUnread}
                    </span>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions header communes */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Recherche mobile — toggle */}
            <button
              onClick={() => setShowSearch(!showSearch)}
              className={`sm:hidden w-8 h-8 rounded-xl flex items-center justify-center ${mobileView === "chat" ? "hidden" : ""}`}
              style={{
                background: showSearch ? "#EFF6FF" : "#F1F5F9",
                border: "none",
                cursor: "pointer",
              }}
            >
              {showSearch ? (
                <IconX size={14} style={{ color: "#2563EB" }} />
              ) : (
                <IconSearch size={14} style={{ color: "#64748B" }} />
              )}
            </button>
            <button
              onClick={() => load()}
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${mobileView === "chat" ? "hidden sm:flex" : ""}`}
              style={{
                background: "#F1F5F9",
                border: "1px solid #E2E8F0",
                cursor: "pointer",
              }}
            >
              <IconRefresh
                size={14}
                style={{
                  color: "#64748B",
                  animation: loading ? "spin 1s linear infinite" : "none",
                }}
              />
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowModal(true)}
              className={`flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-bold text-white ${mobileView === "chat" ? "hidden sm:flex" : "flex"}`}
              style={{
                background: "linear-gradient(135deg,#2563EB,#1D4ED8)",
                boxShadow: "0 2px 8px rgba(37,99,235,.3)",
                border: "none",
                cursor: "pointer",
              }}
            >
              <IconPlus size={13} />
              <span className="hidden sm:inline">Nouveau</span>
            </motion.button>
          </div>
        </header>

        {/* ══ LAYOUT 2 COLONNES ══ */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* ── PANEL LISTE ── */}
          <div
            className={`panel-list ${mobileView === "chat" ? "sm:flex hidden" : ""}`}
          >
            {/* Barre recherche */}
            <div
              className="px-3 py-2.5 flex-shrink-0"
              style={{ borderBottom: "1px solid #F1F5F9" }}
            >
              {/* Desktop — recherche permanente */}
              <div className="relative hidden sm:block">
                <IconSearch
                  size={13}
                  style={{
                    position: "absolute",
                    left: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#94A3B8",
                    pointerEvents: "none",
                  }}
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher..."
                  style={{
                    width: "100%",
                    height: "36px",
                    paddingLeft: "30px",
                    paddingRight: search ? "30px" : "12px",
                    border: "1.5px solid #E2E8F0",
                    borderRadius: "10px",
                    fontSize: "13px",
                    color: "#0F172A",
                    outline: "none",
                    background: "#F8FAFC",
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                  }}
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    style={{
                      position: "absolute",
                      right: "8px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#94A3B8",
                      display: "flex",
                    }}
                  >
                    <IconX size={13} />
                  </button>
                )}
              </div>

              {/* Mobile — recherche conditionnelle */}
              <AnimatePresence>
                {showSearch && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="relative sm:hidden overflow-hidden"
                  >
                    <input
                      autoFocus
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Rechercher une conversation..."
                      style={{
                        width: "100%",
                        height: "38px",
                        padding: "0 12px",
                        border: "1.5px solid #BFDBFE",
                        borderRadius: "10px",
                        fontSize: "14px",
                        color: "#0F172A",
                        outline: "none",
                        background: "#EFF6FF",
                        fontFamily: "inherit",
                        boxSizing: "border-box",
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Compteur conversations */}
              {!showSearch && (
                <div className="flex items-center justify-between sm:hidden">
                  <span
                    className="text-xs font-semibold"
                    style={{ color: "#94A3B8" }}
                  >
                    {conversations.length} conversation
                    {conversations.length > 1 ? "s" : ""}
                  </span>
                  {totalUnread > 0 && (
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ background: "#EFF6FF", color: "#2563EB" }}
                    >
                      {totalUnread} non lu{totalUnread > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Liste conversations */}
            <div className="flex-1 overflow-y-auto">
              {loading && conversations.length === 0 ? (
                <div className="space-y-1 p-2">
                  {Array(6)
                    .fill(0)
                    .map((_, i) => (
                      <div
                        key={i}
                        className="h-[72px] rounded-xl"
                        style={{
                          background:
                            "linear-gradient(90deg,#E2E8F0 25%,#F1F5F9 50%,#E2E8F0 75%)",
                          backgroundSize: "200% 100%",
                          animation: "shimmer 1.5s infinite",
                        }}
                      />
                    ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-16 px-6 text-center">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3"
                    style={{ background: "#EFF6FF" }}
                  >
                    <IconMessage size={26} style={{ color: "#93C5FD" }} />
                  </div>
                  <p
                    className="text-sm font-bold mb-1"
                    style={{ color: "#0F172A" }}
                  >
                    {search ? "Aucun résultat" : "Aucune conversation"}
                  </p>
                  <p className="text-xs" style={{ color: "#94A3B8" }}>
                    {search
                      ? "Modifiez votre recherche"
                      : "Démarrez une nouvelle conversation"}
                  </p>
                  {!search && (
                    <button
                      onClick={() => setShowModal(true)}
                      className="mt-3 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold"
                      style={{
                        background: "#EFF6FF",
                        color: "#2563EB",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      <IconPlus size={13} /> Nouveau message
                    </button>
                  )}
                </div>
              ) : (
                filtered.map((conv) => {
                  const isActive = activeKey === conv.key;
                  const col = avatarColor(
                    conv.interlocutor.nom,
                    conv.interlocutor.prenom,
                  );
                  return (
                    <div
                      key={conv.key}
                      className={`conv-item flex items-center gap-3 px-4 py-3 ${isActive ? "conv-active" : ""}`}
                      style={{
                        borderBottom: "1px solid #F8FAFC",
                        minHeight: "72px",
                      }}
                      onClick={() => openConv(conv.key)}
                    >
                      {/* Avatar + badge */}
                      <div style={{ position: "relative", flexShrink: 0 }}>
                        <Avatar
                          nom={conv.interlocutor.nom}
                          prenom={conv.interlocutor.prenom}
                          size={44}
                        />
                        {conv.unread > 0 && (
                          <div
                            style={{
                              position: "absolute",
                              top: "-4px",
                              right: "-4px",
                              minWidth: "18px",
                              height: "18px",
                              borderRadius: "9px",
                              background: "#2563EB",
                              color: "#fff",
                              fontSize: "10px",
                              fontWeight: 700,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              padding: "0 4px",
                              border: "2px solid #fff",
                            }}
                          >
                            {conv.unread > 9 ? "9+" : conv.unread}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <span
                            className="text-sm font-bold truncate"
                            style={{
                              color: "#0F172A",
                              fontWeight: conv.unread > 0 ? 700 : 600,
                            }}
                          >
                            {conv.interlocutor.nom_complet}
                          </span>
                          <span
                            className="text-xs flex-shrink-0"
                            style={{ color: "#94A3B8" }}
                          >
                            {timeLabel(conv.lastMessage.date_envoi)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mb-0.5">
                          <div
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              background: col,
                              flexShrink: 0,
                            }}
                          />
                          <span
                            className="text-xs truncate"
                            style={{ color: "#94A3B8" }}
                          >
                            {conv.bien.titre}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {conv.lastMessage.expediteur.id === user.id && (
                            <span style={{ flexShrink: 0 }}>
                              {conv.lastMessage.est_lu ? (
                                <IconChecks
                                  size={11}
                                  style={{ color: "#2563EB" }}
                                />
                              ) : (
                                <IconCheck
                                  size={11}
                                  style={{ color: "#94A3B8" }}
                                />
                              )}
                            </span>
                          )}
                          <p
                            className="text-xs truncate"
                            style={{
                              color: conv.unread > 0 ? "#0F172A" : "#94A3B8",
                              fontWeight: conv.unread > 0 ? 600 : 400,
                            }}
                          >
                            {conv.lastMessage.expediteur.id === user.id
                              ? "Vous : "
                              : ""}
                            {conv.lastMessage.contenu}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ── PANEL CHAT ── */}
          <div
            className={`panel-chat ${mobileView === "chat" ? "active" : ""}`}
          >
            {!activeConv ? (
              /* Écran vide — desktop uniquement */
              <div className="hidden sm:flex flex-1 flex-col items-center justify-center p-8 text-center">
                <div
                  className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5"
                  style={{
                    background: "linear-gradient(135deg,#EFF6FF,#DBEAFE)",
                  }}
                >
                  <IconMessage size={36} style={{ color: "#93C5FD" }} />
                </div>
                <h3
                  className="text-base font-bold mb-2"
                  style={{ color: "#0F172A" }}
                >
                  Sélectionnez une conversation
                </h3>
                <p className="text-sm mb-5" style={{ color: "#94A3B8" }}>
                  Choisissez une conversation ou démarrez-en une nouvelle
                </p>
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white"
                  style={{
                    background: "linear-gradient(135deg,#2563EB,#1D4ED8)",
                    boxShadow: "0 4px 12px rgba(37,99,235,.3)",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <IconPlus size={15} /> Nouveau message
                </button>
              </div>
            ) : (
              <>
                {/* Header chat desktop */}
                <div
                  className="hidden sm:flex items-center gap-3 px-4 py-3 bg-white flex-shrink-0"
                  style={{
                    borderBottom: "1px solid #E2E8F0",
                    boxShadow: "0 1px 3px rgba(0,0,0,.04)",
                  }}
                >
                  <Avatar
                    nom={activeConv.interlocutor.nom}
                    prenom={activeConv.interlocutor.prenom}
                    size={40}
                  />
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-sm font-bold"
                      style={{ color: "#0F172A" }}
                    >
                      {activeConv.interlocutor.nom_complet}
                    </div>
                    <div
                      className="flex items-center gap-2 text-xs"
                      style={{ color: "#94A3B8" }}
                    >
                      <IconHome2 size={11} />
                      <span className="truncate">{activeConv.bien.titre}</span>
                      {activeConv.bien.adresse && (
                        <>
                          <span>·</span>
                          <span className="truncate">
                            {activeConv.bien.adresse}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {activeConv.interlocutor.telephone && (
                      <a
                        href={`tel:${activeConv.interlocutor.telephone}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
                        style={{
                          background: "#ECFDF5",
                          color: "#059669",
                          textDecoration: "none",
                        }}
                      >
                        <IconPhone size={13} />{" "}
                        {activeConv.interlocutor.telephone}
                      </a>
                    )}
                    <span
                      className="text-xs font-semibold px-2.5 py-1 rounded-full capitalize"
                      style={{ background: "#EFF6FF", color: "#2563EB" }}
                    >
                      {activeConv.interlocutor.role}
                    </span>
                  </div>
                </div>

                {/* Messages */}
                <div
                  className="flex-1 overflow-y-auto px-3 sm:px-5 py-4"
                  style={{ background: "#F8FAFC" }}
                >
                  <div className="max-w-2xl mx-auto space-y-1">
                    {activeConv.messages.map((m, i) => {
                      const isMine = m.expediteur.id === user.id;
                      const prevDate =
                        i > 0
                          ? new Date(
                              activeConv.messages[i - 1].date_envoi,
                            ).toDateString()
                          : null;
                      const currDate = new Date(m.date_envoi).toDateString();
                      const showDate = prevDate !== currDate;
                      const prevSame =
                        i > 0 &&
                        activeConv.messages[i - 1].expediteur.id ===
                          m.expediteur.id;
                      const nextSame =
                        i < activeConv.messages.length - 1 &&
                        activeConv.messages[i + 1].expediteur.id ===
                          m.expediteur.id;

                      return (
                        <div key={m.id}>
                          {showDate && (
                            <div className="flex items-center gap-3 my-4">
                              <div
                                className="flex-1 h-px"
                                style={{ background: "#E2E8F0" }}
                              />
                              <span
                                className="text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0"
                                style={{
                                  background: "#fff",
                                  color: "#94A3B8",
                                  border: "1px solid #E2E8F0",
                                }}
                              >
                                {fullDate(m.date_envoi)}
                              </span>
                              <div
                                className="flex-1 h-px"
                                style={{ background: "#E2E8F0" }}
                              />
                            </div>
                          )}

                          <div
                            className={`msg-bubble flex ${isMine ? "justify-end" : "justify-start"} ${prevSame && !showDate ? "mt-0.5" : "mt-3"}`}
                          >
                            {/* Avatar interlocuteur */}
                            {!isMine && (
                              <div
                                style={{
                                  width: 28,
                                  flexShrink: 0,
                                  marginRight: "8px",
                                  alignSelf: "flex-end",
                                }}
                              >
                                {!nextSame && (
                                  <Avatar
                                    nom={m.expediteur.nom}
                                    prenom={m.expediteur.prenom}
                                    size={28}
                                  />
                                )}
                              </div>
                            )}

                            <div style={{ maxWidth: "min(75%, 480px)" }}>
                              {/* Nom expéditeur (premier message du groupe) */}
                              {!isMine && !prevSame && (
                                <div
                                  className="text-xs font-semibold mb-1 ml-1"
                                  style={{ color: "#64748B" }}
                                >
                                  {m.expediteur.prenom}
                                </div>
                              )}

                              <div
                                style={{
                                  padding: "10px 14px",
                                  fontSize: "14px",
                                  lineHeight: 1.55,
                                  color: isMine ? "#fff" : "#0F172A",
                                  background: isMine
                                    ? "linear-gradient(135deg,#2563EB,#1D4ED8)"
                                    : "#fff",
                                  borderRadius: isMine
                                    ? prevSame
                                      ? "18px 4px 4px 18px"
                                      : "18px 18px 4px 18px"
                                    : prevSame
                                      ? "4px 18px 18px 4px"
                                      : "4px 18px 18px 18px",
                                  ...((!prevSame && isMine) ||
                                  (!prevSame && !isMine)
                                    ? {
                                        borderRadius: isMine
                                          ? "18px 18px 4px 18px"
                                          : "18px 18px 18px 4px",
                                      }
                                    : {}),
                                  boxShadow: isMine
                                    ? "0 2px 10px rgba(37,99,235,.25)"
                                    : "0 1px 4px rgba(0,0,0,.08)",
                                  wordBreak: "break-word",
                                }}
                              >
                                {m.contenu}
                              </div>

                              {/* Heure + statut lu (dernier du groupe) */}
                              {!nextSame && (
                                <div
                                  className={`flex items-center gap-1 mt-1 ${isMine ? "justify-end pr-1" : "justify-start pl-1"}`}
                                >
                                  <span
                                    className="text-xs"
                                    style={{ color: "#94A3B8" }}
                                  >
                                    {timeLabel(m.date_envoi)}
                                  </span>
                                  {isMine &&
                                    (m.est_lu ? (
                                      <IconChecks
                                        size={13}
                                        style={{ color: "#2563EB" }}
                                      />
                                    ) : (
                                      <IconCheck
                                        size={13}
                                        style={{ color: "#94A3B8" }}
                                      />
                                    ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} style={{ height: 4 }} />
                  </div>
                </div>

                {/* Zone saisie */}
                <div
                  className="flex-shrink-0 bg-white px-3 sm:px-4 py-3"
                  style={{
                    borderTop: "1px solid #E2E8F0",
                    boxShadow: "0 -2px 12px rgba(0,0,0,.04)",
                  }}
                >
                  <div className="max-w-2xl mx-auto flex items-end gap-2">
                    <textarea
                      ref={textareaRef}
                      value={contenu}
                      onChange={(e) => setContenu(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      onInput={(e) => {
                        const t = e.currentTarget;
                        t.style.height = "auto";
                        t.style.height = `${Math.min(t.scrollHeight, 140)}px`;
                      }}
                      placeholder="Écrire un message..."
                      rows={1}
                      style={{
                        flex: 1,
                        padding: "10px 14px",
                        border: "1.5px solid #E2E8F0",
                        borderRadius: "16px",
                        fontSize: "14px",
                        color: "#0F172A",
                        background: "#F8FAFC",
                        maxHeight: "140px",
                        lineHeight: 1.5,
                      }}
                    />
                    <button
                      className="send-btn w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      onClick={handleSend}
                      disabled={sending || !contenu.trim()}
                      style={{
                        background: !contenu.trim()
                          ? "#E2E8F0"
                          : "linear-gradient(135deg,#2563EB,#1D4ED8)",
                        boxShadow: !contenu.trim()
                          ? "none"
                          : "0 4px 12px rgba(37,99,235,.35)",
                        border: "none",
                        cursor: !contenu.trim() ? "not-allowed" : "pointer",
                        transition: "all .15s",
                      }}
                    >
                      {sending ? (
                        <IconLoader2
                          size={16}
                          color="white"
                          style={{ animation: "spin 1s linear infinite" }}
                        />
                      ) : (
                        <IconSend
                          size={16}
                          color={!contenu.trim() ? "#94A3B8" : "white"}
                        />
                      )}
                    </button>
                  </div>
                  <p
                    className="text-xs text-center mt-1.5 hidden sm:block"
                    style={{ color: "#CBD5E1" }}
                  >
                    Entrée pour envoyer · Maj+Entrée pour saut de ligne
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <ModalNouvelleConversation
        open={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={load}
      />
    </>
  );
}
