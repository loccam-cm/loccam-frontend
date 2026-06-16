"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { Message, PaginatedResponse } from "@/types";
import {
  IconArrowLeft,
  IconSend,
  IconSearch,
  IconX,
  IconMessage,
  IconPaperclip,
  IconCheck,
  IconChecks,
  IconDots,
  IconPhone,
  IconVideo,
  IconChevronLeft,
  IconMoodSmile,
  IconRefresh,
  IconFile,
  IconDownload,
  IconLoader2,
  IconUser,
} from "@tabler/icons-react";

// ── Types ──────────────────────────────────────────────────
interface Utilisateur {
  id: number;
  nom: string;
  prenom: string;
  nom_complet: string;
  email: string;
  telephone: string;
  role: string;
}

interface Conversation {
  interlocuteur: Utilisateur;
  dernierMessage: Message;
  nonLus: number;
  messages: Message[];
  bienId: number | null;
}

// ── Emojis fréquents ──────────────────────────────────────
const EMOJIS = [
  "😊",
  "😂",
  "❤️",
  "👍",
  "🙏",
  "😭",
  "😍",
  "🔥",
  "✅",
  "👋",
  "😢",
  "🎉",
  "💯",
  "🤔",
  "😅",
  "🙂",
  "😁",
  "💪",
  "🥲",
  "😮",
  "🏠",
  "🔑",
  "💰",
  "📄",
  "⚠️",
  "✍️",
  "📱",
  "🛠️",
  "💧",
  "⚡",
];

// ── Utilitaires ────────────────────────────────────────────
function formatHeure(iso: string) {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  if (diff < 60000) return "maintenant";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
  if (diff < 86400000)
    return d.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  if (diff < 86400000) return "Aujourd'hui";
  if (diff < 172800000) return "Hier";
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
}

