"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
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
} from "@tabler/icons-react";

// ── Types ──────────────────────────────────────────────────
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

// ── Helpers ────────────────────────────────────────────────
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
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function Avatar({
  nom,
  prenom,
  size = 36,
}: {
  nom: string;
  prenom: string;
  size?: number;
}) {
  const colors = [
    "#3B82F6",
    "#059669",
    "#D97706",
    "#7C3AED",
    "#EF4444",
    "#06B6D4",
    "#EC4899",
  ];
  const color =
    colors[
      ((prenom?.charCodeAt(0) ?? 0) + (nom?.charCodeAt(0) ?? 0)) % colors.length
    ];
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "10px",
        background: `${color}20`,
        border: `1.5px solid ${color}35`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        fontSize: size * 0.33,
        color,
        flexShrink: 0,
      }}
    >
      {prenom?.[0] ?? "?"}
      {nom?.[0] ?? ""}
    </div>
  );
}

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

// ── Page principale ────────────────────────────────────────
export default function MessagesPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [contenu, setContenu] = useState("");
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const [showModal, setShowModal] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = async () => {
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
    pollRef.current = setInterval(load, 10000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeKey]);

  // Marquer comme lu à l'ouverture
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      if (textareaRef.current) textareaRef.current.style.height = "auto";
      await load();
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch {
      toast.error("Erreur lors de l'envoi");
    } finally {
      setSending(false);
    }
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

  const openConv = (key: string) => {
    setActiveKey(key);
    setMobileView("chat");
  };

  if (!user) return null;

  return (
    <>
      <style>{`
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes spin{to{transform:rotate(360deg)}}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:#E2E8F0;border-radius:4px}
        .conv-item{transition:background .12s;cursor:pointer}
        .conv-item:hover{background:#F8FAFC}
        .conv-active{background:#EFF6FF}
        textarea{resize:none;font-family:inherit}
        textarea:focus{outline:none}
      `}</style>

      <div
        className="flex h-screen overflow-hidden"
        style={{
          background: "#F1F5F9",
          fontFamily: "'DM Sans','Helvetica Neue',sans-serif",
        }}
      >
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Header */}
          <header
            className="flex items-center gap-3 px-4 sm:px-6 h-14 sm:h-16 flex-shrink-0 bg-white"
            style={{
              borderBottom: "1px solid #E2E8F0",
              boxShadow: "0 1px 3px rgba(0,0,0,.04)",
            }}
          >
            {/* Mobile — vue chat */}
            {mobileView === "chat" && activeConv && (
              <button
                onClick={() => setMobileView("list")}
                className="sm:hidden flex items-center gap-1 text-sm font-medium flex-shrink-0"
                style={{ color: "#64748B" }}
              >
                <IconChevronLeft size={16} />
              </button>
            )}

            {/* Mobile chat header */}
            {mobileView === "chat" && activeConv && (
              <div className="flex items-center gap-2 flex-1 min-w-0 sm:hidden">
                <Avatar
                  nom={activeConv.interlocutor.nom}
                  prenom={activeConv.interlocutor.prenom}
                  size={32}
                />
                <div className="min-w-0">
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
              </div>
            )}

            {/* Desktop header */}
            {(mobileView === "list" || !activeConv) && (
              <>
                <Link
                  href="/bailleur"
                  className="flex items-center gap-1.5 text-sm font-medium flex-shrink-0"
                  style={{ color: "#64748B", textDecoration: "none" }}
                >
                  <IconArrowLeft size={16} />
                  <span className="hidden sm:inline">Retour</span>
                </Link>
                <div
                  className="h-5 w-px flex-shrink-0"
                  style={{ background: "#E2E8F0" }}
                />
              </>
            )}

            <div className="hidden sm:flex items-center gap-2 flex-1 min-w-0">
              <IconMessage
                size={17}
                style={{ color: "#2563EB", flexShrink: 0 }}
              />
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
                  {totalUnread} non lu{totalUnread > 1 ? "s" : ""}
                </span>
              )}
            </div>

            <button
              onClick={load}
              className="w-9 h-9 rounded-lg flex items-center justify-center ml-auto sm:ml-0"
              style={{ background: "#F1F5F9", border: "1px solid #E2E8F0" }}
            >
              <IconRefresh
                size={15}
                style={{
                  color: "#64748B",
                  animation: loading ? "spin 1s linear infinite" : "none",
                }}
              />
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 px-3 sm:px-4 h-9 rounded-xl text-sm font-bold text-white"
              style={{
                background: "linear-gradient(135deg,#2563EB,#1D4ED8)",
                boxShadow: "0 2px 8px rgba(37,99,235,.35)",
              }}
            >
              <IconPlus size={15} />
              <span className="hidden sm:inline">Nouveau message</span>
            </motion.button>
          </header>

          {/* Layout 2 colonnes */}
          <div className="flex-1 flex overflow-hidden">
            {/* ── Liste conversations ── */}
            <div
              className={`${mobileView === "chat" ? "hidden sm:flex" : "flex"} flex-col bg-white flex-shrink-0`}
              style={{
                width: "clamp(260px, 30%, 340px)",
                borderRight: "1px solid #E2E8F0",
              }}
            >
              {/* Recherche */}
              <div
                className="p-3 flex-shrink-0"
                style={{ borderBottom: "1px solid #F1F5F9" }}
              >
                <div className="relative">
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
                      border: "1.5px solid #E2E8F0",
                      borderRadius: "10px",
                      fontSize: "13px",
                      color: "#0F172A",
                      outline: "none",
                      background: "#F8FAFC",
                      fontFamily: "inherit",
                    }}
                  />
                </div>
              </div>

              {/* Liste */}
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="space-y-1 p-2">
                    {Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <div
                          key={i}
                          className="h-16 rounded-xl"
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
                  <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
                      style={{ background: "#EFF6FF" }}
                    >
                      <IconMessage size={24} style={{ color: "#93C5FD" }} />
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
                        : "Les messages apparaîtront ici"}
                    </p>
                  </div>
                ) : (
                  filtered.map((conv) => (
                    <div
                      key={conv.key}
                      className={`conv-item flex items-center gap-3 px-4 py-3 ${activeKey === conv.key ? "conv-active" : ""}`}
                      style={{ borderBottom: "1px solid #F8FAFC" }}
                      onClick={() => openConv(conv.key)}
                    >
                      <div className="relative flex-shrink-0">
                        <Avatar
                          nom={conv.interlocutor.nom}
                          prenom={conv.interlocutor.prenom}
                          size={42}
                        />
                        {conv.unread > 0 && (
                          <div
                            className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-white"
                            style={{
                              background: "#2563EB",
                              fontSize: "10px",
                              fontWeight: 700,
                            }}
                          >
                            {conv.unread}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span
                            className="text-sm font-bold truncate"
                            style={{ color: "#0F172A" }}
                          >
                            {conv.interlocutor.nom_complet}
                          </span>
                          <span
                            className="text-xs flex-shrink-0 ml-2"
                            style={{ color: "#94A3B8" }}
                          >
                            {timeLabel(conv.lastMessage.date_envoi)}
                          </span>
                        </div>
                        <div
                          className="flex items-center gap-1 text-xs mb-0.5"
                          style={{ color: "#94A3B8" }}
                        >
                          <IconHome2 size={10} style={{ flexShrink: 0 }} />
                          <span className="truncate">{conv.bien.titre}</span>
                        </div>
                        <div
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
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* ── Zone de chat ── */}
            <div
              className={`${mobileView === "list" && !activeConv ? "hidden sm:flex" : "flex"} flex-1 flex-col min-w-0`}
              style={{ background: "#F8FAFC" }}
            >
              {!activeConv ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4"
                    style={{ background: "#EFF6FF" }}
                  >
                    <IconMessage size={36} style={{ color: "#93C5FD" }} />
                  </div>
                  <h3
                    className="text-base font-bold mb-2"
                    style={{ color: "#0F172A" }}
                  >
                    Sélectionnez une conversation
                  </h3>
                  <p className="text-sm" style={{ color: "#64748B" }}>
                    Choisissez une conversation dans la liste
                  </p>
                </div>
              ) : (
                <>
                  {/* Header conversation desktop */}
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
                        className="text-sm font-bold truncate"
                        style={{ color: "#0F172A" }}
                      >
                        {activeConv.interlocutor.nom_complet}
                      </div>
                      <div
                        className="flex items-center gap-1 text-xs"
                        style={{ color: "#94A3B8" }}
                      >
                        <IconHome2 size={11} />
                        <span className="truncate">
                          {activeConv.bien.titre}
                        </span>
                      </div>
                    </div>
                    <span
                      className="text-xs font-semibold px-2.5 py-1 rounded-full capitalize"
                      style={{ background: "#EFF6FF", color: "#2563EB" }}
                    >
                      {activeConv.interlocutor.role}
                    </span>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
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

                      return (
                        <div key={m.id}>
                          {showDate && (
                            <div className="flex items-center gap-3 my-3">
                              <div
                                className="flex-1 h-px"
                                style={{ background: "#E2E8F0" }}
                              />
                              <span
                                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                                style={{
                                  background: "#F1F5F9",
                                  color: "#94A3B8",
                                }}
                              >
                                {new Date(m.date_envoi).toLocaleDateString(
                                  "fr-FR",
                                  { day: "numeric", month: "long" },
                                )}
                              </span>
                              <div
                                className="flex-1 h-px"
                                style={{ background: "#E2E8F0" }}
                              />
                            </div>
                          )}
                          <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                          >
                            <div style={{ maxWidth: "70%" }}>
                              <div
                                className="px-3.5 py-2.5 text-sm"
                                style={{
                                  background: isMine
                                    ? "linear-gradient(135deg,#2563EB,#1D4ED8)"
                                    : "#fff",
                                  color: isMine ? "white" : "#0F172A",
                                  borderRadius: isMine
                                    ? "18px 18px 4px 18px"
                                    : "18px 18px 18px 4px",
                                  boxShadow: isMine
                                    ? "0 2px 8px rgba(37,99,235,.3)"
                                    : "0 1px 3px rgba(0,0,0,.08)",
                                  lineHeight: 1.6,
                                }}
                              >
                                {m.contenu}
                              </div>
                              <div
                                className={`flex items-center gap-1 mt-1 ${isMine ? "justify-end" : "justify-start"}`}
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
                                      size={12}
                                      style={{ color: "#2563EB" }}
                                    />
                                  ) : (
                                    <IconCheck
                                      size={12}
                                      style={{ color: "#94A3B8" }}
                                    />
                                  ))}
                              </div>
                            </div>
                          </motion.div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Zone de saisie */}
                  <div
                    className="flex-shrink-0 p-3 bg-white"
                    style={{ borderTop: "1px solid #E2E8F0" }}
                  >
                    <div className="flex items-end gap-2">
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
                          t.style.height = `${Math.min(t.scrollHeight, 120)}px`;
                        }}
                        placeholder="Écrivez votre message... (Entrée pour envoyer)"
                        rows={1}
                        style={{
                          flex: 1,
                          padding: "10px 14px",
                          border: "1.5px solid #E2E8F0",
                          borderRadius: "14px",
                          fontSize: "13px",
                          color: "#0F172A",
                          background: "#F8FAFC",
                          maxHeight: "120px",
                          lineHeight: 1.5,
                        }}
                      />
                      <motion.button
                        whileHover={
                          sending || !contenu.trim() ? {} : { scale: 1.05 }
                        }
                        whileTap={
                          sending || !contenu.trim() ? {} : { scale: 0.95 }
                        }
                        onClick={handleSend}
                        disabled={sending || !contenu.trim()}
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                          background: !contenu.trim()
                            ? "#E2E8F0"
                            : "linear-gradient(135deg,#2563EB,#1D4ED8)",
                          boxShadow: !contenu.trim()
                            ? "none"
                            : "0 3px 10px rgba(37,99,235,.4)",
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
                      </motion.button>
                    </div>
                    <p
                      className="text-xs mt-1.5 text-center"
                      style={{ color: "#CBD5E1" }}
                    >
                      Entrée pour envoyer · Maj+Entrée pour retour à la ligne
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
      </div>
    </>
  );
}
