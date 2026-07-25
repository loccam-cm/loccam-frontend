"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { DemandeContact, PaginatedResponse, StatutDemande } from "@/types";
import {
  IconArrowLeft,
  IconWorld,
  IconPhone,
  IconMail,
  IconMapPin,
  IconMessage,
  IconClock,
  IconX,
  IconCalendarEvent,
  IconFileCheck,
  IconLoader2,
  IconInbox,
  IconBuilding,
  IconBell,
  IconArrowRight,
} from "@tabler/icons-react";

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-2xl ${className}`}
      style={{
        background: "linear-gradient(90deg,#E2E8F0 25%,#F1F5F9 50%,#E2E8F0 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.5s infinite",
      }}
    />
  );
}

const STATUT_INFO: Record<
  StatutDemande,
  { bg: string; col: string; lbl: string; icon: React.ReactNode }
> = {
  nouvelle: { bg: "#EFF6FF", col: "#2563EB", lbl: "Nouvelle", icon: <IconClock size={12} /> },
  contactee: { bg: "#FFFBEB", col: "#D97706", lbl: "Contactée", icon: <IconPhone size={12} /> },
  visite_planifiee: { bg: "#F5F3FF", col: "#7C3AED", lbl: "Visite planifiée", icon: <IconCalendarEvent size={12} /> },
  transformee: { bg: "#ECFDF5", col: "#059669", lbl: "Transformée en contrat", icon: <IconFileCheck size={12} /> },
  refusee: { bg: "#FEF2F2", col: "#DC2626", lbl: "Refusée", icon: <IconX size={12} /> },
  expiree: { bg: "#F1F5F9", col: "#64748B", lbl: "Expirée", icon: <IconClock size={12} /> },
};

const FILTRES: { val: StatutDemande | "toutes"; lbl: string }[] = [
  { val: "toutes", lbl: "Toutes" },
  { val: "nouvelle", lbl: "Nouvelles" },
  { val: "contactee", lbl: "Contactées" },
  { val: "visite_planifiee", lbl: "Visites planifiées" },
  { val: "transformee", lbl: "Transformées" },
  { val: "refusee", lbl: "Refusées" },
];

function formatDate(iso: string): string {
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "à l'instant";
  if (diffMin < 60) return `il y a ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `il y a ${diffH} h`;
  const diffJ = Math.floor(diffH / 24);
  if (diffJ < 7) return `il y a ${diffJ} j`;
  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: d.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
  });
}