function isImage(url: string) {
  return /\.(jpg|jpeg|png|webp|gif)(\?|$)/i.test(url);
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
  const colors = [
    "#3B82F6",
    "#059669",
    "#D97706",
    "#7C3AED",
    "#EF4444",
    "#06B6D4",
    "#EC4899",
  ];
  const col = colors[(prenom?.charCodeAt(0) ?? 0) % colors.length];
  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "14px",
          background: `${col}18`,
          border: `1.5px solid ${col}30`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
          fontSize: size * 0.35,
          color: col,
        }}
      >
        {prenom?.[0]}
        {nom?.[0]}
      </div>
      {online && (
        <div
          style={{
            position: "absolute",
            bottom: 1,
            right: 1,
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

// ── Composant pièce jointe ─────────────────────────────────
function PieceJointe({ url }: { url: string }) {
  if (isImage(url)) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        style={{ display: "block", marginTop: "6px" }}
      >
        <img
          src={url}
          alt="pièce jointe"
          style={{
            maxWidth: "220px",
            maxHeight: "180px",
            borderRadius: "10px",
            objectFit: "cover",
            cursor: "pointer",
          }}
        />
      </a>
    );
  }
  const nom = url.split("/").pop()?.split("?")[0] ?? "Fichier";
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        marginTop: "6px",
        padding: "8px 12px",
        background: "rgba(255,255,255,.15)",
        borderRadius: "10px",
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <IconFile size={16} />
      <span
        style={{
          fontSize: "12px",
          maxWidth: "160px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {nom}
      </span>
      <IconDownload size={14} />
    </a>
  );
}

// ── Emoji picker ───────────────────────────────────────────
function EmojiPicker({
  onPick,
  onClose,
}: {
  onPick: (e: string) => void;
  onClose: () => void;
}) {
  return (
    <>
      <div
        style={{ position: "fixed", inset: 0, zIndex: 49 }}
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 8 }}
        transition={{ duration: 0.15 }}
        style={{
          position: "absolute",
          bottom: "52px",
          left: 0,
          zIndex: 50,
          background: "#fff",
          border: "1px solid #E2E8F0",
          borderRadius: "16px",
          padding: "12px",
          boxShadow: "0 8px 32px rgba(0,0,0,.15)",
          width: "224px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: "4px",
          }}
        >
          {EMOJIS.map((e) => (
            <button
              key={e}
              onClick={() => {
                onPick(e);
                onClose();
              }}
              style={{
                width: "36px",
                height: "36px",
                fontSize: "20px",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                borderRadius: "8px",
                transition: "background .1s",
              }}
              onMouseEnter={(el) =>
                (el.currentTarget.style.background = "#F1F5F9")
              }
              onMouseLeave={(el) =>
                (el.currentTarget.style.background = "transparent")
              }
            >
              {e}
            </button>
          ))}
        </div>
      </motion.div>
    </>
  );
}

// ── Menu trois points ──────────────────────────────────────
function DotsMenu({
  interlocutor,
  onClose,
}: {
  interlocutor: Utilisateur;
  onClose: () => void;
}) {
  return (
    <>
      <div
        style={{ position: "fixed", inset: 0, zIndex: 49 }}
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: -8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -8 }}
        transition={{ duration: 0.15 }}
        style={{
          position: "absolute",
          top: "44px",
          right: 0,
          zIndex: 50,
          background: "#fff",
          border: "1px solid #E2E8F0",
          borderRadius: "14px",
          padding: "6px",
          boxShadow: "0 8px 32px rgba(0,0,0,.15)",
          minWidth: "200px",
        }}
      >
        {[
          {
            ico: <IconUser size={15} />,
            lbl: "Voir le profil du bailleur",
            action: () =>
              toast.info(
                `${interlocutor.nom_complet} · ${interlocutor.telephone}`,
              ),
          },
          {
            ico: <IconPhone size={15} />,
            lbl: `Appeler ${interlocutor.prenom}`,
            action: () => window.open(`tel:${interlocutor.telephone}`),
          },
          {
            ico: <IconX size={15} />,
            lbl: "Effacer la conversation",
            action: () => toast.info("Fonctionnalité bientôt disponible"),
            danger: true,
          },
        ].map((item) => (
          <button
            key={item.lbl}
            onClick={() => {
              item.action();
              onClose();
            }}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 12px",
              borderRadius: "10px",
              border: "none",
              background: "none",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: 500,
              textAlign: "left",
              color: item.danger ? "#EF4444" : "#0F172A",
              fontFamily: "inherit",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = item.danger
                ? "#FEF2F2"
                : "#F8FAFC")
            }
            onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
          >
            <span style={{ color: item.danger ? "#EF4444" : "#64748B" }}>
              {item.ico}
            </span>
            {item.lbl}
          </button>
        ))}
      </motion.div>
    </>
  );
}

