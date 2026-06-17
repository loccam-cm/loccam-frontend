"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { Bien, Contrat, PaginatedResponse } from "@/types";
import {
  IconFileText,
  IconPlus,
  IconSearch,
  IconArrowLeft,
  IconRefresh,
  IconX,
  IconCheck,
  IconLoader2,
  IconHome2,
  IconUsers,
  IconCreditCard,
  IconCalendar,
  IconChevronRight,
  IconEdit,
  IconEye,
  IconAlertCircle,
  IconFilter,
  IconDownload,
  IconCircleCheck,
  IconClockHour4,
  IconBan,
  IconSignature,
} from "@tabler/icons-react";

interface FormData {
  bien: string;
  locataire: string;
  date_debut: string;
  date_fin: string;
  loyer_mensuel: string;
  caution: string;
  jour_echeance: string;
  notes: string;
}

interface LocataireOption {
  id: number;
  nom_complet: string;
  email: string;
}

const STATUT_MAP: Record<
  string,
  { bg: string; col: string; lbl: string; ico: React.ReactNode }
> = {
  actif: {
    bg: "#ECFDF5",
    col: "#059669",
    lbl: "Actif",
    ico: <IconCircleCheck size={11} />,
  },
  termine: {
    bg: "#F1F5F9",
    col: "#64748B",
    lbl: "Terminé",
    ico: <IconBan size={11} />,
  },
  resilie: {
    bg: "#FEF2F2",
    col: "#DC2626",
    lbl: "Résilié",
    ico: <IconBan size={11} />,
  },
  en_attente: {
    bg: "#FFFBEB",
    col: "#D97706",
    lbl: "En attente",
    ico: <IconClockHour4 size={11} />,
  },
  brouillon: {
    bg: "#F1F5F9",
    col: "#94A3B8",
    lbl: "Brouillon",
    ico: <IconFileText size={11} />,
  },
};

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-xl ${className}`}
      style={{
        background:
          "linear-gradient(90deg,#E2E8F0 25%,#F1F5F9 50%,#E2E8F0 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.5s infinite",
      }}
    />
  );
}

function StatutBadge({ statut }: { statut: string }) {
  const s = STATUT_MAP[statut] ?? {
    bg: "#F1F5F9",
    col: "#64748B",
    lbl: statut,
    ico: null,
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
  ];
  const col = colors[(prenom?.charCodeAt(0) ?? 0) % colors.length];
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "10px",
        background: `${col}18`,
        border: `1.5px solid ${col}30`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        fontSize: size * 0.35,
        color: col,
        flexShrink: 0,
      }}
    >
      {prenom?.[0]}
      {nom?.[0]}
    </div>
  );
}

export default function ContratsPage() {
  const { user } = useAuth();
  const [contrats, setContrats] = useState<Contrat[]>([]);
  const [biens, setBiens] = useState<Bien[]>([]);
  const [locataires, setLocataires] = useState<LocataireOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatut, setFilter] = useState("tous");
  const [filterOpen, setFilterOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Contrat | null>(null);
  const [selected, setSelected] = useState<Contrat | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [signing, setSigning] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const emptyForm: FormData = {
    bien: "",
    locataire: "",
    date_debut: "",
    date_fin: "",
    loyer_mensuel: "",
    caution: "",
    jour_echeance: "5",
    notes: "",
  };
  const [form, setForm] = useState<FormData>(emptyForm);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [cRes, bRes, invRes] = await Promise.all([
        api.get<PaginatedResponse<Contrat>>("/contrats/"),
        api.get<PaginatedResponse<Bien>>("/biens/"),
        api.get<any[]>("/invitations/").catch(() => ({ data: [] })),
      ]);
      setContrats(cRes.data.results);
      setBiens(bRes.data.results);

      const locSet = new Map<number, LocataireOption>();
      const invs = Array.isArray(invRes.data)
        ? invRes.data
        : ((invRes.data as any)?.results ?? []);
      invs
        .filter((i: any) => i.statut === "acceptee" && i.locataire_id)
        .forEach((i: any) => {
          locSet.set(i.locataire_id, {
            id: i.locataire_id,
            nom_complet: i.locataire_nom || i.nom_invite || i.email_invite,
            email: i.email_invite,
          });
        });
      cRes.data.results.forEach((c) => {
        if (c.locataire) {
          locSet.set(c.locataire.id, {
            id: c.locataire.id,
            nom_complet: c.locataire.nom_complet,
            email: c.locataire.email,
          });
        }
      });
      setLocataires(Array.from(locSet.values()));
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditItem(null);
    setForm(emptyForm);
    setErrors({});
    setShowForm(true);
  };

  const openEdit = (c: Contrat) => {
    setEditItem(c);
    setForm({
      bien: c.bien?.id?.toString() ?? "",
      locataire: c.locataire?.id?.toString() ?? "",
      date_debut: c.date_debut ?? "",
      date_fin: c.date_fin ?? "",
      loyer_mensuel: c.loyer_mensuel?.toString() ?? "",
      caution: c.caution?.toString() ?? "",
      jour_echeance: (c as any).jour_echeance?.toString() ?? "5",
      notes: (c as any).notes ?? "",
    });
    setErrors({});
    setShowForm(true);
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.bien) e.bien = "Choisissez un bien";
    if (!form.locataire) e.locataire = "Choisissez un locataire";
    if (!form.date_debut) e.date_debut = "Date de début requise";
    if (!form.loyer_mensuel || isNaN(Number(form.loyer_mensuel)))
      e.loyer_mensuel = "Loyer invalide";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        bien: Number(form.bien),
        locataire: Number(form.locataire),
        date_debut: form.date_debut,
        date_fin: form.date_fin || null,
        loyer_mensuel: Number(form.loyer_mensuel),
        caution: form.caution ? Number(form.caution) : null,
        jour_echeance: Number(form.jour_echeance),
        notes: form.notes,
      };
      if (editItem) {
        await api.put(`/contrats/${editItem.id}/`, payload);
      } else {
        await api.post("/contrats/", payload);
      }
      setSuccess(true);
      toast.success(editItem ? "Contrat mis à jour !" : "Contrat créé !");
      setTimeout(() => {
        setSuccess(false);
        setShowForm(false);
        load();
      }, 1400);
    } catch (err: unknown) {
      const e = err as { response?: { data?: Record<string, unknown> } };
      if (e.response?.data) {
        const apiErrors: Record<string, string> = {};
        Object.entries(e.response.data).forEach(([k, v]) => {
          apiErrors[k] = Array.isArray(v) ? (v as string[])[0] : String(v);
        });
        setErrors(apiErrors);
        if (apiErrors.non_field_errors || apiErrors.detail) {
          toast.error(apiErrors.non_field_errors ?? apiErrors.detail);
        }
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSigner = async (contratId: number) => {
    setSigning(true);
    try {
      await api.post(`/contrats/${contratId}/signer/`);
      toast.success("Contrat signé ! En attente de la signature du locataire.");
      setSelected(null);
      load();
    } catch {
      toast.error("Erreur lors de la signature");
    } finally {
      setSigning(false);
    }
  };

  // ✅ Télécharger le PDF du contrat
  const telechargerPdf = async (contratId: number) => {
    setDownloading(true);
    try {
      const res = await api.get(`/contrats/${contratId}/pdf/`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(
        new Blob([res.data], { type: "application/pdf" }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `Contrat_LocCam_${contratId.toString().padStart(6, "0")}.pdf`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Contrat téléchargé !");
    } catch {
      toast.error("Erreur lors du téléchargement");
    } finally {
      setDownloading(false);
    }
  };

  const set = (k: keyof FormData, v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  const filtered = contrats.filter((c) => {
    const loc = c.locataire?.nom_complet ?? "";
    const bien = c.bien?.titre ?? "";
    const matchSearch =
      !search ||
      loc.toLowerCase().includes(search.toLowerCase()) ||
      bien.toLowerCase().includes(search.toLowerCase());
    const matchStatut = filterStatut === "tous" || c.statut === filterStatut;
    return matchSearch && matchStatut;
  });

  const stats = {
    total: contrats.length,
    actifs: contrats.filter((c) => c.statut === "actif").length,
    attente: contrats.filter(
      (c) => c.statut === "en_attente" || c.statut === "brouillon",
    ).length,
    termines: contrats.filter(
      (c) => c.statut === "termine" || c.statut === "resilie",
    ).length,
  };

  if (!user) return null;

  return (
    <>
      <style>{`
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes spin{to{transform:rotate(360deg)}}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:#E2E8F0;border-radius:4px}
        .row-hover{transition:background .12s}.row-hover:hover{background:#F8FAFC}
        .card-c{transition:all .18s ease}.card-c:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,.08)}
        .ifield{width:100%;height:42px;padding:0 12px;border-radius:10px;border:1.5px solid #E2E8F0;font-size:13px;color:#0F172A;outline:none;background:#fff;transition:border-color .15s;font-family:inherit}
        .ifield:focus{border-color:#7C3AED;box-shadow:0 0 0 3px rgba(124,58,237,.1)}
        .ifield.err{border-color:#EF4444}
        .sfield{width:100%;height:42px;padding:0 12px;border-radius:10px;border:1.5px solid #E2E8F0;font-size:13px;color:#0F172A;outline:none;background:#fff;cursor:pointer;font-family:inherit;transition:border-color .15s}
        .sfield:focus{border-color:#7C3AED}
        .sfield.err{border-color:#EF4444}
        .tfield{width:100%;padding:10px 12px;border-radius:10px;border:1.5px solid #E2E8F0;font-size:13px;color:#0F172A;outline:none;background:#fff;resize:vertical;min-height:72px;font-family:inherit;transition:border-color .15s}
        .tfield:focus{border-color:#7C3AED}
      `}</style>

      <div
        className="flex flex-col min-h-screen"
        style={{
          background: "#F1F5F9",
          fontFamily: "'DM Sans','Helvetica Neue',sans-serif",
        }}
      >
        {/* Header */}
        <header
          className="sticky top-0 z-30 flex items-center gap-3 px-4 sm:px-6 h-14 sm:h-16 bg-white"
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
            <IconFileText
              size={17}
              style={{ color: "#7C3AED", flexShrink: 0 }}
            />
            <h1
              className="text-sm font-bold truncate"
              style={{ color: "#0F172A" }}
            >
              Mes contrats
            </h1>
            {!loading && (
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                style={{ background: "#F5F3FF", color: "#7C3AED" }}
              >
                {contrats.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
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
              onClick={openAdd}
              className="flex items-center gap-2 px-3 sm:px-4 h-9 rounded-xl text-xs sm:text-sm font-bold text-white flex-shrink-0"
              style={{
                background: "linear-gradient(135deg,#7C3AED,#6D28D9)",
                boxShadow: "0 2px 8px rgba(124,58,237,.35)",
              }}
            >
              <IconPlus size={15} />
              <span className="hidden sm:inline">Nouveau contrat</span>
            </motion.button>
          </div>
        </header>

        {/* Stats */}
        <div className="px-4 sm:px-6 pt-4 sm:pt-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {[
              {
                lbl: "Total",
                val: stats.total,
                col: "#7C3AED",
                bg: "#F5F3FF",
                ico: <IconFileText size={15} />,
              },
              {
                lbl: "Actifs",
                val: stats.actifs,
                col: "#059669",
                bg: "#ECFDF5",
                ico: <IconCircleCheck size={15} />,
              },
              {
                lbl: "En attente",
                val: stats.attente,
                col: "#D97706",
                bg: "#FFFBEB",
                ico: <IconClockHour4 size={15} />,
              },
              {
                lbl: "Terminés",
                val: stats.termines,
                col: "#64748B",
                bg: "#F1F5F9",
                ico: <IconBan size={15} />,
              },
            ].map((s, i) => (
              <motion.div
                key={s.lbl}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl p-3 sm:p-4"
                style={{ border: "1px solid #E2E8F0" }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs" style={{ color: "#94A3B8" }}>
                    {s.lbl}
                  </span>
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: s.bg, color: s.col }}
                  >
                    {s.ico}
                  </div>
                </div>
                <div className="text-2xl font-bold" style={{ color: s.col }}>
                  {loading ? "—" : s.val}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Toolbar */}
          <div className="flex gap-2 mb-4 flex-wrap">
            <div className="relative flex-1 min-w-48">
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
                placeholder="Locataire, logement..."
                style={{
                  width: "100%",
                  height: "42px",
                  padding: "0 12px 0 36px",
                  borderRadius: "10px",
                  border: "1.5px solid #E2E8F0",
                  fontSize: "14px",
                  color: "#0F172A",
                  outline: "none",
                  background: "#fff",
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
                  <IconX size={14} />
                </button>
              )}
            </div>
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="flex items-center gap-2 px-3 h-11 rounded-xl text-sm font-semibold flex-shrink-0"
              style={{
                background: filterStatut !== "tous" ? "#F5F3FF" : "#fff",
                border: "1.5px solid",
                borderColor: filterStatut !== "tous" ? "#7C3AED" : "#E2E8F0",
                color: filterStatut !== "tous" ? "#7C3AED" : "#64748B",
              }}
            >
              <IconFilter size={15} />
              <span className="hidden sm:inline">Filtrer</span>
            </button>
          </div>

          <AnimatePresence>
            {filterOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden mb-4"
              >
                <div className="flex gap-2 flex-wrap pb-1">
                  {[
                    { val: "tous", lbl: "Tous" },
                    { val: "actif", lbl: "Actifs" },
                    { val: "brouillon", lbl: "Brouillons" },
                    { val: "en_attente", lbl: "En attente" },
                    { val: "termine", lbl: "Terminés" },
                    { val: "resilie", lbl: "Résiliés" },
                  ].map((f) => (
                    <button
                      key={f.val}
                      onClick={() => {
                        setFilter(f.val);
                        setFilterOpen(false);
                      }}
                      className="px-3 py-2 rounded-xl text-xs font-semibold"
                      style={
                        filterStatut === f.val
                          ? { background: "#7C3AED", color: "#fff" }
                          : {
                              background: "#fff",
                              color: "#64748B",
                              border: "1px solid #E2E8F0",
                            }
                      }
                    >
                      {f.lbl}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Liste */}
        <div className="flex-1 px-4 sm:px-6 pb-6">
          {loading ? (
            <div className="flex flex-col gap-3">
              {Array(4)
                .fill(0)
                .map((_, i) => (
                  <Skeleton key={i} className="h-24" />
                ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
                style={{ background: "#F5F3FF" }}
              >
                <IconFileText size={24} style={{ color: "#C4B5FD" }} />
              </div>
              <h3
                className="text-sm font-bold mb-1"
                style={{ color: "#0F172A" }}
              >
                {search || filterStatut !== "tous"
                  ? "Aucun contrat trouvé"
                  : "Aucun contrat"}
              </h3>
              <p className="text-xs mb-4" style={{ color: "#94A3B8" }}>
                {search || filterStatut !== "tous"
                  ? "Modifiez vos critères"
                  : "Créez votre premier contrat de bail"}
              </p>
              {!search && filterStatut === "tous" && (
                <button
                  onClick={openAdd}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white"
                  style={{
                    background: "linear-gradient(135deg,#7C3AED,#6D28D9)",
                  }}
                >
                  <IconPlus size={14} />
                  Créer un contrat
                </button>
              )}
            </div>
          ) : (
            <>
              <p className="text-xs mb-3" style={{ color: "#94A3B8" }}>
                {filtered.length} contrat{filtered.length > 1 ? "s" : ""}
              </p>

              {/* Cartes mobile */}
              <div className="sm:hidden flex flex-col gap-3">
                {filtered.map((c, i) => (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="card-c bg-white rounded-2xl p-4 cursor-pointer"
                    style={{ border: "1px solid #E2E8F0" }}
                    onClick={() => setSelected(c)}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      {c.locataire && (
                        <Avatar
                          nom={c.locataire.nom}
                          prenom={c.locataire.prenom}
                          size={42}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <span
                            className="text-sm font-bold"
                            style={{ color: "#0F172A" }}
                          >
                            {c.locataire?.nom_complet ?? "—"}
                          </span>
                          <StatutBadge statut={c.statut} />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <IconHome2 size={12} style={{ color: "#94A3B8" }} />
                          <span
                            className="text-xs truncate"
                            style={{ color: "#64748B" }}
                          >
                            {c.bien?.titre ?? "—"}
                          </span>
                        </div>
                      </div>
                      <IconChevronRight
                        size={15}
                        style={{ color: "#CBD5E1", flexShrink: 0 }}
                      />
                    </div>
                    <div
                      className="flex items-center justify-between pt-2.5"
                      style={{ borderTop: "1px solid #F1F5F9" }}
                    >
                      <div className="flex items-center gap-1.5">
                        <IconCalendar size={12} style={{ color: "#94A3B8" }} />
                        <span className="text-xs" style={{ color: "#64748B" }}>
                          {c.date_debut
                            ? new Date(c.date_debut).toLocaleDateString(
                                "fr-FR",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                },
                              )
                            : "—"}
                        </span>
                      </div>
                      <span
                        className="text-sm font-bold"
                        style={{ color: "#059669" }}
                      >
                        {c.loyer_mensuel?.toLocaleString("fr-FR")} XAF/mois
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Tableau desktop */}
              <div
                className="hidden sm:block bg-white rounded-2xl overflow-hidden"
                style={{ border: "1px solid #E2E8F0" }}
              >
                <div
                  className="grid px-5 py-3"
                  style={{
                    gridTemplateColumns: "2fr 1.8fr 1fr 1fr 1fr auto",
                    gap: "12px",
                    background: "#F8FAFC",
                    borderBottom: "1px solid #F1F5F9",
                  }}
                >
                  {[
                    "Locataire",
                    "Logement",
                    "Loyer",
                    "Début",
                    "Statut",
                    "",
                  ].map((h) => (
                    <div
                      key={h}
                      className="text-xs font-bold uppercase tracking-wider"
                      style={{ color: "#94A3B8" }}
                    >
                      {h}
                    </div>
                  ))}
                </div>
                {filtered.map((c, i) => (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="row-hover grid items-center px-5 py-3.5 cursor-pointer"
                    style={{
                      gridTemplateColumns: "2fr 1.8fr 1fr 1fr 1fr auto",
                      gap: "12px",
                      borderBottom: "1px solid #F8FAFC",
                    }}
                    onClick={() => setSelected(c)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {c.locataire && (
                        <Avatar
                          nom={c.locataire.nom}
                          prenom={c.locataire.prenom}
                        />
                      )}
                      <div className="min-w-0">
                        <div
                          className="text-sm font-semibold truncate"
                          style={{ color: "#0F172A" }}
                        >
                          {c.locataire?.nom_complet ?? "—"}
                        </div>
                        <div
                          className="text-xs truncate"
                          style={{ color: "#94A3B8" }}
                        >
                          {c.locataire?.email ?? "—"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 min-w-0">
                      <IconHome2
                        size={13}
                        style={{ color: "#94A3B8", flexShrink: 0 }}
                      />
                      <span
                        className="text-sm truncate"
                        style={{ color: "#475569" }}
                      >
                        {c.bien?.titre ?? "—"}
                      </span>
                    </div>

                    <div
                      className="text-sm font-bold"
                      style={{ color: "#059669" }}
                    >
                      {c.loyer_mensuel?.toLocaleString("fr-FR")} XAF
                    </div>

                    <div className="text-sm" style={{ color: "#475569" }}>
                      {c.date_debut
                        ? new Date(c.date_debut).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "short",
                            year: "2-digit",
                          })
                        : "—"}
                    </div>

                    <div>
                      <StatutBadge statut={c.statut} />
                    </div>

                    <div className="flex gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEdit(c);
                        }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: "#F5F3FF", color: "#7C3AED" }}
                      >
                        <IconEdit size={13} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelected(c);
                        }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: "#F1F5F9", color: "#64748B" }}
                      >
                        <IconEye size={13} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* ── DRAWER FORMULAIRE ── */}
        <AnimatePresence>
          {showForm && (
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
                onClick={() => setShowForm(false)}
              />
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 280 }}
                className="fixed right-0 top-0 bottom-0 z-50 overflow-y-auto"
                style={{
                  width: "min(520px,100vw)",
                  background: "#fff",
                  boxShadow: "-8px 0 40px rgba(0,0,0,.15)",
                }}
              >
                <div
                  className="flex items-center justify-between px-6 py-5 sticky top-0 bg-white z-10"
                  style={{ borderBottom: "1px solid #F1F5F9" }}
                >
                  <div>
                    <h2
                      className="text-base font-bold"
                      style={{ color: "#0F172A" }}
                    >
                      {editItem
                        ? "Modifier le contrat"
                        : "Nouveau contrat de bail"}
                    </h2>
                    <p className="text-xs mt-0.5" style={{ color: "#94A3B8" }}>
                      {editItem
                        ? "Modification en cours"
                        : "Associez un locataire à un logement"}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowForm(false)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: "#F1F5F9" }}
                  >
                    <IconX size={16} style={{ color: "#64748B" }} />
                  </button>
                </div>

                <div className="px-6 py-5 space-y-5">
                  {/* Bien */}
                  <div>
                    <div
                      className="text-xs font-bold uppercase tracking-wider mb-3"
                      style={{ color: "#94A3B8" }}
                    >
                      Logement
                    </div>
                    <label
                      className="block text-xs font-semibold mb-1.5"
                      style={{ color: "#374151" }}
                    >
                      Bien à louer <span style={{ color: "#EF4444" }}>*</span>
                    </label>
                    <select
                      value={form.bien}
                      onChange={(e) => set("bien", e.target.value)}
                      className={`sfield ${errors.bien ? "err" : ""}`}
                    >
                      <option value="">-- Choisir un bien --</option>
                      {biens
                        .filter(
                          (b) =>
                            b.statut === "libre" ||
                            (editItem && b.id === editItem.bien?.id),
                        )
                        .map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.titre} — {b.adresse}
                          </option>
                        ))}
                    </select>
                    {errors.bien && (
                      <p className="text-xs mt-1" style={{ color: "#EF4444" }}>
                        {errors.bien}
                      </p>
                    )}
                    {biens.filter((b) => b.statut === "libre").length === 0 &&
                      !editItem && (
                        <p
                          className="text-xs mt-1.5 flex items-center gap-1"
                          style={{ color: "#D97706" }}
                        >
                          <IconAlertCircle size={12} />
                          Aucun bien libre disponible
                        </p>
                      )}
                  </div>

                  {/* Locataire */}
                  <div>
                    <div
                      className="text-xs font-bold uppercase tracking-wider mb-3"
                      style={{ color: "#94A3B8" }}
                    >
                      Locataire
                    </div>
                    <label
                      className="block text-xs font-semibold mb-1.5"
                      style={{ color: "#374151" }}
                    >
                      Locataire <span style={{ color: "#EF4444" }}>*</span>
                    </label>
                    <select
                      value={form.locataire}
                      onChange={(e) => set("locataire", e.target.value)}
                      className={`sfield ${errors.locataire ? "err" : ""}`}
                    >
                      <option value="">-- Choisir un locataire --</option>
                      {locataires.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.nom_complet} ({l.email})
                        </option>
                      ))}
                    </select>
                    {errors.locataire && (
                      <p className="text-xs mt-1" style={{ color: "#EF4444" }}>
                        {errors.locataire}
                      </p>
                    )}
                    {locataires.length === 0 && (
                      <p
                        className="text-xs mt-1.5 flex items-center gap-1"
                        style={{ color: "#D97706" }}
                      >
                        <IconAlertCircle size={12} />
                        Aucun locataire — invitez d&apos;abord un locataire
                      </p>
                    )}
                  </div>

                  {/* Dates */}
                  <div>
                    <div
                      className="text-xs font-bold uppercase tracking-wider mb-3"
                      style={{ color: "#94A3B8" }}
                    >
                      Durée du bail
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label
                          className="block text-xs font-semibold mb-1.5"
                          style={{ color: "#374151" }}
                        >
                          Date de début{" "}
                          <span style={{ color: "#EF4444" }}>*</span>
                        </label>
                        <input
                          type="date"
                          value={form.date_debut}
                          onChange={(e) => set("date_debut", e.target.value)}
                          className={`ifield ${errors.date_debut ? "err" : ""}`}
                        />
                        {errors.date_debut && (
                          <p
                            className="text-xs mt-1"
                            style={{ color: "#EF4444" }}
                          >
                            {errors.date_debut}
                          </p>
                        )}
                      </div>
                      <div>
                        <label
                          className="block text-xs font-semibold mb-1.5"
                          style={{ color: "#374151" }}
                        >
                          Date de fin{" "}
                          <span style={{ color: "#94A3B8" }}>(optionnel)</span>
                        </label>
                        <input
                          type="date"
                          value={form.date_fin}
                          onChange={(e) => set("date_fin", e.target.value)}
                          className="ifield"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Finances */}
                  <div>
                    <div
                      className="text-xs font-bold uppercase tracking-wider mb-3"
                      style={{ color: "#94A3B8" }}
                    >
                      Conditions financières
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label
                          className="block text-xs font-semibold mb-1.5"
                          style={{ color: "#374151" }}
                        >
                          Loyer mensuel (XAF){" "}
                          <span style={{ color: "#EF4444" }}>*</span>
                        </label>
                        <input
                          type="number"
                          value={form.loyer_mensuel}
                          onChange={(e) => set("loyer_mensuel", e.target.value)}
                          placeholder="85000"
                          className={`ifield ${errors.loyer_mensuel ? "err" : ""}`}
                        />
                        {errors.loyer_mensuel && (
                          <p
                            className="text-xs mt-1"
                            style={{ color: "#EF4444" }}
                          >
                            {errors.loyer_mensuel}
                          </p>
                        )}
                      </div>
                      <div>
                        <label
                          className="block text-xs font-semibold mb-1.5"
                          style={{ color: "#374151" }}
                        >
                          Caution (XAF)
                        </label>
                        <input
                          type="number"
                          value={form.caution}
                          onChange={(e) => set("caution", e.target.value)}
                          placeholder="85000"
                          className="ifield"
                        />
                      </div>
                    </div>
                    <div className="mt-3">
                      <label
                        className="block text-xs font-semibold mb-1.5"
                        style={{ color: "#374151" }}
                      >
                        Jour d&apos;échéance (du mois)
                      </label>
                      <select
                        value={form.jour_echeance}
                        onChange={(e) => set("jour_echeance", e.target.value)}
                        className="sfield"
                      >
                        {[1, 5, 10, 15, 20, 25, 28].map((j) => (
                          <option key={j} value={j}>
                            Le {j} de chaque mois
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Erreurs API */}
                  {Object.keys(errors).filter(
                    (k) =>
                      ![
                        "bien",
                        "locataire",
                        "date_debut",
                        "loyer_mensuel",
                      ].includes(k),
                  ).length > 0 && (
                    <div
                      className="flex items-start gap-2 p-3 rounded-xl"
                      style={{
                        background: "#FEF2F2",
                        border: "1px solid #FECACA",
                      }}
                    >
                      <IconAlertCircle
                        size={14}
                        style={{
                          color: "#EF4444",
                          flexShrink: 0,
                          marginTop: "1px",
                        }}
                      />
                      <div className="text-xs" style={{ color: "#DC2626" }}>
                        {Object.entries(errors)
                          .filter(
                            ([k]) =>
                              ![
                                "bien",
                                "locataire",
                                "date_debut",
                                "loyer_mensuel",
                              ].includes(k),
                          )
                          .map(([k, v]) => (
                            <div key={k}>
                              <strong>{k}</strong> : {v}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  <div>
                    <div
                      className="text-xs font-bold uppercase tracking-wider mb-3"
                      style={{ color: "#94A3B8" }}
                    >
                      Notes
                    </div>
                    <textarea
                      value={form.notes}
                      onChange={(e) => set("notes", e.target.value)}
                      placeholder="Clauses spéciales, conditions particulières..."
                      className="tfield"
                    />
                  </div>
                </div>

                <div
                  className="sticky bottom-0 bg-white px-6 py-4 flex gap-3"
                  style={{
                    borderTop: "1px solid #F1F5F9",
                    boxShadow: "0 -4px 16px rgba(0,0,0,.06)",
                  }}
                >
                  <button
                    onClick={() => setShowForm(false)}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold"
                    style={{ background: "#F1F5F9", color: "#64748B" }}
                  >
                    Annuler
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmit}
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white"
                    style={{
                      background: success
                        ? "#059669"
                        : "linear-gradient(135deg,#7C3AED,#6D28D9)",
                      boxShadow: "0 2px 10px rgba(124,58,237,.3)",
                    }}
                  >
                    {saving ? (
                      <>
                        <IconLoader2
                          size={15}
                          style={{ animation: "spin 1s linear infinite" }}
                        />
                        Enregistrement...
                      </>
                    ) : success ? (
                      <>
                        <IconCheck size={15} />
                        {editItem ? "Mis à jour !" : "Contrat créé !"}
                      </>
                    ) : (
                      <>
                        <IconCheck size={15} />
                        {editItem ? "Mettre à jour" : "Créer le contrat"}
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ── DRAWER DÉTAIL ── */}
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
                  width: "min(440px,100vw)",
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
                    Détail du contrat
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelected(null);
                        openEdit(selected);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                      style={{ background: "#F5F3FF", color: "#7C3AED" }}
                    >
                      <IconEdit size={13} />
                      Modifier
                    </button>
                    <button
                      onClick={() => setSelected(null)}
                      className="w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{ background: "#F1F5F9" }}
                    >
                      <IconX size={15} style={{ color: "#64748B" }} />
                    </button>
                  </div>
                </div>

                <div className="px-5 py-5 space-y-5">
                  {/* Statut + signatures */}
                  <div
                    className="p-4 rounded-2xl"
                    style={{
                      background:
                        selected.statut === "actif"
                          ? "#ECFDF5"
                          : selected.statut === "brouillon"
                            ? "#FFFBEB"
                            : "#F8FAFC",
                      border: `1px solid ${selected.statut === "actif" ? "#A7F3D0" : selected.statut === "brouillon" ? "#FDE68A" : "#E2E8F0"}`,
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div
                          className="text-xs mb-1"
                          style={{ color: "#94A3B8" }}
                        >
                          Statut
                        </div>
                        <StatutBadge statut={selected.statut} />
                      </div>
                      <div className="text-right">
                        <div
                          className="text-xs mb-1"
                          style={{ color: "#94A3B8" }}
                        >
                          Référence
                        </div>
                        <div
                          className="text-sm font-bold"
                          style={{ color: "#0F172A" }}
                        >
                          #{selected.id}
                        </div>
                      </div>
                    </div>
                    <div
                      className="grid grid-cols-2 gap-2 pt-3"
                      style={{ borderTop: "1px solid rgba(0,0,0,.06)" }}
                    >
                      {[
                        { lbl: "Bailleur", signed: selected.signe_bailleur },
                        { lbl: "Locataire", signed: selected.signe_locataire },
                      ].map((s) => (
                        <div
                          key={s.lbl}
                          className="flex items-center gap-2 p-2 rounded-lg"
                          style={{
                            background: s.signed ? "#ECFDF5" : "#F8FAFC",
                          }}
                        >
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{
                              background: s.signed ? "#059669" : "#E2E8F0",
                            }}
                          >
                            {s.signed ? (
                              <IconCheck size={12} color="white" />
                            ) : (
                              <IconClockHour4
                                size={12}
                                style={{ color: "#94A3B8" }}
                              />
                            )}
                          </div>
                          <span
                            className="text-xs font-semibold"
                            style={{ color: s.signed ? "#059669" : "#94A3B8" }}
                          >
                            {s.lbl} — {s.signed ? "Signé" : "En attente"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bouton signer */}
                  {!selected.signe_bailleur && (
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleSigner(selected.id)}
                      disabled={signing}
                      className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white"
                      style={{
                        background: signing
                          ? "#94A3B8"
                          : "linear-gradient(135deg,#7C3AED,#6D28D9)",
                        boxShadow: signing
                          ? "none"
                          : "0 3px 12px rgba(124,58,237,.4)",
                      }}
                    >
                      {signing ? (
                        <>
                          <IconLoader2
                            size={15}
                            style={{ animation: "spin 1s linear infinite" }}
                          />
                          Signature...
                        </>
                      ) : (
                        <>
                          <IconSignature size={15} />
                          Signer le contrat (bailleur)
                        </>
                      )}
                    </motion.button>
                  )}

                  {/* Logement */}
                  {selected.bien && (
                    <div>
                      <div
                        className="text-xs font-bold uppercase tracking-wider mb-3"
                        style={{ color: "#94A3B8" }}
                      >
                        Logement
                      </div>
                      <div
                        className="flex items-center gap-3 p-4 rounded-2xl"
                        style={{
                          background: "linear-gradient(135deg,#1E293B,#0F172A)",
                        }}
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: "rgba(255,255,255,.1)" }}
                        >
                          <IconHome2 size={20} color="white" />
                        </div>
                        <div>
                          <div className="text-white font-bold text-sm">
                            {selected.bien.titre}
                          </div>
                          <div
                            className="text-xs"
                            style={{ color: "rgba(255,255,255,.5)" }}
                          >
                            {selected.bien.adresse}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Locataire */}
                  {selected.locataire && (
                    <div>
                      <div
                        className="text-xs font-bold uppercase tracking-wider mb-3"
                        style={{ color: "#94A3B8" }}
                      >
                        Locataire
                      </div>
                      <div
                        className="flex items-center gap-3 p-3 rounded-xl"
                        style={{
                          background: "#F8FAFC",
                          border: "1px solid #F1F5F9",
                        }}
                      >
                        <Avatar
                          nom={selected.locataire.nom}
                          prenom={selected.locataire.prenom}
                          size={40}
                        />
                        <div>
                          <div
                            className="text-sm font-bold"
                            style={{ color: "#0F172A" }}
                          >
                            {selected.locataire.nom_complet}
                          </div>
                          <div className="text-xs" style={{ color: "#94A3B8" }}>
                            {selected.locataire.email}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Conditions */}
                  <div>
                    <div
                      className="text-xs font-bold uppercase tracking-wider mb-3"
                      style={{ color: "#94A3B8" }}
                    >
                      Conditions
                    </div>
                    <div className="space-y-2">
                      {[
                        {
                          lbl: "Loyer mensuel",
                          val: selected.loyer_mensuel
                            ? `${selected.loyer_mensuel.toLocaleString("fr-FR")} XAF`
                            : "—",
                          col: "#059669",
                        },
                        {
                          lbl: "Caution",
                          val: selected.caution
                            ? `${selected.caution.toLocaleString("fr-FR")} XAF`
                            : "—",
                          col: "#0F172A",
                        },
                        {
                          lbl: "Date d'entrée",
                          val: selected.date_debut
                            ? new Date(selected.date_debut).toLocaleDateString(
                                "fr-FR",
                                {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                },
                              )
                            : "—",
                          col: "#0F172A",
                        },
                        {
                          lbl: "Date de fin",
                          val: selected.date_fin
                            ? new Date(selected.date_fin).toLocaleDateString(
                                "fr-FR",
                                {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                },
                              )
                            : "Bail à durée indéterminée",
                          col: "#64748B",
                        },
                      ].map((row) => (
                        <div
                          key={row.lbl}
                          className="flex items-center justify-between py-2.5 px-3 rounded-xl"
                          style={{ background: "#F8FAFC" }}
                        >
                          <span
                            className="text-xs"
                            style={{ color: "#64748B" }}
                          >
                            {row.lbl}
                          </span>
                          <span
                            className="text-sm font-semibold"
                            style={{ color: row.col }}
                          >
                            {row.val}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ✅ Actions — PDF branché */}
                  <div>
                    <div
                      className="text-xs font-bold uppercase tracking-wider mb-3"
                      style={{ color: "#94A3B8" }}
                    >
                      Actions
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {/* ✅ Télécharger PDF — branché sur telechargerPdf */}
                      <button
                        onClick={() => telechargerPdf(selected.id)}
                        disabled={downloading}
                        className="flex items-center gap-2 p-3 rounded-xl text-xs font-semibold"
                        style={{
                          background: "#F5F3FF",
                          color: "#7C3AED",
                          opacity: downloading ? 0.6 : 1,
                        }}
                      >
                        {downloading ? (
                          <>
                            <IconLoader2
                              size={13}
                              style={{ animation: "spin 1s linear infinite" }}
                            />
                            Génération...
                          </>
                        ) : (
                          <>
                            <IconDownload size={13} />
                            Télécharger PDF
                          </>
                        )}
                      </button>

                      {/* Autres actions */}
                      {[
                        {
                          ico: <IconCreditCard size={13} />,
                          lbl: "Voir paiements",
                          col: "#059669",
                          bg: "#ECFDF5",
                        },
                        {
                          ico: <IconUsers size={13} />,
                          lbl: "Contacter locataire",
                          col: "#2563EB",
                          bg: "#EFF6FF",
                        },
                        {
                          ico: <IconBan size={13} />,
                          lbl: "Résilier contrat",
                          col: "#DC2626",
                          bg: "#FEF2F2",
                        },
                      ].map((a) => (
                        <button
                          key={a.lbl}
                          className="flex items-center gap-2 p-3 rounded-xl text-xs font-semibold"
                          style={{ background: a.bg, color: a.col }}
                          onClick={() =>
                            toast.info("Fonctionnalité bientôt disponible")
                          }
                        >
                          {a.ico}
                          {a.lbl}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  {(selected as any).notes && (
                    <div>
                      <div
                        className="text-xs font-bold uppercase tracking-wider mb-2"
                        style={{ color: "#94A3B8" }}
                      >
                        Notes
                      </div>
                      <p
                        className="text-sm p-3 rounded-xl leading-relaxed"
                        style={{ background: "#F8FAFC", color: "#475569" }}
                      >
                        {(selected as any).notes}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