export default function DemandesPage() {
  const { user } = useAuth();
  const [demandes, setDemandes] = useState<DemandeContact[]>([]);
  const [nextUrl, setNextUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filtre, setFiltre] = useState<StatutDemande | "toutes">("toutes");
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (filtre !== "toutes") params.statut = filtre;
      const res = await api.get<PaginatedResponse<DemandeContact>>("/demandes-contact/", { params });
      setDemandes(res.data.results);
      setNextUrl(res.data.next);
    } catch {
      setDemandes([]);
      setNextUrl(null);
    } finally {
      setLoading(false);
    }
  }, [filtre]);

  const loadCounts = useCallback(async () => {
    const statuts: (StatutDemande | "toutes")[] = [
      "toutes", "nouvelle", "contactee", "visite_planifiee", "transformee", "refusee",
    ];
    const entries = await Promise.all(
      statuts.map((s) =>
        api
          .get<PaginatedResponse<DemandeContact>>("/demandes-contact/", {
            params: { ...(s !== "toutes" ? { statut: s } : {}), page_size: 1 },
          })
          .then((res) => [s, res.data.count] as const)
          .catch(() => [s, 0] as const)
      )
    );
    const map: Record<string, number> = {};
    entries.forEach(([s, c]) => (map[s] = c));
    setCounts(map);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    loadCounts();
  }, [loadCounts]);

  const loadMore = async () => {
    if (!nextUrl) return;
    setLoadingMore(true);
    try {
      const res = await api.get<PaginatedResponse<DemandeContact>>(nextUrl);
      setDemandes((prev) => [...prev, ...res.data.results]);
      setNextUrl(res.data.next);
    } catch {
    } finally {
      setLoadingMore(false);
    }
  };

  const changerStatut = async (id: number, statut: StatutDemande) => {
    setUpdatingId(id);
    try {
      await api.patch(`/demandes-contact/${id}/statut/`, { statut });
      if (statut === "transformee") {
        toast.success("Demande marquée comme transformée.", {
          description: "Pense à créer le contrat correspondant dans \"Contrats\" avec les infos du visiteur.",
        });
      } else {
        toast.success("Demande mise à jour.");
      }
      load();
      loadCounts();
    } catch {
      toast.error("Impossible de mettre à jour cette demande.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRefuser = (id: number) => {
    if (!window.confirm("Refuser cette demande ? Cette action est réversible depuis le filtre \"Refusées\" si besoin de revenir en arrière manuellement.")) return;
    changerStatut(id, "refusee");
  };

  if (!user) return null;

  const nbNouvelles = counts["nouvelle"] ?? 0;

  return (
    <>
      <style>{`
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>

      <div
        className="flex h-screen overflow-hidden"
        style={{ background: "#F1F5F9", fontFamily: "'DM Sans','Helvetica Neue',sans-serif" }}
      >
        <div className="flex-1 flex flex-col overflow-hidden">
          <header
            className="flex items-center gap-4 px-4 sm:px-6 h-16 flex-shrink-0 bg-white"
            style={{ borderBottom: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(0,0,0,.04)" }}
          >
            <Link
              href="/bailleur"
              className="flex items-center gap-2 text-sm font-medium"
              style={{ color: "#64748B", textDecoration: "none" }}
            >
              <IconArrowLeft size={16} />
              <span className="hidden sm:inline">Tableau de bord</span>
            </Link>
            <div className="h-5 w-px" style={{ background: "#E2E8F0" }} />
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <IconWorld size={18} style={{ color: "#2563EB", flexShrink: 0 }} />
              <h1 className="text-sm font-bold truncate" style={{ color: "#0F172A" }}>
                Demandes marketplace
              </h1>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="max-w-3xl mx-auto">
              {/* ── Bannière nouvelles demandes ── */}
              {nbNouvelles > 0 && filtre !== "nouvelle" && (
                <button
                  onClick={() => setFiltre("nouvelle")}
                  className="w-full flex items-center gap-3 mb-5 p-4 rounded-2xl text-left"
                  style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", cursor: "pointer" }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "#2563EB" }}
                  >
                    <IconBell size={16} color="#fff" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold" style={{ color: "#0F172A" }}>
                      {nbNouvelles} nouvelle{nbNouvelles > 1 ? "s" : ""} demande{nbNouvelles > 1 ? "s" : ""}
                    </p>
                    <p className="text-xs" style={{ color: "#64748B" }}>
                      En attente d&apos;une réponse de ta part
                    </p>
                  </div>
                  <IconArrowRight size={16} style={{ color: "#2563EB", flexShrink: 0 }} />
                </button>
              )}

              {/* ── Filtres avec compteurs ── */}
              <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
                {FILTRES.map((f) => {
                  const c = counts[f.val];
                  return (
                    <button
                      key={f.val}
                      onClick={() => setFiltre(f.val)}
                      className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg flex-shrink-0"
                      style={{
                        background: filtre === f.val ? "#0F172A" : "#fff",
                        color: filtre === f.val ? "#fff" : "#475569",
                        border: `1px solid ${filtre === f.val ? "#0F172A" : "#E2E8F0"}`,
                        cursor: "pointer",
                      }}
                    >
                      {f.lbl}
                      {typeof c === "number" && c > 0 && (
                        <span
                          className="flex items-center justify-center text-[10px] font-bold rounded-full"
                          style={{
                            minWidth: 16,
                            height: 16,
                            padding: "0 4px",
                            background: filtre === f.val ? "rgba(255,255,255,.25)" : "#F1F5F9",
                            color: filtre === f.val ? "#fff" : "#475569",
                          }}
                        >
                          {c}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* ── Liste ── */}
              {loading ? (
                <div className="flex flex-col gap-3">
                  {Array(3)
                    .fill(0)
                    .map((_, i) => (
                      <Skeleton key={i} className="h-32" />
                    ))}
                </div>
              ) : demandes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                    style={{ background: "#EFF6FF" }}
                  >
                    <IconInbox size={28} style={{ color: "#93C5FD" }} />
                  </div>
                  <h3 className="text-base font-bold mb-2" style={{ color: "#0F172A" }}>
                    Aucune demande {filtre !== "toutes" ? "dans cette catégorie" : "pour l'instant"}
                  </h3>
                  <p className="text-sm mb-5" style={{ color: "#64748B" }}>
                    Publiez vos biens sur la marketplace pour recevoir des demandes.
                  </p>
                  <Link
                    href="/bailleur/biens"
                    className="text-sm font-semibold px-4 py-2.5 rounded-xl text-white"
                    style={{ background: "#2563EB" }}
                  >
                    Gérer mes biens
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <AnimatePresence>
                    {demandes.map((d) => {
                      const info = STATUT_INFO[d.statut];
                      const enCours = updatingId === d.id;
                      const estActive = ["nouvelle", "contactee", "visite_planifiee"].includes(d.statut);
                      return (
                        <motion.div
                          key={d.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="bg-white rounded-2xl p-4 sm:p-5"
                          style={{ border: "1px solid #E2E8F0" }}
                        >
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-start gap-3 min-w-0">
                              <div
                                className="rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center"
                                style={{ width: 44, height: 44, background: "#F1F5F9" }}
                              >
                                {d.bien.photo_principale ? (
                                  <img
                                    src={d.bien.photo_principale}
                                    alt={d.bien.titre}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <IconBuilding size={18} style={{ color: "#CBD5E1" }} />
                                )}
                              </div>
                              <div className="min-w-0">
                                <Link
                                  href="/bailleur/biens"
                                  className="text-sm font-bold hover:underline"
                                  style={{ color: "#0F172A" }}
                                >
                                  {d.bien.titre}
                                </Link>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <IconMapPin size={11} style={{ color: "#94A3B8", flexShrink: 0 }} />
                                  <span className="text-xs truncate" style={{ color: "#64748B" }}>
                                    {d.bien.adresse}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <span
                              className="text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 flex-shrink-0"
                              style={{ background: info.bg, color: info.col }}
                            >
                              {info.icon} {info.lbl}
                            </span>
                          </div>

                          <div
                            className="flex flex-wrap items-center gap-x-4 gap-y-1.5 py-3 mb-3"
                            style={{ borderTop: "1px solid #F1F5F9", borderBottom: "1px solid #F1F5F9" }}
                          >
                            <span className="text-sm font-semibold" style={{ color: "#334155" }}>
                              {d.nom_visiteur}
                            </span>
                            <a
                              href={`tel:${d.telephone_visiteur}`}
                              className="flex items-center gap-1.5 text-sm"
                              style={{ color: "#2563EB", textDecoration: "none" }}
                            >
                              <IconPhone size={13} /> {d.telephone_visiteur}
                            </a>
                            {d.email_visiteur && (
                              <a
                                href={`mailto:${d.email_visiteur}`}
                                className="flex items-center gap-1.5 text-sm"
                                style={{ color: "#2563EB", textDecoration: "none" }}
                              >
                                <IconMail size={13} /> {d.email_visiteur}
                              </a>
                            )}
                            <span
                              className="flex items-center gap-1 text-xs ml-auto"
                              style={{ color: "#94A3B8" }}
                              title={new Date(d.date_creation).toLocaleString("fr-FR")}
                            >
                              <IconClock size={11} /> {formatDate(d.date_creation)}
                            </span>
                          </div>

                          {d.message && (
                            <div className="flex items-start gap-2 mb-3">
                              <IconMessage size={14} style={{ color: "#94A3B8", marginTop: 2 }} />
                              <p className="text-sm" style={{ color: "#475569" }}>
                                {d.message}
                              </p>
                            </div>
                          )}

                          {estActive && (
                            <div className="flex flex-wrap gap-2 pt-1">
                              {d.statut === "nouvelle" && (
                                <button
                                  disabled={enCours}
                                  onClick={() => changerStatut(d.id, "contactee")}
                                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg"
                                  style={{ background: "#FFFBEB", color: "#D97706", border: "none", cursor: "pointer" }}
                                >
                                  <IconPhone size={12} /> Marquer contactée
                                </button>
                              )}
                              {(d.statut === "nouvelle" || d.statut === "contactee") && (
                                <button
                                  disabled={enCours}
                                  onClick={() => changerStatut(d.id, "visite_planifiee")}
                                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg"
                                  style={{ background: "#F5F3FF", color: "#7C3AED", border: "none", cursor: "pointer" }}
                                >
                                  <IconCalendarEvent size={12} /> Planifier une visite
                                </button>
                              )}
                              <button
                                disabled={enCours}
                                onClick={() => changerStatut(d.id, "transformee")}
                                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg"
                                style={{ background: "#ECFDF5", color: "#059669", border: "none", cursor: "pointer" }}
                              >
                                <IconFileCheck size={12} /> Transformer en contrat
                              </button>
                              <button
                                disabled={enCours}
                                onClick={() => handleRefuser(d.id)}
                                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg"
                                style={{ background: "#FEF2F2", color: "#DC2626", border: "none", cursor: "pointer" }}
                              >
                                {enCours ? (
                                  <IconLoader2 size={12} style={{ animation: "spin 0.8s linear infinite" }} />
                                ) : (
                                  <IconX size={12} />
                                )}
                                Refuser
                              </button>
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>

                  {nextUrl && (
                    <div className="flex justify-center mt-3">
                      <button
                        onClick={loadMore}
                        disabled={loadingMore}
                        className="flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl"
                        style={{ background: "#fff", border: "1px solid #E2E8F0", color: "#334155", cursor: "pointer" }}
                      >
                        {loadingMore && (
                          <IconLoader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} />
                        )}
                        Voir plus de demandes
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
