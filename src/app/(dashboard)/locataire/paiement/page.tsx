"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { toast } from "sonner";
import { Contrat, PaginatedResponse } from "@/types";
import { useRouter } from "next/navigation";
import {
  IconCreditCard,
  IconArrowLeft,
  IconRefresh,
  IconHome2,
  IconCheck,
  IconAlertCircle,
  IconLoader2,
  IconShieldCheck,
  IconCircleCheck,
  IconX,
  IconChevronRight,
  IconLock,
  IconPhone,
  IconBuildingBank,
  IconAlertTriangle,
  IconDownload,
  IconDroplet,
  IconBolt,
  IconReceipt,
  IconInfoCircle,
} from "@tabler/icons-react";

// ── Types ─────────────────────────────────────────────────────
type Etape =
  | "choix"
  | "saisie"
  | "confirmation"
  | "traitement"
  | "succes"
  | "erreur";
type Moyen = "orange_money" | "mtn_money" | "cash";

interface Releve {
  id: number;
  mois: number;
  annee: number;
  bien_titre: string;
  locataire_nom: string;
  conso_eau: number;
  montant_eau: number;
  conso_elec: number;
  montant_elec: number;
  montant_total: number;
  statut: string;
  tarif_eau: string;
  tarif_elec: string;
}

