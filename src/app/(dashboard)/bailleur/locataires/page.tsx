"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { Utilisateur, Contrat, PaginatedResponse } from "@/types";
import {
  IconUsers,
  IconSearch,
  IconArrowLeft,
  IconRefresh,
  IconPhone,
  IconMail,
  IconHome2,
  IconFileText,
  IconChevronRight,
  IconX,
  IconFilter,
  IconUserCheck,
  IconUserX,
  IconClock,
  IconCreditCard,
  IconAlertCircle,
  IconEye,
  IconMessage,
  IconPlus,
  IconSend,
  IconLoader2,
  IconCheck,
  IconTrash,
} from "@tabler/icons-react";

// ── Types ──────────────────────────────────────────────────
interface LocataireAvecContrat extends Utilisateur {
  contrat?: Contrat;
  bien_titre?: string;
  loyer?: number;
  statut_paiement?: "ok" | "retard" | "attente";
}

interface Invitation {
  id: number;
  email_invite: string;
  nom_invite: string;
  bien: number | null;
  bien_titre: string | null;
  statut: "en_attente" | "acceptee" | "expiree" | "annulee";
  est_expiree: boolean;
  lien: string;
  date_envoi: string;
  date_expiration: string;
  date_acceptation: string | null;
}

interface Bien {
  id: number;
  titre: string;
  adresse: string;
}

// ── Helpers ────────────────────────────────────────────────
function tempsRelatif(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const j = Math.floor(diff / 86400000);
  if (j === 0) return "Aujourd'hui";
  if (j === 1) return "Hier";
  return `Il y a ${j} j`;
}

// ── Avatar ─────────────────────────────────────────────────
function Avatar({
  nom,
  prenom,
  size = 40,
}: {
  nom: string;
  prenom: string;
  size?: number;
}) {
  const initiales = `${prenom?.[0] ?? "?"}${nom?.[0] ?? ""}`;
  const colors = [
    "#3B82F6",
    "#059669",
    "#D97706",
    "#7C3AED",
    "#EF4444",
    "#06B6D4",
    "#EC4899",
  ];
  const color = colors[(prenom.charCodeAt(0) ?? 0) % colors.length];
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "12px",
        background: `${color}18`,
        border: `1.5px solid ${color}30`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        fontSize: size * 0.35,
        color,
        flexShrink: 0,
      }}
    >
      {initiales}
    </div>
  );
}

// ── Badge statut paiement ──────────────────────────────────
function PaiementBadge({ statut }: { statut?: string }) {
  if (!statut) return null;
  const map = {
    ok: {
      bg: "#ECFDF5",
      col: "#059669",
      lbl: "À jour",
      ico: <IconUserCheck size={11} />,
    },
    retard: {
      bg: "#FEF2F2",
      col: "#DC2626",
      lbl: "En retard",
      ico: <IconUserX size={11} />,
    },
    attente: {
      bg: "#FFFBEB",
      col: "#D97706",
      lbl: "En attente",
      ico: <IconClock size={11} />,
    },
  };
  const s = map[statut as keyof typeof map];
  if (!s) return null;
  return (
    <span
      className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full"
      style={{ background: s.bg, color: s.col }}
    >
      {s.ico}
      {s.lbl}
    </span>
  );
}

// ── Badge statut invitation ────────────────────────────────
function InvitationBadge({
  statut,
  est_expiree,
}: {
  statut: Invitation["statut"];
  est_expiree: boolean;
}) {
  const s =
    est_expiree || statut === "expiree"
      ? {
          bg: "#F1F5F9",
          col: "#64748B",
          lbl: "Expirée",
          ico: <IconClock size={11} />,
        }
      : statut === "acceptee"
        ? {
            bg: "#ECFDF5",
            col: "#059669",
            lbl: "Acceptée",
            ico: <IconCheck size={11} />,
          }
        : statut === "annulee"
          ? {
              bg: "#FEF2F2",
              col: "#DC2626",
              lbl: "Annulée",
              ico: <IconX size={11} />,
            }
          : {
              bg: "#EFF6FF",
              col: "#2563EB",
              lbl: "En attente",
              ico: <IconClock size={11} />,
            };
  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
      style={{ background: s.bg, color: s.col }}
    >
      {s.ico}
      {s.lbl}
    </span>
  );
}