// ── Page principale ────────────────────────────────────────
export default function MessageriePage() {
  const { user } = useAuth();
  const [conversations, setConvs] = useState<Conversation[]>([]);
  const [active, setActive] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const [showEmoji, setShowEmoji] = useState(false);
  const [showDots, setShowDots] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (user) {
      load();
      pollRef.current = setInterval(load, 10000);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get<PaginatedResponse<Message>>("/messages/");
      const msgs = res.data.results;

      const map = new Map<number, Conversation>();
      msgs.forEach((m) => {
        const other =
          m.expediteur?.id === user?.id ? m.destinataire : m.expediteur;
        if (!other) return;
        const ex = map.get(other.id);
        if (!ex) {
          map.set(other.id, {
            interlocuteur: other as Utilisateur,
            dernierMessage: m,
            nonLus: !m.est_lu && m.expediteur?.id !== user?.id ? 1 : 0,
            messages: [m],
            bienId: (m as any).bien?.id ?? null,
          });
        } else {
          ex.messages.push(m);
          if (!m.est_lu && m.expediteur?.id !== user?.id) ex.nonLus++;
          if (new Date(m.date_envoi) > new Date(ex.dernierMessage.date_envoi))
            ex.dernierMessage = m;
        }
      });

      const convList = Array.from(map.values()).sort(
        (a, b) =>
          new Date(b.dernierMessage.date_envoi).getTime() -
          new Date(a.dernierMessage.date_envoi).getTime(),
      );
      setConvs(convList);

      if (active) {
        const updated = convList.find(
          (c) => c.interlocuteur.id === active.interlocuteur.id,
        );
        if (updated) {
          setMessages(
            updated.messages.sort(
              (a, b) =>
                new Date(a.date_envoi).getTime() -
                new Date(b.date_envoi).getTime(),
            ),
          );
        }
      } else if (convList.length > 0) {
        setActive(convList[0]);
        setMessages(
          convList[0].messages.sort(
            (a, b) =>
              new Date(a.date_envoi).getTime() -
              new Date(b.date_envoi).getTime(),
          ),
        );
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const openConv = (conv: Conversation) => {
    setActive(conv);
    setMessages(
      conv.messages.sort(
        (a, b) =>
          new Date(a.date_envoi).getTime() - new Date(b.date_envoi).getTime(),
      ),
    );
    setMobileView("chat");
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const sendMessage = async (texte: string, pieceJointeUrl?: string) => {
    if ((!texte.trim() && !pieceJointeUrl) || !active || sending) return;
    setSending(true);
    try {
      await api.post("/messages/", {
        destinataire: active.interlocuteur.id,
        bien: active.bienId,
        contenu: texte.trim() || (pieceJointeUrl ? "📎 Pièce jointe" : ""),
        piece_jointe_url: pieceJointeUrl ?? "",
      });
      setInput("");
      await load();
    } catch {
      toast.error("Erreur lors de l'envoi");
    } finally {
      setSending(false);
    }
  };

  // Upload pièce jointe
  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("fichier", file);
      fd.append("type_document", "piece_jointe");
      const res = await api.post("/upload/", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await sendMessage(input, res.data.url_publique);
      setInput("");
    } catch {
      toast.error("Erreur lors de l'envoi du fichier");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const filteredConvs = conversations.filter(
    (c) =>
      !search ||
      c.interlocuteur.nom_complet.toLowerCase().includes(search.toLowerCase()),
  );
  const totalNonLus = conversations.reduce((s, c) => s + c.nonLus, 0);

  if (!user) return null;

  return (
    <>
      <style>{`
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:#D1FAE5;border-radius:4px}
        .conv-item{transition:background .12s;cursor:pointer}
        .conv-item:hover{background:#F0FDF4}
        .conv-item.active{background:#ECFDF5}
        .msg-input{flex:1;min-width:0;padding:10px 16px;border-radius:24px;border:1.5px solid #D1FAE5;font-size:15px;color:#0F172A;outline:none;background:#fff;font-family:inherit;transition:border-color .15s;line-height:1.45}
        .msg-input:focus{border-color:#059669;box-shadow:0 0 0 3px rgba(5,150,105,.08)}
        .msg-input::placeholder{color:#94A3B8}
        .send-btn{width:44px;height:44px;border-radius:50%;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .15s}
        .send-btn:hover{transform:scale(1.08)}
        .send-btn:active{transform:scale(.95)}
        .online-pulse{animation:pulse 2.5s ease-in-out infinite}
        .chat-shell{display:flex;height:100dvh;overflow:hidden;background:#F0FDF4;font-family:'DM Sans','Helvetica Neue',sans-serif}
        @media(min-width:768px){
          .sidebar-list{width:320px;flex-shrink:0;display:flex!important;flex-direction:column;height:100dvh;background:#fff;border-right:1px solid #D1FAE5}
          .chat-area{flex:1;display:flex!important;flex-direction:column;height:100dvh}
          .back-btn{display:none!important}
        }
        @media(max-width:767px){
          .sidebar-list{position:fixed;inset:0;z-index:10;background:#fff;flex-direction:column;height:100dvh}
          .sidebar-list.hidden-mobile{display:none!important}
          .chat-area{position:fixed;inset:0;z-index:20;flex-direction:column;height:100dvh;background:#F8FAFC}
          .chat-area.hidden-mobile{display:none!important}
        }
      `}</style>

      {/* Input fichier caché */}
      <input
        ref={fileRef}
        type="file"
        style={{ display: "none" }}
        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />

      <div className="chat-shell">
        {/* ── Sidebar liste ── */}
        <div
          className={`sidebar-list ${mobileView === "chat" ? "hidden-mobile" : ""}`}
        >
          {/* Header */}
          <div
            style={{
              padding: "16px 20px 12px",
              borderBottom: "1px solid #F0FDF4",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "14px",
              }}
            >
              <Link
                href="/locataire"
                style={{
                  display: "flex",
                  alignItems: "center",
                  color: "#64748B",
                  textDecoration: "none",
                }}
              >
                <IconArrowLeft size={16} />
              </Link>
              <div style={{ flex: 1 }}>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <h1
                    style={{
                      fontSize: "17px",
                      fontWeight: 700,
                      color: "#0F172A",
                    }}
                  >
                    Messages
                  </h1>
                  {totalNonLus > 0 && (
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        background: "#059669",
                        color: "#fff",
                        padding: "2px 7px",
                        borderRadius: "10px",
                      }}
                    >
                      {totalNonLus}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: "12px", color: "#94A3B8" }}>
                  {conversations.length} conversation
                  {conversations.length !== 1 ? "s" : ""}
                </div>
              </div>
              <button
                onClick={load}
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  background: "#F0FDF4",
                  border: "1px solid #D1FAE5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                <IconRefresh
                  size={15}
                  style={{
                    color: "#059669",
                    animation: loading ? "spin 1s linear infinite" : "none",
                  }}
                />
              </button>
            </div>

            {/* Recherche */}
            <div style={{ position: "relative" }}>
              <IconSearch
                size={15}
                style={{
                  position: "absolute",
                  left: "12px",
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
                  height: "38px",
                  padding: "0 12px 0 36px",
                  borderRadius: "12px",
                  border: "1.5px solid #E2E8F0",
                  fontSize: "14px",
                  color: "#0F172A",
                  outline: "none",
                  background: "#F8FAFC",
                  fontFamily: "inherit",
                }}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#94A3B8",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <IconX size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Liste conversations */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {loading && conversations.length === 0 ? (
              <div style={{ padding: "12px" }}>
                {Array(4)
                  .fill(0)
                  .map((_, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        gap: "12px",
                        padding: "12px",
                        marginBottom: "4px",
                      }}
                    >
                      <div
                        style={{
                          width: "48px",
                          height: "48px",
                          borderRadius: "14px",
                          background:
                            "linear-gradient(90deg,#D1FAE5 25%,#ECFDF5 50%,#D1FAE5 75%)",
                          backgroundSize: "200% 100%",
                          animation: "shimmer 1.5s infinite",
                          flexShrink: 0,
                        }}
                      />
                      <div
                        style={{
                          flex: 1,
                          display: "flex",
                          flexDirection: "column",
                          gap: "6px",
                        }}
                      >
                        <div
                          style={{
                            height: "13px",
                            borderRadius: "6px",
                            background:
                              "linear-gradient(90deg,#D1FAE5 25%,#ECFDF5 50%,#D1FAE5 75%)",
                            backgroundSize: "200% 100%",
                            animation: "shimmer 1.5s infinite",
                            width: "60%",
                          }}
                        />
                        <div
                          style={{
                            height: "11px",
                            borderRadius: "6px",
                            background:
                              "linear-gradient(90deg,#D1FAE5 25%,#ECFDF5 50%,#D1FAE5 75%)",
                            backgroundSize: "200% 100%",
                            animation: "shimmer 1.5s infinite",
                          }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            ) : filteredConvs.length === 0 ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "48px 24px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "18px",
                    background: "#ECFDF5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "12px",
                  }}
                >
                  <IconMessage size={26} style={{ color: "#6EE7B7" }} />
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "#0F172A",
                    marginBottom: "4px",
                  }}
                >
                  {search ? "Aucun résultat" : "Aucun message"}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#94A3B8",
                    lineHeight: 1.5,
                  }}
                >
                  {search
                    ? "Modifiez votre recherche"
                    : "Vos échanges avec votre bailleur apparaîtront ici"}
                </div>
              </div>
            ) : (
              filteredConvs.map((conv) => (
                <div
                  key={conv.interlocuteur.id}
                  className={`conv-item ${active?.interlocuteur.id === conv.interlocuteur.id ? "active" : ""}`}
                  onClick={() => openConv(conv)}
                  style={{
                    display: "flex",
                    gap: "12px",
                    padding: "14px 20px",
                    borderBottom: "1px solid #F8FAFC",
                  }}
                >
                  <Avatar
                    nom={conv.interlocuteur.nom}
                    prenom={conv.interlocuteur.prenom}
                    size={48}
                    online
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "3px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "14px",
                          fontWeight: conv.nonLus > 0 ? 700 : 600,
                          color: "#0F172A",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          flex: 1,
                        }}
                      >
                        {conv.interlocuteur.nom_complet}
                      </span>
                      <span
                        style={{
                          fontSize: "11px",
                          color: conv.nonLus > 0 ? "#059669" : "#94A3B8",
                          flexShrink: 0,
                          marginLeft: "8px",
                          fontWeight: conv.nonLus > 0 ? 600 : 400,
                        }}
                      >
                        {formatHeure(conv.dernierMessage.date_envoi)}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "8px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "13px",
                          color: conv.nonLus > 0 ? "#374151" : "#94A3B8",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          flex: 1,
                          fontWeight: conv.nonLus > 0 ? 500 : 400,
                        }}
                      >
                        {conv.dernierMessage.expediteur?.id === user?.id
                          ? "Vous : "
                          : ""}
                        {conv.dernierMessage.piece_jointe_url
                          ? "📎 Pièce jointe"
                          : conv.dernierMessage.contenu}
                      </div>
                      {conv.nonLus > 0 && (
                        <div
                          style={{
                            width: "20px",
                            height: "20px",
                            borderRadius: "50%",
                            background: "#059669",
                            color: "#fff",
                            fontSize: "11px",
                            fontWeight: 700,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          {conv.nonLus}
                        </div>
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#94A3B8",
                        marginTop: "2px",
                      }}
                    >
                      Propriétaire
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── Zone de chat ── */}
        <div
          className={`chat-area ${mobileView === "list" ? "hidden-mobile" : ""}`}
          style={{
            display: "flex",
            flexDirection: "column",
            background: "#F8FAFC",
          }}
        >
          {active ? (
            <>
              {/* Header */}
              <div
                style={{
                  padding: "12px 16px",
                  background: "#fff",
                  borderBottom: "1px solid #D1FAE5",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  boxShadow: "0 1px 4px rgba(5,150,105,.05)",
                  flexShrink: 0,
                  position: "relative",
                  zIndex: 10,
                }}
              >
                {/* Retour mobile */}
                <button
                  className="back-btn"
                  onClick={() => setMobileView("list")}
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    background: "#F0FDF4",
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                >
                  <IconChevronLeft size={20} style={{ color: "#059669" }} />
                </button>

                <Avatar
                  nom={active.interlocuteur.nom}
                  prenom={active.interlocuteur.prenom}
                  size={42}
                  online
                />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: "15px",
                      fontWeight: 700,
                      color: "#0F172A",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {active.interlocuteur.nom_complet}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    <div
                      className="online-pulse"
                      style={{
                        width: "7px",
                        height: "7px",
                        borderRadius: "50%",
                        background: "#10B981",
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontSize: "12px", color: "#059669" }}>
                      En ligne · Propriétaire
                    </span>
                  </div>
                </div>

                {/* Actions header */}
                <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                  {/* Appel */}
                  <a
                    href={`tel:${active.interlocuteur.telephone}`}
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "10px",
                      background: "#F0FDF4",
                      border: "1px solid #D1FAE5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#059669",
                      textDecoration: "none",
                    }}
                    title={`Appeler ${active.interlocuteur.prenom}`}
                  >
                    <IconPhone size={17} />
                  </a>

                  {/* Vidéo */}
                  <button
                    onClick={() => toast.info("Appel vidéo bientôt disponible")}
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "10px",
                      background: "#F0FDF4",
                      border: "1px solid #D1FAE5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      color: "#64748B",
                    }}
                  >
                    <IconVideo size={17} />
                  </button>

                  {/* Trois points */}
                  <div style={{ position: "relative" }}>
                    <button
                      onClick={() => setShowDots((d) => !d)}
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "10px",
                        background: showDots ? "#F0FDF4" : "#F8FAFC",
                        border: "1px solid #D1FAE5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        color: "#64748B",
                      }}
                    >
                      <IconDots size={17} />
                    </button>
                    <AnimatePresence>
                      {showDots && (
                        <DotsMenu
                          interlocutor={active.interlocuteur}
                          onClose={() => setShowDots(false)}
                        />
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
              >
                {messages.map((msg, i) => {
                  const isMine = msg.expediteur?.id === user?.id;
                  const prev = messages[i - 1];
                  const next = messages[i + 1];
                  const showDate =
                    !prev ||
                    formatDate(msg.date_envoi) !== formatDate(prev.date_envoi);
                  const showAvatar =
                    !isMine &&
                    (!next || next.expediteur?.id !== msg.expediteur?.id);
                  const isGrouped =
                    prev &&
                    prev.expediteur?.id === msg.expediteur?.id &&
                    !showDate;

                  return (
                    <div key={msg.id}>
                      {showDate && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            margin: "12px 0",
                          }}
                        >
                          <div
                            style={{
                              flex: 1,
                              height: "1px",
                              background: "#E2E8F0",
                            }}
                          />
                          <span
                            style={{
                              fontSize: "11px",
                              fontWeight: 600,
                              color: "#94A3B8",
                              padding: "4px 12px",
                              borderRadius: "12px",
                              background: "#F1F5F9",
                            }}
                          >
                            {formatDate(msg.date_envoi)}
                          </span>
                          <div
                            style={{
                              flex: 1,
                              height: "1px",
                              background: "#E2E8F0",
                            }}
                          />
                        </div>
                      )}

                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.2 }}
                        style={{
                          display: "flex",
                          flexDirection: isMine ? "row-reverse" : "row",
                          alignItems: "flex-end",
                          gap: "8px",
                          marginTop: isGrouped ? "2px" : "10px",
                        }}
                      >
                        {!isMine && (
                          <div style={{ width: "32px", flexShrink: 0 }}>
                            {showAvatar && (
                              <Avatar
                                nom={active.interlocuteur.nom}
                                prenom={active.interlocuteur.prenom}
                                size={32}
                              />
                            )}
                          </div>
                        )}

                        <div
                          style={{
                            maxWidth: "72%",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: isMine ? "flex-end" : "flex-start",
                          }}
                        >
                          <div
                            style={{
                              padding:
                                msg.piece_jointe_url && !msg.contenu?.trim()
                                  ? "6px"
                                  : "10px 14px",
                              borderRadius: isMine
                                ? "18px 18px 4px 18px"
                                : "18px 18px 18px 4px",
                              background: isMine
                                ? "linear-gradient(135deg,#059669,#047857)"
                                : "#fff",
                              color: isMine ? "#fff" : "#0F172A",
                              fontSize: "14px",
                              lineHeight: 1.5,
                              boxShadow: isMine
                                ? "0 2px 8px rgba(5,150,105,.3)"
                                : "0 1px 4px rgba(0,0,0,.06)",
                              border: isMine ? "none" : "1px solid #F1F5F9",
                              wordBreak: "break-word",
                            }}
                          >
                            {msg.contenu &&
                              msg.contenu !== "📎 Pièce jointe" && (
                                <div>{msg.contenu}</div>
                              )}
                            {msg.piece_jointe_url && (
                              <PieceJointe url={msg.piece_jointe_url} />
                            )}
                          </div>

                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              marginTop: "3px",
                              padding: "0 4px",
                            }}
                          >
                            <span
                              style={{ fontSize: "11px", color: "#94A3B8" }}
                            >
                              {new Date(msg.date_envoi).toLocaleTimeString(
                                "fr-FR",
                                { hour: "2-digit", minute: "2-digit" },
                              )}
                            </span>
                            {isMine &&
                              (msg.est_lu ? (
                                <IconChecks
                                  size={13}
                                  style={{ color: "#059669" }}
                                />
                              ) : (
                                <IconCheck
                                  size={13}
                                  style={{ color: "#94A3B8" }}
                                />
                              ))}
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {/* Zone saisie */}
              <div
                style={{
                  padding: "12px 16px 16px",
                  background: "#fff",
                  borderTop: "1px solid #D1FAE5",
                  flexShrink: 0,
                }}
              >
                {/* Barre upload en cours */}
                {uploading && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "8px 12px",
                      background: "#ECFDF5",
                      borderRadius: "10px",
                      marginBottom: "8px",
                    }}
                  >
                    <IconLoader2
                      size={14}
                      style={{
                        color: "#059669",
                        animation: "spin 1s linear infinite",
                      }}
                    />
                    <span
                      style={{
                        fontSize: "12px",
                        color: "#059669",
                        fontWeight: 600,
                      }}
                    >
                      Envoi du fichier...
                    </span>
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-end",
                    gap: "10px",
                  }}
                >
                  {/* Paperclip */}
                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      background: "#F0FDF4",
                      border: "1px solid #D1FAE5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      color: "#059669",
                      flexShrink: 0,
                      opacity: uploading ? 0.5 : 1,
                    }}
                  >
                    <IconPaperclip size={17} />
                  </button>

                  {/* Input texte */}
                  <div style={{ flex: 1, position: "relative" }}>
                    <input
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage(input);
                        }
                      }}
                      placeholder="Écrire un message..."
                      className="msg-input"
                      style={{ width: "100%" }}
                    />
                  </div>

                  {/* Emoji */}
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <button
                      onClick={() => setShowEmoji((s) => !s)}
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        background: showEmoji ? "#F0FDF4" : "transparent",
                        border: "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        color: showEmoji ? "#059669" : "#94A3B8",
                      }}
                    >
                      <IconMoodSmile size={20} />
                    </button>
                    <AnimatePresence>
                      {showEmoji && (
                        <EmojiPicker
                          onPick={(e) => setInput((i) => i + e)}
                          onClose={() => setShowEmoji(false)}
                        />
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Envoyer */}
                  <button
                    className="send-btn"
                    onClick={() => sendMessage(input)}
                    disabled={!input.trim() || sending || uploading}
                    style={{
                      background:
                        input.trim() && !sending
                          ? "linear-gradient(135deg,#059669,#047857)"
                          : "#E2E8F0",
                      boxShadow: input.trim()
                        ? "0 4px 12px rgba(5,150,105,.35)"
                        : "none",
                      flexShrink: 0,
                    }}
                  >
                    {sending ? (
                      <IconRefresh
                        size={18}
                        color="white"
                        style={{ animation: "spin 1s linear infinite" }}
                      />
                    ) : (
                      <IconSend
                        size={18}
                        color={input.trim() && !sending ? "white" : "#94A3B8"}
                      />
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "16px",
              }}
            >
              <div
                style={{
                  width: "72px",
                  height: "72px",
                  borderRadius: "24px",
                  background: "#ECFDF5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IconMessage size={32} style={{ color: "#6EE7B7" }} />
              </div>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: 700,
                    color: "#0F172A",
                    marginBottom: "4px",
                  }}
                >
                  Vos messages
                </div>
                <div style={{ fontSize: "13px", color: "#94A3B8" }}>
                  Sélectionnez une conversation
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