// ── Constantes ────────────────────────────────────────────────
const MOIS_FR = [
  "",
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

// ── Composants ────────────────────────────────────────────────
function SkeletonGreen({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-xl ${className}`}
      style={{
        background:
          "linear-gradient(90deg,#D1FAE5 25%,#ECFDF5 50%,#D1FAE5 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.5s infinite",
      }}
    />
  );
}

function StepDot({
  n,
  active,
  done,
}: {
  n: number;
  active: boolean;
  done: boolean;
}) {
  return (
    <div
      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
      style={{
        background: done ? "#059669" : active ? "#059669" : "#E2E8F0",
        color: done || active ? "#fff" : "#94A3B8",
      }}
    >
      {done ? <IconCheck size={13} /> : n}
    </div>
  );
}

function Toggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!value)}
      style={{
        width: "44px",
        height: "24px",
        borderRadius: "12px",
        border: "none",
        cursor: "pointer",
        position: "relative",
        transition: "background .2s",
        flexShrink: 0,
        background: value ? "#059669" : "#E2E8F0",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: "4px",
          left: value ? "22px" : "4px",
          width: "16px",
          height: "16px",
          borderRadius: "50%",
          background: "#fff",
          transition: "left .2s",
          boxShadow: "0 1px 3px rgba(0,0,0,.2)",
        }}
      />
    </button>
  );
}

// ── Page ──────────────────────────────────────────────────────
export default function PaiementPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [contrat, setContrat] = useState<Contrat | null>(null);
  const [releve, setReleve] = useState<Releve | null>(null);
  const [loading, setLoading] = useState(true);
  const [etape, setEtape] = useState<Etape>("choix");
  const [moyen, setMoyen] = useState<Moyen | null>(null);
  const [moyenParDefaut, setMoyenPD] = useState<Moyen | null>(null);
  const [telephone, setTel] = useState("");
  const [telError, setTelError] = useState("");
  const [processing, setProc] = useState(false);
  const [paiementId, setPaiId] = useState<number | null>(null);
  const [downloading, setDownloading] = useState(false);

  // Ce que le locataire choisit de payer
  const [inclureLoyer, setInclureLoyer] = useState(true);
  const [inclureCharges, setInclureCharges] = useState(false);

  useEffect(() => {
    if (user) load();
  }, [user]);

  const load = async () => {
    setLoading(true);
    try {
      const [contratRes, prefsRes, relevesRes] = await Promise.all([
        api.get<PaginatedResponse<Contrat>>("/contrats/"),
        api.get("/auth/preferences/"),
        api.get("/releves/"),
      ]);
      const actif =
        contratRes.data.results.find((c) => c.statut === "actif") ?? null;
      setContrat(actif);

      // Relevé en attente de paiement (envoyé par le bailleur ce mois)
      const now = new Date();
      const relevePending =
        (relevesRes.data.results ?? []).find(
          (r: Releve) =>
            r.statut === "envoye" &&
            r.mois === now.getMonth() + 1 &&
            r.annee === now.getFullYear(),
        ) ?? null;
      setReleve(relevePending);
      setInclureCharges(!!relevePending);

      // Moyen préféré
      const prefere = prefsRes.data.moyen_paiement_prefere as Moyen;
      if (["orange_money", "mtn_money", "cash"].includes(prefere)) {
        setMoyen(prefere);
        setMoyenPD(prefere);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  // ── Calculs ───────────────────────────────────────────────
  // montant_periode = loyer_mensuel × multiplicateur de périodicité
  // (ex : contrat trimestriel → 3x le loyer mensuel). Fallback sur
  // loyer_mensuel si le backend ne renvoie pas encore ce champ.
  const loyer = contrat?.montant_periode ?? contrat?.loyer_mensuel ?? 0;
  const montantLoyer = inclureLoyer ? loyer : 0;
  const montantCharges = inclureCharges && releve ? releve.montant_total : 0;
  const montantEau = inclureCharges && releve ? releve.montant_eau : 0;
  const montantElec = inclureCharges && releve ? releve.montant_elec : 0;
  const total = montantLoyer + montantCharges;

  const now = new Date();
  const moisCourant = now.toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });
  const moisNum = now.getMonth() + 1;
  const anneeNum = now.getFullYear();

  const validateTel = (): boolean => {
    const cleaned = telephone.replace(/\s/g, "");
    if (!cleaned) {
      setTelError("Numéro requis");
      return false;
    }
    if (!/^(\+?237)?[0-9]{9}$/.test(cleaned)) {
      setTelError("Format invalide (ex: 699 000 000)");
      return false;
    }
    setTelError("");
    return true;
  };

  const handlePayer = () => {
    if (moyen !== "cash" && !validateTel()) return;
    setEtape("confirmation");
  };

  const handleConfirmer = async () => {
    if (!contrat) return;
    setEtape("traitement");
    setProc(true);
    try {
      const payload: Record<string, unknown> = {
        contrat_id: contrat.id,
        moyen: moyen,
        montant_eau: montantEau,
        montant_elec: montantElec,
      };
      // Lier au relevé si les charges sont incluses
      if (inclureCharges && releve) {
        payload.releve_id = releve.id;
      }
      const res = await api.post("/paiements/initier/", payload);
      const { paiement_id, paydunya_url } = res.data;
      setPaiId(paiement_id);
      if (moyen === "cash") {
        setEtape("succes");
      } else {
        router.push(paydunya_url);
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: unknown; status?: number } };
      console.error("Erreur paiement:", e.response?.status, e.response?.data);
      setEtape("erreur");
    } finally {
      setProc(false);
    }
  };

  const telechargerQuittance = async () => {
    if (!paiementId) return;
    setDownloading(true);
    try {
      const res = await api.get(`/paiements/${paiementId}/quittance/`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(
        new Blob([res.data], { type: "application/pdf" }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Quittance_${paiementId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Quittance téléchargée !");
    } catch {
      toast.error("Erreur lors du téléchargement.");
    } finally {
      setDownloading(false);
    }
  };

  if (!user) return null;

  const MOYENS = [
    {
      id: "orange_money" as Moyen,
      lbl: "Orange Money",
      sub: "Paiement instantané",
      img: "/orange-money.jpg",
      color: "#FF6600",
      bg: "rgba(255,102,0,.06)",
      border: "rgba(255,102,0,.25)",
    },
    {
      id: "mtn_money" as Moyen,
      lbl: "MTN Mobile Money",
      sub: "Paiement instantané",
      img: "/mtn-money.jpg",
      color: "#D97706",
      bg: "rgba(217,119,6,.06)",
      border: "rgba(217,119,6,.25)",
    },
    {
      id: "cash" as Moyen,
      lbl: "Paiement en espèces",
      sub: "À remettre au bailleur",
      img: null,
      color: "#059669",
      bg: "rgba(5,150,105,.06)",
      border: "rgba(5,150,105,.25)",
      icon: <IconBuildingBank size={24} style={{ color: "#059669" }} />,
    },
  ];

  return (
    <>
      <style>{`
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        .pulse-dot{animation:pulse 1.8s ease-in-out infinite}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#D1FAE5;border-radius:4px}
        .moyen-card{transition:all .2s ease;cursor:pointer}
        .moyen-card:hover{transform:translateY(-2px)}
        .input-tel{width:100%;height:48px;padding:0 16px 0 80px;border-radius:14px;border:2px solid #E2E8F0;font-size:16px;color:#0F172A;outline:none;background:#fff;transition:border-color .15s;font-family:inherit}
        .input-tel:focus{border-color:#059669;box-shadow:0 0 0 4px rgba(5,150,105,.1)}
        .input-tel.err{border-color:#EF4444}
      `}</style>

      <div
        className="min-h-screen"
        style={{
          background: "#F0FDF4",
          fontFamily: "'DM Sans','Helvetica Neue',sans-serif",
        }}
      >
        {/* Header */}
        <header
          className="sticky top-0 z-30 flex items-center gap-3 px-4 sm:px-6 h-14 sm:h-16 bg-white"
          style={{
            borderBottom: "1px solid #D1FAE5",
            boxShadow: "0 1px 4px rgba(5,150,105,.05)",
          }}
        >
          <button
            onClick={() =>
              etape !== "traitement" &&
              (etape === "choix" ? null : setEtape("choix"))
            }
            style={{
              color: "#64748B",
              background: "none",
              border: "none",
              cursor: etape === "traitement" ? "not-allowed" : "pointer",
              padding: 0,
            }}
          >
            {etape === "choix" ? (
              <Link
                href="/locataire"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  color: "#64748B",
                  textDecoration: "none",
                }}
              >
                <IconArrowLeft size={16} />
                <span className="hidden sm:inline">Retour</span>
              </Link>
            ) : etape !== "traitement" &&
              etape !== "succes" &&
              etape !== "erreur" ? (
              <span className="flex items-center gap-1.5 text-sm font-medium">
                <IconArrowLeft size={16} />
                <span className="hidden sm:inline">Retour</span>
              </span>
            ) : null}
          </button>
          <div
            className="h-5 w-px flex-shrink-0"
            style={{ background: "#D1FAE5" }}
          />
          <div className="flex items-center gap-2 flex-1">
            <IconCreditCard
              size={17}
              style={{ color: "#059669", flexShrink: 0 }}
            />
            <h1 className="text-sm font-bold" style={{ color: "#0F172A" }}>
              Payer mon loyer
            </h1>
          </div>
          <div className="flex items-center gap-1.5">
            <IconLock size={13} style={{ color: "#059669" }} />
            <span
              className="text-xs font-medium hidden sm:inline"
              style={{ color: "#059669" }}
            >
              Paiement sécurisé
            </span>
          </div>
        </header>

        <div className="max-w-md mx-auto px-4 sm:px-6 py-5 sm:py-6">
          {/* Loading */}
          {loading && (
            <div className="space-y-4">
              <SkeletonGreen className="h-32" />
              <SkeletonGreen className="h-48" />
            </div>
          )}

          {/* Aucun contrat */}
          {!loading && !contrat && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
                style={{ background: "#FFFBEB" }}
              >
                <IconAlertCircle size={26} style={{ color: "#D97706" }} />
              </div>
              <h3
                className="text-sm font-bold mb-1"
                style={{ color: "#0F172A" }}
              >
                Aucun contrat actif
              </h3>
              <p className="text-xs" style={{ color: "#94A3B8" }}>
                Vous n&apos;avez pas de logement actif
              </p>
            </div>
          )}

          {!loading && contrat && (
            <AnimatePresence mode="wait">
              {/* ══ ÉTAPE 1 — CHOIX ══ */}
              {etape === "choix" && (
                <motion.div
                  key="choix"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Carte logement */}
                  <div
                    className="rounded-2xl p-4 mb-4 flex items-center gap-3"
                    style={{
                      background: "linear-gradient(135deg,#064E3B,#059669)",
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(255,255,255,.12)" }}
                    >
                      <IconHome2 size={20} color="white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-bold text-sm truncate">
                        {contrat.bien?.titre ?? "Logement"}
                      </div>
                      <div
                        className="text-xs"
                        style={{ color: "rgba(255,255,255,.6)" }}
                      >
                        {moisCourant}
                      </div>
                    </div>
                  </div>

                  {/* ── Section loyer ── */}
                  <div
                    className="bg-white rounded-2xl p-4 mb-3"
                    style={{ border: "1px solid #D1FAE5" }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <IconReceipt size={15} style={{ color: "#059669" }} />
                          <span
                            className="text-sm font-bold"
                            style={{ color: "#0F172A" }}
                          >
                            Loyer
                          </span>
                        </div>
                        <div
                          className="text-2xl font-bold"
                          style={{ color: "#059669" }}
                        >
                          {loyer.toLocaleString("fr-FR")}
                          <span
                            className="text-sm font-normal ml-1"
                            style={{ color: "#94A3B8" }}
                          >
                            XAF
                          </span>
                        </div>
                        <div
                          className="text-xs mt-0.5"
                          style={{ color: "#94A3B8" }}
                        >
                          Loyer {contrat?.periodicite_display?.toLowerCase() ?? "mensuel"} — {moisCourant}
                        </div>
                      </div>
                      <Toggle value={inclureLoyer} onChange={setInclureLoyer} />
                    </div>
                    {!inclureLoyer && (
                      <div
                        className="flex items-center gap-1.5 mt-3 pt-3 text-xs"
                        style={{
                          borderTop: "1px solid #F0FDF4",
                          color: "#94A3B8",
                        }}
                      >
                        <IconInfoCircle size={12} />
                        Le loyer ne sera pas inclus dans ce paiement
                      </div>
                    )}
                  </div>

                  {/* ── Section charges (depuis relevé bailleur) ── */}
                  {releve ? (
                    <div
                      className="bg-white rounded-2xl p-4 mb-3"
                      style={{ border: "1px solid #D1FAE5" }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <IconDroplet size={15} style={{ color: "#0EA5E9" }} />
                          <span
                            className="text-sm font-bold"
                            style={{ color: "#0F172A" }}
                          >
                            Charges du mois
                          </span>
                          <span
                            className="text-xs px-1.5 py-0.5 rounded-full font-semibold"
                            style={{ background: "#EFF6FF", color: "#2563EB" }}
                          >
                            Relevé bailleur
                          </span>
                        </div>
                        <Toggle
                          value={inclureCharges}
                          onChange={setInclureCharges}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2 mb-3">
                        {/* Eau */}
                        {releve.montant_eau > 0 && (
                          <div
                            className="rounded-xl p-3"
                            style={{ background: "#F0F9FF" }}
                          >
                            <div className="flex items-center gap-1 mb-1">
                              <IconDroplet
                                size={11}
                                style={{ color: "#0EA5E9" }}
                              />
                              <span
                                className="text-xs font-bold"
                                style={{ color: "#0284C7" }}
                              >
                                Eau
                              </span>
                            </div>
                            <div
                              className="text-xs"
                              style={{ color: "#7DD3FC" }}
                            >
                              {releve.conso_eau.toFixed(2)} m³
                            </div>
                            <div
                              className="text-sm font-bold mt-0.5"
                              style={{ color: "#0EA5E9" }}
                            >
                              {releve.montant_eau.toLocaleString("fr-FR")} XAF
                            </div>
                          </div>
                        )}
                        {/* Élec */}
                        {releve.montant_elec > 0 && (
                          <div
                            className="rounded-xl p-3"
                            style={{ background: "#FFFBEB" }}
                          >
                            <div className="flex items-center gap-1 mb-1">
                              <IconBolt
                                size={11}
                                style={{ color: "#F59E0B" }}
                              />
                              <span
                                className="text-xs font-bold"
                                style={{ color: "#D97706" }}
                              >
                                Électricité
                              </span>
                            </div>
                            <div
                              className="text-xs"
                              style={{ color: "#FCD34D" }}
                            >
                              {releve.conso_elec.toFixed(2)} kWh
                            </div>
                            <div
                              className="text-sm font-bold mt-0.5"
                              style={{ color: "#F59E0B" }}
                            >
                              {releve.montant_elec.toLocaleString("fr-FR")} XAF
                            </div>
                          </div>
                        )}
                      </div>

                      <div
                        className="flex items-center justify-between pt-2"
                        style={{ borderTop: "1px solid #F0FDF4" }}
                      >
                        <span
                          className="text-xs font-semibold"
                          style={{ color: "#64748B" }}
                        >
                          Total charges
                        </span>
                        <span
                          className="text-base font-bold"
                          style={{
                            color: inclureCharges ? "#059669" : "#94A3B8",
                          }}
                        >
                          {releve.montant_total.toLocaleString("fr-FR")} XAF
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="bg-white rounded-2xl p-4 mb-3"
                      style={{ border: "1px solid #E2E8F0" }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: "#F1F5F9" }}
                        >
                          <IconDroplet size={16} style={{ color: "#CBD5E1" }} />
                        </div>
                        <div>
                          <div
                            className="text-sm font-semibold"
                            style={{ color: "#94A3B8" }}
                          >
                            Aucune facture de charges
                          </div>
                          <div
                            className="text-xs mt-0.5"
                            style={{ color: "#CBD5E1" }}
                          >
                            Votre bailleur n&apos;a pas encore envoyé le relevé
                            de ce mois
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Total */}
                  <div
                    className="flex justify-between items-center px-5 py-4 rounded-2xl mb-5"
                    style={{
                      background: total > 0 ? "#ECFDF5" : "#F1F5F9",
                      border: `1px solid ${total > 0 ? "#A7F3D0" : "#E2E8F0"}`,
                    }}
                  >
                    <span
                      className="text-sm font-bold"
                      style={{ color: total > 0 ? "#059669" : "#94A3B8" }}
                    >
                      Total à payer
                    </span>
                    <span
                      className="text-2xl font-bold"
                      style={{ color: total > 0 ? "#059669" : "#94A3B8" }}
                    >
                      {total.toLocaleString("fr-FR")} XAF
                    </span>
                  </div>

                  {/* Moyens de paiement */}
                  {total > 0 && (
                    <>
                      <div
                        className="text-xs font-bold uppercase tracking-wider mb-3"
                        style={{ color: "#94A3B8" }}
                      >
                        Choisir le moyen de paiement
                      </div>
                      <div className="space-y-3">
                        {MOYENS.map((m) => (
                          <motion.div
                            key={m.id}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            className="moyen-card flex items-center gap-4 p-4 rounded-2xl"
                            style={{
                              background: moyen === m.id ? m.bg : "#fff",
                              border: `2px solid ${moyen === m.id ? m.color : "#E2E8F0"}`,
                            }}
                            onClick={() => setMoyen(m.id)}
                          >
                            <div
                              className="w-14 h-10 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden"
                              style={{
                                background: m.bg,
                                border: `1px solid ${m.border}`,
                              }}
                            >
                              {m.img ? (
                                <img
                                  src={m.img}
                                  alt={m.lbl}
                                  style={{
                                    height: "32px",
                                    width: "auto",
                                    objectFit: "contain",
                                  }}
                                />
                              ) : (
                                (m as any).icon
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <div
                                  className="text-sm font-bold"
                                  style={{ color: "#0F172A" }}
                                >
                                  {m.lbl}
                                </div>
                                {moyenParDefaut === m.id && (
                                  <span
                                    className="text-xs font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                                    style={{
                                      background: "#ECFDF5",
                                      color: "#059669",
                                    }}
                                  >
                                    Préféré
                                  </span>
                                )}
                              </div>
                              <div
                                className="text-xs"
                                style={{ color: "#94A3B8" }}
                              >
                                {m.sub}
                              </div>
                            </div>
                            <div
                              className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                              style={{
                                borderColor:
                                  moyen === m.id ? m.color : "#E2E8F0",
                                background:
                                  moyen === m.id ? m.color : "transparent",
                              }}
                            >
                              {moyen === m.id && (
                                <IconCheck size={11} color="white" />
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </>
                  )}

                  {total === 0 && (
                    <div
                      className="flex items-center gap-2 p-3 rounded-xl"
                      style={{
                        background: "#FFFBEB",
                        border: "1px solid #FDE68A",
                      }}
                    >
                      <IconInfoCircle
                        size={14}
                        style={{ color: "#D97706", flexShrink: 0 }}
                      />
                      <p className="text-xs" style={{ color: "#92400E" }}>
                        Sélectionnez au moins le loyer ou les charges pour
                        continuer.
                      </p>
                    </div>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => moyen && total > 0 && setEtape("saisie")}
                    disabled={!moyen || total === 0}
                    className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl text-sm font-bold mt-5"
                    style={{
                      background:
                        moyen && total > 0
                          ? "linear-gradient(135deg,#059669,#047857)"
                          : "#E2E8F0",
                      boxShadow:
                        moyen && total > 0
                          ? "0 4px 14px rgba(5,150,105,.35)"
                          : "none",
                      color: moyen && total > 0 ? "#fff" : "#94A3B8",
                      transition: "all .2s",
                      border: "none",
                      cursor: moyen && total > 0 ? "pointer" : "not-allowed",
                    }}
                  >
                    Continuer <IconChevronRight size={17} />
                  </motion.button>

                  <div className="flex items-center justify-center gap-2 mt-4">
                    <IconLock size={12} style={{ color: "#94A3B8" }} />
                    <span className="text-xs" style={{ color: "#94A3B8" }}>
                      Paiement sécurisé via PayDunya
                    </span>
                  </div>
                </motion.div>
              )}

              {/* ══ ÉTAPE 2 — SAISIE NUMÉRO ══ */}
              {etape === "saisie" && (
                <motion.div
                  key="saisie"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.28 }}
                >
                  <div className="flex items-center justify-center gap-2 mb-6">
                    {[1, 2, 3].map((n) => (
                      <div key={n} className="flex items-center gap-2">
                        <StepDot n={n} active={n === 2} done={n < 2} />
                        {n < 3 && (
                          <div
                            className="w-8 h-0.5 rounded"
                            style={{
                              background: n < 2 ? "#059669" : "#E2E8F0",
                            }}
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="text-center mb-6">
                    <div
                      className="text-xs font-semibold uppercase tracking-wider mb-1"
                      style={{ color: "#94A3B8" }}
                    >
                      Montant à payer
                    </div>
                    <div
                      className="text-4xl font-bold"
                      style={{ color: "#059669" }}
                    >
                      {total.toLocaleString("fr-FR")} XAF
                    </div>
                    <div className="text-sm mt-1" style={{ color: "#64748B" }}>
                      {moisCourant}
                    </div>
                  </div>

                  {/* Détail paiement */}
                  <div
                    className="bg-white rounded-2xl p-4 mb-5"
                    style={{ border: "1px solid #D1FAE5" }}
                  >
                    {inclureLoyer && (
                      <div
                        className="flex justify-between py-2"
                        style={{
                          borderBottom:
                            inclureCharges && releve
                              ? "1px solid #F0FDF4"
                              : "none",
                        }}
                      >
                        <span
                          className="text-xs flex items-center gap-1.5"
                          style={{ color: "#64748B" }}
                        >
                          <IconReceipt size={12} />
                          Loyer
                        </span>
                        <span
                          className="text-sm font-semibold"
                          style={{ color: "#0F172A" }}
                        >
                          {loyer.toLocaleString("fr-FR")} XAF
                        </span>
                      </div>
                    )}
                    {inclureCharges && releve && (
                      <>
                        {releve.montant_eau > 0 && (
                          <div
                            className="flex justify-between py-2"
                            style={{
                              borderBottom:
                                releve.montant_elec > 0
                                  ? "1px solid #F0FDF4"
                                  : "none",
                            }}
                          >
                            <span
                              className="text-xs flex items-center gap-1.5"
                              style={{ color: "#64748B" }}
                            >
                              <IconDroplet
                                size={12}
                                style={{ color: "#0EA5E9" }}
                              />
                              Eau ({releve.conso_eau.toFixed(2)} m³)
                            </span>
                            <span
                              className="text-sm font-semibold"
                              style={{ color: "#0F172A" }}
                            >
                              {releve.montant_eau.toLocaleString("fr-FR")} XAF
                            </span>
                          </div>
                        )}
                        {releve.montant_elec > 0 && (
                          <div className="flex justify-between py-2">
                            <span
                              className="text-xs flex items-center gap-1.5"
                              style={{ color: "#64748B" }}
                            >
                              <IconBolt
                                size={12}
                                style={{ color: "#F59E0B" }}
                              />
                              Élec ({releve.conso_elec.toFixed(2)} kWh)
                            </span>
                            <span
                              className="text-sm font-semibold"
                              style={{ color: "#0F172A" }}
                            >
                              {releve.montant_elec.toLocaleString("fr-FR")} XAF
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {moyen === "cash" ? (
                    <div
                      className="bg-white rounded-2xl p-5 mb-5 text-center"
                      style={{ border: "1px solid #D1FAE5" }}
                    >
                      <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3"
                        style={{ background: "#ECFDF5" }}
                      >
                        <IconBuildingBank
                          size={28}
                          style={{ color: "#059669" }}
                        />
                      </div>
                      <h3
                        className="text-sm font-bold mb-2"
                        style={{ color: "#0F172A" }}
                      >
                        Paiement en espèces
                      </h3>
                      <p
                        className="text-xs leading-relaxed"
                        style={{ color: "#64748B" }}
                      >
                        Remettez{" "}
                        <strong style={{ color: "#059669" }}>
                          {total.toLocaleString("fr-FR")} XAF
                        </strong>{" "}
                        directement à votre bailleur. Une quittance sera générée
                        après confirmation.
                      </p>
                    </div>
                  ) : (
                    <div
                      className="bg-white rounded-2xl p-5 mb-5"
                      style={{ border: "1px solid #D1FAE5" }}
                    >
                      <div
                        className="flex items-center gap-3 mb-5 p-3 rounded-xl"
                        style={{
                          background:
                            moyen === "orange_money"
                              ? "rgba(255,102,0,.07)"
                              : "rgba(217,119,6,.07)",
                        }}
                      >
                        <img
                          src={
                            moyen === "orange_money"
                              ? "/orange-money.jpg"
                              : "/mtn-money.jpg"
                          }
                          alt=""
                          style={{
                            height: "32px",
                            width: "auto",
                            borderRadius: "6px",
                          }}
                        />
                        <div>
                          <div
                            className="text-sm font-bold"
                            style={{ color: "#0F172A" }}
                          >
                            {moyen === "orange_money"
                              ? "Orange Money"
                              : "MTN Mobile Money"}
                          </div>
                          <div className="text-xs" style={{ color: "#94A3B8" }}>
                            Entrez votre numéro pour recevoir la demande
                          </div>
                        </div>
                      </div>
                      <label
                        className="block text-xs font-bold mb-2"
                        style={{ color: "#374151" }}
                      >
                        Numéro {moyen === "orange_money" ? "Orange" : "MTN"}{" "}
                        <span style={{ color: "#EF4444" }}>*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                          <IconPhone size={16} style={{ color: "#94A3B8" }} />
                          <span
                            className="text-sm font-bold"
                            style={{ color: "#64748B" }}
                          >
                            +237
                          </span>
                        </div>
                        <input
                          type="tel"
                          value={telephone}
                          onChange={(e) => {
                            setTel(e.target.value);
                            setTelError("");
                          }}
                          placeholder="6XX XXX XXX"
                          className={`input-tel ${telError ? "err" : ""}`}
                        />
                      </div>
                      {telError && (
                        <p
                          className="text-xs mt-1.5 flex items-center gap-1"
                          style={{ color: "#EF4444" }}
                        >
                          <IconAlertCircle size={12} />
                          {telError}
                        </p>
                      )}
                      <p className="text-xs mt-2" style={{ color: "#94A3B8" }}>
                        Vous recevrez une notification sur ce numéro pour
                        valider le paiement.
                      </p>
                    </div>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handlePayer}
                    className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl text-sm font-bold text-white"
                    style={{
                      background: "linear-gradient(135deg,#059669,#047857)",
                      boxShadow: "0 4px 14px rgba(5,150,105,.35)",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Vérifier et continuer <IconChevronRight size={17} />
                  </motion.button>
                  <button
                    onClick={() => setEtape("choix")}
                    className="w-full text-center py-3 text-sm font-medium mt-2"
                    style={{
                      color: "#94A3B8",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Modifier ma sélection
                  </button>
                </motion.div>
              )}

              {/* ══ ÉTAPE 3 — CONFIRMATION ══ */}
              {etape === "confirmation" && (
                <motion.div
                  key="confirmation"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.28 }}
                >
                  <div className="flex items-center justify-center gap-2 mb-6">
                    {[1, 2, 3].map((n) => (
                      <div key={n} className="flex items-center gap-2">
                        <StepDot n={n} active={n === 3} done={n < 3} />
                        {n < 3 && (
                          <div
                            className="w-8 h-0.5 rounded"
                            style={{ background: "#059669" }}
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  <h2
                    className="text-lg font-bold text-center mb-1"
                    style={{ color: "#0F172A" }}
                  >
                    Confirmer le paiement
                  </h2>
                  <p
                    className="text-xs text-center mb-5"
                    style={{ color: "#94A3B8" }}
                  >
                    Vérifiez les informations avant de valider
                  </p>

                  <div
                    className="bg-white rounded-2xl overflow-hidden mb-4"
                    style={{ border: "1px solid #D1FAE5" }}
                  >
                    <div
                      className="px-5 py-4"
                      style={{
                        background: "linear-gradient(135deg,#064E3B,#059669)",
                      }}
                    >
                      <div
                        className="text-xs font-bold uppercase tracking-wider mb-1"
                        style={{ color: "rgba(255,255,255,.5)" }}
                      >
                        Récapitulatif
                      </div>
                      <div className="text-2xl font-bold text-white">
                        {total.toLocaleString("fr-FR")} XAF
                      </div>
                      <div
                        className="text-xs mt-0.5"
                        style={{ color: "rgba(255,255,255,.6)" }}
                      >
                        {moisCourant}
                      </div>
                    </div>
                    <div className="px-5 py-4">
                      {[
                        { lbl: "Logement", val: contrat.bien?.titre ?? "—" },
                        ...(inclureLoyer
                          ? [
                              {
                                lbl: "Loyer",
                                val: `${loyer.toLocaleString("fr-FR")} XAF`,
                              },
                            ]
                          : []),
                        ...(inclureCharges && releve && releve.montant_eau > 0
                          ? [
                              {
                                lbl: "Charges eau",
                                val: `${releve.montant_eau.toLocaleString("fr-FR")} XAF`,
                              },
                            ]
                          : []),
                        ...(inclureCharges && releve && releve.montant_elec > 0
                          ? [
                              {
                                lbl: "Charges élec",
                                val: `${releve.montant_elec.toLocaleString("fr-FR")} XAF`,
                              },
                            ]
                          : []),
                        {
                          lbl: "Moyen",
                          val: MOYENS.find((m) => m.id === moyen)?.lbl ?? "—",
                        },
                        ...(moyen !== "cash" && telephone
                          ? [{ lbl: "Numéro", val: `+237 ${telephone}` }]
                          : []),
                      ].map((r) => (
                        <div
                          key={r.lbl}
                          className="flex justify-between py-3"
                          style={{ borderBottom: "1px solid #F0FDF4" }}
                        >
                          <span
                            className="text-xs"
                            style={{ color: "#94A3B8" }}
                          >
                            {r.lbl}
                          </span>
                          <span
                            className="text-sm font-semibold"
                            style={{ color: "#0F172A" }}
                          >
                            {r.val}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {moyen !== "cash" && (
                    <div
                      className="flex gap-2.5 p-3.5 rounded-xl mb-4"
                      style={{
                        background: "#FFFBEB",
                        border: "1px solid #FDE68A",
                      }}
                    >
                      <IconAlertTriangle
                        size={15}
                        style={{
                          color: "#D97706",
                          flexShrink: 0,
                          marginTop: "1px",
                        }}
                      />
                      <p
                        className="text-xs leading-relaxed"
                        style={{ color: "#92400E" }}
                      >
                        Vous recevrez une notification sur le{" "}
                        <strong>+237 {telephone}</strong>. Validez le paiement
                        sur votre téléphone dans les 5 minutes.
                      </p>
                    </div>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleConfirmer}
                    className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl text-sm font-bold text-white mb-3"
                    style={{
                      background: "linear-gradient(135deg,#059669,#047857)",
                      boxShadow: "0 4px 14px rgba(5,150,105,.4)",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    <IconShieldCheck size={17} /> Confirmer le paiement
                  </motion.button>
                  <button
                    onClick={() => setEtape("saisie")}
                    className="w-full py-3 rounded-2xl text-sm font-semibold"
                    style={{
                      background: "#F1F5F9",
                      color: "#64748B",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Modifier
                  </button>
                </motion.div>
              )}

              {/* ══ TRAITEMENT ══ */}
              {etape === "traitement" && (
                <motion.div
                  key="traitement"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-16 text-center"
                >
                  <div className="relative w-20 h-20 mb-6">
                    <div
                      className="w-20 h-20 rounded-full"
                      style={{ border: "3px solid #D1FAE5" }}
                    />
                    <div
                      className="absolute inset-0 w-20 h-20 rounded-full border-t-4 border-green-500"
                      style={{ animation: "spin 1s linear infinite" }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <IconLoader2
                        size={28}
                        style={{
                          color: "#059669",
                          animation: "spin 1s linear infinite",
                        }}
                      />
                    </div>
                  </div>
                  <h3
                    className="text-base font-bold mb-2"
                    style={{ color: "#0F172A" }}
                  >
                    Traitement en cours...
                  </h3>
                  <p className="text-sm" style={{ color: "#64748B" }}>
                    {moyen === "cash"
                      ? "Enregistrement du paiement..."
                      : "En attente de confirmation Mobile Money..."}
                  </p>
                  {moyen !== "cash" && (
                    <div
                      className="mt-4 flex items-center gap-2 px-4 py-3 rounded-xl"
                      style={{
                        background: "#FFFBEB",
                        border: "1px solid #FDE68A",
                      }}
                    >
                      <div
                        className="pulse-dot w-2 h-2 rounded-full"
                        style={{ background: "#D97706" }}
                      />
                      <span
                        className="text-xs font-medium"
                        style={{ color: "#92400E" }}
                      >
                        Validez sur votre téléphone
                      </span>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ══ SUCCÈS ══ */}
              {etape === "succes" && (
                <motion.div
                  key="succes"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center py-8 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", duration: 0.6, delay: 0.1 }}
                    className="w-24 h-24 rounded-full flex items-center justify-center mb-5"
                    style={{
                      background: "linear-gradient(135deg,#059669,#10B981)",
                      boxShadow: "0 8px 30px rgba(5,150,105,.4)",
                    }}
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.4, type: "spring" }}
                    >
                      <IconCircleCheck size={44} color="white" />
                    </motion.div>
                  </motion.div>

                  <h2
                    className="text-2xl font-bold mb-2"
                    style={{ color: "#0F172A" }}
                  >
                    Paiement confirmé !
                  </h2>
                  <p className="text-sm mb-1" style={{ color: "#64748B" }}>
                    {total.toLocaleString("fr-FR")} XAF — {moisCourant}
                  </p>
                  <p className="text-xs mb-6" style={{ color: "#94A3B8" }}>
                    Votre quittance a été générée automatiquement.
                  </p>

                  <div
                    className="w-full bg-white rounded-2xl p-5 mb-6 text-left"
                    style={{ border: "1px solid #D1FAE5" }}
                  >
                    <div
                      className="text-xs font-bold uppercase tracking-wider mb-3"
                      style={{ color: "#94A3B8" }}
                    >
                      Détail du paiement
                    </div>
                    {[
                      { lbl: "Logement", val: contrat.bien?.titre ?? "—" },
                      {
                        lbl: "Montant",
                        val: `${total.toLocaleString("fr-FR")} XAF`,
                        col: "#059669",
                      },
                      {
                        lbl: "Méthode",
                        val: MOYENS.find((m) => m.id === moyen)?.lbl ?? "—",
                      },
                      {
                        lbl: "Référence",
                        val: paiementId
                          ? `PAI-${paiementId.toString().padStart(6, "0")}`
                          : "—",
                      },
                    ].map((r) => (
                      <div
                        key={r.lbl}
                        className="flex justify-between py-2.5"
                        style={{ borderBottom: "1px solid #F0FDF4" }}
                      >
                        <span className="text-xs" style={{ color: "#94A3B8" }}>
                          {r.lbl}
                        </span>
                        <span
                          className="text-sm font-semibold"
                          style={{ color: (r as any).col ?? "#0F172A" }}
                        >
                          {r.val}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="w-full grid gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={telechargerQuittance}
                      disabled={downloading || !paiementId}
                      className="flex items-center justify-center gap-2.5 py-3.5 rounded-2xl text-sm font-bold text-white w-full"
                      style={{
                        background: "linear-gradient(135deg,#059669,#047857)",
                        boxShadow: "0 4px 14px rgba(5,150,105,.3)",
                        opacity: downloading ? 0.7 : 1,
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      {downloading ? (
                        <>
                          <IconLoader2
                            size={17}
                            style={{ animation: "spin 1s linear infinite" }}
                          />
                          Téléchargement...
                        </>
                      ) : (
                        <>
                          <IconDownload size={17} />
                          Télécharger la quittance
                        </>
                      )}
                    </motion.button>
                    <Link
                      href="/locataire"
                      className="flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold"
                      style={{
                        background: "#F0FDF4",
                        border: "1.5px solid #A7F3D0",
                        color: "#059669",
                        textDecoration: "none",
                      }}
                    >
                      Retour au tableau de bord
                    </Link>
                  </div>
                </motion.div>
              )}

              {/* ══ ERREUR ══ */}
              {etape === "erreur" && (
                <motion.div
                  key="erreur"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center py-12 text-center"
                >
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
                    style={{ background: "#FEF2F2" }}
                  >
                    <IconX size={36} style={{ color: "#EF4444" }} />
                  </div>
                  <h2
                    className="text-xl font-bold mb-2"
                    style={{ color: "#0F172A" }}
                  >
                    Paiement échoué
                  </h2>
                  <p
                    className="text-sm mb-6"
                    style={{
                      color: "#64748B",
                      maxWidth: "260px",
                      lineHeight: 1.6,
                    }}
                  >
                    Le paiement n&apos;a pas pu être traité. Vérifiez votre
                    solde et réessayez.
                  </p>
                  <div className="w-full grid gap-3">
                    <button
                      onClick={() => setEtape("confirmation")}
                      className="flex items-center justify-center gap-2.5 py-3.5 rounded-2xl text-sm font-bold text-white"
                      style={{
                        background: "linear-gradient(135deg,#059669,#047857)",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      <IconRefresh size={17} />
                      Réessayer
                    </button>
                    <button
                      onClick={() => {
                        setEtape("choix");
                        setMoyen(null);
                        setTel("");
                      }}
                      className="py-3.5 rounded-2xl text-sm font-semibold"
                      style={{
                        background: "#F1F5F9",
                        color: "#64748B",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      Modifier ma sélection
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
    </>
  );
}