// ── Modal invitation ───────────────────────────────────────
function ModalInvitation({
  biens,
  onClose,
  onSuccess,
}: {
  biens: Bien[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState({ email: "", nom: "", bien_id: "" });
  const [saving, setSaving] = useState(false);
  const [focuses, setFocuses] = useState<Record<string, boolean>>({});

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const focus = (k: string, v: boolean) =>
    setFocuses((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/invitations/", {
        email_invite: form.email,
        nom_invite: form.nom,
        bien_id: form.bien_id ? Number(form.bien_id) : null,
      });
      toast.success(`Invitation envoyée à ${form.email} !`);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      toast.error(e.response?.data?.error ?? "Erreur lors de l'envoi");
    } finally {
      setSaving(false);
    }
  };

  const fieldStyle = (k: string) => ({
    border: `1.5px solid ${focuses[k] ? "#2563EB" : "#E2E8F0"}`,
    borderRadius: "10px",
    transition: "border-color .15s",
    position: "relative" as const,
    display: "flex",
    alignItems: "center",
  });
  const inputStyle = {
    width: "100%",
    height: "40px",
    padding: "0 10px 0 32px",
    border: "none",
    outline: "none",
    background: "transparent",
    fontSize: "13px",
    color: "#0F172A",
    fontFamily: "inherit",
  };
  const iconStyle = (k: string) => ({
    position: "absolute" as const,
    left: "10px",
    color: focuses[k] ? "#2563EB" : "#94A3B8",
    pointerEvents: "none" as const,
  });

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40"
        style={{ background: "rgba(0,0,0,.45)", backdropFilter: "blur(6px)" }}
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div
          className="bg-white rounded-2xl w-full max-w-md overflow-hidden"
          style={{ boxShadow: "0 24px 60px rgba(0,0,0,.2)" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="flex items-center justify-between px-6 py-5"
            style={{ background: "linear-gradient(135deg,#1A3C5E,#2563EB)" }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(255,255,255,.15)" }}
              >
                <IconSend size={18} color="white" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">
                  Inviter un locataire
                </h2>
                <p
                  className="text-xs"
                  style={{ color: "rgba(255,255,255,.6)" }}
                >
                  Il recevra un lien valide 7 jours
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(255,255,255,.15)", color: "white" }}
            >
              <IconX size={15} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            <div>
              <label
                className="block text-xs font-bold mb-1.5"
                style={{ color: "#374151" }}
              >
                Email <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <div style={fieldStyle("email")}>
                <IconMail size={13} style={iconStyle("email")} />
                <input
                  type="email"
                  required
                  value={form.email}
                  style={inputStyle}
                  onChange={(e) => set("email", e.target.value)}
                  onFocus={() => focus("email", true)}
                  onBlur={() => focus("email", false)}
                  placeholder="locataire@email.com"
                />
              </div>
            </div>

            <div>
              <label
                className="block text-xs font-bold mb-1.5"
                style={{ color: "#374151" }}
              >
                Nom{" "}
                <span style={{ color: "#94A3B8", fontWeight: 400 }}>
                  (optionnel)
                </span>
              </label>
              <div style={fieldStyle("nom")}>
                <IconUsers size={13} style={iconStyle("nom")} />
                <input
                  type="text"
                  value={form.nom}
                  style={inputStyle}
                  onChange={(e) => set("nom", e.target.value)}
                  onFocus={() => focus("nom", true)}
                  onBlur={() => focus("nom", false)}
                  placeholder="Jean Dupont"
                />
              </div>
            </div>

            <div>
              <label
                className="block text-xs font-bold mb-1.5"
                style={{ color: "#374151" }}
              >
                Bien concerné{" "}
                <span style={{ color: "#94A3B8", fontWeight: 400 }}>
                  (optionnel)
                </span>
              </label>
              <div style={fieldStyle("bien")}>
                <IconHome2 size={13} style={iconStyle("bien")} />
                <select
                  value={form.bien_id}
                  style={{
                    ...inputStyle,
                    cursor: "pointer",
                    appearance: "none",
                    color: form.bien_id ? "#0F172A" : "#94A3B8",
                  }}
                  onChange={(e) => set("bien_id", e.target.value)}
                  onFocus={() => focus("bien", true)}
                  onBlur={() => focus("bien", false)}
                >
                  <option value="">-- Aucun bien sélectionné --</option>
                  {biens.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.titre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div
              className="flex items-start gap-2 p-3 rounded-xl"
              style={{ background: "#EFF6FF", border: "1px solid #DBEAFE" }}
            >
              <IconAlertCircle
                size={13}
                style={{ color: "#2563EB", flexShrink: 0, marginTop: "1px" }}
              />
              <p
                className="text-xs"
                style={{ color: "#1D4ED8", lineHeight: 1.5 }}
              >
                Le locataire recevra un email avec un lien valide{" "}
                <strong>7 jours</strong>.
              </p>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: "#F1F5F9", color: "#64748B" }}
              >
                Annuler
              </button>
              <motion.button
                type="submit"
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white"
                style={{
                  background: "linear-gradient(135deg,#2563EB,#1D4ED8)",
                  boxShadow: "0 3px 12px rgba(37,99,235,.4)",
                }}
                whileHover={saving ? {} : { scale: 1.01 }}
                whileTap={saving ? {} : { scale: 0.99 }}
              >
                {saving ? (
                  <>
                    <IconLoader2
                      size={14}
                      style={{ animation: "spin 1s linear infinite" }}
                    />
                    Envoi...
                  </>
                ) : (
                  <>
                    <IconSend size={14} />
                    Envoyer
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
    </>
  );
}

// ── Page principale ────────────────────────────────────────
export default function LocatairesPage() {
  const { user } = useAuth();

  // Locataires actifs
  const [locataires, setLocataires] = useState<LocataireAvecContrat[]>([]);
  const [selected, setSelected] = useState<LocataireAvecContrat | null>(null);

  // Invitations
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [biens, setBiens] = useState<Bien[]>([]);
  const [annulerId, setAnnulerId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);

  // UI
  const [loading, setLoading] = useState(true);
  const [onglet, setOnglet] = useState<"locataires" | "invitations">(
    "locataires",
  );
  const [search, setSearch] = useState("");
  const [filterStatut, setFilter] = useState<
    "tous" | "ok" | "retard" | "attente"
  >("tous");

  useEffect(() => {
    const init = async () => {
      await load();
    };
    init();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [usersRes, contratsRes, invRes, biensRes] = await Promise.all([
        api.get<PaginatedResponse<Utilisateur>>("/users/?role=locataire"),
        api.get<PaginatedResponse<Contrat>>("/contrats/"),
        api.get<Invitation[]>("/invitations/"),
        api.get<PaginatedResponse<Bien>>("/biens/"),
      ]);
      const contrats = contratsRes.data.results;
      const enriched: LocataireAvecContrat[] = usersRes.data.results
        .filter((u) => u.role === "locataire")
        .map((u) => {
          const contrat = contrats.find(
            (c) => c.locataire?.id === u.id && c.statut === "actif",
          );
          return {
            ...u,
            contrat,
            bien_titre: contrat?.bien?.titre,
            loyer: contrat?.loyer_mensuel,
            statut_paiement: contrat ? "ok" : undefined,
          };
        });
      setLocataires(enriched);
      setInvitations(invRes.data);
      setBiens(biensRes.data.results);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleAnnuler = async (id: number) => {
    try {
      await api.delete(`/invitations/${id}/`);
      toast.success("Invitation annulée");
      setAnnulerId(null);
      load();
    } catch {
      toast.error("Erreur lors de l'annulation");
    }
  };

  const filteredLoc = locataires.filter((l) => {
    const matchSearch =
      !search ||
      l.nom_complet.toLowerCase().includes(search.toLowerCase()) ||
      l.email.toLowerCase().includes(search.toLowerCase()) ||
      (l.bien_titre ?? "").toLowerCase().includes(search.toLowerCase());
    const matchStatut =
      filterStatut === "tous" || l.statut_paiement === filterStatut;
    return matchSearch && matchStatut;
  });

  const filteredInv = invitations.filter(
    (inv) =>
      !search ||
      inv.email_invite.toLowerCase().includes(search.toLowerCase()) ||
      inv.nom_invite.toLowerCase().includes(search.toLowerCase()),
  );

  const statsLoc = {
    total: locataires.length,
    actifs: locataires.filter((l) => l.contrat).length,
    retard: locataires.filter((l) => l.statut_paiement === "retard").length,
  };
  const statsInv = {
    total: invitations.length,
    attente: invitations.filter(
      (i) => i.statut === "en_attente" && !i.est_expiree,
    ).length,
    acceptees: invitations.filter((i) => i.statut === "acceptee").length,
  };

  if (!user) return null;

  return (
    <>
      <style>{`
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes spin{to{transform:rotate(360deg)}}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:#E2E8F0;border-radius:4px}
        .row-h{transition:background .12s}.row-h:hover{background:#F8FAFC}
        .ifield{width:100%;height:40px;padding:0 12px 0 34px;border:1.5px solid #E2E8F0;border-radius:10px;font-size:13px;color:#0F172A;outline:none;background:#fff;transition:border-color .15s;font-family:inherit}
        .ifield:focus{border-color:#2563EB}
      `}</style>

      <div
        className="flex h-screen overflow-hidden"
        style={{
          background: "#F1F5F9",
          fontFamily: "'DM Sans','Helvetica Neue',sans-serif",
        }}
      >
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* ── Header ── */}
          <header
            className="flex items-center gap-3 px-4 sm:px-6 h-14 sm:h-16 flex-shrink-0 bg-white"
            style={{
              borderBottom: "1px solid #E2E8F0",
              boxShadow: "0 1px 3px rgba(0,0,0,.04)",
            }}
          >
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
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <IconUsers
                size={17}
                style={{ color: "#2563EB", flexShrink: 0 }}
              />
              <h1
                className="text-sm font-bold truncate"
                style={{ color: "#0F172A" }}
              >
                Locataires
              </h1>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={load}
                className="w-9 h-9 rounded-lg flex items-center justify-center"
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
                <span className="hidden sm:inline">Inviter</span>
              </motion.button>
            </div>
          </header>

          {/* ── Onglets ── */}
          <div className="flex items-center gap-1 px-4 sm:px-6 pt-4 pb-0 flex-shrink-0">
            {[
              { key: "locataires", lbl: "Locataires", count: statsLoc.total },
              {
                key: "invitations",
                lbl: "Invitations",
                count: statsInv.attente,
                dot: statsInv.attente > 0,
              },
            ].map((o) => (
              <button
                key={o.key}
                onClick={() => setOnglet(o.key as typeof onglet)}
                className="flex items-center gap-2 px-4 py-2 rounded-t-xl text-sm font-semibold transition-all"
                style={
                  onglet === o.key
                    ? {
                        background: "white",
                        color: "#0F172A",
                        borderBottom: "2px solid #2563EB",
                        boxShadow: "0 -2px 8px rgba(0,0,0,.04)",
                      }
                    : { color: "#64748B", background: "transparent" }
                }
              >
                {o.lbl}
                <span
                  className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                  style={
                    onglet === o.key
                      ? { background: "#EFF6FF", color: "#2563EB" }
                      : { background: "#F1F5F9", color: "#94A3B8" }
                  }
                >
                  {o.count}
                </span>
                {o.dot && (
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: "#D97706" }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* ── Contenu ── */}
          <div
            className="flex-1 overflow-y-auto bg-white"
            style={{ borderTop: "1px solid #E2E8F0" }}
          >
            <div className="px-4 sm:px-6 pt-4 pb-6">
              {/* Recherche */}
              <div className="relative mb-4">
                <IconSearch
                  size={14}
                  style={{
                    position: "absolute",
                    left: "11px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#94A3B8",
                    pointerEvents: "none",
                  }}
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={
                    onglet === "locataires"
                      ? "Nom, email, logement..."
                      : "Email ou nom..."
                  }
                  className="ifield"
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

              {/* ══ ONGLET LOCATAIRES ══ */}
              {onglet === "locataires" && (
                <>
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[
                      {
                        lbl: "Total",
                        val: statsLoc.total,
                        col: "#2563EB",
                        bg: "#EFF6FF",
                      },
                      {
                        lbl: "Actifs",
                        val: statsLoc.actifs,
                        col: "#059669",
                        bg: "#ECFDF5",
                      },
                      {
                        lbl: "En retard",
                        val: statsLoc.retard,
                        col: "#DC2626",
                        bg: "#FEF2F2",
                      },
                    ].map((s) => (
                      <div
                        key={s.lbl}
                        className="rounded-xl p-3 flex items-center gap-2"
                        style={{
                          background: s.bg,
                          border: `1px solid ${s.bg}`,
                        }}
                      >
                        <span
                          className="text-xl font-bold"
                          style={{ color: s.col }}
                        >
                          {loading ? "—" : s.val}
                        </span>
                        <span
                          className="text-xs"
                          style={{ color: s.col, opacity: 0.7 }}
                        >
                          {s.lbl}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Filtres rapides */}
                  <div
                    className="flex gap-1.5 mb-4 overflow-x-auto pb-1"
                    style={{ scrollbarWidth: "none" }}
                  >
                    {[
                      { val: "tous", lbl: "Tous" },
                      { val: "ok", lbl: "À jour" },
                      { val: "retard", lbl: "En retard" },
                      { val: "attente", lbl: "En attente" },
                    ].map((f) => (
                      <button
                        key={f.val}
                        onClick={() => setFilter(f.val as typeof filterStatut)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold flex-shrink-0 transition-all"
                        style={
                          filterStatut === f.val
                            ? { background: "#2563EB", color: "white" }
                            : { background: "#F1F5F9", color: "#64748B" }
                        }
                      >
                        {f.lbl}
                      </button>
                    ))}
                  </div>

                  {/* Liste locataires */}
                  {loading ? (
                    <div className="space-y-3">
                      {Array(4)
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
                  ) : filteredLoc.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
                        style={{ background: "#EFF6FF" }}
                      >
                        <IconUsers size={24} style={{ color: "#93C5FD" }} />
                      </div>
                      <p
                        className="text-sm font-bold mb-1"
                        style={{ color: "#0F172A" }}
                      >
                        {search || filterStatut !== "tous"
                          ? "Aucun résultat"
                          : "Aucun locataire"}
                      </p>
                      <p className="text-xs mb-4" style={{ color: "#94A3B8" }}>
                        Invitez vos locataires pour qu&apos;ils rejoignent
                        LocCam
                      </p>
                      <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white"
                        style={{
                          background: "linear-gradient(135deg,#2563EB,#1D4ED8)",
                        }}
                      >
                        <IconSend size={14} /> Envoyer une invitation
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredLoc.map((l, i) => (
                        <motion.div
                          key={l.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className="row-h flex items-center gap-3 p-3 rounded-xl cursor-pointer"
                          style={{ border: "1px solid #F1F5F9" }}
                          onClick={() => setSelected(l)}
                        >
                          <Avatar nom={l.nom} prenom={l.prenom} size={40} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className="text-sm font-bold truncate"
                                style={{ color: "#0F172A" }}
                              >
                                {l.nom_complet}
                              </span>
                              <PaiementBadge statut={l.statut_paiement} />
                            </div>
                            <div
                              className="flex items-center gap-2 text-xs"
                              style={{ color: "#94A3B8" }}
                            >
                              <span className="truncate">{l.email}</span>
                              {l.bien_titre && (
                                <>
                                  <span>·</span>
                                  <span className="truncate">
                                    {l.bien_titre}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          <IconChevronRight
                            size={15}
                            style={{ color: "#CBD5E1", flexShrink: 0 }}
                          />
                        </motion.div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* ══ ONGLET INVITATIONS ══ */}
              {onglet === "invitations" && (
                <>
                  {/* Stats invitations */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[
                      {
                        lbl: "Envoyées",
                        val: statsInv.total,
                        col: "#2563EB",
                        bg: "#EFF6FF",
                      },
                      {
                        lbl: "En attente",
                        val: statsInv.attente,
                        col: "#D97706",
                        bg: "#FFFBEB",
                      },
                      {
                        lbl: "Acceptées",
                        val: statsInv.acceptees,
                        col: "#059669",
                        bg: "#ECFDF5",
                      },
                    ].map((s) => (
                      <div
                        key={s.lbl}
                        className="rounded-xl p-3 flex items-center gap-2"
                        style={{ background: s.bg }}
                      >
                        <span
                          className="text-xl font-bold"
                          style={{ color: s.col }}
                        >
                          {loading ? "—" : s.val}
                        </span>
                        <span
                          className="text-xs"
                          style={{ color: s.col, opacity: 0.7 }}
                        >
                          {s.lbl}
                        </span>
                      </div>
                    ))}
                  </div>

                  {filteredInv.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
                        style={{ background: "#EFF6FF" }}
                      >
                        <IconSend size={24} style={{ color: "#93C5FD" }} />
                      </div>
                      <p
                        className="text-sm font-bold mb-1"
                        style={{ color: "#0F172A" }}
                      >
                        {search
                          ? "Aucun résultat"
                          : "Aucune invitation envoyée"}
                      </p>
                      <p className="text-xs mb-4" style={{ color: "#94A3B8" }}>
                        Invitez vos locataires pour qu&apos;ils créent leur
                        compte
                      </p>
                      <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white"
                        style={{
                          background: "linear-gradient(135deg,#2563EB,#1D4ED8)",
                        }}
                      >
                        <IconPlus size={14} /> Nouvelle invitation
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredInv.map((inv, i) => (
                        <motion.div
                          key={inv.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className="flex items-center gap-3 p-3 rounded-xl"
                          style={{
                            border: "1px solid #F1F5F9",
                            background: "#FAFAFA",
                          }}
                        >
                          {/* Avatar initiale email */}
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold"
                            style={{
                              background:
                                inv.statut === "acceptee"
                                  ? "#ECFDF5"
                                  : "#EFF6FF",
                              color:
                                inv.statut === "acceptee"
                                  ? "#059669"
                                  : "#2563EB",
                            }}
                          >
                            {(inv.nom_invite || inv.email_invite)
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-0.5">
                              <span
                                className="text-sm font-bold truncate"
                                style={{ color: "#0F172A" }}
                              >
                                {inv.nom_invite || inv.email_invite}
                              </span>
                              <InvitationBadge
                                statut={inv.statut}
                                est_expiree={inv.est_expiree}
                              />
                            </div>
                            <div
                              className="flex items-center gap-2 text-xs"
                              style={{ color: "#94A3B8" }}
                            >
                              <IconMail size={11} />
                              <span className="truncate">
                                {inv.email_invite}
                              </span>
                              {inv.bien_titre && (
                                <>
                                  <span>·</span>
                                  <IconHome2 size={11} />
                                  <span className="truncate">
                                    {inv.bien_titre}
                                  </span>
                                </>
                              )}
                            </div>
                            <div
                              className="text-xs mt-0.5"
                              style={{ color: "#94A3B8" }}
                            >
                              {inv.statut === "acceptee" && inv.date_acceptation
                                ? `Acceptée ${tempsRelatif(inv.date_acceptation)}`
                                : `Envoyée ${tempsRelatif(inv.date_envoi)}`}
                              {inv.statut === "en_attente" &&
                                !inv.est_expiree && (
                                  <span style={{ color: "#D97706" }}>
                                    {" · expire le "}
                                    {new Date(
                                      inv.date_expiration,
                                    ).toLocaleDateString("fr-FR")}
                                  </span>
                                )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            {inv.statut === "en_attente" &&
                              !inv.est_expiree && (
                                <>
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(inv.lien);
                                      toast.success("Lien copié !");
                                    }}
                                    className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold"
                                    style={{
                                      background: "#EFF6FF",
                                      color: "#2563EB",
                                    }}
                                  >
                                    <IconMail size={12} /> Copier lien
                                  </button>
                                  {annulerId === inv.id ? (
                                    <div className="flex gap-1">
                                      <button
                                        onClick={() => setAnnulerId(null)}
                                        className="px-2 py-1.5 rounded-lg text-xs"
                                        style={{
                                          background: "#F1F5F9",
                                          color: "#64748B",
                                        }}
                                      >
                                        Non
                                      </button>
                                      <button
                                        onClick={() => handleAnnuler(inv.id)}
                                        className="px-2 py-1.5 rounded-lg text-xs font-bold text-white"
                                        style={{ background: "#EF4444" }}
                                      >
                                        Oui
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => setAnnulerId(inv.id)}
                                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                                      style={{
                                        background: "#FEF2F2",
                                        color: "#EF4444",
                                      }}
                                    >
                                      <IconTrash size={13} />
                                    </button>
                                  )}
                                </>
                              )}
                            {inv.statut === "acceptee" && (
                              <span
                                className="text-xs font-semibold px-2.5 py-1 rounded-lg"
                                style={{
                                  background: "#ECFDF5",
                                  color: "#059669",
                                }}
                              >
                                Compte créé
                              </span>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── DRAWER LOCATAIRE ── */}
        <AnimatePresence>
          {selected && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40"
                style={{
                  background: "rgba(0,0,0,.35)",
                  backdropFilter: "blur(4px)",
                }}
                onClick={() => setSelected(null)}
              />
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 280 }}
                className="fixed right-0 top-0 bottom-0 z-50 overflow-y-auto"
                style={{
                  width: "min(420px,100vw)",
                  background: "#fff",
                  boxShadow: "-8px 0 40px rgba(0,0,0,.15)",
                }}
              >
                <div
                  className="flex items-center justify-between px-5 py-4 sticky top-0 bg-white z-10"
                  style={{ borderBottom: "1px solid #F1F5F9" }}
                >
                  <h2
                    className="text-sm font-bold"
                    style={{ color: "#0F172A" }}
                  >
                    Fiche locataire
                  </h2>
                  <button
                    onClick={() => setSelected(null)}
                    className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: "#F1F5F9" }}
                  >
                    <IconX size={15} style={{ color: "#64748B" }} />
                  </button>
                </div>

                <div className="px-5 py-5 space-y-5">
                  {/* Profil */}
                  <div
                    className="flex items-center gap-4 p-4 rounded-2xl"
                    style={{
                      background: "#F8FAFC",
                      border: "1px solid #F1F5F9",
                    }}
                  >
                    <Avatar
                      nom={selected.nom}
                      prenom={selected.prenom}
                      size={56}
                    />
                    <div className="flex-1 min-w-0">
                      <h3
                        className="font-bold text-base truncate"
                        style={{ color: "#0F172A" }}
                      >
                        {selected.nom_complet}
                      </h3>
                      <p
                        className="text-xs truncate mb-2"
                        style={{ color: "#94A3B8" }}
                      >
                        {selected.email}
                      </p>
                      <PaiementBadge statut={selected.statut_paiement} />
                    </div>
                  </div>

                  {/* Coordonnées */}
                  <div>
                    <div
                      className="text-xs font-bold uppercase tracking-wider mb-3"
                      style={{ color: "#94A3B8" }}
                    >
                      Coordonnées
                    </div>
                    <div className="space-y-2.5">
                      {[
                        {
                          ico: <IconMail size={15} />,
                          val: selected.email,
                          lbl: "Email",
                        },
                        {
                          ico: <IconPhone size={15} />,
                          val: selected.telephone ?? "—",
                          lbl: "Téléphone",
                        },
                      ].map((row) => (
                        <div
                          key={row.lbl}
                          className="flex items-center gap-3 p-3 rounded-xl"
                          style={{ background: "#F8FAFC" }}
                        >
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ background: "#EFF6FF", color: "#2563EB" }}
                          >
                            {row.ico}
                          </div>
                          <div>
                            <div
                              className="text-xs"
                              style={{ color: "#94A3B8" }}
                            >
                              {row.lbl}
                            </div>
                            <div
                              className="text-sm font-semibold"
                              style={{ color: "#0F172A" }}
                            >
                              {row.val}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Contrat */}
                  {selected.contrat ? (
                    <div>
                      <div
                        className="text-xs font-bold uppercase tracking-wider mb-3"
                        style={{ color: "#94A3B8" }}
                      >
                        Contrat actif
                      </div>
                      <div
                        className="rounded-2xl overflow-hidden"
                        style={{ border: "1px solid #E2E8F0" }}
                      >
                        <div
                          className="p-4"
                          style={{
                            background:
                              "linear-gradient(135deg,#0F172A,#1E293B)",
                          }}
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center"
                              style={{ background: "rgba(255,255,255,.1)" }}
                            >
                              <IconHome2 size={20} color="white" />
                            </div>
                            <div>
                              <div className="text-white font-bold text-sm">
                                {selected.bien_titre}
                              </div>
                              <div
                                className="text-xs"
                                style={{ color: "rgba(255,255,255,.5)" }}
                              >
                                Contrat actif
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            {[
                              {
                                lbl: "Loyer mensuel",
                                val: selected.loyer
                                  ? `${selected.loyer.toLocaleString("fr-FR")} XAF`
                                  : "—",
                              },
                              {
                                lbl: "Caution",
                                val: selected.contrat.caution
                                  ? `${selected.contrat.caution.toLocaleString("fr-FR")} XAF`
                                  : "—",
                              },
                              {
                                lbl: "Entrée",
                                val: selected.contrat.date_debut
                                  ? new Date(
                                      selected.contrat.date_debut,
                                    ).toLocaleDateString("fr-FR")
                                  : "—",
                              },
                              { lbl: "Statut", val: "Actif" },
                            ].map((s) => (
                              <div key={s.lbl}>
                                <div
                                  className="text-xs"
                                  style={{ color: "rgba(255,255,255,.4)" }}
                                >
                                  {s.lbl}
                                </div>
                                <div className="text-sm font-semibold text-white">
                                  {s.val}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="rounded-xl p-4 flex items-center gap-3"
                      style={{
                        background: "#FFFBEB",
                        border: "1px solid #FDE68A",
                      }}
                    >
                      <IconAlertCircle
                        size={18}
                        style={{ color: "#D97706", flexShrink: 0 }}
                      />
                      <div>
                        <div
                          className="text-sm font-semibold"
                          style={{ color: "#92400E" }}
                        >
                          Aucun contrat actif
                        </div>
                        <div className="text-xs" style={{ color: "#B45309" }}>
                          Ce locataire n&apos;a pas de logement attribué
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div>
                    <div
                      className="text-xs font-bold uppercase tracking-wider mb-3"
                      style={{ color: "#94A3B8" }}
                    >
                      Actions rapides
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        {
                          ico: <IconMessage size={14} />,
                          lbl: "Message",
                          col: "#2563EB",
                          bg: "#EFF6FF",
                        },
                        {
                          ico: <IconCreditCard size={14} />,
                          lbl: "Paiements",
                          col: "#059669",
                          bg: "#ECFDF5",
                        },
                        {
                          ico: <IconFileText size={14} />,
                          lbl: "Contrat",
                          col: "#7C3AED",
                          bg: "#F5F3FF",
                        },
                        {
                          ico: <IconAlertCircle size={14} />,
                          lbl: "Signalements",
                          col: "#D97706",
                          bg: "#FFFBEB",
                        },
                      ].map((a) => (
                        <button
                          key={a.lbl}
                          className="flex items-center gap-2 p-3 rounded-xl text-xs font-semibold"
                          style={{ background: a.bg, color: a.col }}
                        >
                          {a.ico}
                          {a.lbl}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Modal invitation */}
        <AnimatePresence>
          {showModal && (
            <ModalInvitation
              biens={biens}
              onClose={() => setShowModal(false)}
              onSuccess={load}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
